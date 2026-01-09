import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import LogsTable from './LogsTable';
import Filters from './Filters';
import { ApiLog, FilterOptions } from '../../types';
import apiService from '../../services/api';

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const logsData = await apiService.getLogs({}, 1, 100);
      setLogs(logsData);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
      setError('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = async (filters: FilterOptions) => {
    try {
      setLoading(true);
      const filteredLogs = await apiService.getLogs(filters, 1, 100);
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Erreur lors du filtrage:', error);
      setError('Erreur lors du filtrage');
    } finally {
      setLoading(false);
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
      console.error('Erreur lors de l\'export:', error);
      setError('Erreur lors de l\'export');
    }
  };

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h2 className="mb-3">
          <i className="fas fa-history me-2"></i>
          Logs des API
        </h2>
        <p className="text-muted">
          Consultez et analysez tous les appels API enregistrés par le système de monitoring.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Filters onFiltersChange={handleFiltersChange} onExport={handleExport} />

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Liste des Logs ({logs.length} entrées)
            </h5>
            <div>
              <button 
                className="btn btn-outline-primary btn-sm me-2"
                onClick={loadLogs}
                disabled={loading}
              >
                <i className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></i>
                Actualiser
              </button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </Spinner>
              <p className="mt-2">Chargement des logs...</p>
            </div>
          ) : (
            <LogsTable 
              logs={logs} 
              onRefresh={loadLogs}
              loading={loading}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LogsPage;
