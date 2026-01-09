using System.ComponentModel.DataAnnotations;

namespace ApiMonitor.Models
{
    public class Survey
    {
        public int Id { get; set; }
        
        [Required]
        public string SurveyId { get; set; } = string.Empty;
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public string Opcode { get; set; } = string.Empty;
        
        public string? Status { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public string? CreatedBy { get; set; }
        
        public string? LastModifiedBy { get; set; }
        
        // Navigation properties
        public virtual ICollection<SurveyResponse> Responses { get; set; } = new List<SurveyResponse>();
    }

    public class SurveyResponse
    {
        public int Id { get; set; }
        
        [Required]
        public int SurveyId { get; set; }
        
        [Required]
        public string ResponseId { get; set; } = string.Empty;
        
        public string? RespondentId { get; set; }
        
        public string? RespondentEmail { get; set; }
        
        public string? ResponseData { get; set; } // JSON string
        
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        
        public string? Status { get; set; }
        
        // Navigation property
        public virtual Survey Survey { get; set; } = null!;
    }

    public class SurveyApiLog
    {
        public int Id { get; set; }
        
        [Required]
        public string Endpoint { get; set; } = string.Empty;
        
        [Required]
        public string Method { get; set; } = string.Empty;
        
        public string? RequestData { get; set; }
        
        public string? ResponseData { get; set; }
        
        public int StatusCode { get; set; }
        
        public long DurationMs { get; set; }
        
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
        
        public string? ErrorMessage { get; set; }
        
        public string? SurveyId { get; set; }
        
        public string? Opcode { get; set; }
    }
}
