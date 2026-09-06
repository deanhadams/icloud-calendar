using icloud_calendar_api.Features.ApiKeys;

namespace icloud_calendar_api.Features.Clients;

public class Client
{
    public int Id { get; set; }
    public Guid ClientIdentifier { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
}
