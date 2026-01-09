namespace ApiMonitor.DTOs;

public class OverviewDto
{
    public int Total { get; set; }
    public int OkCount { get; set; }
    public int ErrorCount { get; set; }
    public double AvgDurationMs { get; set; }
    public double P95DurationMs { get; set; }
    public double ErrorRate { get; set; }
    public List<string> Alerts { get; set; } = new();
}

public class TimeSeriesPointDto
{
    public DateTime TimestampUtc { get; set; }
    public int Count { get; set; }
    public double AvgDurationMs { get; set; }
}

public class EndpointStatsDto
{
    public string Path { get; set; } = "";
    public int Count { get; set; }
    public double AvgDurationMs { get; set; }
    public int ErrorCount { get; set; }
    public double SuccessRate { get; set; }
}

public class TokenStatsDto
{
    public string TokenHash { get; set; } = "";
    public int UsageCount { get; set; }
    public DateTime LastUsed { get; set; }
    public DateTime FirstUsed { get; set; }
    public double AvgDurationMs { get; set; }
    public int ErrorCount { get; set; }
    public double SuccessRate { get; set; }
}