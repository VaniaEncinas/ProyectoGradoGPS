import { Delete, Edit } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteUserRequest, updateUserRequest } from "../services/api";

function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    password: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const buttonStyle = { borderRadius: "12px", textTransform: "none", "&:hover": { opacity: 0.9 } };

  const handleEditOpen = () => {
    setFormData({
      nombre: user?.nombre || "",
      apellido: user?.apellido || "",
      telefono: user?.telefono || "",
      password: "",
    });
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    setOpenEdit(false);

    const result = await Swal.fire({
      title: '¿Deseas guardar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#126117c8',
      cancelButtonColor: '#c62828',
      backdrop: true
    });

    if (result.isConfirmed) {
      try {
        const res = await updateUserRequest(formData);
        if (res.data && res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
        }

        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado correctamente',
          timer: 1500,
          showConfirmButton: false,
          backdrop: true
        });
      } catch (err) {
        console.error("Error al actualizar usuario:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar usuario',
          text: err.response?.data?.message || 'Inténtalo nuevamente',
          backdrop: true
        });
      }
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Está seguro de eliminar su usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#126117c8',
      cancelButtonColor: '#c62828',
      backdrop: true
    });

    if (result.isConfirmed) {
      try {
        await deleteUserRequest();
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado correctamente',
          timer: 1500,
          showConfirmButton: false,
          backdrop: true
        }).then(() => navigate("/login"));
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar usuario',
          text: err.response?.data?.message || 'Inténtalo nuevamente',
          backdrop: true
        });
      }
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ p: { xs: 2, sm: 8 }, maxWidth: "90%", mx: "auto", position: "relative", }}>
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

      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mt: { xs: 6, sm: 0 },
        }}
      >
        Perfil de Usuario
      </Typography>

      {/* Tarjeta de perfil */}
      <Box sx={{
        p: 5,
        mt: 4,
        background: "linear-gradient(135deg, #b9b9eef1 10%, #fefdfee3 50%, #b9b9eee2 100%)",
        borderRadius: 3,
        boxShadow: 3,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        gap: 5
      }}>
        <Avatar sx={{ width: 100, height: 100, bgcolor: "#00050ad1", fontSize: 36 }}>
          {user.nombre?.[0]?.toUpperCase() || "U"}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>{user.nombre} {user.apellido}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1"><strong>Teléfono:</strong> {user.telefono}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button variant="contained" color="primary" startIcon={<Edit />} onClick={handleEditOpen} sx={buttonStyle}>
          Editar
        </Button>
        <Button variant="contained" color="error" startIcon={<Delete />} onClick={handleDelete} sx={buttonStyle}>
          Eliminar
        </Button>
      </Box>

      {/* Modal Editar */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="sm"
        BackdropProps={{ sx: { backdropFilter: "blur(6px)" } }}
        PaperProps={{ sx: {background: "radial-gradient(circle, #fefdfef8 0%, #e0e8f7b7 100%)"} }}
      >
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Nombre" fullWidth value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
          <TextField label="Apellido" fullWidth value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} />
          <TextField label="Teléfono" fullWidth value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
          <TextField label="Nueva contraseña" type="password" fullWidth value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}>
          <Button variant="outlined" onClick={() => setOpenEdit(false)} sx={{ ...buttonStyle, color: "#c62828", borderColor: "#c62828", "&:hover": {bgcolor: "#d32f2f",color: "#fff"},}}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={handleEditSave} sx={{ ...buttonStyle, "&:hover": {bgcolor: "#1f52faff"}}}>Guardar</Button>
        </Box>
      </Dialog>
    </Box>
  );
}

export default Perfil;
