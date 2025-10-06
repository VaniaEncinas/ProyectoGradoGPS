import { Delete, Edit } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUserRequest, updateUserRequest } from "../services/api"; // 👈 tus funciones API

function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    password: "",
  });

  // cargar usuario al montar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // abrir modal edición
  const handleEditOpen = () => {
    setFormData({
      nombre: user?.nombre || "",
      apellido: user?.apellido || "",
      telefono: user?.telefono || "",
      password: "",
    });
    setOpenEdit(true);
  };

  // guardar cambios
  const handleEditSave = async () => {
    try {
      const res = await updateUserRequest(formData);
      if (res.data && res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      setOpenEdit(false);
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
    }
  };

  // eliminar usuario
  const handleDelete = async () => {
    try {
      await deleteUserRequest();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900, mx: "auto", position: "relative" }}>
      <IconButton
        onClick={() => navigate("/principal")}
        sx={{ position: "absolute", top: 0, left: -30, bgcolor: "white", boxShadow: 2, "&:hover": { bgcolor: "#f0f0f0" } }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Perfil de Usuario
      </Typography>

      <Typography variant="body1">Nombre: {user.nombre}</Typography>
      <Typography variant="body1">Apellido: {user.apellido}</Typography>
      <Typography variant="body1">Teléfono: {user.telefono}</Typography>
      <Typography variant="body1">Email: {user.email}</Typography>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Edit />}
          onClick={handleEditOpen}
          sx={{ mr: 2 }}
        >
          Editar
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<Delete />}
          onClick={() => setOpenDelete(true)}
        >
          Eliminar
        </Button>
      </Box>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            fullWidth
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Apellido"
            fullWidth
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Teléfono"
            fullWidth
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Nueva contraseña"
            type="password"
            fullWidth
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button onClick={handleEditSave} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>¿Está seguro de eliminar su usuario?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>No</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Perfil;
