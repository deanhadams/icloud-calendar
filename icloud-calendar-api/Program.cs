using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Auth;
using icloud_calendar_api.Features.Calendar;
using icloud_calendar_api.Features.Encryption;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// AddDbContextFactory also registers AppDbContext itself as scoped, so existing
// constructor-injected AppDbContext usage (controllers, the auth handler) is
// unaffected; the factory is only needed by the singleton ICloudCalendarService below.
builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(ApiKeyAuthenticationDefaults.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(ApiKeyAuthenticationDefaults.SchemeName, options => { });

builder.Services.AddSingleton<IPasswordEncryptionService, AesGcmPasswordEncryptionService>();

builder.Services.Configure<ICloudDavSettings>(builder.Configuration.GetSection("ICloudDav"));
builder.Services.AddHttpClient("ICloudCalDav");

// Singleton so the per-end-user calendar discovery cache inside ICloudCalendarService
// persists across requests instead of being rebuilt on every call.
builder.Services.AddSingleton<ICloudCalendarService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
