import { Navigate } from 'react-router-dom';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="access-denied-header">
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para acceder a esta página</p>
          </div>
          <div className="access-denied-content">
            <div className="denied-icon">🔒</div>
            <p className="denied-message">
              Solo usuarios con rol <strong>{requiredRole}</strong> pueden acceder aquí.
            </p>
            <p className="denied-submessage">
              Tu rol actual: <strong>{userRole}</strong>
            </p>
          </div>
          <div className="access-denied-actions">
            <a href="/" className="back-button">
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;