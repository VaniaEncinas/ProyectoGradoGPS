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
  Paper,
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
  deletePulseraRequest,
  getPulserasRequest,
  registerPulseraRequest,
  updatePulseraRequest,
} from "../services/api";

function Pulsera() {
    const navigate = useNavigate();

    const [pulseras, setPulseras] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [nombre, setNombre] = useState("");
    const [editingPulsera, setEditingPulsera] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        type: "",
        pulseraId: null,
    });
    const [successDialog, setSuccessDialog] = useState({
        open: false,
        message: "",
    });

    // Cargar pulseras
    useEffect(() => {
        getPulserasRequest()
            .then((res) => setPulseras(res.data))
            .catch((err) => console.error("Error cargando pulseras:", err));
    }, []);

    // Cerrar mensaje automático
    useEffect(() => {
        if (successDialog.open) {
            const timer = setTimeout(() => {
                setSuccessDialog({ ...successDialog, open: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successDialog.open]);

    const handleCancelarForm = () => {
        setShowForm(false);
        setEditingPulsera(null);
        setNombre("");
    };

    const handleAgregarPulsera = async (e) => {
        e.preventDefault();
        if (!nombre) {
            alert("El nombre es obligatorio");
            return;
        }

        try {
            if (editingPulsera) {
                const { data } = await updatePulseraRequest(editingPulsera.id_pulsera, { nombre });
                setPulseras(
                    pulseras.map((p) =>
                        p.id_pulsera === editingPulsera.id_pulsera ? { ...p, nombre: data.nombre } : p
                    )
                );
                setSuccessDialog({ open: true, message: "Cambios guardados correctamente" });
            } else {
                const { data } = await registerPulseraRequest({ nombre });
                setPulseras([{ id_pulsera: data.id_pulsera, nombre: data.nombre }, ...pulseras]);
                setSuccessDialog({ open: true, message: "Pulsera registrada correctamente" });
            }

            handleCancelarForm();
        } catch (err) {
            const msg = err.response?.data?.message || "Error al guardar la pulsera";
            setSuccessDialog({ open: true, message: msg });
        }
    };

    const handleEliminarPulsera = (id_pulsera) => {
        setConfirmDialog({ open: true, type: "delete", pulseraId: id_pulsera });
    };

    const handleConfirmDelete = async () => {
        try {
            await deletePulseraRequest(confirmDialog.pulseraId);
            setPulseras(pulseras.filter((p) => p.id_pulsera !== confirmDialog.pulseraId));
            setConfirmDialog({ open: false, type: "", pulseraId: null });
            setSuccessDialog({ open: true, message: "Pulsera eliminada correctamente" });
        } catch (err) {
            console.error(err);
            alert("Error al eliminar la pulsera");
        }
    };

    const handleEditarPulsera = (pulsera) => {
        setEditingPulsera(pulsera);
        setNombre(pulsera.nombre);
        setShowForm(true);
    };

    const pulserasFiltradas = pulseras.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

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

    return (
        <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900, mx: "auto", position: "relative" }}>
            <IconButton
                onClick={() => navigate("/principal")}
                sx={{
                    position: "absolute",
                    top: 0,
                    left: -30,
                    bgcolor: "white",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "#f5f2f2c9" },
                }}
            >
                <ArrowBackIcon />
            </IconButton>

            <Box sx={{ filter: showForm || confirmDialog.open ? "blur(4px)" : "none", transition: "0.3s" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, mt: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        Pulseras
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setShowForm(true)}
                        sx={buttonStyle}
                    >
                        Registrar Pulsera
                    </Button>
                </Box>

                <TextField
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
                />

                <TableContainer component={Paper} sx={{ boxShadow: 3, mt: 2 }}>
                    <Table sx={{ minWidth: 400 }} aria-label="tabla de pulseras">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#7886f35f" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pulseras.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No hay pulseras registradas.
                                    </TableCell>
                                </TableRow>
                            ) : pulserasFiltradas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No se encontraron pulseras.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pulserasFiltradas.map((pulsera) => (
                                    <TableRow key={pulsera.id_pulsera}>
                                        <TableCell>{pulsera.nombre}</TableCell>
                                        <TableCell>{pulsera.id_nino ? "Asignada" : "Disponible"}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditarPulsera(pulsera)}
                                                    sx={{ "&:hover": { bgcolor: "#a3f0faff" }, borderRadius: "12px" }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleEliminarPulsera(pulsera.id_pulsera)}
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

            {showForm && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        bgcolor: "rgba(3, 3, 23, 0.56)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 20,
                        p: 2,
                    }}
                >
                    <Paper
                        sx={{
                            width: { xs: "100%", sm: 400 },
                            p: 4,
                            borderRadius: 3,
                            boxShadow: 6,
                            position: "relative",
                        }}
                    >
                        <IconButton onClick={handleCancelarForm} sx={{ position: "absolute", top: 10, right: 10 }}>
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                            {editingPulsera ? "Editar Pulsera" : "Registrar Pulsera"}
                        </Typography>

                        <Box component="form" onSubmit={handleAgregarPulsera} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                fullWidth
                            />

                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                                <Button variant="text" onClick={handleCancelarForm} sx={textButtonStyle}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="contained" color="primary" sx={buttonStyle}>
                                    Guardar
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            )}

            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
                <DialogContent>
                    {confirmDialog.type === "delete" && "¿Está seguro de eliminar esta pulsera?"}
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
                        onClick={handleConfirmDelete}
                        sx={buttonStyle}
                    >
                        Sí
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={successDialog.open}
                onClose={() => setSuccessDialog({ ...successDialog, open: false })}
            >
                <DialogContent>{successDialog.message}</DialogContent>
            </Dialog>
        </Box>
    );
}

export default Pulsera;
