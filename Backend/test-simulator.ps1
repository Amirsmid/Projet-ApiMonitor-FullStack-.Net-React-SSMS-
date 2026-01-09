# Script de test pour ApiMonitor
# Utilisation: .\test-simulator.ps1

param(
    [string]$BaseUrl = "https://localhost:7001",
    [string]$Email = "admin@local.test",
    [string]$Password = "P@ssw0rd!",
    [int]$CallCount = 100
)

Write-Host "=== Test ApiMonitor ===" -ForegroundColor Green
Write-Host "URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Email: $Email" -ForegroundColor Yellow
Write-Host "Nombre d'appels: $CallCount" -ForegroundColor Yellow
Write-Host ""

# 1. Connexion pour obtenir le token
Write-Host "1. Connexion..." -ForegroundColor Cyan
$loginBody = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "OK Connexion reussie" -ForegroundColor Green
} catch {
    Write-Host "ERREUR Connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Test des endpoints d'analytics
Write-Host "`n2. Test des analytics..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $overview = Invoke-RestMethod -Uri "$BaseUrl/api/analytics/overview" -Method GET -Headers $headers
    Write-Host "OK Overview: $($overview.total) requetes totales" -ForegroundColor Green
    
    $endpoints = Invoke-RestMethod -Uri "$BaseUrl/api/analytics/topendpoints" -Method GET -Headers $headers
    Write-Host "OK Top endpoints: $($endpoints.Count) endpoints trouves" -ForegroundColor Green
    
    $timeseries = Invoke-RestMethod -Uri "$BaseUrl/api/analytics/timeseries" -Method GET -Headers $headers
    Write-Host "OK Time series: $($timeseries.Count) points de donnees" -ForegroundColor Green
} catch {
    Write-Host "ERREUR analytics: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Simulation d'appels API
Write-Host "`n3. Simulation d'appels API..." -ForegroundColor Cyan
$endpoints = @("/api/users", "/api/products", "/api/orders", "/api/categories", "/api/reviews")
$methods = @("GET", "POST", "PUT", "DELETE")
$userAgents = @(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "PostmanRuntime/7.32.3",
    "curl/7.88.1"
)

$random = Get-Random
$successCount = 0
$errorCount = 0

for ($i = 1; $i -le $CallCount; $i++) {
    $endpoint = $endpoints | Get-Random
    $method = $methods | Get-Random
    $userAgent = $userAgents | Get-Random
    
    # Simuler differents scenarios
    $statusCode = switch (Get-Random -Minimum 1 -Maximum 101) {
        { $_ -le 70 } { 200 }  # 70% de succes
        { $_ -le 85 } { 404 }  # 15% de 404
        { $_ -le 90 } { 500 }  # 5% d'erreur serveur
        { $_ -le 95 } { 401 }  # 5% d'erreur auth
        default { 429 }        # 5% de rate limit
    }
    
    $duration = Get-Random -Minimum 50 -Maximum 2000
    $clientIp = "192.168.1.$(Get-Random -Minimum 1 -Maximum 255)"
    
    $logBody = @{
        method = $method
        path = $endpoint
        statusCode = $statusCode
        durationMs = $duration
        clientIp = $clientIp
        userAgent = $userAgent
        timestampUtc = (Get-Date).AddSeconds(-(Get-Random -Minimum 0 -Maximum 3600)).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/logs/ingest" -Method POST -Body $logBody -Headers $headers
        $successCount++
        
        if ($i % 10 -eq 0) {
            Write-Host "OK Appel $i/$CallCount: $method $endpoint -> $statusCode (${duration}ms)" -ForegroundColor Green
        }
    } catch {
        $errorCount++
        Write-Host "ERREUR Appel $i/$CallCount: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Pause aléatoire
    Start-Sleep -Milliseconds (Get-Random -Minimum 100 -Maximum 500)
}

# 4. Résultats finaux
Write-Host "`n4. Resultats finaux..." -ForegroundColor Cyan
Write-Host "Appels reussis: $successCount/$CallCount" -ForegroundColor Green
Write-Host "Appels echoues: $errorCount/$CallCount" -ForegroundColor Red

# 5. Vérification finale
Write-Host "`n5. Verification finale..." -ForegroundColor Cyan
try {
    $finalOverview = Invoke-RestMethod -Uri "$BaseUrl/api/analytics/overview" -Method GET -Headers $headers
    Write-Host "Total requetes: $($finalOverview.total)" -ForegroundColor Green
    Write-Host "Taux d'erreur: $($finalOverview.errorRate)%" -ForegroundColor Yellow
    Write-Host "Temps moyen: $([math]::Round($finalOverview.avgDurationMs))ms" -ForegroundColor Yellow
    
    if ($finalOverview.alerts.Count -gt 0) {
        Write-Host "Alertes detectees:" -ForegroundColor Red
        foreach ($alert in $finalOverview.alerts) {
            Write-Host "  - $alert" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "ERREUR verification finale: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green
