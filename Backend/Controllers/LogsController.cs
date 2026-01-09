using ApiMonitor.Data;
using ApiMonitor.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiMonitor.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LogsController : ControllerBase
{
    private readonly AppDbContext _db;
    public LogsController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Viewer")]
    public async Task<ActionResult<IEnumerable<ApiLog>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] int? statusCode = null,
        [FromQuery] string? method = null,
        [FromQuery] string? path = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 500);

        var query = _db.ApiLogs.AsQueryable();

        if (statusCode.HasValue)
        {
            query = query.Where(l => l.StatusCode == statusCode);
        }

        if (!string.IsNullOrEmpty(method))
        {
            query = query.Where(l => l.Method == method);
        }

        if (!string.IsNullOrEmpty(path))
        {
            query = query.Where(l => l.Path.Contains(path));
        }

        if (fromDate.HasValue)
        {
            query = query.Where(l => l.TimestampUtc >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(l => l.TimestampUtc <= toDate.Value);
        }

        var logs = await query
            .OrderByDescending(l => l.TimestampUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("export/csv")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? statusCode = null,
        [FromQuery] string? method = null)
    {
        var query = _db.ApiLogs.AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(l => l.TimestampUtc >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(l => l.TimestampUtc <= toDate.Value);
        if (statusCode.HasValue)
            query = query.Where(l => l.StatusCode == statusCode);
        if (!string.IsNullOrEmpty(method))
            query = query.Where(l => l.Method == method);

        var logs = await query
            .OrderByDescending(l => l.TimestampUtc)
            .Take(10000) // Limite pour éviter les fichiers trop gros
            .ToListAsync();

        var csv = "Timestamp,Method,Path,StatusCode,DurationMs,ClientIp,UserAgent\n";
        foreach (var log in logs)
        {
            csv += $"\"{log.TimestampUtc:yyyy-MM-dd HH:mm:ss}\",\"{log.Method}\",\"{log.Path}\",{log.StatusCode},{log.DurationMs},\"{log.ClientIp}\",\"{log.UserAgent}\"\n";
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"apilogs_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }

    [HttpPost("ingest")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Ingest(ApiLog log)
    {
        log.Id = 0;
        log.TimestampUtc = log.TimestampUtc == default ? DateTime.UtcNow : log.TimestampUtc;
        _db.ApiLogs.Add(log);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = log.Id }, log);
    }

    [HttpDelete("purge")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Purge([FromQuery] int? daysToKeep = null)
    {
        if (daysToKeep.HasValue)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep.Value);
            var deletedCount = await _db.ApiLogs
                .Where(l => l.TimestampUtc < cutoffDate)
                .ExecuteDeleteAsync();
            
            return Ok(new { message = $"Supprimé {deletedCount} logs antérieurs à {cutoffDate:yyyy-MM-dd}" });
        }
        else
        {
            var deletedCount = await _db.ApiLogs.ExecuteDeleteAsync();
            return Ok(new { message = $"Supprimé {deletedCount} logs" });
        }
    }
}