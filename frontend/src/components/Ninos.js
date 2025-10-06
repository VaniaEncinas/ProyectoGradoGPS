import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
import {
  deleteNinoRequest,
  getNinosByUsuarioRequest,
  getPulserasRequest,
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

  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: "", ninoId: null });
  const [successDialog, setSuccessDialog] = useState({ open: false, message: "" });

  const navigate = useNavigate();

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Traer niños de ese usuario
      getNinosByUsuarioRequest(parsedUser.id)
        .then((res) => setNinos(res.data))
        .catch((err) => console.error(err));

      // Traer pulseras
      getPulserasRequest()
        .then((res) => setPulseras(res.data))
        .catch((err) => console.error(err));
    }
  }, []);

  // 🔹 Cerrar mensaje de éxito automáticamente
  useEffect(() => {
    if (successDialog.open) {
      const timer = setTimeout(() => {
        setSuccessDialog((prev) => ({ ...prev, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successDialog.open]);

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
      alert("Todos los campos son obligatorios");
      return;
    }

    if (editingNino) {
      setConfirmDialog({ open: true, type: "edit", ninoId: editingNino.id_nino });
    } else {
      try {
        const { data } = await registerNinoRequest({
          id_usuario: user.id,
          nombre,
          fecha_nacimiento: fechaNacimiento,
          id_pulsera: pulseraId,
        });

        const pulseraAsignada = pulseras.find((p) => p.id_pulsera === parseInt(pulseraId));

        setNinos([
          ...ninos,
          {
            id_nino: data.id_nino,
            nombre,
            fecha_nacimiento: fechaNacimiento,
            pulsera: pulseraAsignada || { nombre: "" },
          }
        ]);

        handleCancelarForm();
        setSuccessDialog({ open: true, message: "Niño/a registrado correctamente" });

        // Actualizar la lista de pulseras para que la recién asignada ya no aparezca
        setPulseras(pulseras.map(p => p.id_pulsera === parseInt(pulseraId) ? { ...p, id_nino: data.id_nino } : p));
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Error registrando niño");
      }
    }
  };

  const handleConfirmEdit = async () => {
    try {
      const { data } = await updateNinoRequest(editingNino.id_nino, {
        nombre,
        fecha_nacimiento: fechaNacimiento,
        id_pulsera: pulseraId,
      });

      const pulseraAsignada = pulseras.find((p) => p.id_pulsera === parseInt(pulseraId));

      setNinos(ninos.map((n) =>
        n.id_nino === editingNino.id_nino
          ? { ...data.nino, pulsera: pulseraAsignada || { nombre: "" } }
          : n
      ));

      handleCancelarForm();
      setConfirmDialog({ open: false, type: "", ninoId: null });
      setSuccessDialog({ open: true, message: "Los cambios se guardaron correctamente" });

      // Actualizar lista de pulseras (liberar la anterior y asignar la nueva)
      setPulseras(pulseras.map(p => {
        if (p.id_pulsera === editingNino.pulsera?.id_pulsera) return { ...p, id_nino: null };
        if (p.id_pulsera === parseInt(pulseraId)) return { ...p, id_nino: editingNino.id_nino };
        return p;
      }));

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error actualizando niño");
    }
  };

  const handleEliminarNino = (id_nino) => {
    setConfirmDialog({ open: true, type: "delete", ninoId: id_nino });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteNinoRequest(confirmDialog.ninoId);
      setNinos(ninos.filter((n) => n.id_nino !== confirmDialog.ninoId));
      setConfirmDialog({ open: false, type: "", ninoId: null });
      setSuccessDialog({ open: true, message: "El niño/a fue eliminado correctamente" });

      // Liberar pulsera
      setPulseras(pulseras.map(p => p.id_nino === confirmDialog.ninoId ? { ...p, id_nino: null } : p));
    } catch (err) {
      console.error(err);
      alert("Error eliminando niño");
    }
  };

  const handleEditarNino = (nino) => {
    setEditingNino(nino);
    setNombre(nino.nombre);
    setFechaNacimiento(nino.fecha_nacimiento);
    setPulseraId(nino.pulsera?.id_pulsera || "");
    setShowForm(true);
  };

  const ninosFiltrados = ninos.filter((nino) =>
    nino.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!user) return null;

  const buttonStyle = {
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": { backgroundColor: "#2a98c0dc", color: "white" },
  };

  const textButtonStyle = {
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": { backgroundColor: "#c24345a1" },
  };

  const pulserasLibres = pulseras.filter(
    p => p.id_nino == null || (editingNino && p.id_nino === editingNino.id_nino)
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900, mx: "auto", position: "relative" }}>
      <IconButton
        onClick={() => navigate("/principal")}
        sx={{ position: "absolute", top: 0, left: -30, bgcolor: "white", boxShadow: 2, "&:hover": { bgcolor: "#f5f2f2c9" } }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ filter: showForm ? "blur(4px)" : "none", transition: "0.3s" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, mt: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>Niños</Typography>
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
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        />

        <TableContainer component={Paper} sx={{ boxShadow: 3, mt: 2 }}>
          <Table sx={{ minWidth: 400 }} aria-label="tabla de niños">
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
                  <TableCell colSpan={4} align="center">No hay niños registrados.</TableCell>
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
                          sx={{ "&:hover": { bgcolor: "#a3f0faff" }, borderRadius: "12px" }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleEliminarNino(nino.id_nino)}
                          sx={{ "&:hover": { bgcolor: "#780b1b7d" }, borderRadius: "12px" }}
                        >
                          <DeleteIcon />
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

      {/* Formulario */}
      {showForm && (
        <Box sx={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", bgcolor: "rgba(3, 3, 23, 0.56)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 20, p: 2 }}>
          <Paper sx={{ width: { xs: "100%", sm: 500 }, p: 4, borderRadius: 3, boxShadow: 6, position: "relative" }}>
            <IconButton onClick={handleCancelarForm} sx={{ position: "absolute", top: 10, right: 10 }}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              {editingNino ? "Editar Niño/a" : "Registrar Niño/a"}
            </Typography>
            <Box component="form" onSubmit={handleAgregarNino} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required fullWidth />
              <TextField label="Fecha de Nacimiento" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required InputLabelProps={{ shrink: true }} fullWidth />

              <Select
                value={pulseraId}
                onChange={(e) => setPulseraId(e.target.value)}
                displayEmpty
                required
              >
                <MenuItem value="" disabled>Seleccione una pulsera</MenuItem>
                {pulserasLibres.map((p) => (
                  <MenuItem key={p.id_pulsera} value={p.id_pulsera}>
                    {p.nombre} {p.id_nino && p.id_nino !== editingNino?.id_nino ? "(Asignada)" : ""}
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="text"
                  onClick={handleCancelarForm}
                  sx={textButtonStyle}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={buttonStyle}
                >
                  Guardar
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogContent>
          {confirmDialog.type === "edit" && "¿Está seguro de guardar los cambios?"}
          {confirmDialog.type === "delete" && "¿Está seguro de eliminar este niño/a?"}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            variant="text"
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            sx={textButtonStyle}
          >
            No
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (confirmDialog.type === "edit") handleConfirmEdit();
              else if (confirmDialog.type === "delete") handleConfirmDelete();
            }}
            sx={buttonStyle}
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog.open} onClose={() => setSuccessDialog({ ...successDialog, open: false })}>
        <DialogContent>{successDialog.message}</DialogContent>
      </Dialog>
    </Box>
  );
}

export default Ninos;
