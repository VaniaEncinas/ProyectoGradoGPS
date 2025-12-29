import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  deletePulseraRequest,
  getPulserasByUsuarioRequest,
  registerPulseraRequest,
  updatePulseraRequest,
} from "../services/api";

function Pulsera() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [user, setUser] = useState(null);
  const [pulseras, setPulseras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [editingPulsera, setEditingPulsera] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      getPulserasByUsuarioRequest(parsedUser.id)
        .then((res) => setPulseras(Array.isArray(res.data) ? res.data : []))
        .catch((err) => console.error("Error cargando pulseras:", err));
    }
  }, []);

  const handleCancelarForm = () => {
    setShowForm(false);
    setEditingPulsera(null);
    setNombre("");
  };

  const handleAgregarPulsera = async (e) => {
    e.preventDefault();
    if (!nombre) {
      Swal.fire({
        icon: "warning",
        title: "Campo obligatorio",
        text: "El nombre de la pulsera es requerido.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      if (editingPulsera) {
        const { data } = await updatePulseraRequest(editingPulsera.id_pulsera, { nombre });
        setPulseras(
          Array.isArray(pulseras)
          ? pulseras.map((p) =>
            p.id_pulsera === editingPulsera.id_pulsera ? { ...p, nombre: data.nombre } : p
          )
          : []
        );

        Swal.fire({
          icon: "success",
          title: "Pulsera actualizada correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const { data } = await registerPulseraRequest({ nombre, id_usuario: user.id });
        setPulseras([{ id_pulsera: data.id_pulsera, nombre: data.nombre }, ...pulseras]);

        Swal.fire({
          icon: "success",
          title: "Pulsera registrada correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      handleCancelarForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Error al guardar la pulsera";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonColor: "#c62828",
      });
    }
  };

  const handleEliminarPulsera = async (id_pulsera) => {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción eliminará la pulsera permanentemente.",
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
        await deletePulseraRequest(id_pulsera);
        setPulseras(pulseras.filter((p) => p.id_pulsera !== id_pulsera));

        Swal.fire({
          icon: "success",
          title: "Pulsera eliminada correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la pulsera.",
          confirmButtonColor: "#c62828",
        });
      }
    }
  };

  const handleEditarPulsera = (pulsera) => {
    setEditingPulsera(pulsera);
    setNombre(pulsera.nombre);
    setShowForm(true);
  };

  const pulserasFiltradas = Array.isArray(pulseras)
  ? pulseras.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )
  : [];

  if (!user) return null;

  const buttonStyle = {
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": { backgroundColor: "#2a98c0dc", color: "white" },
  };

  return (
    <Box sx={{ display: "flex", p: { xs: 0, sm: 0 },
        maxWidth: "100%",
        position: "relative", }}>
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          maxWidth: 900,
          mx: "auto",
          position: "relative",
          minWidth: 0,
          ml: { xs: 0, sm: "0px" }, 
        }}
      >
        <IconButton
          onClick={() => navigate("/principal")}
          sx={{
            position: "fixed",
            bgcolor: "white",
            boxShadow: 2,
            "&:hover": { bgcolor: "#f5f2f2c9" },
            zIndex: 3,
            top: { xs: 68, sm: 30 },
            left: { xs: 12, sm: 280 },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ filter: showForm ? "blur(4px)" : "none", transition: "0.3s", width: { xs: "100%", sm: "100%" } }}> 
          <Box // Título y botón
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              mb: 3,
              mt: { xs: 1, sm: 2.5 },
              gap: { xs: 1.5, sm: 0 },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                textAlign: { xs: "center", sm: "left" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Pulseras
            </Typography>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{
                ...buttonStyle,
                alignSelf: { xs: "left", sm: "auto" },
                width: { xs: "100%", sm: "auto" },
                maxWidth: { xs: 180, sm: "none" },
              }}
            >
              Registrar Pulsera
            </Button>
          </Box>

          <TextField // buscador
            placeholder="Buscar pulsera"
            variant="outlined"
            fullWidth
            margin="normal"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { xs: 350, sm: "100%" },
              mt: { xs: 0, sm: 0 },
              mx: { xs: "auto", sm: 0 },
            }}
          />

          <TableContainer //tabla
            component={Paper}
            sx={{
              boxShadow: 3,
              borderRadius: 3,
              width: "100%",
              maxWidth: "100%",
              mx: "auto",
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "55vh",
              "&::-webkit-scrollbar": { width: "8px", height: "8px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "transparent",
                borderRadius: "8px",
                transition: "background-color 0.3s ease",
              },
              "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
              "&:hover::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0, 0, 0, 0.4)",
              },
              "&:hover::-webkit-scrollbar-track": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              },
              scrollbarWidth: "thin",
              "&:not(:hover)": { scrollbarColor: "transparent transparent" },
              "&:hover": {
                scrollbarColor:
                  "rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Table
              sx={{
                minWidth: { xs: "0.75rem", sm: "50rem" },
                "& td, & th": {
                  fontSize: { xs: "0.75rem", sm: "1rem" },
                  whiteSpace: "nowrap",
                  flex: 1,
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: "#7886f35f" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pulserasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No hay pulseras registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  pulserasFiltradas.map((pulsera) => (
                    <TableRow key={pulsera.id_pulsera}>
                      <TableCell>{pulsera.nombre}</TableCell>
                      <TableCell>
                        {pulsera.id_nino ? "Asignada" : "Disponible"}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Editar">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditarPulsera(pulsera)}
                            sx={{
                              "&:hover": { bgcolor: "#a3f0faff" },
                              borderRadius: "20px",
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleEliminarPulsera(pulsera.id_pulsera)
                            }
                            sx={{
                              "&:hover": { bgcolor: "#fc052a71" },
                              borderRadius: "20px",
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {showForm && ( //formulario
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
            <Paper
              sx={{
                width: "clamp(320px, 92vw, 500px)",
                maxWidth: "95vw",
                boxSizing: "border-box",
                p: { xs: 2, sm: 4 },
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                position: "relative",
                background:
                  "radial-gradient(circle, rgba(254,253,254,0.96) 0%, rgba(224,232,247,0.86) 100%)",
                backdropFilter: "blur(8px)",
                overflowY: "auto",
                maxHeight: "90vh",
                mx: "auto",
              }}
            >
              <IconButton
                onClick={handleCancelarForm}
                sx={{ position: "absolute", top: 10, right: 10, color: "#000" }}
              >
                <CloseIcon />
              </IconButton>

              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  textAlign: "center",
                }}
              >
                {editingPulsera ? "Editar Pulsera" : "Registrar Pulsera"}
              </Typography>

              <Box
                component="form"
                onSubmit={handleAgregarPulsera}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  fullWidth
                  InputProps={{
                    sx: { fontSize: { xs: "0.9rem", sm: "1rem" } },
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelarForm}
                    sx={{
                      ...buttonStyle,
                      color: "#c62828",
                      borderColor: "#c62828",
                      "&:hover": { bgcolor: "#d32f2f", color: "#fff" },
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{
                      ...buttonStyle,
                      "&:hover": { bgcolor: "#1f52faff" },
                    }}
                  >
                    Guardar
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Pulsera;
