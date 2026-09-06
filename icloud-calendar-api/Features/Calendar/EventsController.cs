using System.Globalization;
using System.Security.Claims;
using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace icloud_calendar_api.Features.Calendar;

[ApiController]
[Authorize]
[Route("v1/users/{userId:guid}/events")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICloudCalendarService _calendarService;

    public EventsController(AppDbContext dbContext, ICloudCalendarService calendarService)
    {
        _dbContext = dbContext;
        _calendarService = calendarService;
    }

    public record CalendarEventResponse(string EventId, string Title, DateTime Start, DateTime End, string? Location, string? Notes);

    public record CreateEventRequest(string Title, DateTime Start, DateTime End, string? Location, string? Notes);

    public record UpdateEventRequest(string Title, DateTime Start, DateTime End, string? Location, string? Notes);

    public record CreateEventResponse(string EventId);

    [HttpGet]
    public async Task<ActionResult<List<CalendarEventResponse>>> GetEvents(Guid userId, [FromQuery] DateTime start, [FromQuery] DateTime end)
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        if (!await OwnsEndUserAsync(userId, clientId))
        {
            return NotFound();
        }

        try
        {
            var events = await _calendarService.GetEventsAsync(userId, start, end);

            var response = events
                .Select(e => new CalendarEventResponse(e.Uid, e.Summary, e.Start, e.End, e.Location, e.Description))
                .ToList();

            return response;
        }
        catch (ICloudUnauthorizedException)
        {
            return NeedsReconnectConflict();
        }
        catch (EndUserCredentialsMissingException)
        {
            return NeedsReconnectConflict();
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status502BadGateway, title: "iCloud calendar request failed.");
        }
    }

    [HttpPost]
    public async Task<ActionResult<CreateEventResponse>> CreateEvent(Guid userId, CreateEventRequest request)
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        if (!await OwnsEndUserAsync(userId, clientId))
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest("title is required.");
        }

        if (request.End <= request.Start)
        {
            return BadRequest("end must be after start.");
        }

        try
        {
            var uid = await _calendarService.CreateEventAsync(
                userId,
                new CreateICloudCalendarEventRequest(
                    request.Start,
                    request.End,
                    request.Title,
                    request.Notes ?? string.Empty,
                    request.Location ?? string.Empty));

            var response = new CreateEventResponse(uid);

            return CreatedAtAction(nameof(GetEvents), new { userId, start = request.Start, end = request.End }, response);
        }
        catch (ICloudUnauthorizedException)
        {
            return NeedsReconnectConflict();
        }
        catch (EndUserCredentialsMissingException)
        {
            return NeedsReconnectConflict();
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status502BadGateway, title: "iCloud calendar request failed.");
        }
    }

    [HttpPatch("{eventId}")]
    public async Task<IActionResult> UpdateEvent(Guid userId, string eventId, UpdateEventRequest request)
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        if (!await OwnsEndUserAsync(userId, clientId))
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest("title is required.");
        }

        if (request.End <= request.Start)
        {
            return BadRequest("end must be after start.");
        }

        try
        {
            await _calendarService.UpdateEventAsync(
                userId,
                eventId,
                new UpdateICloudCalendarEventRequest(
                    request.Start,
                    request.End,
                    request.Title,
                    request.Notes ?? string.Empty,
                    request.Location ?? string.Empty));

            return NoContent();
        }
        catch (ICloudUnauthorizedException)
        {
            return NeedsReconnectConflict();
        }
        catch (EndUserCredentialsMissingException)
        {
            return NeedsReconnectConflict();
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status502BadGateway, title: "iCloud calendar request failed.");
        }
    }

    [HttpDelete("{eventId}")]
    public async Task<IActionResult> DeleteEvent(Guid userId, string eventId)
    {
        if (!TryGetClientId(out var clientId))
        {
            return Unauthorized();
        }

        if (!await OwnsEndUserAsync(userId, clientId))
        {
            return NotFound();
        }

        try
        {
            await _calendarService.DeleteEventAsync(userId, eventId);

            return NoContent();
        }
        catch (ICloudUnauthorizedException)
        {
            return NeedsReconnectConflict();
        }
        catch (EndUserCredentialsMissingException)
        {
            return NeedsReconnectConflict();
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status502BadGateway, title: "iCloud calendar request failed.");
        }
    }

    private ObjectResult NeedsReconnectConflict()
    {
        return Problem(
            detail: "This end user's iCloud credentials are no longer valid and must be reconnected.",
            statusCode: StatusCodes.Status409Conflict,
            title: "iCloud reconnect required.");
    }

    private async Task<bool> OwnsEndUserAsync(Guid userId, int clientId)
    {
        return await _dbContext.EndUsers
            .AsNoTracking()
            .AnyAsync(u => u.EndUserIdentifier == userId && u.ClientId == clientId);
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
