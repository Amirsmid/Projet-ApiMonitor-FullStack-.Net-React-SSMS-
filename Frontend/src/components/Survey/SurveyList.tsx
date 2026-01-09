import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

interface Survey {
  id: number;
  surveyId: string;
  title: string;
  description?: string;
  opcode: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  responseCount: number;
}

interface SurveyListProps {
  onSurveySelect?: (survey: Survey) => void;
}

const SurveyList: React.FC<SurveyListProps> = ({ onSurveySelect }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSurveys();
      setSurveys(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des surveys');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusClass = status === 'Active' ? 'bg-success' : 
                       status === 'Inactive' ? 'bg-secondary' : 'bg-warning';
    return (
      <span className={`badge ${statusClass}`}>
        {status || 'Unknown'}
      </span>
    );
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-poll me-2"></i>
          Surveys ({surveys.length})
        </h5>
        <button 
          className="btn btn-primary btn-sm"
          onClick={fetchSurveys}
        >
          <i className="fas fa-sync-alt me-1"></i>
          Actualiser
        </button>
      </div>
      <div className="card-body p-0">
        {surveys.length === 0 ? (
          <div className="text-center p-4">
            <i className="fas fa-poll fa-3x text-muted mb-3"></i>
            <p className="text-muted">Aucun survey trouvé</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Titre</th>
                  <th>Opcode</th>
                  <th>Statut</th>
                  <th>Réponses</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr key={survey.id} style={{ cursor: onSurveySelect ? 'pointer' : 'default' }}
                      onClick={() => onSurveySelect?.(survey)}>
                    <td>
                      <div>
                        <strong>{survey.title}</strong>
                        {survey.description && (
                          <div className="text-muted small">{survey.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info">{survey.opcode}</span>
                    </td>
                    <td>{getStatusBadge(survey.status)}</td>
                    <td>
                      <span className="badge bg-primary">{survey.responseCount}</span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(survey.createdAt).toLocaleDateString('fr-FR')}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSurveySelect?.(survey);
                          }}
                          title="Voir les détails"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-success"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement view responses
                          }}
                          title="Voir les réponses"
                        >
                          <i className="fas fa-list"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyList;
