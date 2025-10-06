import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, InputAdornment, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await loginRequest({ email, password });
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/principal");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al conectar con el servidor");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "92vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #c4a9e0ff 0%, #c4d5f5ff 100%)",
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: { xs: "80%", sm: 400 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          boxShadow: 6,
          background: "linear-gradient(135deg, #8138cfff 0%, #a7c0edff 100%)",
        }}
      >
        <AccountCircleIcon color="black" sx={{ fontSize: 120, mb: 2 }} />
       

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          color="black"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
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
          color="black"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 3,
            py: 1.5,
            fontWeight: "bold",
            boxShadow: 3,
            "&:hover": { bgcolor: "#0d2648ff" },
          }}
        >
          Iniciar Sesión
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
          >
            Regístrate aquí
          </Link>

        </Box>
      </Box>
    </Box>
  );
}

export default Login;
