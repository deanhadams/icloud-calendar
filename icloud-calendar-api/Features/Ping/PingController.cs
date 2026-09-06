using System.Globalization;
using System.Security.Claims;
using icloud_calendar_api.Features.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace icloud_calendar_api.Features.Ping;

[ApiController]
[Authorize]
[Route("v1/ping")]
public class PingController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var clientId = int.Parse(
            User.FindFirstValue(ApiKeyAuthenticationDefaults.ClientIdClaimType)!,
            CultureInfo.InvariantCulture);

        var clientIdentifier = Guid.Parse(
            User.FindFirstValue(ApiKeyAuthenticationDefaults.ClientIdentifierClaimType)!);

        return Ok(new
        {
            ok = true,
            clientId,
            clientIdentifier
        });
    }
}
