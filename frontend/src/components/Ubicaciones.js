import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import MapIcon from "@mui/icons-material/Map";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "../config/leafletIconFix";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : `http://${window.location.hostname}:4000`;

const fetchZonaSeguraActiva = async (id_usuario, id_nino) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/zonas/${id_usuario}`);
    const zonasActivas = Array.isArray(data) ? data.filter(z => z.id_nino === id_nino && z.estado === "activo") : [];
    if (zonasActivas.length === 0) return null;
    return zonasActivas[0];
  } catch (error) {
    console.error("Error obteniendo zona segura activa:", error);
    return null;
  }
};

function Ubicaciones() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ninos, setNinos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [historialOpen, setHistorialOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedNino, setSelectedNino] = useState(null);
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);
  const mapRef = useRef(null); 
  const markerRef = useRef(null);
  const [isHistorialMap, setIsHistorialMap] = useState(false);
  const [zonaActiva, setZonaActiva] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUbicaciones(parsedUser.id);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchUbicaciones(user.id), 20000);
    return () => clearInterval(interval);
  }, [user]);

useEffect(() => {
  if (!mapOpen || !selectedNino || isHistorialMap) return;

  const interval = setInterval(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/ubicaciones/usuario/${user.id}`);
      const ubicaciones = Array.isArray(data) ? data.filter(u => u.id_nino === selectedNino.id_nino) : [];
      if (ubicaciones.length === 0) return;

      const ultima = ubicaciones[0];

      setSelectedUbicacion(ultima);
      setSelectedNino(prev => ({ ...prev, ultima_ubicacion: ultima }));
    } catch (err) {
      console.error("Error actualizando ubicación en tiempo real:", err);
    }
  }, 5000); 

  return () => clearInterval(interval);
}, [mapOpen, selectedNino, user, isHistorialMap]);

  const fetchUbicaciones = async (id_usuario) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/ubicaciones/usuario/${id_usuario}`);
      
      const grouped = data.reduce((acc, curr) => {
        if (!curr.id_nino) return acc;
        if (!acc[curr.id_nino]) acc[curr.id_nino] = [];
        acc[curr.id_nino].push(curr);
        return acc;
      }, {});

      const ninosConUltimaUbicacion = Object.entries(grouped)
        .map(([id_nino, ubicaciones]) => {
          if (!ubicaciones || ubicaciones.length === 0) return null;
          const ultima = ubicaciones[0];
          return {
            id_nino: Number(id_nino),
            nombre: ultima.nombre || `Niño ${id_nino}`,
            ultima_ubicacion: ultima,
            historial: ubicaciones,
          };
        })
        .filter(Boolean);

      setNinos(ninosConUltimaUbicacion);

      if (mapOpen && selectedNino) {
        const actualizado = ninosConUltimaUbicacion.find(n => n.id_nino === selectedNino.id_nino);
        if (actualizado) {
          setSelectedUbicacion(actualizado.ultima_ubicacion);
          setSelectedNino(actualizado);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error cargando ubicaciones:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !selectedUbicacion) return;

    markerRef.current.setLatLng([
      selectedUbicacion.latitud,
      selectedUbicacion.longitud,
    ]);
    if (mapOpen) {
    mapRef.current.setView(
      [selectedUbicacion.latitud, selectedUbicacion.longitud],
      mapRef.current.getZoom(),
      { animate: true }
    );
    }
  }, [selectedUbicacion]);

  if (!user) return null;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: "100%", mx: "auto", position: "relative", overflowX: "hidden" }}>
      <IconButton
        onClick={() => navigate("/principal")}
        sx={{
          position: "fixed",
          bgcolor: "white",
          boxShadow: 2,
          "&:hover": { bgcolor: "#f5f2f2c9" },
          zIndex: 3,
          top: { xs: 78, sm: 30 },
          left: { xs: 14, sm: 285 },
          transition: "top 0.3s ease, left 0.3s ease",
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h4" sx={{ mb: 3, mt: { xs: 6, sm: 4 }, fontWeight: "bold", textAlign: "center" }}>
        Ubicaciones
      </Typography>

      {loading ? (
        <Typography textAlign="center">Cargando...</Typography>
      ) : ninos.length === 0 ? (
        <Typography textAlign="center">No hay ubicaciones registradas para tus niños.</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 3, borderRadius: 3, width: "100%", maxWidth: "900px", mx: "auto",
            overflowX: "auto", overflowY: "auto", maxHeight: "60vh",
            "&::-webkit-scrollbar": { width: "8px", height: "8px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "transparent", borderRadius: "8px", transition: "background-color 0.3s ease" },
            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
            "&:hover::-webkit-scrollbar-thumb": { backgroundColor: "rgba(0, 0, 0, 0.4)" },
            "&:hover::-webkit-scrollbar-track": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
            scrollbarWidth: "thin",
            "&:not(:hover)": { scrollbarColor: "transparent transparent" },
            "&:hover": { scrollbarColor: "rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.1)" }
          }}
        >
          <Table sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#7886f35f" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Última Ubicación</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Fecha/Hora</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ninos.map((nino) => (
                <TableRow key={nino.id_nino}>
                  <TableCell>{nino.nombre}</TableCell>
                  <TableCell>{nino.ultima_ubicacion ? `${nino.ultima_ubicacion.latitud}, ${nino.ultima_ubicacion.longitud}` : "-"}</TableCell>
                  <TableCell>{nino.ultima_ubicacion ? nino.ultima_ubicacion.fecha_hora : "-"}</TableCell>
                  <TableCell>
                    <Tooltip title="Historial">
                      <IconButton
                        color="primary"
                        sx={{ "&:hover": { bgcolor: "#b0e6edcb" }, borderRadius: "20px" }}
                        onClick={() => { setSelectedNino(nino); setHistorialOpen(true); }}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver mapa">
                      <IconButton
                        color="secondary"
                        sx={{ "&:hover": { bgcolor: "#de53d77d" }, borderRadius: "20px" }}
                        onClick={async() => { setIsHistorialMap(false); setSelectedNino(nino); setSelectedUbicacion(nino.ultima_ubicacion); const zona = await fetchZonaSeguraActiva(user.id, nino.id_nino); setZonaActiva(zona); setMapOpen(true); }}
                      >
                        <MapIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {historialOpen && selectedNino && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1400,
            p: 1.5,
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(3,3,23,0.38)",
          }}
        >
          <Paper
            sx={{
              width: "clamp(320px, 92vw, 500px)",
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              position: "relative",
              background: "radial-gradient(circle, rgba(254,253,254,0.96) 0%, rgba(224,232,247,0.86) 100%)",
              overflowY: "auto",
              maxHeight: "80vh",
            }}
          >
            <IconButton onClick={() => setHistorialOpen(false)} sx={{ position: "absolute", top: 10, right: 10, color: "#000" }}>
              <CloseIcon />
            </IconButton>

            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
              Historial de {selectedNino.nombre}
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#7886f35f" }}>
                  <TableCell>Fecha/Hora</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Ver Mapa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(selectedNino.historial || []).map((ubi, index) => (
                  <TableRow key={index}>
                    <TableCell>{ubi.fecha_hora}</TableCell>
                    <TableCell>{`${ubi.latitud}, ${ubi.longitud}`}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver en mapa">
                        <IconButton
                          color="secondary"
                          onClick={async() => { setIsHistorialMap(true); setSelectedUbicacion(ubi); const zona = await fetchZonaSeguraActiva(user.id, selectedNino.id_nino);setZonaActiva(zona); setMapOpen(true);}}
                        >
                          <MapIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {mapOpen && selectedUbicacion && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1500,
            p: 1.5,
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(3,3,23,0.5)",
          }}
        >
          <Paper
            sx={{
              width: "clamp(320px, 92vw, 600px)",
              height: { xs: "60%", sm: 500 },
              maxHeight: "90vh",
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              background: "radial-gradient(circle, rgba(254,253,254,0.96) 0%, rgba(224,232,247,0.86) 100%)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f6f4fa", borderBottom: "1px solid #e0e0e0", px: 2, py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#555", fontSize: "1.1rem" }}>
                {historialOpen ? "Ubicación" : "Ubicación Actual"}
              </Typography>
              <IconButton onClick={() => {setMapOpen(false); setIsHistorialMap(false);}} sx={{ bgcolor: "white", boxShadow: 1, "&:hover": { bgcolor: "#f0f0f0" } }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, position: "relative" }}>
              <MapContainer
                center={[selectedUbicacion.latitud, selectedUbicacion.longitud]}
                zoom={15}
                whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker
                  ref={markerRef}
                  position={[selectedUbicacion.latitud, selectedUbicacion.longitud]}
                  icon={L.icon({
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })}
                >
                  <Popup>
                    {selectedNino ? selectedNino.nombre : "Niño"} <br />
                    {selectedUbicacion.fecha_hora}
                  </Popup>
                </Marker>
                {zonaActiva && (
                  <Circle
                   center={[zonaActiva.latitud, zonaActiva.longitud]}
                   radius={zonaActiva.radio_metros}
                  pathOptions={{ color: "green", fillColor: "lightblue", fillOpacity: 0.75 }}
                  />
                )}
              </MapContainer>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default Ubicaciones;