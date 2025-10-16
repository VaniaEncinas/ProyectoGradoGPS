import { Box, Button, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerRequest } from "../services/api";

function Register() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nombre || !apellido || !email || !telefono || !password) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Todos los campos son obligatorios",
        backdrop: true,
      });
      return;
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Correo inválido",
        text: "El correo electrónico debe ser un @gmail.com válido",
        backdrop: true,
      });
      return;
    }

    try {
      await registerRequest({ nombre, apellido, email, telefono, password });
      Swal.fire({
        icon: "success",
        title: "Usuario registrado correctamente",
        timer: 1500,
        showConfirmButton: false,
        backdrop: true,
      });
      setTimeout(() => navigate("/login"), 1600);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error de conexión con el servidor",
        backdrop: true,
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "92vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #84779cc2 0%, #e2e6f8b3 50%, #84779cc2 100%)",
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleRegister}
        autoComplete="off" 
        sx={{
          width: { xs: "90%", sm: 450 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          boxShadow: 6,
          background: "linear-gradient(135deg, #b9b9eee2 0%, #fefdfefe 50%, #b9b9eee2 100%)",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", color: "rgba(0, 2, 6, 0.9)" }}
        >
          Crear Cuenta
        </Typography>

        <TextField
          label="Nombre"
          variant="outlined"
          color="black"
          fullWidth
          margin="normal"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          autoComplete="off"
        />
        <TextField
          label="Apellido"
          variant="outlined"
          color="black"
          fullWidth
          margin="normal"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
          autoComplete="off"
        />
        <TextField
          label="Correo electrónico"
          variant="outlined"
          color="black"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
        />
        <TextField
          label="Teléfono"
          variant="outlined"
          color="black"
          fullWidth
          margin="normal"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          type="tel"            
          autoComplete="off"    
        />

        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          color="black"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password" 
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 3,
            py: 1.5,
            px: 7,
            fontWeight: "bold",
            boxShadow: 3,
            bgcolor: "#0d2648ff",
            "&:hover": { bgcolor: "#22222de6" },
          }}
        >
          Registrarse
        </Button>

        <Typography align="center" sx={{ mt: 2 }}>
          ¿Ya tienes cuenta?{" "}
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => navigate("/login")}
            sx={{ color: "#3a0ca3", fontWeight: "bold" }}
          >
            Inicia Sesión
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default Register;
