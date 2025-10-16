import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MapIcon from "@mui/icons-material/Map";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createZonaRequest,
  deleteZonaRequest,
  getNinosByUsuarioRequest,
  getZonasRequest,
  updateZonaRequest,
} from "../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const Zonas = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const id_usuario = user?.id;

  const [ninos, setNinos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [form, setForm] = useState({
    id_nino: "",
    nombre_zona: "",
    latitud: null,
    longitud: null,
    radio_metros: "",
  });

  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalMapOpen, setModalMapOpen] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [viewZona, setViewZona] = useState(null);
  const [mapCenter, setMapCenter] = useState([-17.3935419, -66.1570139]);

  useEffect(() => {
    if (!id_usuario) {
      Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Por favor inicia sesión nuevamente.",
      }).then(() => {
        localStorage.clear();
        navigate("/");
      });
    } else {
      fetchNinos();
      fetchZonas();
    }
  }, [id_usuario, navigate]);

  const fetchNinos = async () => {
    try {
      const res = await getNinosByUsuarioRequest(id_usuario);
      setNinos(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los niños", "error");
    }
  };

  const fetchZonas = async () => {
    try {
      const res = await getZonasRequest(id_usuario);
      setZonas(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las zonas", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({
      id_nino: "",
      nombre_zona: "",
      latitud: null,
      longitud: null,
      radio_metros: "",
    });
    setEditingZona(null);
    setShowMap(false);
  };

  const buttonStyle = {
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": { backgroundColor: "#2a98c0dc", color: "white" },
  };

  const handleOpenForm = (zona = null) => {
    if (zona) {
      setEditingZona(zona);
      setForm({
        id_nino: zona.id_nino,
        nombre_zona: zona.nombre_zona,
        latitud: zona.latitud,
        longitud: zona.longitud,
        radio_metros: zona.radio_metros,
        estado: zona.estado ?? 1,
      });
      setMapCenter([zona.latitud, zona.longitud]);
      setShowMap(true);
    } else {
      resetForm();
    }
    setModalFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id_nino, nombre_zona, latitud, longitud, radio_metros } = form;

    if (!id_nino || !nombre_zona || !latitud || !longitud || !radio_metros) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text: "Todos los campos son obligatorios",
        backdrop: true,
      });
      return;
    }

    try {
      if (editingZona) {
        await updateZonaRequest(editingZona.id_zona, {
          ...form,
          id_usuario,
          estado: form.estado ?? 1,
        });
        Swal.fire({
          icon: "success",
          title: "Zona actualizada correctamente",
          timer: 1500,
          showConfirmButton: false,
          backdrop: true,
        });
      } else {
        await createZonaRequest({ ...form, id_usuario, estado: 1 });
        Swal.fire({
          icon: "success",
          title: "Zona agregada correctamente",
          timer: 1500,
          showConfirmButton: false,
          backdrop: true,
        });
      }

      setModalFormOpen(false);
      resetForm();
      fetchZonas();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar la zona", "error");
    }
  };

  const handleDelete = async (id_zona) => {
    const result = await Swal.fire({
      title: "¿Eliminar zona?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#126117c8",
      cancelButtonColor: "#c62828",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteZonaRequest(id_zona);
        Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "Zona eliminada correctamente",
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la zona",
          showConfirmButton: true,
        });
      }
    }
  };

  const handleOpenMap = (zona) => {
    setViewZona(zona);
    setModalMapOpen(true);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(coords);
          setForm({
            ...form,
            latitud: coords[0],
            longitud: coords[1],
          });
        },
        () => {
          console.warn("No se pudo obtener la ubicación, usando ubicación por defecto");
        }
      );
    }
  };

  const LocationSelector = () => {
    const map = useMap();

    useEffect(() => {
      map.setView(mapCenter);
    }, [mapCenter, map]);

    useMapEvents({
      click(e) {
        setForm({
          ...form,
          latitud: e.latlng.lat,
          longitud: e.latlng.lng,
        });
      },
    });

    return form.latitud && form.longitud ? (
      <Marker
        position={[form.latitud, form.longitud]}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            setForm({ ...form, latitud: lat, longitud: lng });
          },
        }}
      />
    ) : null;
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 1 }, maxWidth: 900, mx: "auto", position: "relative" }}>
      <Box
        sx={{
          position: { xs: "fixed", sm: "relative" },
          top: { xs: 68, sm: "auto" },
          left: { xs: 12, sm: "auto" },
          width: "100%",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", sm: "center" },
          bgcolor: "transparent",
          p: 0,
          boxShadow: 0,
        }}
      >
        <IconButton
          onClick={() => navigate("/principal")}
          sx={{
            position: "fixed",
            top: { xs: 68, sm: 30 },
            left: { xs: 12, sm: 280 },
            bgcolor: "white",
            boxShadow: 2,
            "&:hover": { bgcolor: "#f5f2f2c9" },
            zIndex: 1300,
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            ml: { xs: 0, sm: 1 },
            textAlign: "center",
            flexGrow: 1,
          }}
        >
          Zonas Seguras
        </Typography>
      </Box>

      <Box
        sx={{
          mt: { xs: 10, sm: 6 },
          mb: 2,
          display: "flex",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={buttonStyle}
        >
          Agregar Zona
        </Button>
      </Box>

      <Box sx={{ maxHeight: "58vh", overflowY: "auto", scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" }, }}>
        {zonas.map((zona) => (
          <Box
            key={zona.id_zona}
            sx={{
              p: 2,
              mb: 1,
              border: "1px solid #ccc",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#0000001b",
            }}
          >
            <Box>
              <Typography>
                <strong>{zona.nombre_zona}</strong> (
                {ninos.find((n) => n.id_nino === zona.id_nino)?.nombre})
              </Typography>
              <Typography>
                Lat: {zona.latitud}, Lon: {zona.longitud}, Radio: {zona.radio_metros} m
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Editar">
                <IconButton
                  color="primary"
                  onClick={() => handleOpenForm(zona)}
                  sx={{ "&:hover": { bgcolor: "#b0e6edcb" }, borderRadius: "20px" }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  color="error"
                  onClick={() => handleDelete(zona.id_zona)}
                  sx={{ "&:hover": { bgcolor: "#fc052a71" }, borderRadius: "20px" }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ver mapa">
                <IconButton
                  color="secondary"
                  onClick={() => handleOpenMap(zona)}
                  sx={{ "&:hover": { bgcolor: "#de53d77d" }, borderRadius: "20px" }}
                >
                  <MapIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>

      <Modal open={modalFormOpen} onClose={() => setModalFormOpen(false)}>
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
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          <Box
            sx={{
              width: { xs: "90%", sm: 500 },
              maxHeight: "85vh",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 4,
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              {editingZona ? "Editar Zona" : "Agregar Zona"}
            </Typography>

            <TextField
              select
              label="Niño/a"
              name="id_nino"
              value={form.id_nino}
              onChange={handleChange}
              fullWidth
              margin="normal"
            >
              {ninos.map((n) => (
                <MenuItem key={n.id_nino} value={n.id_nino}>
                  {n.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Nombre de la zona"
              name="nombre_zona"
              value={form.nombre_zona}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Radio (metros)"
              name="radio_metros"
              value={form.radio_metros}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="number"
            />

            <Button
              variant="outlined"
              sx={{ mt: 1, mb: 2 }}
              onClick={() => {
                getUserLocation();
                setShowMap(true);
              }}
              fullWidth
            >
              Seleccionar ubicación en mapa
            </Button>

            {showMap && (
              <Box sx={{ height: { xs: 250, sm: 300 }, mb: 2 }}>
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationSelector />
                  {form.latitud && (
                    <Circle
                      center={[form.latitud, form.longitud]}
                      radius={form.radio_metros || 0}
                      pathOptions={{ color: "blue", fillOpacity: 0.3 }}
                    />
                  )}
                </MapContainer>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: "auto" }}>
              <Button variant="contained" onClick={handleSubmit} sx={buttonStyle}>
                {editingZona ? "Guardar" : "Agregar Zona"}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setModalFormOpen(false)}
                sx={{
                  ...buttonStyle,
                  color: "#c62828",
                  borderColor: "#c62828",
                  "&:hover": { bgcolor: "#d32f2f", color: "#fff" },
                }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal open={modalMapOpen} onClose={() => setModalMapOpen(false)}>
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
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          <Box
            sx={{
              width: { xs: "95%", md: 600 },
              maxHeight: "95vh",
              overflowY: "auto",
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 2,
              boxShadow: 4,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ubicación de la zona
              </Typography>
              <IconButton onClick={() => setModalMapOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {viewZona && (
              <Box sx={{ height: { xs: 250, sm: 400 } }}>
                <MapContainer
                  center={[viewZona.latitud, viewZona.longitud]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                  dragging={true}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[viewZona.latitud, viewZona.longitud]} />
                  <Circle
                    center={[viewZona.latitud, viewZona.longitud]}
                    radius={viewZona.radio_metros}
                    pathOptions={{ color: "blue", fillOpacity: 0.3 }}
                  />
                </MapContainer>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Zonas;