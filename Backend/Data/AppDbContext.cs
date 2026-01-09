using ApiMonitor.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiMonitor.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ApiLog> ApiLogs => Set<ApiLog>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Survey> Surveys => Set<Survey>();
    public DbSet<SurveyResponse> SurveyResponses => Set<SurveyResponse>();
    public DbSet<SurveyApiLog> SurveyApiLogs => Set<SurveyApiLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User configuration
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        
        // Survey configuration
        modelBuilder.Entity<Survey>().HasIndex(s => s.SurveyId).IsUnique();
        modelBuilder.Entity<Survey>().HasIndex(s => s.Opcode);
        
        // SurveyResponse configuration
        modelBuilder.Entity<SurveyResponse>().HasIndex(r => r.ResponseId).IsUnique();
        modelBuilder.Entity<SurveyResponse>().HasIndex(r => r.RespondentEmail);
        
        // SurveyApiLog configuration
        modelBuilder.Entity<SurveyApiLog>().HasIndex(l => l.SurveyId);
        modelBuilder.Entity<SurveyApiLog>().HasIndex(l => l.Opcode);
        modelBuilder.Entity<SurveyApiLog>().HasIndex(l => l.TimestampUtc);
        
        // Relationships
        modelBuilder.Entity<SurveyResponse>()
            .HasOne(r => r.Survey)
            .WithMany(s => s.Responses)
            .HasForeignKey(r => r.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
