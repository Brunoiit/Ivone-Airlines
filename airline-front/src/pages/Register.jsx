import { useState } from "react";
import { register as registerAPI } from "../api/auth";
import { Container, TextField, Button, Typography, MenuItem } from "@mui/material";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await registerAPI({ full_name: fullName, email, role, password });
      alert("Registro exitoso, ahora inicia sesión");
      window.location.href = "/login";
    } catch (err) {
      alert(err?.response?.data?.detail || "Error registrando usuario");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Crear Cuenta
      </Typography>

      <form onSubmit={submit}>
        <TextField
          fullWidth
          margin="normal"
          label="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="normal"
          label="Tipo de usuario"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="customer">Cliente</MenuItem>
          <MenuItem value="airline">Aerolínea</MenuItem>
        </TextField>

        <TextField
          fullWidth
          margin="normal"
          type="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Registrarse
        </Button>
      </form>
    </Container>
  );
}