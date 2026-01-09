# Script de test simple pour ApiMonitor
param(
    [string]$BaseUrl = "https://localhost:5001",
    [int]$CallCount = 20
)

Write-Host "=== Test Simple ApiMonitor ===" -ForegroundColor Green
Write-Host "URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Nombre d'appels: $CallCount" -ForegroundColor Yellow

# 1. Connexion
Write-Host "`n1. Connexion..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@local.test"
    password = "P@ssw0rd!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "OK Connexion reussie" -ForegroundColor Green
} catch {
    Write-Host "ERREUR Connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. Simulation d'appels
Write-Host "`n2. Simulation d'appels..." -ForegroundColor Cyan
$endpoints = @("/api/users", "/api/products", "/api/orders")
$methods = @("GET", "POST", "PUT")

for ($i = 1; $i -le $CallCount; $i++) {
    $endpoint = $endpoints | Get-Random
    $method = $methods | Get-Random
    $statusCode = if (Get-Random -Minimum 1 -Maximum 101 -le 80) { 200 } else { 404 }
    $duration = Get-Random -Minimum 50 -Maximum 1000
    
    $logBody = @{
        method = $method
        path = $endpoint
        statusCode = $statusCode
        durationMs = $duration
        clientIp = "192.168.1.$i"
        userAgent = "Test-Script"
        timestampUtc = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/logs/ingest" -Method POST -Body $logBody -Headers $headers
        Write-Host "OK Appel ${i}: $method $endpoint -> $statusCode" -ForegroundColor Green
    } catch {
        Write-Host "ERREUR Appel ${i}: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 100
}

# 4. Verification
Write-Host "`n3. Verification..." -ForegroundColor Cyan
try {
    $overview = Invoke-RestMethod -Uri "$BaseUrl/api/analytics/overview" -Method GET -Headers $headers
    Write-Host "Total requetes: $($overview.total)" -ForegroundColor Green
    Write-Host "Taux d'erreur: $($overview.errorRate)%" -ForegroundColor Yellow
    Write-Host "Temps moyen: $([math]::Round($overview.avgDurationMs))ms" -ForegroundColor Yellow
} catch {
    Write-Host "ERREUR verification: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green
