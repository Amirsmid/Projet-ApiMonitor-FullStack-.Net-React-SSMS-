import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import OverviewCards from './OverviewCards';
import Charts from './Charts';
import Filters from './Filters';
import LogsTable from './LogsTable';
import { 
  OverviewData, 
  TimeSeriesPoint, 
  EndpointStats, 
  ApiLog, 
  FilterOptions 
} from '../../types';
import apiService from '../../services/api';
import signalRService from '../../services/signalR';

const Dashboard: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [endpointsData, setEndpointsData] = useState<EndpointStats[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');

  useEffect(() => {
    loadDashboard();
    setupSignalR();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(loadDashboard, 30000);
    
    return () => {
      clearInterval(interval);
      signalRService.stopConnection();
    };
  }, []);

  const setupSignalR = async () => {
    try {
      signalRService.setOnOverviewUpdate((data) => {
        setOverviewData(data);
      });

      signalRService.setOnLogReceived((log) => {
        setLogs(prevLogs => [log, ...prevLogs.slice(0, 49)]); // Garder max 50 logs
      });

      await signalRService.startConnection();
      setConnectionStatus('Connected');
    } catch (error) {
      console.error('SignalR setup failed:', error);
      setConnectionStatus('Failed');
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, timeSeries, endpoints, recentLogs] = await Promise.all([
        apiService.getOverview(),
        apiService.getTimeSeries(),
        apiService.getTopEndpoints(),
        apiService.getLogs({}, 1, 20)
      ]);

      setOverviewData(overview);
      setTimeSeriesData(timeSeries);
      setEndpointsData(endpoints);
      setLogs(recentLogs);
    } catch (error: any) {
      console.error('Dashboard loading error:', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        // Rediriger vers la page de login
        localStorage.removeItem('authToken');
        window.location.reload();
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré sur http://localhost:5000');
      } else {
        setError('Erreur lors du chargement des données: ' + (error.message || 'Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = async (filters: FilterOptions) => {
    try {
      const filteredLogs = await apiService.getLogs(filters, 1, 50);
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Filter error:', error);
      setError('Erreur lors du filtrage');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apilogs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      setError('Erreur lors de l\'export');
    }
  };

  const handleRefreshLogs = async () => {
    try {
      const recentLogs = await apiService.getLogs({}, 1, 20);
      setLogs(recentLogs);
    } catch (error) {
      console.error('Refresh error:', error);
      setError('Erreur lors de l\'actualisation');
    }
  };

  if (loading && !overviewData) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement du dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Status de connexion */}
      <div className="mb-3">
        <Alert variant={connectionStatus === 'Connected' ? 'success' : 'warning'} className="py-2 signalr-status">
          <small>
            <i className="fas fa-circle me-1"></i>
            <span className="signalr-label">SignalR:</span> {connectionStatus}
          </small>
        </Alert>
      </div>

      {/* Alertes */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {overviewData?.alerts && overviewData.alerts.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <h6>⚠️ Alertes détectées:</h6>
          <ul className="mb-0">
            {overviewData.alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Cartes de vue d'ensemble */}
      {overviewData && <OverviewCards data={overviewData} />}

      {/* Graphiques */}
      {overviewData && timeSeriesData.length > 0 && (
        <Charts timeSeriesData={timeSeriesData} overviewData={overviewData} />
      )}

      {/* Filtres */}
      <Filters onFiltersChange={handleFiltersChange} onExport={handleExport} />

      {/* Tableau des logs */}
      <LogsTable 
        logs={logs} 
        onRefresh={handleRefreshLogs}
        loading={loading}
      />
    </Container>
  );
};

export default Dashboard;
