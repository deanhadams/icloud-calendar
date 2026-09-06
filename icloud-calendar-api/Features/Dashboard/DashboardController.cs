using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using icloud_calendar_api.Data;
using icloud_calendar_api.Features.ApiKeys;
using icloud_calendar_api.Features.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace icloud_calendar_api.Features.Dashboard;

[ApiController]
[Authorize(AuthenticationSchemes = DashboardAuthenticationDefaults.SchemeName)]
[Route("v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public DashboardController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public record MeResponse(int ClientId, Guid ClientIdentifier, string Name, string? Email);

    public record ApiKeySummaryResponse(int Id, string Status, string Tier, DateTimeOffset CreatedAt);

    public record CreateApiKeyResponse(int Id, string Key, string Status, string Tier, DateTimeOffset CreatedAt);

    public record EndUserSummaryResponse(Guid UserId, string IcloudEmail, string CalendarName, string Status);

    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> GetMe()
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        var client = await _dbContext.Clients
            .AsNoTracking()
            .SingleOrDefaultAsync(c => c.Id == clientId);

        if (client is null)
        {
            return NotFound();
        }

        return new MeResponse(client.Id, client.ClientIdentifier, client.Name, client.Email);
    }

    [HttpGet("api-keys")]
    public async Task<ActionResult<List<ApiKeySummaryResponse>>> GetApiKeys()
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        var apiKeys = await _dbContext.ApiKeys
            .AsNoTracking()
            .Where(k => k.ClientId == clientId)
            .Select(k => new ApiKeySummaryResponse(k.Id, k.Status, k.Tier, k.CreatedAt))
            .ToListAsync();

        return apiKeys;
    }

    [HttpPost("api-keys")]
    public async Task<ActionResult<CreateApiKeyResponse>> CreateApiKey()
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        var (rawKey, keyHash) = GenerateApiKey();

        var apiKey = new ApiKey
        {
            ClientId = clientId,
            KeyHash = keyHash
        };

        _dbContext.ApiKeys.Add(apiKey);
        await _dbContext.SaveChangesAsync();

        var response = new CreateApiKeyResponse(apiKey.Id, rawKey, apiKey.Status, apiKey.Tier, apiKey.CreatedAt);

        return CreatedAtAction(nameof(GetApiKeys), response);
    }

    [HttpPatch("api-keys/{id:int}/revoke")]
    public async Task<IActionResult> RevokeApiKey(int id)
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        var apiKey = await _dbContext.ApiKeys
            .SingleOrDefaultAsync(k => k.Id == id && k.ClientId == clientId);

        if (apiKey is null)
        {
            return NotFound();
        }

        apiKey.Status = "revoked";
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("end-users")]
    public async Task<ActionResult<List<EndUserSummaryResponse>>> GetEndUsers()
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        var endUsers = await _dbContext.EndUsers
            .AsNoTracking()
            .Where(u => u.ClientId == clientId)
            .Select(u => new EndUserSummaryResponse(u.EndUserIdentifier, u.IcloudEmail, u.CalendarName, u.Status))
            .ToListAsync();

        return endUsers;
    }

    private static (string RawKey, string KeyHash) GenerateApiKey()
    {
        var rawKey = "ak_" + Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

        return (rawKey, ApiKeyHasher.Hash(rawKey));
    }

    private bool TryGetClientId(out int clientId)
    {
        var claimValue = User.FindFirstValue(ApiKeyAuthenticationDefaults.ClientIdClaimType);

        if (claimValue is null || !int.TryParse(claimValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out clientId))
        {
            clientId = 0;
            return false;
        }

        return true;
    }
}
