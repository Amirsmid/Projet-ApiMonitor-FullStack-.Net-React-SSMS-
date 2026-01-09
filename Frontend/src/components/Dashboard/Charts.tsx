import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { TimeSeriesPoint, OverviewData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartsProps {
  timeSeriesData: TimeSeriesPoint[];
  overviewData: OverviewData;
}

const Charts: React.FC<ChartsProps> = ({ timeSeriesData, overviewData }) => {
  const timeSeriesChartData = {
    labels: timeSeriesData.map(point => 
      new Date(point.timestampUtc).toLocaleTimeString()
    ),
    datasets: [
      {
        label: 'Requêtes',
        data: timeSeriesData.map(point => point.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Temps moyen (ms)',
        data: timeSeriesData.map(point => point.avgDurationMs),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const timeSeriesOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Heure',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Nombre de requêtes',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Temps (ms)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution des requêtes',
      },
    },
  };

  const statusChartData = {
    labels: ['200 OK', '404 Not Found', '500 Error', 'Autres'],
    datasets: [
      {
        data: [
          overviewData.okCount,
          0, // 404 count would need to be calculated separately
          overviewData.errorCount,
          overviewData.total - overviewData.okCount - overviewData.errorCount,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(201, 203, 207, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Répartition par statut',
      },
    },
  };

  return (
    <Row className="mb-4">
      <Col md={8}>
        <Card>
          <Card.Header>
            <h5 className="card-title mb-0">
              <i className="fas fa-chart-line me-2"></i>
              Évolution des requêtes
            </h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '300px' }}>
              <Line data={timeSeriesChartData} options={timeSeriesOptions} />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Header>
            <h5 className="card-title mb-0">
              <i className="fas fa-chart-pie me-2"></i>
              Répartition par statut
            </h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '300px' }}>
              <Doughnut data={statusChartData} options={statusChartOptions} />
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Charts;
