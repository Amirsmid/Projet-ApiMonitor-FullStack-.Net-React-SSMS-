import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { ApiLog } from '../../types';

interface LogsTableProps {
  logs: ApiLog[];
  onRefresh: () => void;
  loading?: boolean;
}

const LogsTable: React.FC<LogsTableProps> = ({ logs, onRefresh, loading = false }) => {
  const getStatusBadgeVariant = (statusCode: number) => {
    if (statusCode < 400) return 'success';
    if (statusCode < 500) return 'warning';
    return 'danger';
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'success';
      case 'POST': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'danger';
      default: return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          <i className="fas fa-history me-2"></i>
          Logs récents
        </h5>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <i className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></i>
          Actualiser
        </Button>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Méthode</th>
                <th>Path</th>
                <th>Statut</th>
                <th>Durée</th>
                <th>IP Client</th>
                <th>User Agent</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    {loading ? 'Chargement...' : 'Aucun log trouvé'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <small>{formatTimestamp(log.timestampUtc)}</small>
                    </td>
                    <td>
                      <Badge bg={getMethodBadgeVariant(log.method)}>
                        {log.method}
                      </Badge>
                    </td>
                    <td>
                      <code className="text-break">{log.path}</code>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(log.statusCode)}>
                        {log.statusCode}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-muted">
                        {log.durationMs ? `${log.durationMs}ms` : '-'}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {log.clientIp || '-'}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                        {log.userAgent || '-'}
                      </small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LogsTable;
