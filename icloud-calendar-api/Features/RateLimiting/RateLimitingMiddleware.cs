using System.Globalization;
using System.Security.Claims;
using System.Text.Json;
using icloud_calendar_api.Features.Auth;
using StackExchange.Redis;

namespace icloud_calendar_api.Features.RateLimiting;

/// <summary>
/// Per-ApiKey fixed-window rate limiting backed by Upstash (Redis-protocol) via
/// StackExchange.Redis. Registered globally in Program.cs but scoped to /v1 routes;
/// requests that never authenticated are passed through untouched so the normal
/// [Authorize] 401 still happens downstream.
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;

    public RateLimitingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IConnectionMultiplexer redis)
    {
        if (!context.Request.Path.StartsWithSegments("/v1"))
        {
            await _next(context);
            return;
        }

        var apiKeyIdClaim = context.User.FindFirst(ApiKeyAuthenticationDefaults.ApiKeyIdClaimType);

        if (apiKeyIdClaim == null)
        {
            // No authenticated ApiKey (missing/invalid credentials) — nothing to rate
            // limit; let the authorization middleware downstream reject the request.
            await _next(context);
            return;
        }

        var tier = context.User.FindFirstValue(ApiKeyAuthenticationDefaults.TierClaimType);

        if (string.IsNullOrWhiteSpace(tier) || !RateLimitTiers.RequestsPerMinute.TryGetValue(tier, out var limit))
        {
            tier = RateLimitTiers.DefaultTier;
            limit = RateLimitTiers.RequestsPerMinute[tier];
        }

        var nowUnixSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var windowStartUnixSeconds = nowUnixSeconds - (nowUnixSeconds % 60);
        var currentMinute = windowStartUnixSeconds / 60;
        var retryAfterSeconds = (int)(windowStartUnixSeconds + 60 - nowUnixSeconds);

        var redisKey = $"ratelimit:{apiKeyIdClaim.Value}:{currentMinute}";

        var db = redis.GetDatabase();

        var count = await db.StringIncrementAsync(redisKey);

        if (count == 1)
        {
            await db.KeyExpireAsync(redisKey, TimeSpan.FromSeconds(70));
        }

        if (count > limit)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.Headers.RetryAfter = retryAfterSeconds.ToString(CultureInfo.InvariantCulture);
            context.Response.ContentType = "application/json";

            var body = JsonSerializer.Serialize(new
            {
                error = "Rate limit exceeded",
                tier,
                limit,
                retryAfterSeconds
            });

            await context.Response.WriteAsync(body);
            return;
        }

        context.Response.Headers["X-RateLimit-Limit"] = limit.ToString(CultureInfo.InvariantCulture);
        context.Response.Headers["X-RateLimit-Remaining"] = Math.Max(0, limit - count).ToString(CultureInfo.InvariantCulture);

        await _next(context);
    }
}
