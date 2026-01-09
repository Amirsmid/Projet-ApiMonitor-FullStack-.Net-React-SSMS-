import React, { useState } from 'react';
import apiService from '../../services/api';

interface SurveyFormProps {
  onSurveyCreated?: (survey: any) => void;
  onCancel?: () => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSurveyCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    opcode: '305', // Default opcode from Atreemo
    description: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.createSurvey(formData);
      
      if (onSurveyCreated) {
        onSurveyCreated(response);
      }
      
      // Reset form
      setFormData({
        title: '',
        opcode: '305',
        description: '',
        status: 'Active'
      });
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du survey');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-plus-circle me-2"></i>
          Créer un nouveau Survey
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Titre <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Titre du survey"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="opcode" className="form-label">
                  Opcode <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="opcode"
                  name="opcode"
                  value={formData.opcode}
                  onChange={handleInputChange}
                  placeholder="305"
                  required
                />
                <div className="form-text">
                  Code d'opération Atreemo (par défaut: 305)
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Description du survey (optionnel)"
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="status" className="form-label">
              Statut
            </label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Active">Actif</option>
              <option value="Inactive">Inactif</option>
              <option value="Draft">Brouillon</option>
            </select>
          </div>
          
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Création...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Créer le Survey
                </>
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyForm;
