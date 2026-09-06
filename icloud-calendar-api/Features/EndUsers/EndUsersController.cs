using System.Globalization;
using System.Security.Claims;
using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Auth;
using icloud_calendar_api.Features.Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace icloud_calendar_api.Features.EndUsers;

[ApiController]
[Authorize]
[Route("v1/users")]
public class EndUsersController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordEncryptionService _encryptionService;
    private readonly EndUserCreationService _creationService;

    public EndUsersController(AppDbContext dbContext, IPasswordEncryptionService encryptionService, EndUserCreationService creationService)
    {
        _dbContext = dbContext;
        _encryptionService = encryptionService;
        _creationService = creationService;
    }

    public record CreateEndUserRequest(string IcloudEmail, string AppSpecificPassword, string CalendarName);

    public record CreateEndUserResponse(Guid UserId, string Status);

    public record EndUserResponse(Guid UserId, string Status, string CalendarName, string IcloudEmail);

    public record UpdateCredentialsRequest(string AppSpecificPassword);

    public record UpdateCredentialsResponse(Guid UserId, string Status);

    [HttpPost]
    public async Task<ActionResult<CreateEndUserResponse>> Create(CreateEndUserRequest request)
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.IcloudEmail) ||
            string.IsNullOrWhiteSpace(request.AppSpecificPassword) ||
            string.IsNullOrWhiteSpace(request.CalendarName))
        {
            return BadRequest("icloudEmail, appSpecificPassword, and calendarName are required.");
        }

        var endUser = await _creationService.CreateAsync(clientId, request.IcloudEmail, request.AppSpecificPassword, request.CalendarName);

        var response = new CreateEndUserResponse(endUser.EndUserIdentifier, endUser.Status);

        return CreatedAtAction(nameof(GetByIdentifier), new { userId = endUser.EndUserIdentifier }, response);
    }

    [HttpGet("{userId:guid}")]
    public async Task<ActionResult<EndUserResponse>> GetByIdentifier(Guid userId)
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        var endUser = await _dbContext.EndUsers
            .SingleOrDefaultAsync(u => u.EndUserIdentifier == userId && u.ClientId == clientId);

        if (endUser is null)
        {
            return NotFound();
        }

        return new EndUserResponse(endUser.EndUserIdentifier, endUser.Status, endUser.CalendarName, endUser.IcloudEmail);
    }

    [HttpPatch("{userId:guid}/credentials")]
    public async Task<ActionResult<UpdateCredentialsResponse>> UpdateCredentials(Guid userId, UpdateCredentialsRequest request)
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.AppSpecificPassword))
        {
            return BadRequest("appSpecificPassword is required.");
        }

        var endUser = await _dbContext.EndUsers
            .SingleOrDefaultAsync(u => u.EndUserIdentifier == userId && u.ClientId == clientId);

        if (endUser is null)
        {
            return NotFound();
        }

        var (ciphertext, iv, authTag) = _encryptionService.Encrypt(request.AppSpecificPassword);

        endUser.EncryptedPassword = ciphertext;
        endUser.EncryptionIv = iv;
        endUser.EncryptionAuthTag = authTag;
        endUser.Status = "connected";

        await _dbContext.SaveChangesAsync();

        return new UpdateCredentialsResponse(endUser.EndUserIdentifier, endUser.Status);
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
