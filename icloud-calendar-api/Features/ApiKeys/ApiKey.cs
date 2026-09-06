using icloud_calendar_api.Features.Clients;

namespace icloud_calendar_api.Features.ApiKeys;

public class ApiKey
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string KeyHash { get; set; } = string.Empty;
    public string Status { get; set; } = "active";

    /// <summary>
    /// Rate-limit tier name (see RateLimitTiers.RequestsPerMinute). Lives on the key,
    /// not the Client, so one client can have multiple keys on different tiers later.
    /// </summary>
    public string Tier { get; set; } = "Free";

    public DateTimeOffset CreatedAt { get; set; }

    public Client Client { get; set; } = null!;
}
