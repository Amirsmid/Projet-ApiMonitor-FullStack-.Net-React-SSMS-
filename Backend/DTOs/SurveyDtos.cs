using System.ComponentModel.DataAnnotations;

namespace ApiMonitor.DTOs
{
    // Survey DTOs
    public record SurveyDto(
        int Id,
        string SurveyId,
        string Title,
        string? Description,
        string Opcode,
        string? Status,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        string? CreatedBy,
        int ResponseCount
    );

    public record CreateSurveyRequest(
        [param: Required] string Title,
        [param: Required] string Opcode,
        string? Description,
        string? Status = "Active"
    );

    public record UpdateSurveyRequest(
        string? Title,
        string? Description,
        string? Status
    );

    // Survey Response DTOs
    public record SurveyResponseDto(
        int Id,
        string ResponseId,
        string? RespondentId,
        string? RespondentEmail,
        string? ResponseData,
        DateTime SubmittedAt,
        string? Status
    );

    public record CreateSurveyResponseRequest(
        [param: Required] string SurveyId,
        [param: Required] string ResponseId,
        string? RespondentId,
        string? RespondentEmail,
        [param: Required] string ResponseData
    );

    // Atreemo API DTOs
    public record AtreemoAuthRequest(
        [param: Required] string Username,
        [param: Required] string Password
    );

    public record AtreemoAuthResponse(
        string Token,
        DateTime ExpiresAt,
        string UserId
    );

    public record AtreemoSurveyRequest(
        [param: Required] string Opcode,
        string? Title,
        string? Description
    );

    public record AtreemoSurveyResponse(
        string SurveyId,
        string Status,
        string Message,
        object? Data
    );

    // Analytics DTOs for Surveys
    public record SurveyAnalyticsDto(
        int TotalSurveys,
        int ActiveSurveys,
        int TotalResponses,
        int ResponsesToday,
        double AverageResponseTime,
        Dictionary<string, int> ResponsesByStatus,
        Dictionary<string, int> SurveysByStatus
    );

    public record SurveyTimeSeriesDto(
        DateTime TimestampUtc,
        int SurveyCount,
        int ResponseCount,
        double AverageResponseTime
    );
}
