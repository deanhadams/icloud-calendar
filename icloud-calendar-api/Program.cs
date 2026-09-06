using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Auth;
using icloud_calendar_api.Features.Calendar;
using icloud_calendar_api.Features.Encryption;
using icloud_calendar_api.Features.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

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

builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
{
    var connectionString = builder.Configuration["Redis:ConnectionString"];

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "Redis:ConnectionString is not configured. Set it to your Upstash Redis connection " +
            "string (e.g. as a Railway environment variable) or in appsettings.Development.json for " +
            "local development.");
    }

    return ConnectionMultiplexer.Connect(ParseRedisConnectionString(connectionString));
});

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
app.UseMiddleware<RateLimitingMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Upstash gives connection strings as a redis://.../rediss://... URI, which
// StackExchange.Redis's own connection-string parser does not understand (it expects
// "host:port,password=...,ssl=True" instead) — parsed by hand into ConfigurationOptions.
// AbortOnConnectFail is set to false so transient connect failures are retried instead
// of throwing, per the RedisConnectionException's own suggested fix.
static ConfigurationOptions ParseRedisConnectionString(string connectionString)
{
    var uri = new Uri(connectionString);

    var userInfoParts = uri.UserInfo.Split(':', 2);
    var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : null;

    var options = new ConfigurationOptions
    {
        Password = password,
        Ssl = string.Equals(uri.Scheme, "rediss", StringComparison.OrdinalIgnoreCase),
        AbortOnConnectFail = false,
    };

    options.EndPoints.Add(uri.Host, uri.Port);

    return options;
}
