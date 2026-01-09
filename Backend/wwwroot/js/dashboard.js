// Configuration globale
const API_BASE = window.location.origin;
let authToken = localStorage.getItem('authToken');
let currentTheme = localStorage.getItem('theme') || 'light';

// Éléments DOM
let timeSeriesChart, statusChart;
let connection;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeCharts();
    initializeSignalR();
    loadDashboard();
    setInterval(loadDashboard, 30000); // Actualisation toutes les 30 secondes
});

// Gestion du thème
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    
    // Mettre à jour les graphiques
    if (timeSeriesChart) timeSeriesChart.destroy();
    if (statusChart) statusChart.destroy();
    initializeCharts();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Initialisation des graphiques
function initializeCharts() {
    const isDark = currentTheme === 'dark';
    const textColor = isDark ? '#f8f9fa' : '#212529';
    const gridColor = isDark ? '#495057' : '#dee2e6';

    // Configuration commune
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // Graphique temporel
    const timeSeriesCtx = document.getElementById('timeSeriesChart').getContext('2d');
    timeSeriesChart = new Chart(timeSeriesCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Requêtes',
                data: [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.4
            }, {
                label: 'Temps moyen (ms)',
                data: [],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: gridColor }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false }
                }
            },
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            }
        }
    });

    // Graphique des statuts
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['200 OK', '404 Not Found', '500 Error', 'Autres'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor }
                }
            }
        }
    });
}

// SignalR
function initializeSignalR() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/hubs/logs")
        .withAutomaticReconnect()
        .build();

    connection.on("ReceiveLog", function(log) {
        addLogToTable(log);
    });

    connection.on("AnalyticsUpdated", function(data) {
        updateOverview(data);
    });

    connection.start()
        .then(() => updateConnectionStatus('Connecté', 'success'))
        .catch(err => {
            console.error('SignalR Connection Error: ', err);
            updateConnectionStatus('Erreur', 'danger');
        });

    connection.onreconnecting(() => updateConnectionStatus('Reconnexion...', 'warning'));
    connection.onreconnected(() => updateConnectionStatus('Connecté', 'success'));
    connection.onclose(() => updateConnectionStatus('Déconnecté', 'secondary'));
}

function updateConnectionStatus(status, type) {
    const element = document.getElementById('connectionStatus');
    element.textContent = status;
    element.className = `badge bg-${type}`;
}

// Chargement du dashboard
async function loadDashboard() {
    try {
        await Promise.all([
            loadOverview(),
            loadTimeSeries(),
            loadTopEndpoints(),
            loadRecentLogs()
        ]);
    } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        showAlert('Erreur lors du chargement des données', 'danger');
    }
}

async function loadOverview() {
    const response = await fetch(`${API_BASE}/api/analytics/overview`, {
        headers: getAuthHeaders()
    });
    
    if (response.ok) {
        const data = await response.json();
        updateOverview(data);
        updateStatusChart(data);
    }
}

async function loadTimeSeries() {
    const response = await fetch(`${API_BASE}/api/analytics/timeseries?points=24`, {
        headers: getAuthHeaders()
    });
    
    if (response.ok) {
        const data = await response.json();
        updateTimeSeriesChart(data);
    }
}

async function loadTopEndpoints() {
    const response = await fetch(`${API_BASE}/api/analytics/topendpoints?top=10`, {
        headers: getAuthHeaders()
    });
    
    if (response.ok) {
        const data = await response.json();
        updateEndpointsTable(data);
    }
}

async function loadRecentLogs() {
    const response = await fetch(`${API_BASE}/api/logs?pageSize=20`, {
        headers: getAuthHeaders()
    });
    
    if (response.ok) {
        const data = await response.json();
        updateLogsTable(data);
    }
}

// Mise à jour des éléments UI
function updateOverview(data) {
    document.getElementById('totalRequests').textContent = data.total.toLocaleString();
    document.getElementById('successCount').textContent = data.okCount.toLocaleString();
    document.getElementById('errorCount').textContent = data.errorCount.toLocaleString();
    document.getElementById('avgDuration').textContent = `${Math.round(data.avgDurationMs)}ms`;

    // Affichage des alertes
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';
    
    if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning alert-dismissible fade show';
            alertDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>${alert}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            alertsContainer.appendChild(alertDiv);
        });
    }
}

