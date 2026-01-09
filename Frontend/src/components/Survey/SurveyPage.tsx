import React, { useState, useMemo } from 'react';
import SurveyList from './SurveyList';
import SurveyForm from './SurveyForm';
import SurveyAnalytics from './SurveyAnalytics';
import apiService from '../../services/api';

const SurveyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'analytics'>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);

  // Vérifier si l'utilisateur est Admin
  const isAdmin = useMemo(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Possible claim keys for role
      const roleClaim =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] || payload['roles'];
      if (!roleClaim) return false;
      if (Array.isArray(roleClaim)) return roleClaim.includes('Admin');
      return String(roleClaim) === 'Admin';
    } catch {
      return false;
    }
  }, []);

  const handleSurveyCreated = (survey: any) => {
    setActiveTab('list');
    // Optionally show success message
  };

  const handleSurveySelect = (survey: any) => {
    setSelectedSurvey(survey);
    // Could open a modal or navigate to detail view
  };

  const handleDeleteSurvey = async (surveyId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce survey ? Cette action est irréversible.')) {
      try {
        await apiService.deleteSurvey(surveyId);
        setSelectedSurvey(null);
        // Optionally refresh the survey list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting survey:', error);
        alert('Erreur lors de la suppression du survey');
      }
    }
  };

  // Rediriger les Viewers vers 'list' s'ils essaient d'accéder à 'create'
  React.useEffect(() => {
    if (!isAdmin && activeTab === 'create') {
      setActiveTab('list');
    }
  }, [isAdmin, activeTab]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-poll me-2"></i>
              Gestion des Surveys
            </h2>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('list')}
              >
                <i className="fas fa-list me-1"></i>
                Liste
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('create')}
                >
                  <i className="fas fa-plus me-1"></i>
                  Créer
                </button>
              )}
              <button
                type="button"
                className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('analytics')}
              >
                <i className="fas fa-chart-bar me-1"></i>
                Analytics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'list' && (
            <SurveyList onSurveySelect={handleSurveySelect} />
          )}

          {activeTab === 'create' && (
            <SurveyForm 
              onSurveyCreated={handleSurveyCreated}
              onCancel={() => setActiveTab('list')}
            />
          )}

          {activeTab === 'analytics' && (
            <SurveyAnalytics />
          )}

          {/* Survey Details Modal (if needed) */}
          {selectedSurvey && (
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <i className="fas fa-poll me-2"></i>
                      Détails du Survey
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSelectedSurvey(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="survey-detail-item">
                          <label className="survey-detail-label">Titre:</label>
                          <p className="survey-detail-value">{selectedSurvey.title}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="survey-detail-item">
                          <label className="survey-detail-label">Opcode:</label>
                          <p><span className="badge bg-info">{selectedSurvey.opcode}</span></p>
                        </div>
                      </div>
                    </div>
                    {selectedSurvey.description && (
                      <div className="mb-3 survey-detail-item">
                        <label className="survey-detail-label">Description:</label>
                        <p className="survey-detail-value">{selectedSurvey.description}</p>
                      </div>
                    )}
                    <div className="row">
                      <div className="col-md-4">
                        <div className="survey-detail-item">
                          <label className="survey-detail-label">Statut:</label>
                          <p>
                            <span className={`badge ${selectedSurvey.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                              {selectedSurvey.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="survey-detail-item">
                          <label className="survey-detail-label">Réponses:</label>
                          <p><span className="badge bg-primary">{selectedSurvey.responseCount}</span></p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="survey-detail-item">
                          <label className="survey-detail-label">Créé le:</label>
                          <p className="survey-detail-value">{new Date(selectedSurvey.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSelectedSurvey(null)}
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        // TODO: Implement view responses
                        setSelectedSurvey(null);
                      }}
                    >
                      <i className="fas fa-list me-1"></i>
                      Voir les Réponses
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDeleteSurvey(selectedSurvey.id)}
                      >
                        <i className="fas fa-trash me-1"></i>
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;
