using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace icloud_calendar_api.Features.Auth;

/// <summary>
/// Authenticates the admin-only Clients/ApiKeys management endpoints against a single
/// static key from configuration ("Admin:ApiKey"), sent as the "X-Admin-Key" header.
///
/// This is a deliberately separate scheme from ApiKeyAuthenticationHandler (the
/// per-client Bearer-token scheme used under /v1) — see AdminAuthenticationDefaults.
/// The two guard disjoint route sets and are never both evaluated for the same
/// request, so there is no "which scheme wins" ambiguity between them.
/// </summary>
public class AdminApiKeyAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly IConfiguration _configuration;

    public AdminApiKeyAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IConfiguration configuration)
        : base(options, logger, encoder)
    {
        _configuration = configuration;
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var configuredKey = _configuration["Admin:ApiKey"];

        if (string.IsNullOrEmpty(configuredKey))
        {
            Logger.LogError("Admin authentication failed: Admin:ApiKey is not configured.");
            return Task.FromResult(AuthenticateResult.Fail("Admin authentication is not configured."));
        }

        if (!Request.Headers.TryGetValue(AdminAuthenticationDefaults.HeaderName, out var providedKeyHeader) || providedKeyHeader.Count == 0)
        {
            Logger.LogWarning("Admin authentication failed: {Header} header missing.", AdminAuthenticationDefaults.HeaderName);
            return Task.FromResult(AuthenticateResult.Fail($"{AdminAuthenticationDefaults.HeaderName} header is required."));
        }

        var providedKey = providedKeyHeader.ToString();

        if (!ConstantTimeEquals(providedKey, configuredKey))
        {
            Logger.LogWarning("Admin authentication failed: key mismatch.");
            return Task.FromResult(AuthenticateResult.Fail("Invalid admin key."));
        }

        var claims = new[] { new Claim(ClaimTypes.Role, "Admin") };
        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;

        return Response.WriteAsJsonAsync(new
        {
            error = $"Missing or invalid {AdminAuthenticationDefaults.HeaderName} header."
        });
    }

    // CryptographicOperations.FixedTimeEquals requires equal-length inputs to be
    // meaningful; a length mismatch is not itself sensitive (an admin key's length
    // isn't a secret worth defending), so it's fine to short-circuit on that.
    private static bool ConstantTimeEquals(string a, string b)
    {
        var aBytes = Encoding.UTF8.GetBytes(a);
        var bBytes = Encoding.UTF8.GetBytes(b);

        if (aBytes.Length != bBytes.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(aBytes, bBytes);
    }
}
