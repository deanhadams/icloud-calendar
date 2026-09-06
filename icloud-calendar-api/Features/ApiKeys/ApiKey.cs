using icloud_calendar_api.Features.Clients;

namespace icloud_calendar_api.Features.ApiKeys;

public class ApiKey
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string KeyHash { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public DateTimeOffset CreatedAt { get; set; }

    public Client Client { get; set; } = null!;
}
