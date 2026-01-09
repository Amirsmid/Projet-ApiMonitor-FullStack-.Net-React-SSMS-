using System.Net.Http.Json;
using System.Text.Json;

namespace ApiMonitor.Services;

public class ApiSimulator
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly string _authToken;

    public ApiSimulator(string baseUrl, string authToken)
    {
        _httpClient = new HttpClient();
        _baseUrl = baseUrl.TrimEnd('/');
        _authToken = authToken;
        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authToken);
    }

    public async Task SimulateApiCalls(int count = 100)
    {
        var random = new Random();
        var endpoints = new[]
        {
            "/api/users",
            "/api/products",
            "/api/orders",
            "/api/categories",
            "/api/reviews",
            "/api/payments",
            "/api/shipping",
            "/api/notifications"
        };

        var methods = new[] { "GET", "POST", "PUT", "DELETE" };
        var userAgents = new[]
        {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            "PostmanRuntime/7.32.3",
            "curl/7.88.1"
        };

        Console.WriteLine($"Démarrage de la simulation de {count} appels API...");

        for (int i = 0; i < count; i++)
        {
            try
            {
                var endpoint = endpoints[random.Next(endpoints.Length)];
                var method = methods[random.Next(methods.Length)];
                var userAgent = userAgents[random.Next(userAgents.Length)];

                // Simuler différents scénarios
                var statusCode = random.Next(100) switch
                {
                    < 70 => 200, // 70% de succès
                    < 85 => 404, // 15% de 404
                    < 90 => 500, // 5% d'erreur serveur
                    < 95 => 401, // 5% d'erreur auth
                    _ => 429    // 5% de rate limit
                };

                var duration = random.Next(50, 2000); // 50ms à 2s

                var log = new
                {
                    Method = method,
                    Path = endpoint,
                    StatusCode = statusCode,
                    DurationMs = duration,
                    ClientIp = $"192.168.1.{random.Next(1, 255)}",
                    UserAgent = userAgent,
                    TimestampUtc = DateTime.UtcNow.AddSeconds(-random.Next(3600)) // Dernière heure
                };

                var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/api/logs/ingest", log);
                
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"✅ Appel {i + 1}/{count}: {method} {endpoint} → {statusCode} ({duration}ms)");
                }
                else
                {
                    Console.WriteLine($"❌ Erreur {i + 1}/{count}: {response.StatusCode}");
                }

                // Pause aléatoire entre les appels
                await Task.Delay(random.Next(100, 500));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Exception {i + 1}/{count}: {ex.Message}");
            }
        }

        Console.WriteLine("Simulation terminée !");
    }

    public async Task SimulateRealisticLoad(int durationMinutes = 5)
    {
        var random = new Random();
        var startTime = DateTime.UtcNow;
        var endTime = startTime.AddMinutes(durationMinutes);

        Console.WriteLine($"Simulation de charge réaliste pendant {durationMinutes} minutes...");

        while (DateTime.UtcNow < endTime)
        {
            // Simuler des pics de trafic
            var currentMinute = DateTime.UtcNow.Minute;
            var callsPerSecond = currentMinute % 5 == 0 ? random.Next(5, 15) : random.Next(1, 5);

            for (int i = 0; i < callsPerSecond; i++)
            {
                await SimulateSingleCall(random);
            }

            await Task.Delay(1000); // 1 seconde
        }

        Console.WriteLine("Simulation de charge terminée !");
    }

    private async Task SimulateSingleCall(Random random)
    {
        try
        {
            var endpoints = new[] { "/api/users", "/api/products", "/api/orders" };
            var endpoint = endpoints[random.Next(endpoints.Length)];
            var method = random.Next(100) < 80 ? "GET" : "POST";
            var statusCode = random.Next(100) < 85 ? 200 : 404;
            var duration = random.Next(30, 1500);

            var log = new
            {
                Method = method,
                Path = endpoint,
                StatusCode = statusCode,
                DurationMs = duration,
                ClientIp = $"10.0.0.{random.Next(1, 255)}",
                UserAgent = "ApiSimulator/1.0",
                TimestampUtc = DateTime.UtcNow
            };

            await _httpClient.PostAsJsonAsync($"{_baseUrl}/api/logs/ingest", log);
        }
        catch
        {
            // Ignorer les erreurs de simulation
        }
    }
}
