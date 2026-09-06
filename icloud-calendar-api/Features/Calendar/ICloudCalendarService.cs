using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Xml.Linq;
using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Encryption;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace icloud_calendar_api.Features.Calendar;

/// <summary>
/// Talks CalDAV directly to iCloud via hand-built XML PROPFIND/REPORT requests and
/// hand-built iCalendar text (no calendar library). Ported from a previous project's
/// per-Client implementation, re-keyed to this project's EndUser model.
///
/// Registered as a singleton (see Program.cs) so the calendar discovery cache below
/// survives across requests; it therefore resolves AppDbContext per call via
/// IDbContextFactory rather than taking a scoped AppDbContext in the constructor.
/// </summary>
public class ICloudCalendarService
{
    private const string HttpClientName = "ICloudCalDav";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICloudDavSettings _settings;
    private readonly IDbContextFactory<AppDbContext> _dbContextFactory;
    private readonly IPasswordEncryptionService _encryptionService;

    // Calendar discovery is cached per end user (each end user has their own iCloud
    // account and therefore their own calendar set), keyed by EndUserIdentifier. One
    // discovery lock per end user too, so concurrent requests for different end users
    // don't serialize behind each other.
    private readonly ConcurrentDictionary<Guid, ICloudCalendar> _calendarCache = new();
    private readonly ConcurrentDictionary<Guid, SemaphoreSlim> _calendarCacheLocks = new();

    public ICloudCalendarService(
        IHttpClientFactory httpClientFactory,
        IOptions<ICloudDavSettings> settings,
        IDbContextFactory<AppDbContext> dbContextFactory,
        IPasswordEncryptionService encryptionService)
    {
        _httpClientFactory = httpClientFactory;
        _settings = settings.Value;
        _dbContextFactory = dbContextFactory;
        _encryptionService = encryptionService;
    }

    // Resolves an end user's iCloud email/password (decrypting the stored password)
    // and Base64-encodes them for a Basic auth header.
    private async Task<string> GetBasicAuthCredentialsAsync(Guid endUserIdentifier)
    {
        await using var dbContext = await _dbContextFactory.CreateDbContextAsync();

        var endUser = await dbContext.EndUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.EndUserIdentifier == endUserIdentifier);

        if (endUser == null)
        {
            throw new EndUserNotFoundException(endUserIdentifier);
        }

        if (string.IsNullOrWhiteSpace(endUser.IcloudEmail) || string.IsNullOrWhiteSpace(endUser.EncryptedPassword))
        {
            throw new EndUserCredentialsMissingException(endUserIdentifier);
        }

        var password = _encryptionService.Decrypt(
            endUser.EncryptedPassword,
            endUser.EncryptionIv,
            endUser.EncryptionAuthTag);

