namespace icloud_calendar_api.Features.Auth;

public static class ApiKeyAuthenticationDefaults
{
    public const string SchemeName = "ApiKey";

    /// <summary>The ApiKey's owning Client.Id (int), for internal FK lookups.</summary>
    public const string ClientIdClaimType = "client_id";

    /// <summary>The Client's ClientIdentifier (Guid), for client-facing use.</summary>
    public const string ClientIdentifierClaimType = "client_identifier";
}
