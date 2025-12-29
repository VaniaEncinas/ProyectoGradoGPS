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
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  deleteNinoRequest,
  getNinosByUsuarioRequest,
  getPulserasByUsuarioRequest,
  registerNinoRequest,
  updateNinoRequest
} from "../services/api";

function Ninos() {
  const [user, setUser] = useState(null);
  const [ninos, setNinos] = useState([]);
  const [pulseras, setPulseras] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [pulseraId, setPulseraId] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [editingNino, setEditingNino] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    getNinosByUsuarioRequest(parsedUser.id)
      .then((res) => setNinos(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));

    getPulserasByUsuarioRequest(parsedUser.id)
      .then((res) => setPulseras(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  }, []);

  const handleCancelarForm = () => {
    setShowForm(false);
    setEditingNino(null);
    setNombre("");
    setFechaNacimiento("");
    setPulseraId("");
  };

  const handleAgregarNino = async (e) => {
    e.preventDefault();

    if (!nombre || !fechaNacimiento || !pulseraId) {
      Swal.fire({
        icon: "warning",
        title: "Todos los campos son obligatorios",
        confirmButtonColor: "#0d2648ff",
      });
      return;
    }

    if (editingNino) {
      setShowForm(false); 
      const result = await Swal.fire({
        title: "¿Deseas guardar los cambios?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No",
        confirmButtonColor: "#126117c8",
        cancelButtonColor: "#c62828",
        backdrop: true,
      });

      if (!result.isConfirmed) return;

      try {
        const { data } = await updateNinoRequest(editingNino.id_nino, {
          nombre,
          fecha_nacimiento: fechaNacimiento,
          id_pulsera: pulseraId,
        });

        const pulseraAsignada = pulseras.find(
          (p) => p.id_pulsera === parseInt(pulseraId)
        );

        setNinos(
          ninos.map((n) =>
            n.id_nino === editingNino.id_nino
              ? { ...data.nino, pulsera: pulseraAsignada }
              : n
          )
        );

        setPulseras(
          pulseras.map((p) => {
            if (p.id_pulsera === editingNino.pulsera?.id_pulsera)
              return { ...p, id_nino: null };
            if (p.id_pulsera === parseInt(pulseraId))
              return { ...p, id_nino: editingNino.id_nino };
            return p;
          })
        );

        Swal.fire({
          icon: "success",
          title: "Los cambios se guardaron correctamente",
          timer: 1500,
          showConfirmButton: false,
          backdrop: true,
        });

        handleCancelarForm();
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error al actualizar niño",
          text: err.response?.data?.message || "Inténtalo nuevamente",
          backdrop: true,
        });
      }
      return;
    }

    // Registrar nuevo niño
    try {
      const { data } = await registerNinoRequest({
        id_usuario: user.id,
        nombre,
        fecha_nacimiento: fechaNacimiento,
        id_pulsera: pulseraId,
      });

      const pulseraAsignada = Array.isArray(pulseras)
  ? pulseras.find((p) => p.id_pulsera === parseInt(pulseraId))
  : undefined;
      setNinos([
        ...ninos,
        {
          id_nino: data.id_nino,
          nombre,
          fecha_nacimiento: fechaNacimiento,
          pulsera: pulseraAsignada,
        },
      ]);

      setPulseras(
        pulseras.map((p) =>
          p.id_pulsera === parseInt(pulseraId)
            ? { ...p, id_nino: data.id_nino }
            : p
        )
      );

      handleCancelarForm();

      Swal.fire({
        icon: "success",
        title: "Niño/a registrado correctamente",
        timer: 1500,
        showConfirmButton: false,
        backdrop: true,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error registrando niño",
        text: err.response?.data?.message || "Inténtalo nuevamente",
        backdrop: true,
      });
    }
  };

  // Eliminar Niño
  const handleEliminarNino = async (id_nino) => {
    const result = await Swal.fire({
      title: "¿Está seguro de eliminar este niño?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      confirmButtonColor: "#126117c8",
      cancelButtonColor: "#c62828",
      backdrop: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteNinoRequest(id_nino);
      setNinos(ninos.filter((n) => n.id_nino !== id_nino));
      setPulseras(
        pulseras.map((p) =>
          p.id_nino === id_nino ? { ...p, id_nino: null } : p
        )
      );

      Swal.fire({
        icon: "success",
        title: "El niño/a fue eliminado correctamente",
        timer: 1500,
        showConfirmButton: false,
        backdrop: true,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error eliminando niño",
        text: err.response?.data?.message || "Inténtalo nuevamente",
        backdrop: true,
      });
    }
  };

  const handleEditarNino = (nino) => {
    setEditingNino(nino);
    setNombre(nino.nombre);
    setFechaNacimiento(nino.fecha_nacimiento);
    setPulseraId(nino.pulsera?.id_pulsera || "");
    setShowForm(true);
  };

  const ninosFiltrados = Array.isArray(ninos)
  ? ninos.filter((nino) =>
    nino.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )
: [];

  const pulserasLibres = Array.isArray(pulseras)
  ? pulseras.filter(
    (p) => !p.id_nino || (editingNino && p.id_nino === editingNino.id_nino)
  )
: [];

  if (!user) return null;

  const buttonStyle = {
    borderRadius: "12px",
    textTransform: "none",
    fontSize: { xs: "0.75rem", sm: "0.875rem" },
    padding: { xs: "4px 10px", sm: "6px 16px" },
    "&:hover": { backgroundColor: "#2a98c0dc", color: "white" },
  };

  return (
    <Box
      sx={{
        display: "flex",
        p: { xs: 0, sm: 0 },
        maxWidth: "100%",
        position: "relative",
        ml: { xs: 0, sm: "30px" }, 
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
        <ArrowBackIcon fontSize="medium" />
      </IconButton>

      <Box sx={{ width: { xs: "100%", sm: "95%" }, mx: "auto" }}>
        <Box sx={{ filter: showForm ? "blur(4px)" : "none", transition: "0.3s" }}>
          <Box // Título y botón
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              mb: 3,
              mt: { xs: 1, sm: 6 },
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
              Niños
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={buttonStyle}
            >
              Registrar Niño/a
            </Button>
          </Box>

          <TextField
            placeholder="Buscar niño/a"
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
          />

          <TableContainer
            component={Paper}
            sx={{
              boxShadow: 3,
              borderRadius: 3,
              width: "100%",
              maxWidth: "900px",
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
            <Table sx={{
                minWidth: { xs: "0.75rem", sm: "50rem" },
                "& td, & th": {
                  fontSize: { xs: "0.75rem", sm: "0.9rem" },
                  whiteSpace: "nowrap",
                  flex: 1,
                },
              }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#7886f35f" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Fecha de Nacimiento</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Pulsera</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ninosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No hay niños registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  ninosFiltrados.map((nino) => (
                    <TableRow key={nino.id_nino}>
                      <TableCell>{nino.nombre}</TableCell>
                      <TableCell>{nino.fecha_nacimiento}</TableCell>
                      <TableCell>{nino.pulsera?.nombre || "No asignada"}</TableCell>
                      <TableCell>
                        <Tooltip title="Editar">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditarNino(nino)}
                            sx={{
                              "&:hover": { bgcolor: "#a3f0faff" },
                              borderRadius: "20px",
                              p: { xs: 0.5, sm: 1 },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleEliminarNino(nino.id_nino)}
                            sx={{
                              "&:hover": { bgcolor: "#fc052a71" },
                              borderRadius: "20px",
                              p: { xs: 0.5, sm: 1 },
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
      </Box>

      {showForm && (
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
        background: "radial-gradient(circle, rgba(254,253,254,0.96) 0%, rgba(224,232,247,0.86) 100%)",
        backdropFilter: "blur(8px)",
        overflowY: "auto",
        maxHeight: "90vh",
        mx: "auto", 
      }}
    >
      <IconButton
        onClick={handleCancelarForm}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          color: "#000",
        }}
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
        {editingNino ? "Editar Niño/a" : "Registrar Niño/a"}
      </Typography>

      <Box
        component="form"
        onSubmit={handleAgregarNino}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          fullWidth
          InputProps={{ sx: { fontSize: { xs: "0.9rem", sm: "1rem" } } }}
        />
        <TextField
          label="Fecha de Nacimiento"
          type="date"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
          fullWidth
          InputProps={{ sx: { fontSize: { xs: "0.9rem", sm: "1rem" } } }}
        />
        <Select value={pulseraId} onChange={(e) => setPulseraId(e.target.value)} displayEmpty required>
          <MenuItem value="" disabled>Seleccione una pulsera</MenuItem>
          {pulserasLibres.map((p) => (
            <MenuItem key={p.id_pulsera} value={p.id_pulsera}>{p.nombre}</MenuItem>
          ))}
        </Select>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={handleCancelarForm} sx={{ ...buttonStyle, color: "#c62828", borderColor: "#c62828", "&:hover": { bgcolor: "#d32f2f", color: "#fff" } }}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ ...buttonStyle, "&:hover": { bgcolor: "#1f52faff" } }}>
            Guardar
          </Button>
        </Box>
      </Box>
    </Paper>
  </Box>
)}
</Box>
);
}

export default Ninos;
