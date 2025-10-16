import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { loginRequest } from "../services/api";

function Login({ onLoginSuccess }) { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Campos obligatorios",
        text: "Todos los campos son obligatorios",
        confirmButtonColor: "#0d2648ff",
        backdrop: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await loginRequest({ email, password });
      const data = res.data;

      // Guardamos sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Actualizamos el estado global antes de navegar
      if (onLoginSuccess) onLoginSuccess(data.user);

      // Mostramos mensaje de éxito y navegamos
      await Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        showConfirmButton: false,
        timer: 1500,
        backdrop: true,
      });

      navigate("/principal", { replace: true });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Credenciales inválidas",
        text: "Ingrese un usuario registrado",
        confirmButtonColor: "#0d2648ff",
        backdrop: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "92vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #84779cc2 0%, #e2e6f8b3 50%, #84779cc2 100%)",
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleLogin}
        autoComplete="off"
        sx={{
          width: { xs: "80%", sm: 400 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          boxShadow: 6,
          background:
            "linear-gradient(135deg, #b9b9eee2 0%, #fefdfefe 50%, #b9b9eee2 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <AccountCircleIcon sx={{ fontSize: 100, mb: 2, color: "#0d2648ff" }} />

        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#2b2d42",
            mb: 2,
            textAlign: "center",
          }}
        >
          Inicia sesión en tu cuenta
        </Typography>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
          color="black"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: "#0d2648ff" }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          color="black"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: "#0d2648ff" }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            mt: 3,
            py: 1.5,
            px: 7,
            fontWeight: "bold",
            bgcolor: "#0d2648ff",
            "&:hover": { bgcolor: "#22222de6" },
            boxShadow: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Iniciar Sesión"
          )}
        </Button>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            ¿No tienes cuenta?
          </Typography>
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => navigate("/register")}
            sx={{ color: "#3a0ca3", fontWeight: "bold" }}
          >
            Regístrate aquí
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
