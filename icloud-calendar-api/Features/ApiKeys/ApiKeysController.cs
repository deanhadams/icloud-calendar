using System.Security.Cryptography;
using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace icloud_calendar_api.Features.ApiKeys;

[ApiController]
[Authorize(AuthenticationSchemes = AdminAuthenticationDefaults.SchemeName)]
[Route("[controller]")]
public class ApiKeysController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ApiKeysController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public record CreateApiKeyRequest(Guid ClientIdentifier);

    public record CreateApiKeyResponse(int Id, string Key, string Status, DateTimeOffset CreatedAt, Guid ClientIdentifier);

    [HttpPost]
    public async Task<ActionResult<CreateApiKeyResponse>> Create(CreateApiKeyRequest request)
    {
        var client = await _dbContext.Clients.SingleOrDefaultAsync(c => c.ClientIdentifier == request.ClientIdentifier);

        if (client is null)
        {
            return NotFound("Client not found.");
        }

        var (rawKey, keyHash) = GenerateApiKey();

        var apiKey = new ApiKey
        {
            ClientId = client.Id,
            KeyHash = keyHash
        };

        _dbContext.ApiKeys.Add(apiKey);
        await _dbContext.SaveChangesAsync();

        var response = new CreateApiKeyResponse(apiKey.Id, rawKey, apiKey.Status, apiKey.CreatedAt, client.ClientIdentifier);

        return Created($"/ApiKeys/{apiKey.Id}", response);
    }

    private static (string RawKey, string KeyHash) GenerateApiKey()
    {
        var rawKey = "ak_" + Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

        return (rawKey, ApiKeyHasher.Hash(rawKey));
    }
}
