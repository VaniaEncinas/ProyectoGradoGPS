// src/components/Ubicaciones.js
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "../config/leafletIconFix"; // configuración de icono

function Ubicaciones() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ninos, setNinos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [historialOpen, setHistorialOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedNino, setSelectedNino] = useState(null);
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUbicaciones(parsedUser.id);
    }
  }, []);

  const fetchUbicaciones = async (id_usuario) => {
    try {
      const { data } = await axios.get(`http://localhost:4000/api/ubicaciones/usuario/${id_usuario}`);
      
      const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.id_nino]) acc[curr.id_nino] = [];
        acc[curr.id_nino].push(curr);
        return acc;
      }, {});

      const ninosConUltimaUbicacion = Object.keys(grouped).map((id_nino) => {
        const ubicaciones = grouped[id_nino];
        const ultima = ubicaciones[0];
        return {
          id_nino,
          nombre: ubicaciones[0].nombre || `Niño ${id_nino}`,
          ultima_ubicacion: ultima,
          historial: ubicaciones,
        };
      });

      setNinos(ninosConUltimaUbicacion);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando ubicaciones:", err);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 5, maxWidth: 900, mx: "auto", position: "relative" }}>
      {/* Flecha regresar */}
      <IconButton
        onClick={() => navigate("/principal")}
        sx={{
          position: "absolute",
          top: 0,
          left: -22,
          bgcolor: "white",
          boxShadow: 2,
          borderRadius: "50%",
          width: 40,
          height: 40,
          "&:hover": { bgcolor: "#f0f0f0" },
          zIndex: 10,
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
        Ubicaciones
      </Typography>

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : ninos.length === 0 ? (
        <Typography>No hay ubicaciones registradas para tus niños.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
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
                  <TableCell>
                    {nino.ultima_ubicacion
                      ? `${nino.ultima_ubicacion.latitud}, ${nino.ultima_ubicacion.longitud}`
                      : "-"}
                  </TableCell>
                  <TableCell>{nino.ultima_ubicacion ? nino.ultima_ubicacion.fecha_hora : "-"}</TableCell>
                  <TableCell>
                    <Tooltip title="Historial">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedNino(nino);
                          setHistorialOpen(true);
                        }}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver mapa">
                      <IconButton
                        color="secondary"
                        onClick={() => {
                          setSelectedNino(nino);
                          setSelectedUbicacion(nino.ultima_ubicacion);
                          setMapOpen(true);
                        }}
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

      {/* Historial Modal */}
      {historialOpen && selectedNino && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20,
            p: 2,
          }}
        >
          <Paper
            sx={{
              width: { xs: "100%", sm: 500 },
              p: 3,
              borderRadius: 3,
              position: "relative",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <IconButton
              onClick={() => setHistorialOpen(false)}
              sx={{ position: "absolute", top: 10, right: 10 }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Historial de {selectedNino.nombre}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha/Hora</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Ver Mapa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedNino.historial.map((ubi, index) => (
                  <TableRow key={index}>
                    <TableCell>{ubi.fecha_hora}</TableCell>
                    <TableCell>{`${ubi.latitud}, ${ubi.longitud}`}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver en mapa">
                        <IconButton
                          onClick={() => {
                            setSelectedUbicacion(ubi);
                            setMapOpen(true);
                          }}
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

      {/* Mapa Modal */}
      {mapOpen && selectedUbicacion && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0, 0, 0, 0.58)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 30,
            p: 2,
          }}
        >
          <Paper
            sx={{
              width: { xs: "95%", sm: 600 },
              height: { xs: "50%", sm: 500 },
              p: 0,
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Botón X siempre visible */}
            <IconButton
              onClick={() => setMapOpen(false)}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 50,
                bgcolor: "white",
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <CloseIcon />
            </IconButton>

            <MapContainer
              center={[selectedUbicacion.latitud, selectedUbicacion.longitud]}
              zoom={15}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
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
            </MapContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default Ubicaciones;
