using icloud_calendar_api.Features.Clients;

namespace icloud_calendar_api.Features.EndUsers;

public class EndUser
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public Guid EndUserIdentifier { get; set; }
    public string IcloudEmail { get; set; } = string.Empty;
    public string EncryptedPassword { get; set; } = string.Empty;
    public string EncryptionIv { get; set; } = string.Empty;
    public string EncryptionAuthTag { get; set; } = string.Empty;
    public string CalendarName { get; set; } = string.Empty;
    public string Status { get; set; } = "connected";
    public DateTimeOffset CreatedAt { get; set; }

    public Client Client { get; set; } = null!;
}
