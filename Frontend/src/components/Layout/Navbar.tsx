import React, { useMemo, useState } from 'react';
import { Navbar, Nav, Container, Button, Modal, Form, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../../services/api';

interface NavbarProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
  onLogout: () => void;
}

const AppNavbar: React.FC<NavbarProps> = ({ 
  onThemeToggle, 
  isDarkMode, 
  onLogout 
}) => {
  const location = useLocation();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Viewer'>('Viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const userInfo = useMemo(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const displayName =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        payload['name'] || '';
      const roleClaim =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] || payload['roles'];
      const roleValue = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;
      return { displayName: String(displayName || ''), role: String(roleValue || '') };
    } catch {
      return null;
    }
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiService.register({ email, password, displayName, role });
      setSuccess('Utilisateur créé avec succès');
      setEmail('');
      setDisplayName('');
      setPassword('');
      setRole('Viewer');
    } catch (err: any) {
      setError(err?.response?.data || err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Navbar 
      bg={isDarkMode ? 'dark' : 'light'} 
      variant={isDarkMode ? 'dark' : 'light'} 
      expand="lg" 
      className="mb-4"
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard">
          <i className="fas fa-chart-line me-2"></i>
          ApiMonitor
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/logs" active={location.pathname === '/logs'}>
              Logs
            </Nav.Link>
            <Nav.Link as={Link} to="/analytics" active={location.pathname === '/analytics'}>
              Analytics
            </Nav.Link>
            <Nav.Link as={Link} to="/surveys" active={location.pathname === '/surveys'}>
              Surveys
            </Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            {userInfo && (
              <Nav.Item className="me-3 d-flex align-items-center">
                <span className="text-muted small me-2">Profil:</span>
                <span className="fw-semibold">{userInfo.displayName || 'Utilisateur'}</span>
                <span className="ms-2 badge bg-secondary">{userInfo.role || 'Viewer'}</span>
              </Nav.Item>
            )}
            {isAdmin && (
              <Nav.Item className="me-3">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => { setShowCreateUser(true); setError(null); setSuccess(null); }}
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Créer un compte
                </Button>
            </Nav.Item>
            )}
            <Nav.Item className="me-3">
              <Button
                variant={isDarkMode ? 'outline-light' : 'outline-dark'}
                size="sm"
                onClick={onThemeToggle}
                className="rounded-circle"
                style={{ width: '40px', height: '40px' }}
              >
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </Button>
            </Nav.Item>

            <Nav.Item>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={onLogout}
              >
                <i className="fas fa-sign-out-alt me-1"></i>
                Déconnexion
              </Button>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* Modal création utilisateur (Admin) */}
      <Modal show={showCreateUser} onHide={() => setShowCreateUser(false)} centered>
        <Form onSubmit={handleCreateUser}>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-user-plus me-2"></i>
              Créer un utilisateur
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                {success}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Nom d'affichage</Form.Label>
              <Form.Control value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Rôle</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value as 'Admin' | 'Viewer')} required>
                <option value="Viewer">Viewer (lecture)</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateUser(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Navbar>
  );
};

export default AppNavbar;
