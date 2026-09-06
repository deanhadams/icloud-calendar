namespace icloud_calendar_api.Features.Calendar;

/// <summary>
/// Bound from configuration section "ICloudDav". ServerUrl is the CalDAV discovery
/// root; iCloud redirects this to the account's actual pod, so HttpClient's default
/// auto-redirect behavior is relied on.
/// </summary>
public class ICloudDavSettings
{
    public string ServerUrl { get; set; } = "https://caldav.icloud.com";
}