        return Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{endUser.IcloudEmail}:{password}"));
    }

    private async Task<string> GetCalendarNameAsync(Guid endUserIdentifier)
    {
        await using var dbContext = await _dbContextFactory.CreateDbContextAsync();

        var calendarName = await dbContext.EndUsers
            .AsNoTracking()
            .Where(u => u.EndUserIdentifier == endUserIdentifier)
            .Select(u => (string?)u.CalendarName)
            .FirstOrDefaultAsync();

        if (calendarName == null)
        {
            throw new EndUserNotFoundException(endUserIdentifier);
        }

        return string.IsNullOrWhiteSpace(calendarName) ? "Calendar" : calendarName;
    }

    private async Task MarkNeedsReconnectAsync(Guid endUserIdentifier)
    {
        await using var dbContext = await _dbContextFactory.CreateDbContextAsync();

        var endUser = await dbContext.EndUsers
            .FirstOrDefaultAsync(u => u.EndUserIdentifier == endUserIdentifier);

        if (endUser == null)
        {
            return;
        }

        endUser.Status = "needs_reconnect";

        await dbContext.SaveChangesAsync();
    }

    // Distinguishes a 401 from any other CalDAV failure: marks the end user as needing
    // to reconnect and throws a specific exception so the controller can return 409
    // instead of a generic error. Every CalDAV call site below checks this before its
    // ordinary IsSuccessStatusCode check.
    private async Task EnsureAuthorizedAsync(HttpResponseMessage response, Guid endUserIdentifier)
    {
        if (response.StatusCode != HttpStatusCode.Unauthorized)
        {
            return;
        }

        await MarkNeedsReconnectAsync(endUserIdentifier);

        throw new ICloudUnauthorizedException(endUserIdentifier);
    }

    private async Task<ICloudCalendar> GetSelectedCalendarAsync(Guid endUserIdentifier)
    {
        // Fast path:
        // The calendar has already been discovered.
        if (_calendarCache.TryGetValue(endUserIdentifier, out var cachedCalendar))
        {
            return cachedCalendar;
        }

        // Only one request per end user is allowed to perform discovery.
        var calendarLock = _calendarCacheLocks.GetOrAdd(endUserIdentifier, _ => new SemaphoreSlim(1, 1));
        await calendarLock.WaitAsync();

        try
        {
            // Check again after acquiring the lock.
            //
            // Another request may have discovered and cached
            // the calendar while this request was waiting.
            if (_calendarCache.TryGetValue(endUserIdentifier, out cachedCalendar))
            {
                return cachedCalendar;
            }

            Console.WriteLine(
                "Calendar not cached. Discovering calendars...");

            var calendars = await DiscoverCalendarsAsync(endUserIdentifier);
            var calendarName = await GetCalendarNameAsync(endUserIdentifier);

            var selectedCalendar = calendars
                .FirstOrDefault(x =>
                    x.Name.Equals(
                        calendarName,
                        StringComparison.OrdinalIgnoreCase));

            if (selectedCalendar == null)
            {
                throw new InvalidOperationException(
                    $"iCloud calendar '{calendarName}' was not found for this end user.");
            }

            _calendarCache[endUserIdentifier] = selectedCalendar;

            Console.WriteLine(
                $"Calendar cached: {selectedCalendar.Url}");

            return selectedCalendar;
        }
        finally
        {
            calendarLock.Release();
        }
    }

    public async Task<List<ICloudCalendar>> DiscoverCalendarsAsync(Guid endUserIdentifier)
    {
        var credentials = await GetBasicAuthCredentialsAsync(endUserIdentifier);
        var httpClient = _httpClientFactory.CreateClient(HttpClientName);

        // =========================================================
        // STEP 1 — Discover current-user-principal
        // =========================================================

        using var principalRequest = new HttpRequestMessage(
            new HttpMethod("PROPFIND"),
            _settings.ServerUrl);

        principalRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);

        principalRequest.Headers.Add("Depth", "0");

        var principalXml = """
        <?xml version="1.0" encoding="utf-8" ?>
        <D:propfind xmlns:D="DAV:">
            <D:prop>
                <D:current-user-principal />
            </D:prop>
        </D:propfind>
        """;

        principalRequest.Content = new StringContent(
            principalXml,
            Encoding.UTF8,
            "application/xml");

        using var principalResponse =
            await httpClient.SendAsync(principalRequest);

        await EnsureAuthorizedAsync(principalResponse, endUserIdentifier);

        var principalResponseBody =
            await principalResponse.Content.ReadAsStringAsync();

        if (!principalResponse.IsSuccessStatusCode)
        {
            throw new Exception(
                $"Principal discovery failed: " +
                $"{principalResponse.StatusCode}\n" +
                principalResponseBody);
        }

        var principalDocument =
            XDocument.Parse(principalResponseBody);

        XNamespace dav = "DAV:";

        var principalHref =
            principalDocument
                .Descendants(dav + "current-user-principal")
                .Descendants(dav + "href")
                .FirstOrDefault()
                ?.Value;

        if (string.IsNullOrWhiteSpace(principalHref))
        {
            throw new Exception(
                "Could not find current-user-principal href.");
        }

        var principalUrl =
            new Uri(
                new Uri(_settings.ServerUrl),
                principalHref);

        Console.WriteLine(
            $"Principal URL: {principalUrl}");

        // =========================================================
        // STEP 2 — Discover calendar-home-set
        // =========================================================

        using var homeRequest = new HttpRequestMessage(
            new HttpMethod("PROPFIND"),
            principalUrl);

        homeRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);

        homeRequest.Headers.Add("Depth", "0");

        var homeXml = """
        <?xml version="1.0" encoding="utf-8" ?>
        <D:propfind xmlns:D="DAV:"
                    xmlns:C="urn:ietf:params:xml:ns:caldav">
            <D:prop>
                <C:calendar-home-set />
            </D:prop>
        </D:propfind>
        """;

        homeRequest.Content = new StringContent(
            homeXml,
            Encoding.UTF8,
            "application/xml");

        using var homeResponse =
            await httpClient.SendAsync(homeRequest);

        await EnsureAuthorizedAsync(homeResponse, endUserIdentifier);

        var homeResponseBody =
            await homeResponse.Content.ReadAsStringAsync();

        if (!homeResponse.IsSuccessStatusCode)
        {
            throw new Exception(
                $"Calendar home discovery failed: " +
                $"{homeResponse.StatusCode}\n" +
                homeResponseBody);
        }

        var homeDocument =
            XDocument.Parse(homeResponseBody);

        XNamespace caldav =
            "urn:ietf:params:xml:ns:caldav";

        var calendarHomeHref =
            homeDocument
                .Descendants(caldav + "calendar-home-set")
                .Descendants(dav + "href")
                .FirstOrDefault()
                ?.Value;

        if (string.IsNullOrWhiteSpace(calendarHomeHref))
        {
            throw new Exception(
                "Could not find calendar-home-set href.");
        }

        var calendarHomeUrl =
            new Uri(
                new Uri(_settings.ServerUrl),
                calendarHomeHref);

        Console.WriteLine(
            $"Calendar Home URL: {calendarHomeUrl}");

        // =========================================================
        // STEP 3 — Retrieve calendars
        // =========================================================

        using var calendarsRequest = new HttpRequestMessage(
            new HttpMethod("PROPFIND"),
            calendarHomeUrl);

        calendarsRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);

        calendarsRequest.Headers.Add("Depth", "1");

        var calendarsXml = """
    <?xml version="1.0" encoding="utf-8" ?>
    <D:propfind xmlns:D="DAV:"
                xmlns:C="urn:ietf:params:xml:ns:caldav">
        <D:prop>
            <D:displayname />
            <D:resourcetype />
            <C:supported-calendar-component-set />
        </D:prop>
    </D:propfind>
    """;

        calendarsRequest.Content = new StringContent(
            calendarsXml,
            Encoding.UTF8,
            "application/xml");

        using var calendarsResponse =
            await httpClient.SendAsync(calendarsRequest);

        await EnsureAuthorizedAsync(calendarsResponse, endUserIdentifier);

        var calendarsResponseBody =
            await calendarsResponse.Content.ReadAsStringAsync();

        if (!calendarsResponse.IsSuccessStatusCode)
        {
            throw new Exception(
                $"Calendar discovery failed: " +
                $"{calendarsResponse.StatusCode}\n" +
                calendarsResponseBody);
        }

        // =========================================================
        // STEP 4 — Parse XML
        // =========================================================

        var calendarsDocument =
            XDocument.Parse(calendarsResponseBody);

        var calendars = new List<ICloudCalendar>();

        foreach (var response in calendarsDocument
                     .Descendants(dav + "response"))
        {
            var href =
                response
                    .Element(dav + "href")
                    ?.Value
                    ?.Trim();

            var prop =
                response
                    .Descendants(dav + "prop")
                    .FirstOrDefault();

            if (prop == null || string.IsNullOrWhiteSpace(href))
            {
                continue;
            }

            var displayName =
                prop
                    .Element(dav + "displayname")
                    ?.Value
                    ?.Trim();

            if (string.IsNullOrWhiteSpace(displayName))
            {
                continue;
            }

            // Determine whether this resource is actually a calendar.
            var resourceType =
                prop.Element(dav + "resourcetype");

            var isCalendar =
                resourceType?
                    .Elements()
                    .Any(x => x.Name.LocalName == "calendar") == true;

            if (!isCalendar)
            {
                continue;
            }

            // ---------------------------------------------------------
            // Supported calendar components
            // ---------------------------------------------------------

            var components =
                prop
                    .Element(caldav + "supported-calendar-component-set")?
                    .Elements(caldav + "comp")
                    .Select(x => (string?)x.Attribute("name"))
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Cast<string>()
                    .ToList()
                    ?? [];

            var calendarUrl =
                new Uri(
                    new Uri(_settings.ServerUrl),
                    href);

            calendars.Add(new ICloudCalendar
            {
                Name = displayName,
                Url = calendarUrl.ToString(),
                IsCalendar = true,
                SupportedComponents = components
            });
        }

        Console.WriteLine(
            $"Discovered {calendars.Count} iCloud calendars.");

        foreach (var calendar in calendars)
        {
            Console.WriteLine(
                $"Calendar: {calendar.Name}");

            Console.WriteLine(
                $"URL: {calendar.Url}");

            Console.WriteLine(
                $"Components: " +
                $"{string.Join(", ", calendar.SupportedComponents)}");
        }

        return calendars;
    }

    public async Task<List<ICloudCalendarEvent>> GetEventsAsync(
        Guid endUserIdentifier,
        DateTime from,
        DateTime to)
    {
        var credentials = await GetBasicAuthCredentialsAsync(endUserIdentifier);
        var httpClient = _httpClientFactory.CreateClient(HttpClientName);

        // =========================================================
        // STEP 1 — Discover the selected calendar
        // =========================================================

        var calendar = await GetSelectedCalendarAsync(endUserIdentifier);

        Console.WriteLine($"Using calendar: {calendar.Url}");

        // =========================================================
        // STEP 2 — Create CalDAV calendar-query REPORT
        // =========================================================

        var calendarQueryXml = $"""
        <?xml version="1.0" encoding="utf-8" ?>
        <C:calendar-query
            xmlns:D="DAV:"
            xmlns:C="urn:ietf:params:xml:ns:caldav">

            <D:prop>
                <D:getetag />
                <C:calendar-data />
            </D:prop>

            <C:filter>
                <C:comp-filter name="VCALENDAR">
                    <C:comp-filter name="VEVENT">
                        <C:time-range
                            start="{ToCalDavDateTime(from)}"
                            end="{ToCalDavDateTime(to)}" />
                    </C:comp-filter>
                </C:comp-filter>
            </C:filter>

        </C:calendar-query>
        """;

        using var request = new HttpRequestMessage(
            new HttpMethod("REPORT"),
            calendar.Url);

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);

        request.Headers.Add("Depth", "1");

        request.Content = new StringContent(
            calendarQueryXml,
            Encoding.UTF8,
            "application/xml");

        // =========================================================
        // STEP 3 — Send request to iCloud
        // =========================================================

        using var response =
            await httpClient.SendAsync(request);

        await EnsureAuthorizedAsync(response, endUserIdentifier);

        var responseBody =
            await response.Content.ReadAsStringAsync();

        Console.WriteLine(
            $"Events Status: {(int)response.StatusCode}");

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception(
                $"Event retrieval failed: " +
                $"{response.StatusCode}\n" +
                responseBody);
        }

        // =========================================================
        // STEP 4 — Parse CalDAV XML
        // =========================================================

        var document =
            XDocument.Parse(responseBody);

        XNamespace dav = "DAV:";

        XNamespace caldav =
            "urn:ietf:params:xml:ns:caldav";

        var events =
            new List<ICloudCalendarEvent>();

        foreach (var responseElement in
                 document.Descendants(dav + "response"))
        {
            var calendarData =
                responseElement
                    .Descendants(caldav + "calendar-data")
                    .FirstOrDefault()
                    ?.Value;

            if (string.IsNullOrWhiteSpace(calendarData))
            {
                continue;
            }

            var calendarEvent =
                ParseCalendarEvent(calendarData);

            if (calendarEvent != null)
            {
                events.Add(calendarEvent);
            }
        }

        Console.WriteLine(
            $"Retrieved {events.Count} events.");

        return events;
    }

    public async Task<string> CreateEventAsync(
        Guid endUserIdentifier,
        CreateICloudCalendarEventRequest request)
    {
        var calendar = await GetSelectedCalendarAsync(endUserIdentifier);

        var uid = $"{Guid.NewGuid()}@icloud-calendar-api";

        var eventUrl =
            $"{calendar.Url.TrimEnd('/')}/{uid}.ics";

        var calendarData = $"""
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//icloud-calendar-api//EN
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{ToCalDavDateTime(DateTime.UtcNow)}
DTSTART:{ToCalDavDateTime(request.Start)}
DTEND:{ToCalDavDateTime(request.End)}
SUMMARY:{EscapeICalendarText(request.Summary)}
DESCRIPTION:{EscapeICalendarText(request.Description)}
LOCATION:{EscapeICalendarText(request.Location)}
END:VEVENT
END:VCALENDAR
""";

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Put,
            eventUrl);

        var credentials = await GetBasicAuthCredentialsAsync(endUserIdentifier);

        httpRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);

        httpRequest.Content = new StringContent(
            calendarData,
            Encoding.UTF8,
            "text/calendar");

        var httpClient = _httpClientFactory.CreateClient(HttpClientName);

        var response = await httpClient.SendAsync(httpRequest);

        await EnsureAuthorizedAsync(response, endUserIdentifier);

        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Failed to create iCloud event. " +
                $"Status: {(int)response.StatusCode} " +
                $"{response.StatusCode}. " +
                $"Response: {responseBody}");
        }

        return uid;
    }

    public async Task UpdateEventAsync(
        Guid endUserIdentifier,
        string uid,
        UpdateICloudCalendarEventRequest request)
    {
        var calendar = await GetSelectedCalendarAsync(endUserIdentifier);

        var eventUrl =
            $"{calendar.Url.TrimEnd('/')}/{uid}.ics";

        var calendarData = $"""
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//icloud-calendar-api//EN
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{ToCalDavDateTime(DateTime.UtcNow)}
DTSTART:{ToCalDavDateTime(request.Start)}
DTEND:{ToCalDavDateTime(request.End)}
SUMMARY:{EscapeICalendarText(request.Summary)}
DESCRIPTION:{EscapeICalendarText(request.Description)}
LOCATION:{EscapeICalendarText(request.Location)}
END:VEVENT
END:VCALENDAR
""";

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Put,
            eventUrl);

        var credentials = await GetBasicAuthCredentialsAsync(endUserIdentifier);

        httpRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);

        httpRequest.Content = new StringContent(
            calendarData,
            Encoding.UTF8,
            "text/calendar");

        var httpClient = _httpClientFactory.CreateClient(HttpClientName);

        var response =
            await httpClient.SendAsync(httpRequest);

        await EnsureAuthorizedAsync(response, endUserIdentifier);

        var responseBody =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Failed to update iCloud event. " +
                $"Status: {(int)response.StatusCode} " +
                $"{response.StatusCode}. " +
                $"Response: {responseBody}");
        }
    }

    public async Task DeleteEventAsync(Guid endUserIdentifier, string uid)
    {
        var calendar = await GetSelectedCalendarAsync(endUserIdentifier);

        var eventUrl =
            $"{calendar.Url.TrimEnd('/')}/{uid}.ics";

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Delete,
            eventUrl);

        var credentials = await GetBasicAuthCredentialsAsync(endUserIdentifier);

        httpRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);

        var httpClient = _httpClientFactory.CreateClient(HttpClientName);

        var response =
            await httpClient.SendAsync(httpRequest);

        await EnsureAuthorizedAsync(response, endUserIdentifier);

        var responseBody =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Failed to delete iCloud event. " +
                $"Status: {(int)response.StatusCode} " +
                $"{response.StatusCode}. " +
                $"Response: {responseBody}");
        }
    }

    // Callers are expected to pass UTC (or unspecified-treated-as-UTC) instants — there
    // is no per-client business timezone concept in this project, unlike the reference
    // implementation this was ported from, which converted to/from a hardcoded
    // "South Africa Standard Time" booking timezone.
    private static string ToCalDavDateTime(DateTime dateTime)
    {
        var utcTime = dateTime.Kind switch
        {
            DateTimeKind.Utc => dateTime,
            DateTimeKind.Local => dateTime.ToUniversalTime(),
            _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
        };

        return utcTime.ToString(
            "yyyyMMdd'T'HHmmss'Z'");
    }

    private static ICloudCalendarEvent? ParseCalendarEvent(
        string calendarData)
    {
        var lines = calendarData
            .Replace("\r\n ", "")
            .Replace("\n ", "")
            .Split(
                new[] { "\r\n", "\n" },
                StringSplitOptions.RemoveEmptyEntries);

        string GetValue(string propertyName)
        {
            var line = lines.FirstOrDefault(x =>
                x.StartsWith(
                    propertyName + ":",
                    StringComparison.OrdinalIgnoreCase) ||
                x.StartsWith(
                    propertyName + ";",
                    StringComparison.OrdinalIgnoreCase));

            if (line == null)
            {
                return string.Empty;
            }

            var colonIndex = line.IndexOf(':');

            if (colonIndex < 0)
            {
                return string.Empty;
            }

            return line[(colonIndex + 1)..].Trim();
        }

        var uid = GetValue("UID");

        if (string.IsNullOrWhiteSpace(uid))
        {
            return null;
        }

        var startValue = GetValue("DTSTART");
        var endValue = GetValue("DTEND");

        if (!TryParseICalendarDate(startValue, out var start))
        {
            return null;
        }

        if (!TryParseICalendarDate(endValue, out var end))
        {
            return null;
        }

        return new ICloudCalendarEvent
        {
            Uid = uid,
            Summary = GetValue("SUMMARY"),
            Description = GetValue("DESCRIPTION"),
            Location = GetValue("LOCATION"),
            Start = start,
            End = end
        };
    }

    private static bool TryParseICalendarDate(
        string value,
        out DateTime result)
    {
        result = default;

        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        string[] formats =
        [
            "yyyyMMdd'T'HHmmss'Z'",
            "yyyyMMdd'T'HHmmss",
            "yyyyMMdd"
        ];

        if (!DateTime.TryParseExact(
                value,
                formats,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None,
                out var parsed))
        {
            return false;
        }

        // iCloud value ending in Z = UTC. Unlike the reference implementation, this is
        // not converted into a fixed business timezone — it's returned as UTC.
        if (value.EndsWith("Z", StringComparison.OrdinalIgnoreCase))
        {
            result = DateTime.SpecifyKind(parsed, DateTimeKind.Utc);

            return true;
        }

        // Floating/local calendar time.
        result = DateTime.SpecifyKind(
            parsed,
            DateTimeKind.Unspecified);

        return true;
    }

    private static string EscapeICalendarText(string value)
    {
        return value
            .Replace("\\", "\\\\")
            .Replace(";", "\\;")
            .Replace(",", "\\,")
            .Replace("\r\n", "\\n")
            .Replace("\n", "\\n");
    }
}
