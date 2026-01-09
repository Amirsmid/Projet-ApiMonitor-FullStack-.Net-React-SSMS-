import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import Charts from './Charts';
import OverviewCards from './OverviewCards';
import { 
  OverviewData, 
  TimeSeriesPoint, 
  EndpointStats, 
  TokenStats 
} from '../../types';
import apiService from '../../services/api';

const AnalyticsPage: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [endpointsData, setEndpointsData] = useState<EndpointStats[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, timeSeries, endpoints, tokens] = await Promise.all([
        apiService.getOverview(),
        apiService.getTimeSeries(),
        apiService.getTopEndpoints(),
        apiService.getTokenStats()
      ]);

      setOverviewData(overview);
      setTimeSeriesData(timeSeries);
      setEndpointsData(endpoints);
      setTokenStats(tokens);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      setError('Erreur lors du chargement des données analytiques');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h2 className="mb-3">
          <i className="fas fa-chart-bar me-2"></i>
          Analytics Avancées
        </h2>
        <p className="text-muted">
          Analysez les performances et les tendances de vos APIs avec des métriques détaillées.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement des analytics...</p>
        </div>
      ) : (
        <>
          {overviewData && (
            <>
              <OverviewCards data={overviewData} />
              
              {overviewData.alerts && overviewData.alerts.length > 0 && (
                <Alert variant="warning" className="mb-4">
                  <h6>⚠️ Alertes détectées:</h6>
                  <ul className="mb-0">
                    {overviewData.alerts.map((alert, index) => (
                      <li key={index}>{alert}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </>
          )}

          {timeSeriesData.length > 0 && overviewData && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  Évolution Temporelle
                </h5>
              </Card.Header>
              <Card.Body>
                <Charts timeSeriesData={timeSeriesData} overviewData={overviewData} />
              </Card.Body>
            </Card>
          )}

          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-list-ol me-2"></i>
                    Top Endpoints
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Endpoint</th>
                          <th>Requêtes</th>
                          <th>Temps Moyen</th>
                          <th>Succès</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpointsData.slice(0, 10).map((endpoint, index) => (
                          <tr key={index}>
                            <td>
                              <code className="text-break">{endpoint.path}</code>
                            </td>
                            <td>{endpoint.count}</td>
                            <td>{Math.round(endpoint.avgDurationMs)}ms</td>
                            <td>
                              <span className={`badge ${endpoint.successRate > 90 ? 'bg-success' : endpoint.successRate > 70 ? 'bg-warning' : 'bg-danger'}`}>
                                {endpoint.successRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-key me-2"></i>
                    Statistiques des Tokens
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Token</th>
                          <th>Utilisations</th>
                          <th>Dernière Utilisation</th>
                          <th>Succès</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenStats.slice(0, 10).map((token, index) => (
                          <tr key={index}>
                            <td>
                              <code className="text-break">{token.tokenHash.substring(0, 8)}...</code>
                            </td>
                            <td>{token.usageCount}</td>
                            <td>{new Date(token.lastUsed).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${token.successRate > 90 ? 'bg-success' : token.successRate > 70 ? 'bg-warning' : 'bg-danger'}`}>
                                {token.successRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AnalyticsPage;
