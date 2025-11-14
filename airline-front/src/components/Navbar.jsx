import { useContext } from "react";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }} variant="h6">
          Ivone Airlines
        </Typography>

        <Button color="inherit" component={Link} to="/">
          Buscar Vuelos
        </Button>

        {user?.role === "airline" && (
          <Button color="inherit" component={Link} to="/create-flight">
            Crear Vuelo
          </Button>
        )}

        {!user && (
          <>
            <Button color="inherit" component={Link} to="/login">
              Iniciar Sesión
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Registrarse
            </Button>
          </>
        )}

        {user && (
          <Button color="inherit" onClick={logout}>
            Cerrar Sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
