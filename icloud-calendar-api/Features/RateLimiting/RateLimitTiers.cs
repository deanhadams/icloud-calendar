namespace icloud_calendar_api.Features.RateLimiting;

/// <summary>
/// Maps ApiKey.Tier to a requests-per-minute limit. Adding a paid tier later is just
/// adding an entry here (plus setting Tier on the relevant ApiKey rows) — no schema
/// change needed.
/// </summary>
public static class RateLimitTiers
{
    public const string DefaultTier = "Free";

    public static readonly Dictionary<string, int> RequestsPerMinute = new()
    {
        { "Free", 10 },
        { "Paid", 60 }
    };
}
