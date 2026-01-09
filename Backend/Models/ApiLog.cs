using System.ComponentModel.DataAnnotations;

namespace ApiMonitor.Models;

public class ApiLog
{
    public int Id { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    [MaxLength(10)]
    public string Method { get; set; } = "";

    [MaxLength(2048)]
    public string Path { get; set; } = "";

    [MaxLength(255)]
    public string? QueryString { get; set; }

    public int StatusCode { get; set; }

    public long? DurationMs { get; set; }

    [MaxLength(64)]
    public string? ClientIp { get; set; }

    [MaxLength(2048)]
    public string? UserAgent { get; set; }

    [MaxLength(512)]
    public string? TokenHash { get; set; }  // hash of Bearer token, not the token itself

    public string? ExtraJson { get; set; } // flexible custom payloads
}
