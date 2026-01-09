import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

interface SurveyAnalytics {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  responsesToday: number;
  averageResponseTime: number;
  responsesByStatus: Record<string, number>;
  surveysByStatus: Record<string, number>;
}

interface AtreemoStatus {
  isAuthenticated: boolean;
  baseUrl: string;
  username: string;
  opcode: string;
}

const SurveyAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [atreemoStatus, setAtreemoStatus] = useState<AtreemoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    fetchAtreemoStatus();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.getSurveyAnalytics();
      setAnalytics(response);
    } catch (err: any) {
      console.error('Error fetching survey analytics:', err);
    }
  };

  const fetchAtreemoStatus = async () => {
    try {
      const response = await apiService.getAtreemoStatus();
      setAtreemoStatus(response);
    } catch (err: any) {
      console.error('Error fetching Atreemo status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'draft': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Atreemo Status Card */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-link me-2"></i>
              Statut de connexion Atreemo
            </h5>
          </div>
          <div className="card-body">
            {atreemoStatus && (
              <div className="row">
                <div className="col-md-3">
                  <div className="d-flex align-items-center">
                    <div className={`badge ${atreemoStatus.isAuthenticated ? 'bg-success' : 'bg-danger'} me-2`}>
                      <i className={`fas ${atreemoStatus.isAuthenticated ? 'fa-check' : 'fa-times'}`}></i>
                    </div>
                    <span>
                      {atreemoStatus.isAuthenticated ? 'Connecté' : 'Déconnecté'}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">URL:</small>
                  <div className="fw-bold">{atreemoStatus.baseUrl}</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Utilisateur:</small>
                  <div className="fw-bold">{atreemoStatus.username}</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Opcode:</small>
                  <div className="fw-bold">{atreemoStatus.opcode}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <>
          <div className="col-md-3 mb-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{analytics.totalSurveys}</h4>
                    <p className="mb-0">Surveys Total</p>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-poll fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{analytics.activeSurveys}</h4>
                    <p className="mb-0">Surveys Actifs</p>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{analytics.totalResponses}</h4>
                    <p className="mb-0">Réponses Total</p>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-comments fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{analytics.responsesToday}</h4>
                    <p className="mb-0">Réponses Aujourd'hui</p>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-calendar-day fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-chart-pie me-2"></i>
                  Répartition par Statut (Surveys)
                </h6>
              </div>
              <div className="card-body">
                {Object.entries(analytics.surveysByStatus).map(([status, count]) => (
                  <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-secondary">{status}</span>
                    <span className="fw-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  Répartition par Statut (Réponses)
                </h6>
              </div>
              <div className="card-body">
                {Object.entries(analytics.responsesByStatus).map(([status, count]) => (
                  <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-secondary">{status}</span>
                    <span className="fw-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Métriques de Performance
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Temps de réponse moyen:</span>
                      <span className="fw-bold">
                        {analytics.averageResponseTime.toFixed(2)} ms
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Taux de réponse:</span>
                      <span className="fw-bold">
                        {analytics.totalSurveys > 0 
                          ? ((analytics.totalResponses / analytics.totalSurveys) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="col-12">
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyAnalytics;
