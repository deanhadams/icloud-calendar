using System.Globalization;
using System.Security.Claims;
using System.Text.Encodings.Web;
using icloud_calendar_api.Data;
using icloud_calendar_api.Features.ApiKeys;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace icloud_calendar_api.Features.Auth;

public class ApiKeyAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private const string BearerPrefix = "Bearer ";

    private readonly AppDbContext _dbContext;

    public ApiKeyAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        AppDbContext dbContext)
        : base(options, logger, encoder)
    {
        _dbContext = dbContext;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authorizationHeader) || authorizationHeader.Count == 0)
        {
            Logger.LogWarning("API key authentication failed: Authorization header missing.");
            return AuthenticateResult.Fail("Authorization header missing.");
        }

        var headerValue = authorizationHeader.ToString();
        if (!headerValue.StartsWith(BearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            Logger.LogWarning("API key authentication failed: Authorization header is not a Bearer token.");
            return AuthenticateResult.Fail("Authorization header must use the Bearer scheme.");
        }

        var rawKey = headerValue[BearerPrefix.Length..].Trim();
        if (string.IsNullOrEmpty(rawKey))
        {
            Logger.LogWarning("API key authentication failed: Bearer token is empty.");
            return AuthenticateResult.Fail("Bearer token is empty.");
        }

        var keyHash = ApiKeyHasher.Hash(rawKey);

        var apiKey = await _dbContext.ApiKeys
            .Include(k => k.Client)
            .SingleOrDefaultAsync(k => k.KeyHash == keyHash);

        if (apiKey is null)
        {
            Logger.LogWarning("API key authentication failed: no API key matches the provided hash.");
            return AuthenticateResult.Fail("Invalid API key.");
        }

        if (!string.Equals(apiKey.Status, "active", StringComparison.OrdinalIgnoreCase))
        {
            Logger.LogWarning(
                "API key authentication failed: key {ApiKeyId} for client {ClientId} has status '{Status}'.",
                apiKey.Id, apiKey.ClientId, apiKey.Status);
            return AuthenticateResult.Fail("API key is not active.");
        }

        var claims = new[]
        {
            new Claim(ApiKeyAuthenticationDefaults.ClientIdClaimType, apiKey.ClientId.ToString(CultureInfo.InvariantCulture)),
            new Claim(ApiKeyAuthenticationDefaults.ClientIdentifierClaimType, apiKey.Client.ClientIdentifier.ToString()),
            new Claim(ApiKeyAuthenticationDefaults.ApiKeyIdClaimType, apiKey.Id.ToString(CultureInfo.InvariantCulture)),
            new Claim(ApiKeyAuthenticationDefaults.TierClaimType, apiKey.Tier)
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}
