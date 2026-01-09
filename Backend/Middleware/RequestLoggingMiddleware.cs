using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using ApiMonitor.Data;
using ApiMonitor.Models;

namespace ApiMonitor.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext context, AppDbContext db)
    {
        var sw = Stopwatch.StartNew();

        // clone token (not stored), but keep a hash to correlate without exposing secrets
        string? bearer = context.Request.Headers.Authorization.FirstOrDefault();
        string? tokenHash = null;
        if (!string.IsNullOrWhiteSpace(bearer) && bearer.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            string token = bearer.Substring("Bearer ".Length).Trim();
            using var sha256 = SHA256.Create();
            var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            tokenHash = Convert.ToHexString(hash);
        }

        string? qs = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : null;
        string? ip = context.Connection.RemoteIpAddress?.ToString();
        string? ua = context.Request.Headers.UserAgent.ToString();

        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();
            var log = new ApiLog
            {
                TimestampUtc = DateTime.UtcNow,
                Method = context.Request.Method,
                Path = context.Request.Path,
                QueryString = qs,
                StatusCode = context.Response.StatusCode,
                DurationMs = sw.ElapsedMilliseconds,
                ClientIp = ip,
                UserAgent = ua,
                TokenHash = tokenHash
            };
            db.ApiLogs.Add(log);
            await db.SaveChangesAsync();
        }
    }
}
