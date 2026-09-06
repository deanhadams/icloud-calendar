namespace icloud_calendar_api.Features.Calendar;

/// <summary>
/// Service-level request shapes for ICloudCalendarService. Start/End are treated as UTC
/// (see ICloudCalendarService.ToCalDavDateTime) — there is no per-client business timezone
/// concept here, unlike the reference implementation this was ported from.
/// </summary>
public record CreateICloudCalendarEventRequest(DateTime Start, DateTime End, string Summary, string Description, string Location);

public record UpdateICloudCalendarEventRequest(DateTime Start, DateTime End, string Summary, string Description, string Location);
