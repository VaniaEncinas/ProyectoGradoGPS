import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// Importamos cada pantalla
import Alertas from "./Alertas";
import Ninos from "./Ninos";
import Perfil from "./Perfil";
import Pulsera from "./Pulsera";
import Ubicaciones from "./Ubicaciones";
import Zonas from "./Zonas";

function Principal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else {
          // Si no es un objeto válido, limpiar y redirigir
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
  }, [navigate]);

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
        minHeight: "97vh",
        background: "linear-gradient(135deg, #9177aeff 0%, #b5c7e9ff 100%)",
      }}
    >
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Contenedor principal de contenido */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
        <Routes>
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
