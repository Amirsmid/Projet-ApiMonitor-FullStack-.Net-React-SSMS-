using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMonitor.Data;
using ApiMonitor.DTOs;
using ApiMonitor.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace ApiMonitor.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "ViewerOrAdmin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<LogsHub> _hubContext;

        public AnalyticsController(AppDbContext db, IHubContext<LogsHub> hubContext)
        {
            _db = db;
            _hubContext = hubContext;
        }

        [HttpGet("overview")]
        public async Task<ActionResult<OverviewDto>> GetOverview()
        {
            var total = await _db.ApiLogs.CountAsync();
            var okCount = await _db.ApiLogs.CountAsync(l => l.StatusCode < 400);
            var errorCount = total - okCount;

            // Conversion explicite en double avec vérification de nullabilité
            var avgDuration = total > 0 ? (double)await _db.ApiLogs.AverageAsync(l => l.DurationMs ?? 0) : 0;

            var durations = await _db.ApiLogs.Select(l => l.DurationMs ?? 0).ToListAsync();
            var p95 = durations.Count > 0 ?
                (double)durations.OrderBy(x => x).Skip((int)(durations.Count * 0.95)).FirstOrDefault() : 0;

            // Calcul du taux d'erreur
            var errorRate = total > 0 ? (double)(errorCount * 100.0 / total) : 0;

            // Détection d'anomalies
            var alerts = new List<string>();
            if (errorRate > 10)
            {
                alerts.Add($"Taux d'erreur élevé: {errorRate:F1}% (>10%)");
            }
            if (avgDuration > 1000)
            {
                alerts.Add($"Temps de réponse moyen élevé: {avgDuration:F0}ms (>1000ms)");
            }

            var result = new OverviewDto
            {
                Total = total,
                OkCount = okCount,
                ErrorCount = errorCount,
                AvgDurationMs = avgDuration,
                P95DurationMs = p95,
                ErrorRate = errorRate,
                Alerts = alerts
            };

            await _hubContext.Clients.All.SendAsync("AnalyticsUpdated", result);
            return result;
        }

        [HttpGet("timeseries")]
        public async Task<ActionResult<IEnumerable<TimeSeriesPointDto>>> GetTimeSeries(
    [FromQuery] string interval = "hour",
    [FromQuery] int points = 24)
        {
            if (points <= 0 || points > 1000) points = 24;
            if (interval != "minute" && interval != "hour") interval = "hour";

            // Récupérer les données d'abord, puis les traiter côté client
            var logs = await _db.ApiLogs
                .OrderByDescending(l => l.TimestampUtc)
                .Take(1000)
                .ToListAsync();

            var groupedLogs = logs
                .GroupBy(l => new
                {
                    Bucket = interval == "minute"
                        ? new DateTime(l.TimestampUtc.Year, l.TimestampUtc.Month, l.TimestampUtc.Day,
                                     l.TimestampUtc.Hour, l.TimestampUtc.Minute, 0)
                        : new DateTime(l.TimestampUtc.Year, l.TimestampUtc.Month, l.TimestampUtc.Day,
                                     l.TimestampUtc.Hour, 0, 0)
                })
                .Select(g => new TimeSeriesPointDto
                {
                    TimestampUtc = g.Key.Bucket,
                    Count = g.Count(),
                    AvgDurationMs = g.Average(l => l.DurationMs ?? 0)
                })
                .OrderBy(g => g.TimestampUtc)
                .Take(points)
                .ToList();

            return groupedLogs;
        }

        [HttpGet("topendpoints")]
        public async Task<ActionResult<IEnumerable<EndpointStatsDto>>> GetTopEndpoints(
            [FromQuery] int top = 10)
        {
            if (top <= 0 || top > 50) top = 10;

            var stats = await _db.ApiLogs
                .GroupBy(l => l.Path)
                .Select(g => new EndpointStatsDto
                {
                    Path = g.Key,
                    Count = g.Count(),
                    AvgDurationMs = (double)g.Average(l => l.DurationMs ?? 0), // Conversion explicite avec vérification
                    ErrorCount = g.Count(l => l.StatusCode >= 400),
                    SuccessRate = g.Count() > 0 ?
                        (double)(g.Count(l => l.StatusCode < 400) * 100.0 / g.Count()) : 0 // Conversion explicite
                })
                .OrderByDescending(s => s.Count)
                .Take(top)
                .ToListAsync();

            return stats;
        }

        [HttpGet("tokens")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TokenStatsDto>>> GetTokenStats()
        {
            var tokenStats = await _db.ApiLogs
                .Where(l => !string.IsNullOrEmpty(l.TokenHash))
                .GroupBy(l => l.TokenHash!)
                .Select(g => new TokenStatsDto
                {
                    TokenHash = g.Key,
                    UsageCount = g.Count(),
                    LastUsed = g.Max(l => l.TimestampUtc),
                    FirstUsed = g.Min(l => l.TimestampUtc),
                    AvgDurationMs = (double)g.Average(l => l.DurationMs ?? 0),
                    ErrorCount = g.Count(l => l.StatusCode >= 400)
                })
                .OrderByDescending(t => t.UsageCount)
                .Take(20)
                .ToListAsync();

            return tokenStats;
        }
    }
}