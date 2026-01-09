import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { OverviewData } from '../../types';

interface OverviewCardsProps {
  data: OverviewData;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="stats-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-subtitle mb-2 text-muted">Total Requêtes</h6>
                <h2 className="card-title mb-0 text-primary">
                  {data.total.toLocaleString()}
                </h2>
              </div>
              <div className="text-primary">
                <i className="fas fa-chart-bar" style={{ fontSize: '32px' }}></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="stats-card h-100 border-success">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-subtitle mb-2 text-muted">Succès</h6>
                <h2 className="card-title mb-0 text-success">
                  {data.okCount.toLocaleString()}
                </h2>
                <small className="text-muted">
                  {data.total > 0 ? ((data.okCount / data.total) * 100).toFixed(1) : 0}%
                </small>
              </div>
              <div className="text-success">
                <i className="fas fa-check-circle" style={{ fontSize: '32px' }}></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="stats-card h-100 border-danger">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-subtitle mb-2 text-muted">Erreurs</h6>
                <h2 className="card-title mb-0 text-danger">
                  {data.errorCount.toLocaleString()}
                </h2>
                <small className="text-muted">
                  {data.errorRate.toFixed(1)}%
                </small>
              </div>
              <div className="text-danger">
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '32px' }}></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="stats-card h-100 border-info">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-subtitle mb-2 text-muted">Temps Moyen</h6>
                <h2 className="card-title mb-0 text-info">
                  {Math.round(data.avgDurationMs)}ms
                </h2>
                <small className="text-muted">
                  P95: {Math.round(data.p95DurationMs)}ms
                </small>
              </div>
              <div className="text-info">
                <i className="fas fa-clock" style={{ fontSize: '32px' }}></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewCards;
