namespace icloud_calendar_api.Features.Auth;

public static class ApiKeyAuthenticationDefaults
{
    public const string SchemeName = "ApiKey";

    /// <summary>The ApiKey's owning Client.Id (int), for internal FK lookups.</summary>
    public const string ClientIdClaimType = "client_id";

    /// <summary>The Client's ClientIdentifier (Guid), for client-facing use.</summary>
    public const string ClientIdentifierClaimType = "client_identifier";

    /// <summary>The authenticated ApiKey's own Id (int) — the rate-limiting bucket key.</summary>
    public const string ApiKeyIdClaimType = "api_key_id";

    /// <summary>The authenticated ApiKey's rate-limit Tier (string, e.g. "Free").</summary>
    public const string TierClaimType = "tier";
}
