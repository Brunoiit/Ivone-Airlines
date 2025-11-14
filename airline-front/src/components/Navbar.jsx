import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Airlines
        </Link>

        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Buscar Vuelos
          </Link>

          {user?.role === "airline" && (
            <Link to="/create-flight" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Crear Vuelo
            </Link>
          )}

          {user?.role === "customer" && (
            <>
              <Link to="/my-bookings" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Mis Reservas
              </Link>
              <Link to="/my-payments" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Mis Pagos
              </Link>
            </>
          )}

          {!user && (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Iniciar Sesión
              </Link>
              <Link to="/register" className="nav-link nav-link-primary" onClick={() => setMobileMenuOpen(false)}>
                Registrarse
              </Link>
            </>
          )}

          {user && (
            <>
              <span className="nav-user">
                👤 {user.full_name}
              </span>
              <button onClick={handleLogout} className="nav-logout">
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}