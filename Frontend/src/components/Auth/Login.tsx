import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import apiService from '../../services/api';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister?: (email: string, password: string, displayName: string, role: 'Admin' | 'Viewer') => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('admin@local.test');
  const [password, setPassword] = useState('P@ssw0rd!');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Viewer'>('Viewer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        // si le parent ne fournit pas onRegister, fallback direct service
        if (onRegister) {
          await onRegister(email, password, displayName, role);
        } else {
          const resp = await apiService.register({ email, password, displayName, role });
          localStorage.setItem('authToken', resp.token);
          window.location.reload();
        }
      }
    } catch (error: any) {
      setError(error.response?.data || error.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '450px', width: '100%' }}>
        <Card>
          <Card.Header className="text-center">
            <h4 className="mb-0">
              <i className="fas fa-sign-in-alt me-2"></i>
              ApiMonitor - {isLogin ? 'Connexion' : 'Inscription'}
            </h4>
          </Card.Header>
          <Card.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom d'affichage</Form.Label>
                    <Form.Control
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Votre nom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Rôle</Form.Label>
                    <Form.Select value={role} onChange={(e) => setRole(e.target.value as 'Admin' | 'Viewer')} required>
                      <option value="Viewer">Viewer (lecture)</option>
                      <option value="Admin">Admin</option>
                    </Form.Select>
                  </Form.Group>
                </>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@local.test"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    className="position-absolute"
                    style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </Button>
                </div>
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isLogin ? 'Connexion...' : 'Inscription...'}
                  </>
                ) : (
                  <>
                    <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'} me-2`}></i>
                    {isLogin ? 'Se connecter' : 'S\'inscrire'}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    if (isLogin) {
                      setEmail('');
                      setPassword('');
                      setDisplayName('');
                      setRole('Viewer');
                    } else {
                      setEmail('admin@local.test');
                      setPassword('P@ssw0rd!');
                      setDisplayName('');
                      setRole('Viewer');
                    }
                  }}
                >
                  {isLogin ? 'Créer un compte' : 'Déjà un compte ?'}
                </Button>
              </div>
            </Form>

            {isLogin && (
              <div className="mt-3 text-center">
                <small className="text-muted">
                  Identifiants par défaut : admin@local.test / P@ssw0rd!
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login;
