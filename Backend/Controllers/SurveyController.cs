using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMonitor.Data;
using ApiMonitor.DTOs;
using ApiMonitor.Models;
using ApiMonitor.Services;
using System.Text.Json;

namespace ApiMonitor.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SurveyController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IAtreemoSurveyService _atreemoService;
        private readonly ILogger<SurveyController> _logger;

        public SurveyController(
            AppDbContext db, 
            IAtreemoSurveyService atreemoService, 
            ILogger<SurveyController> logger)
        {
            _db = db;
            _atreemoService = atreemoService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SurveyDto>>> GetSurveys()
        {
            try
            {
                var surveys = await _db.Surveys
                    .Include(s => s.Responses)
                    .OrderByDescending(s => s.CreatedAt)
                    .Select(s => new SurveyDto(
                        s.Id,
                        s.SurveyId,
                        s.Title,
                        s.Description,
                        s.Opcode,
                        s.Status,
                        s.CreatedAt,
                        s.UpdatedAt,
                        s.CreatedBy,
                        s.Responses.Count
                    ))
                    .ToListAsync();

                return Ok(surveys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving surveys");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SurveyDto>> GetSurvey(int id)
        {
            try
            {
                var survey = await _db.Surveys
                    .Include(s => s.Responses)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (survey == null)
                    return NotFound();

                var surveyDto = new SurveyDto(
                    survey.Id,
                    survey.SurveyId,
                    survey.Title,
                    survey.Description,
                    survey.Opcode,
                    survey.Status,
                    survey.CreatedAt,
                    survey.UpdatedAt,
                    survey.CreatedBy,
                    survey.Responses.Count
                );

                return Ok(surveyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving survey {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<SurveyDto>> CreateSurvey(CreateSurveyRequest request)
        {
            try
            {
                // Create survey in Atreemo API
                var atreemoResponse = await _atreemoService.CreateSurveyAsync(
                    request.Opcode, 
                    request.Title, 
                    request.Description);

                if (atreemoResponse == null)
                {
                    return BadRequest("Failed to create survey in Atreemo API");
                }

                // Save to local database
                var survey = new Survey
                {
                    SurveyId = atreemoResponse.SurveyId ?? Guid.NewGuid().ToString(),
                    Title = request.Title,
                    Description = request.Description,
                    Opcode = request.Opcode,
                    Status = request.Status ?? "Active",
                    CreatedBy = User.Identity?.Name ?? "System",
                    CreatedAt = DateTime.UtcNow
                };

                _db.Surveys.Add(survey);
                await _db.SaveChangesAsync();

                // Log API call
                await LogApiCall("POST", "/api/surveys", JsonSerializer.Serialize(request), 
                    JsonSerializer.Serialize(atreemoResponse), 200, 0, survey.SurveyId, request.Opcode);

                var surveyDto = new SurveyDto(
                    survey.Id,
                    survey.SurveyId,
                    survey.Title,
                    survey.Description,
                    survey.Opcode,
                    survey.Status,
                    survey.CreatedAt,
                    survey.UpdatedAt,
                    survey.CreatedBy,
                    0
                );

                return CreatedAtAction(nameof(GetSurvey), new { id = survey.Id }, surveyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating survey");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<SurveyDto>> UpdateSurvey(int id, UpdateSurveyRequest request)
        {
            try
            {
                var survey = await _db.Surveys.FindAsync(id);
                if (survey == null)
                    return NotFound();

                // Update in Atreemo API
                var atreemoResponse = await _atreemoService.UpdateSurveyAsync(
                    survey.SurveyId, 
                    request.Title, 
                    request.Description);

                if (atreemoResponse == null)
                {
                    return BadRequest("Failed to update survey in Atreemo API");
                }

                // Update local database
                if (!string.IsNullOrEmpty(request.Title))
                    survey.Title = request.Title;
                if (!string.IsNullOrEmpty(request.Description))
                    survey.Description = request.Description;
                if (!string.IsNullOrEmpty(request.Status))
                    survey.Status = request.Status;

                survey.UpdatedAt = DateTime.UtcNow;
                survey.LastModifiedBy = User.Identity?.Name ?? "System";

                await _db.SaveChangesAsync();

                // Log API call
                await LogApiCall("PUT", $"/api/surveys/{id}", JsonSerializer.Serialize(request), 
                    JsonSerializer.Serialize(atreemoResponse), 200, 0, survey.SurveyId, survey.Opcode);

                var surveyDto = new SurveyDto(
                    survey.Id,
                    survey.SurveyId,
                    survey.Title,
                    survey.Description,
                    survey.Opcode,
                    survey.Status,
                    survey.CreatedAt,
                    survey.UpdatedAt,
                    survey.CreatedBy,
                    await _db.SurveyResponses.CountAsync(r => r.SurveyId == survey.Id)
                );

                return Ok(surveyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating survey {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteSurvey(int id)
        {
            try
            {
                var survey = await _db.Surveys.FindAsync(id);
                if (survey == null)
                    return NotFound();

                // Delete from Atreemo API
                var atreemoResponse = await _atreemoService.DeleteSurveyAsync(survey.SurveyId);

                if (atreemoResponse == null)
                {
                    return BadRequest("Failed to delete survey from Atreemo API");
                }

                // Delete from local database
                _db.Surveys.Remove(survey);
                await _db.SaveChangesAsync();

                // Log API call
                await LogApiCall("DELETE", $"/api/surveys/{id}", null, 
                    JsonSerializer.Serialize(atreemoResponse), 200, 0, survey.SurveyId, survey.Opcode);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting survey {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/responses")]
        public async Task<ActionResult<IEnumerable<SurveyResponseDto>>> GetSurveyResponses(int id)
        {
            try
            {
                var survey = await _db.Surveys.FindAsync(id);
                if (survey == null)
                    return NotFound();

                // Get responses from Atreemo API
                var atreemoResponse = await _atreemoService.GetSurveyResponsesAsync(survey.SurveyId);

                if (atreemoResponse == null)
                {
                    return BadRequest("Failed to get responses from Atreemo API");
                }

                // Get local responses
                var responses = await _db.SurveyResponses
                    .Where(r => r.SurveyId == id)
                    .OrderByDescending(r => r.SubmittedAt)
                    .Select(r => new SurveyResponseDto(
                        r.Id,
                        r.ResponseId,
                        r.RespondentId,
                        r.RespondentEmail,
                        r.ResponseData,
                        r.SubmittedAt,
                        r.Status
                    ))
                    .ToListAsync();

                // Log API call
                await LogApiCall("GET", $"/api/surveys/{id}/responses", null, 
                    JsonSerializer.Serialize(atreemoResponse), 200, 0, survey.SurveyId, survey.Opcode);

                return Ok(responses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving survey responses for survey {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{id}/responses")]
        public async Task<ActionResult<SurveyResponseDto>> CreateSurveyResponse(int id, CreateSurveyResponseRequest request)
        {
            try
            {
                var survey = await _db.Surveys.FindAsync(id);
                if (survey == null)
                    return NotFound();

                var response = new SurveyResponse
                {
                    SurveyId = id,
                    ResponseId = request.ResponseId,
                    RespondentId = request.RespondentId,
                    RespondentEmail = request.RespondentEmail,
                    ResponseData = request.ResponseData,
                    Status = "Submitted",
                    SubmittedAt = DateTime.UtcNow
                };

                _db.SurveyResponses.Add(response);
                await _db.SaveChangesAsync();

                // Log API call
                await LogApiCall("POST", $"/api/surveys/{id}/responses", JsonSerializer.Serialize(request), 
                    JsonSerializer.Serialize(response), 200, 0, survey.SurveyId, survey.Opcode);

                var responseDto = new SurveyResponseDto(
                    response.Id,
                    response.ResponseId,
                    response.RespondentId,
                    response.RespondentEmail,
                    response.ResponseData,
                    response.SubmittedAt,
                    response.Status
                );

                return CreatedAtAction(nameof(GetSurveyResponses), new { id }, responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating survey response for survey {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("analytics/overview")]
        public async Task<ActionResult<SurveyAnalyticsDto>> GetSurveyAnalytics()
        {
            try
            {
                var totalSurveys = await _db.Surveys.CountAsync();
                var activeSurveys = await _db.Surveys.CountAsync(s => s.Status == "Active");
                var totalResponses = await _db.SurveyResponses.CountAsync();
                var responsesToday = await _db.SurveyResponses
                    .CountAsync(r => r.SubmittedAt.Date == DateTime.UtcNow.Date);

                var averageResponseTime = await _db.SurveyApiLogs
                    .Where(l => l.Endpoint.Contains("/surveys") && l.StatusCode == 200)
                    .AverageAsync(l => l.DurationMs);

                var responsesByStatus = await _db.SurveyResponses
                    .GroupBy(r => r.Status ?? "Unknown")
                    .ToDictionaryAsync(g => g.Key, g => g.Count());

                var surveysByStatus = await _db.Surveys
                    .GroupBy(s => s.Status ?? "Unknown")
                    .ToDictionaryAsync(g => g.Key, g => g.Count());

                var analytics = new SurveyAnalyticsDto(
                    totalSurveys,
                    activeSurveys,
                    totalResponses,
                    responsesToday,
                    averageResponseTime,
                    responsesByStatus,
                    surveysByStatus
                );

                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving survey analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("atreemo/status")]
        public async Task<ActionResult<object>> GetAtreemoStatus()
        {
            try
            {
                var isAuthenticated = await _atreemoService.IsAuthenticatedAsync();
                return Ok(new { 
                    IsAuthenticated = isAuthenticated,
                    BaseUrl = "https://testonebrand.atreemo.com",
                    Username = "Interns@Acteol.com",
                    Opcode = "305"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking Atreemo status");
                return StatusCode(500, "Internal server error");
            }
        }

        private async Task LogApiCall(string method, string endpoint, string? requestData, 
            string? responseData, int statusCode, long durationMs, string? surveyId, string? opcode)
        {
            try
            {
                var log = new SurveyApiLog
                {
                    Endpoint = endpoint,
                    Method = method,
                    RequestData = requestData,
                    ResponseData = responseData,
                    StatusCode = statusCode,
                    DurationMs = durationMs,
                    SurveyId = surveyId,
                    Opcode = opcode,
                    TimestampUtc = DateTime.UtcNow
                };

                _db.SurveyApiLogs.Add(log);
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging API call");
            }
        }
    }
}
