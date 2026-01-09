using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMonitor.Data;
using ApiMonitor.DTOs;

namespace ApiMonitor.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class TokensController : ControllerBase
{
    private readonly AppDbContext _db;

    public TokensController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TokenStatsDto>>> GetTokenStats(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.ApiLogs
            .Where(l => !string.IsNullOrEmpty(l.TokenHash))
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(l => l.TimestampUtc >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(l => l.TimestampUtc <= toDate.Value);

        var tokenStats = await query
            .GroupBy(l => l.TokenHash!)
            .Select(g => new TokenStatsDto
            {
                TokenHash = g.Key,
                UsageCount = g.Count(),
                LastUsed = g.Max(l => l.TimestampUtc),
                FirstUsed = g.Min(l => l.TimestampUtc),
                AvgDurationMs = (double)g.Average(l => l.DurationMs ?? 0),
                ErrorCount = g.Count(l => l.StatusCode >= 400),
                SuccessRate = g.Count() > 0 ? 
                    (double)(g.Count(l => l.StatusCode < 400) * 100.0 / g.Count()) : 0
            })
            .OrderByDescending(t => t.UsageCount)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(tokenStats);
    }

    [HttpGet("suspicious")]
    public async Task<ActionResult<IEnumerable<TokenStatsDto>>> GetSuspiciousTokens()
    {
        var suspiciousTokens = await _db.ApiLogs
            .Where(l => !string.IsNullOrEmpty(l.TokenHash))
            .GroupBy(l => l.TokenHash!)
            .Select(g => new TokenStatsDto
            {
                TokenHash = g.Key,
                UsageCount = g.Count(),
                LastUsed = g.Max(l => l.TimestampUtc),
                FirstUsed = g.Min(l => l.TimestampUtc),
                AvgDurationMs = (double)g.Average(l => l.DurationMs ?? 0),
                ErrorCount = g.Count(l => l.StatusCode >= 400),
                SuccessRate = g.Count() > 0 ? 
                    (double)(g.Count(l => l.StatusCode < 400) * 100.0 / g.Count()) : 0
            })
            .Where(t => 
                t.ErrorCount > 10 || // Plus de 10 erreurs
                t.SuccessRate < 50 || // Taux de succès < 50%
                t.UsageCount > 1000 || // Utilisation excessive
                t.AvgDurationMs > 5000) // Temps de réponse très lent
            .OrderByDescending(t => t.ErrorCount)
            .Take(20)
            .ToListAsync();

        return Ok(suspiciousTokens);
    }

    [HttpGet("expired")]
    public async Task<ActionResult<IEnumerable<TokenStatsDto>>> GetExpiredTokens(
        [FromQuery] int daysInactive = 30)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysInactive);
        
        var expiredTokens = await _db.ApiLogs
            .Where(l => !string.IsNullOrEmpty(l.TokenHash))
            .GroupBy(l => l.TokenHash!)
            .Select(g => new TokenStatsDto
            {
                TokenHash = g.Key,
                UsageCount = g.Count(),
                LastUsed = g.Max(l => l.TimestampUtc),
                FirstUsed = g.Min(l => l.TimestampUtc),
                AvgDurationMs = (double)g.Average(l => l.DurationMs ?? 0),
                ErrorCount = g.Count(l => l.StatusCode >= 400),
                SuccessRate = g.Count() > 0 ? 
                    (double)(g.Count(l => l.StatusCode < 400) * 100.0 / g.Count()) : 0
            })
            .Where(t => t.LastUsed < cutoffDate)
            .OrderBy(t => t.LastUsed)
            .Take(50)
            .ToListAsync();

        return Ok(expiredTokens);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetTokenSummary()
    {
        var totalTokens = await _db.ApiLogs
            .Where(l => !string.IsNullOrEmpty(l.TokenHash))
            .Select(l => l.TokenHash)
            .Distinct()
            .CountAsync();

        var activeTokens = await _db.ApiLogs
            .Where(l => !string.IsNullOrEmpty(l.TokenHash) && 
                       l.TimestampUtc >= DateTime.UtcNow.AddDays(-7))
            .Select(l => l.TokenHash)
            .Distinct()
            .CountAsync();

        var suspiciousCount = await _db.ApiLogs
            .Where(l => !string.IsNullOrEmpty(l.TokenHash))
            .GroupBy(l => l.TokenHash!)
            .Where(g => g.Count(l => l.StatusCode >= 400) > 10 || 
                       (double)(g.Count(l => l.StatusCode < 400) * 100.0 / g.Count()) < 50)
            .CountAsync();

        var avgUsagePerToken = await _db.ApiLogs
            .Where(l => !string.IsNullOrEmpty(l.TokenHash))
            .GroupBy(l => l.TokenHash!)
            .Select(g => g.Count())
            .DefaultIfEmpty()
            .AverageAsync();

        return Ok(new
        {
            TotalTokens = totalTokens,
            ActiveTokens = activeTokens,
            SuspiciousTokens = suspiciousCount,
            AverageUsagePerToken = Math.Round(avgUsagePerToken, 1),
            LastUpdated = DateTime.UtcNow
        });
    }
}