function updateTimeSeriesChart(data) {
    const labels = data.map(item => new Date(item.timestampUtc).toLocaleTimeString());
    const counts = data.map(item => item.count);
    const durations = data.map(item => item.avgDurationMs);

    timeSeriesChart.data.labels = labels;
    timeSeriesChart.data.datasets[0].data = counts;
    timeSeriesChart.data.datasets[1].data = durations;
    timeSeriesChart.update();
}

function updateStatusChart(data) {
    const total = data.total;
    const success = data.okCount;
    const errors = data.errorCount;
    const others = total - success - errors;

    statusChart.data.datasets[0].data = [success, 0, errors, others];
    statusChart.update();
}

function updateEndpointsTable(data) {
    const tbody = document.getElementById('endpointsTable');
    tbody.innerHTML = '';

    data.forEach(endpoint => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><code>${endpoint.path}</code></td>
            <td>${endpoint.count.toLocaleString()}</td>
            <td>${Math.round(endpoint.avgDurationMs)}ms</td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-success" style="width: ${endpoint.successRate}%">
                        ${endpoint.successRate.toFixed(1)}%
                    </div>
                </div>
            </td>
            <td><span class="badge bg-danger">${endpoint.errorCount}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function updateLogsTable(data) {
    const tbody = document.getElementById('logsTable');
    tbody.innerHTML = '';

    data.forEach(log => {
        const row = document.createElement('tr');
        const timestamp = new Date(log.timestampUtc).toLocaleString();
        const statusClass = log.statusCode < 400 ? 'success' : 'danger';
        const methodClass = `method-${log.method.toLowerCase()}`;
        
        row.innerHTML = `
            <td>${timestamp}</td>
            <td><span class="badge ${methodClass} method-badge">${log.method}</span></td>
            <td><code>${log.path}</code></td>
            <td><span class="badge bg-${statusClass} status-badge">${log.statusCode}</span></td>
            <td>${log.durationMs}ms</td>
            <td><small>${log.clientIp || '-'}</small></td>
        `;
        tbody.appendChild(row);
    });
}

function addLogToTable(log) {
    const tbody = document.getElementById('logsTable');
    const row = document.createElement('tr');
    const timestamp = new Date(log.timestampUtc).toLocaleString();
    const statusClass = log.statusCode < 400 ? 'success' : 'danger';
    const methodClass = `method-${log.method.toLowerCase()}`;
    
    row.innerHTML = `
        <td>${timestamp}</td>
        <td><span class="badge ${methodClass} method-badge">${log.method}</span></td>
        <td><code>${log.path}</code></td>
        <td><span class="badge bg-${statusClass} status-badge">${log.statusCode}</span></td>
        <td>${log.durationMs}ms</td>
        <td><small>${log.clientIp || '-'}</small></td>
    `;
    
    tbody.insertBefore(row, tbody.firstChild);
    
    // Limiter à 50 lignes
    if (tbody.children.length > 50) {
        tbody.removeChild(tbody.lastChild);
    }
}

// Filtres
function applyFilters() {
    const method = document.getElementById('methodFilter').value;
    const status = document.getElementById('statusFilter').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    const params = new URLSearchParams();
    if (method) params.append('method', method);
    if (status) params.append('statusCode', status);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    loadFilteredLogs(params);
}

async function loadFilteredLogs(params) {
    try {
        const response = await fetch(`${API_BASE}/api/logs?${params}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            updateLogsTable(data);
        }
    } catch (error) {
        console.error('Erreur lors du filtrage:', error);
        showAlert('Erreur lors du filtrage des données', 'danger');
    }
}

// Export
function exportData() {
    const method = document.getElementById('methodFilter').value;
    const status = document.getElementById('statusFilter').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    const params = new URLSearchParams();
    if (method) params.append('method', method);
    if (status) params.append('statusCode', status);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const url = `${API_BASE}/api/logs/export/csv?${params}`;
    
    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `apilogs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utilitaires
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

function refreshLogs() {
    loadRecentLogs();
}

// Gestion de l'authentification
function checkAuth() {
    if (!authToken) {
        // Rediriger vers la page de connexion ou afficher un modal
        showAlert('Veuillez vous connecter pour accéder au dashboard', 'warning');
        return false;
    }
    return true;
}

// Vérification de l'authentification au chargement
if (!checkAuth()) {
    // Optionnel: rediriger vers une page de connexion
    console.warn('Token d\'authentification manquant');
}
