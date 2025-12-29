import { Box, Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Alertas from "./Alertas";
import Ninos from "./Ninos";
import Perfil from "./Perfil";
import Pulsera from "./Pulsera";
import Sidebar from "./Sidebar";
import Ubicaciones from "./Ubicaciones";
import Zonas from "./Zonas";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import WatchIcon from "@mui/icons-material/Watch";

import {
  getNinosByUsuarioRequest,
  getPulserasByUsuarioRequest,
} from "../services/api";

function Dashboard({ user }) {
  const [ninos, setNinos] = useState([]);
  const [pulseras, setPulseras] = useState([]);

  useEffect(() => {
    getNinosByUsuarioRequest(user.id)
      .then((res) => setNinos(res.data))
      .catch(console.error);
    getPulserasByUsuarioRequest(user.id)
      .then((res) => setPulseras(res.data))
      .catch(console.error);
  }, [user]);

  const totalNinos = ninos.length;
  const pulserasDisponibles = (Array.isArray(pulseras) ? pulseras : [])
  .filter((p) => !p.id_nino).length;
  const pulserasAsignadas = (Array.isArray(pulseras) ? pulseras : [])
  .filter((p) => p.id_nino).length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
        pt: { xs: 3, sm: 0 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 5,
          fontSize: { xs: "1.6rem", sm: "2.2rem" },
        }}
      >
        ¡Hola, {user.nombre}! 👋 Bienvenido a tu panel
      </Typography>

      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{ width: { xs: "95%", sm: "80%", md: "70%" }, maxWidth: 900 }}
      >
        {/* Tarjeta Niños */}
        <Grid item xs={6} sm={4}>
          <Paper
            sx={{
              p: { xs: 3, sm: 3 },
              textAlign: "center",
              boxShadow: 3,
              borderRadius: 3,
              bgcolor: "#fff0f0",
            }}
          >
            <ChildCareIcon
              sx={{ fontSize: { xs: 40, sm: 40 }, mb: 1, color: "#3f51b5" }}
            />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "0.75rem", sm: "1.1rem" } }}
            >
              Niños registrados
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {totalNinos}
            </Typography>
          </Paper>
        </Grid>

        <Grid //Pulseras disponibles
          item
          xs={6}
          sm={4}
          sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-start" } }}
        >
          <Paper
            sx={{
              p: { xs: 2.1, sm: 3 },
              textAlign: "center",
              boxShadow: 3,
              borderRadius: 3,
              bgcolor: "#fff0f0",
              width: { xs: "100%", sm: "100%" },
              mx: { xs: "5%", sm: 0 },
            }}
          >
            <WatchIcon
              sx={{ fontSize: { xs: 40, sm: 40 }, mb: 1, color: "#4caf50" }}
            />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "0.75rem", sm: "1.1rem" } }}
            >
              Pulseras disponibles
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {pulserasDisponibles}
            </Typography>
          </Paper>
        </Grid>

        <Grid //Pulseras asignadas
          item
          xs={12}
          sm={4}
          sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" } }}
        >
          <Paper
            sx={{
              p: { xs: 2.1, sm: 3 },
              textAlign: "center",
              boxShadow: 3,
              borderRadius: 3,
              bgcolor: "#fff0f0",
              width: { xs: "80%", sm: "100%" },
            }}
          >
            <AssignmentTurnedInIcon
              sx={{ fontSize: { xs: 40, sm: 40 }, mb: 1, color: "#f44336" }}
            />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "0.75rem", sm: "1.1rem" } }}
            >
              Pulseras asignadas
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {pulserasAsignadas}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        sx={{
          mt: { xs: 8, sm: 25 },
          p: 2,
          textAlign: "center",
          boxShadow: 2,
          borderRadius: 3,
          bgcolor: "#fffbe6",
          width: { xs: "60%", sm: "50%", md: "70%" },
        }}
      >
        <Typography variant="body1" sx={{ fontSize: { xs: "0.5rem", sm: "1rem" } }}>
          💡 Recuerda registrar tus zonas de seguridad, nuevas pulseras y asignar pulseras si es necesario.
        </Typography>
      </Paper>
    </Box>
  );
}

function Principal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser === "object") {
            setUser(parsedUser);
          } else {
            localStorage.removeItem("user");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
          localStorage.removeItem("user");
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    }
  }, [location.state, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        background:
          "linear-gradient(135deg, #a595c0e2 0%, #e2e6f8b3 50%, #bba9d7e2 100%)",
      }}
    >
      <Sidebar user={user} onLogout={handleLogout} />

      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          overflowY: "auto",
          ml: { sm: "230px" },
          mt: { xs: "45px", sm: 0 },
          height: "100vh",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="ninos" element={<Ninos />} />
          <Route path="pulsera" element={<Pulsera />} />
          <Route path="ubicaciones" element={<Ubicaciones />} />
          <Route path="zonas" element={<Zonas />} />
          <Route path="alertas" element={<Alertas />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default Principal;
