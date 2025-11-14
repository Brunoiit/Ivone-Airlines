import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginAPI } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginAPI({ email, password });
      console.log("[v0] Login response:", res);
      login(res);
      navigate("/");
    } catch (err) {
      console.log("[v0] Login error:", err);
      setError(err?.detail || err?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Iniciar Sesión</h1>
          <p>Bienvenido a Ivone Airlines</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿No tienes cuenta? <a href="/register">Registrarse aquí</a></p>
        </div>
      </div>
    </div>
  );
}