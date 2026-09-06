using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace icloud_calendar_api.Features.Clients;

[ApiController]
[Authorize(AuthenticationSchemes = AdminAuthenticationDefaults.SchemeName)]
[Route("[controller]")]
public class ClientsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ClientsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public record CreateClientRequest(string Name);

    [HttpPost]
    public async Task<ActionResult<Client>> Create(CreateClientRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Name is required.");
        }

        var client = new Client { Name = request.Name };
        _dbContext.Clients.Add(client);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByIdentifier), new { clientIdentifier = client.ClientIdentifier }, client);
    }

    [HttpGet("by-identifier/{clientIdentifier:guid}")]
    public async Task<ActionResult<Client>> GetByIdentifier(Guid clientIdentifier)
    {
        var client = await _dbContext.Clients.SingleOrDefaultAsync(c => c.ClientIdentifier == clientIdentifier);

        if (client is null)
        {
            return NotFound();
        }

        return client;
    }
}
