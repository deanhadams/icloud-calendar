using icloud_calendar_api.Features.ApiKeys;
using icloud_calendar_api.Features.EndUsers;

namespace icloud_calendar_api.Features.Clients;

public class Client
{
    public int Id { get; set; }
    public Guid ClientIdentifier { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The client's Google account email, used to look them up on dashboard sign-in
    /// (DashboardAuthController). Nullable because existing/admin-provisioned clients
    /// may not have one set yet.
    /// </summary>
    public string? Email { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
    public ICollection<EndUser> EndUsers { get; set; } = new List<EndUser>();
}
