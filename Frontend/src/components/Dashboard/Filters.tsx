import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FilterOptions } from '../../types';

interface FiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: () => void;
}

const Filters: React.FC<FiltersProps> = ({ onFiltersChange, onExport }) => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="card-title mb-0">
          <i className="fas fa-filter me-2"></i>
          Filtres
        </h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Méthode</Form.Label>
              <Form.Select
                value={filters.method || ''}
                onChange={(e) => handleFilterChange('method', e.target.value || undefined)}
              >
                <option value="">Toutes</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>Statut</Form.Label>
              <Form.Select
                value={filters.statusCode || ''}
                onChange={(e) => handleFilterChange('statusCode', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Tous</option>
                <option value="200">200 OK</option>
                <option value="404">404 Not Found</option>
                <option value="500">500 Error</option>
                <option value="401">401 Unauthorized</option>
                <option value="403">403 Forbidden</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Date début</Form.Label>
              <Form.Control
                type="datetime-local"
                value={filters.fromDate || ''}
                onChange={(e) => handleFilterChange('fromDate', e.target.value || undefined)}
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Date fin</Form.Label>
              <Form.Control
                type="datetime-local"
                value={filters.toDate || ''}
                onChange={(e) => handleFilterChange('toDate', e.target.value || undefined)}
              />
            </Form.Group>
          </Col>

          <Col md={2} className="d-flex align-items-end">
            <div className="d-flex gap-2 w-100">
              <Button 
                variant="primary" 
                onClick={() => onFiltersChange(filters)}
                className="flex-fill"
              >
                <i className="fas fa-search me-1"></i>
                Filtrer
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={handleReset}
                className="flex-fill"
              >
                <i className="fas fa-undo me-1"></i>
                Reset
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Endpoint (recherche)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Rechercher dans les endpoints..."
                value={filters.path || ''}
                onChange={(e) => handleFilterChange('path', e.target.value || undefined)}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="d-flex align-items-end">
            <Button 
              variant="success" 
              onClick={onExport}
              className="w-100"
            >
              <i className="fas fa-download me-1"></i>
              Export CSV
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Filters;
