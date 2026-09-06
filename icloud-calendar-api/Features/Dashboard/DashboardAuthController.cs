using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace icloud_calendar_api.Features.Dashboard;

/// <summary>
/// Exchanges a verified Google ID token for a short-lived dashboard session JWT
/// (see DashboardAuthenticationDefaults / DashboardController). Unauthenticated by
/// design — this *is* the login endpoint.
/// </summary>
[ApiController]
[Route("v1/auth")]
public class DashboardAuthController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public DashboardAuthController(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public record GoogleSignInRequest(string IdToken);

    public record GoogleSignInResponse(string Token, string ClientName, DateTimeOffset ExpiresAt);

    [HttpPost("google")]
    public async Task<ActionResult<GoogleSignInResponse>> SignInWithGoogle(GoogleSignInRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return BadRequest("idToken is required.");
        }

        GoogleJsonWebSignature.Payload payload;

        try
        {
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings();

            // If Google:ClientId (your OAuth client ID) is configured, restrict to ID
            // tokens issued for *this* app. Without this, ValidateAsync only checks the
            // token's signature/issuer/expiry — any valid Google ID token from any app
            // would pass, letting someone reuse a token meant for an unrelated app to
            // sign in here as long as the email happens to match a Client row.
            var googleClientId = _configuration["Google:ClientId"];

            if (!string.IsNullOrWhiteSpace(googleClientId))
            {
                validationSettings.Audience = new[] { googleClientId };
            }

            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, validationSettings);
        }
        catch (InvalidJwtException ex)
        {
            return Unauthorized(new { error = "Invalid Google ID token.", detail = ex.Message });
        }

        if (string.IsNullOrWhiteSpace(payload.Email) || !payload.EmailVerified)
        {
            return Unauthorized(new { error = "Google account email is not verified." });
        }

        // Verified email only — the request body's idToken is the only untrusted input;
        // nothing else in the request is used for identity.
        var verifiedEmail = payload.Email;

        var client = await _dbContext.Clients
            .AsNoTracking()
            .SingleOrDefaultAsync(c => c.Email != null && EF.Functions.ILike(c.Email, verifiedEmail));

        if (client is null)
        {
            return Unauthorized(new { error = "No account found for this email." });
        }

        var (token, expiresAt) = IssueDashboardToken(client.Id, client.ClientIdentifier);

        return Ok(new GoogleSignInResponse(token, client.Name, expiresAt));
    }

    private (string Token, DateTimeOffset ExpiresAt) IssueDashboardToken(int clientId, Guid clientIdentifier)
    {
        var secret = _configuration["Dashboard:JwtSecret"];

        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("Dashboard:JwtSecret is not configured.");
        }

        var expiresAt = DateTimeOffset.UtcNow.AddHours(24);

        var claims = new[]
        {
            new Claim(ApiKeyAuthenticationDefaults.ClientIdClaimType, clientId.ToString(System.Globalization.CultureInfo.InvariantCulture)),
            new Claim(ApiKeyAuthenticationDefaults.ClientIdentifierClaimType, clientIdentifier.ToString()),
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var signingCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: signingCredentials);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return (tokenString, expiresAt);
    }
}
