import { Box, Button, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      await registerRequest({ nombre, apellido, email, telefono, password });
      alert("Usuario registrado correctamente");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error de conexión con el servidor");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #c4a9e0ff 0%, #c4d5f5ff 100%)",
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{
          width: { xs: "90%", sm: 420 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          boxShadow: 6,
          background: "linear-gradient(135deg, #996ec7ff 0%, #a2b9e6ff 100%)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "rgba(0, 2, 6, 0.9)", }}>
          Crear Cuenta
        </Typography>

        <TextField label="Nombre" variant="outlined" color="black" fullWidth margin="normal" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <TextField label="Apellido" variant="outlined" color="black" fullWidth margin="normal" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
        <TextField label="Correo electrónico" variant="outlined" color="black" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Teléfono" variant="outlined" color="black" fullWidth margin="normal" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        <TextField label="Contraseña" type="password" variant="outlined" color="black" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, py: 1.5, fontWeight: "bold", boxShadow: 3, "&:hover": { bgcolor: "#0d2648ff"  } }}>
          Registrarse
        </Button>

        <Typography align="center" sx={{ mt: 2 }}>
          ¿Ya tienes cuenta?{" "}
          <Link
           component="button"
           type="button"
           underline="hover"
           onClick={() => navigate("/login")}
         >
           Inicia Sesión
          </Link>

        </Typography>
      </Box>
    </Box>
  );
}

export default Register;
