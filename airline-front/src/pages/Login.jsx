import { useState, useContext } from "react";
import { login as loginAPI } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { Container, TextField, Button, Typography } from "@mui/material";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginAPI({ email, password });
      login(res.data);
      alert("Sesión iniciada");
      window.location.href = "/";
    } catch {
      alert("Credenciales inválidas");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Iniciar Sesión
      </Typography>

      <form onSubmit={submit}>
        <TextField
          fullWidth
          margin="normal"
          label="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          type="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Entrar
        </Button>
      </form>
    </Container>
  );
}