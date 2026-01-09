using System.Text;
using System.Text.Json;
using ApiMonitor.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ApiMonitor.Services
{
    public interface IAtreemoSurveyService
    {
        Task<AtreemoAuthResponse?> AuthenticateAsync();
        Task<AtreemoSurveyResponse?> CreateSurveyAsync(string opcode, string title, string? description = null);
        Task<AtreemoSurveyResponse?> GetSurveyAsync(string surveyId);
        Task<AtreemoSurveyResponse?> UpdateSurveyAsync(string surveyId, string? title = null, string? description = null);
        Task<AtreemoSurveyResponse?> DeleteSurveyAsync(string surveyId);
        Task<AtreemoSurveyResponse?> GetSurveyResponsesAsync(string surveyId);
        Task<bool> IsAuthenticatedAsync();
    }

    public class AtreemoSurveyService : IAtreemoSurveyService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AtreemoSurveyService> _logger;
        private string? _authToken;
        private DateTime _tokenExpiresAt = DateTime.MinValue;

        public AtreemoSurveyService(HttpClient httpClient, IConfiguration configuration, ILogger<AtreemoSurveyService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            
            // Configure base URL from configuration
            var baseUrl = _configuration["Atreemo:BaseUrl"] ?? "https://testonebrand.atreemo.com";
            _httpClient.BaseAddress = new Uri(baseUrl);
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        public async Task<AtreemoAuthResponse?> AuthenticateAsync()
        {
            try
            {
                var username = _configuration["Atreemo:Username"] ?? "Interns@Acteol.com";
                var password = _configuration["Atreemo:Password"] ?? "Act!9b2ea829";

                _logger.LogInformation("Authenticating with Atreemo API...");
                
                // Pour le moment, on simule une authentification réussie
                // car l'API Atreemo réelle n'est pas accessible
                _logger.LogWarning("Using mock authentication for Atreemo API (API not accessible)");
                
                _authToken = "mock-token-" + Guid.NewGuid().ToString();
                _tokenExpiresAt = DateTime.UtcNow.AddHours(1);
                
                // Set authorization header for future requests
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _authToken);
                
                _logger.LogInformation("Successfully authenticated with Atreemo API (mock)");
                
                return new AtreemoAuthResponse(_authToken, _tokenExpiresAt, "mock-user-id");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Atreemo authentication");
            }

            return null;
        }

        public async Task<bool> IsAuthenticatedAsync()
        {
            if (string.IsNullOrEmpty(_authToken) || DateTime.UtcNow >= _tokenExpiresAt)
            {
                var authResult = await AuthenticateAsync();
                return authResult != null;
            }
            return true;
        }

        public async Task<AtreemoSurveyResponse?> CreateSurveyAsync(string opcode, string title, string? description = null)
        {
            if (!await IsAuthenticatedAsync())
            {
                _logger.LogError("Not authenticated with Atreemo API");
                return null;
            }

            try
            {
                _logger.LogInformation("Creating survey with opcode: {Opcode}", opcode);
                
                // Simulation de création de survey pour le test
                // car l'API Atreemo réelle n'est pas accessible
                _logger.LogWarning("Using mock survey creation for Atreemo API (API not accessible)");
                
                var mockSurveyId = "survey-" + Guid.NewGuid().ToString();
                
                var mockResponse = new AtreemoSurveyResponse(
                    mockSurveyId,
                    "Active",
                    "Survey created successfully (mock)",
                    new { 
                        opcode = opcode,
                        title = title,
                        description = description,
                        createdAt = DateTime.UtcNow
                    }
                );
                
                _logger.LogInformation("Successfully created survey (mock): {SurveyId}", mockSurveyId);
                return mockResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating survey with opcode: {Opcode}", opcode);
            }

            return null;
        }

        public async Task<AtreemoSurveyResponse?> GetSurveyAsync(string surveyId)
        {
            if (!await IsAuthenticatedAsync())
            {
                _logger.LogError("Not authenticated with Atreemo API");
                return null;
            }

            try
            {
                _logger.LogInformation("Getting survey: {SurveyId}", surveyId);
                
                // Simulation de récupération de survey
                _logger.LogWarning("Using mock survey retrieval for Atreemo API (API not accessible)");
                
                var mockResponse = new AtreemoSurveyResponse(
                    surveyId,
                    "Active",
                    "Survey retrieved successfully (mock)",
                    new { 
                        surveyId = surveyId,
                        retrievedAt = DateTime.UtcNow
                    }
                );
                
                return mockResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey: {SurveyId}", surveyId);
            }

            return null;
        }

        public async Task<AtreemoSurveyResponse?> UpdateSurveyAsync(string surveyId, string? title = null, string? description = null)
        {
            if (!await IsAuthenticatedAsync())
            {
                _logger.LogError("Not authenticated with Atreemo API");
                return null;
            }

            try
            {
                _logger.LogInformation("Updating survey: {SurveyId}", surveyId);
                
                // Simulation de mise à jour de survey
                _logger.LogWarning("Using mock survey update for Atreemo API (API not accessible)");
                
                var mockResponse = new AtreemoSurveyResponse(
                    surveyId,
                    "Active",
                    "Survey updated successfully (mock)",
                    new { 
                        surveyId = surveyId,
                        title = title,
                        description = description,
                        updatedAt = DateTime.UtcNow
                    }
                );
                
                return mockResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating survey: {SurveyId}", surveyId);
            }

            return null;
        }

        public async Task<AtreemoSurveyResponse?> DeleteSurveyAsync(string surveyId)
        {
            if (!await IsAuthenticatedAsync())
            {
                _logger.LogError("Not authenticated with Atreemo API");
                return null;
            }

            try
            {
                _logger.LogInformation("Deleting survey: {SurveyId}", surveyId);
                
                // Simulation de suppression de survey
                _logger.LogWarning("Using mock survey deletion for Atreemo API (API not accessible)");
                
                var mockResponse = new AtreemoSurveyResponse(
                    surveyId,
                    "Deleted",
                    "Survey deleted successfully (mock)",
                    new { 
                        surveyId = surveyId,
                        deletedAt = DateTime.UtcNow
                    }
                );
                
                return mockResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting survey: {SurveyId}", surveyId);
            }

            return null;
        }

        public async Task<AtreemoSurveyResponse?> GetSurveyResponsesAsync(string surveyId)
        {
            if (!await IsAuthenticatedAsync())
            {
                _logger.LogError("Not authenticated with Atreemo API");
                return null;
            }

            try
            {
                _logger.LogInformation("Getting responses for survey: {SurveyId}", surveyId);
                
                // Simulation de récupération des réponses
                _logger.LogWarning("Using mock survey responses retrieval for Atreemo API (API not accessible)");
                
                var mockResponse = new AtreemoSurveyResponse(
                    surveyId,
                    "Active",
                    "Survey responses retrieved successfully (mock)",
                    new { 
                        surveyId = surveyId,
                        responses = new[] {
                            new { id = "resp-1", respondent = "user1@test.com", submittedAt = DateTime.UtcNow.AddHours(-1) },
                            new { id = "resp-2", respondent = "user2@test.com", submittedAt = DateTime.UtcNow.AddHours(-2) }
                        },
                        retrievedAt = DateTime.UtcNow
                    }
                );
                
                return mockResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey responses: {SurveyId}", surveyId);
            }

            return null;
        }
    }
}
