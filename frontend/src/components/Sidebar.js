import GroupIcon from "@mui/icons-material/Group";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import WatchIcon from "@mui/icons-material/Watch";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";

const menuItems = [
  { text: "Perfil", icon: <PersonIcon />, path: "/principal/perfil" },
  { text: "Niños", icon: <GroupIcon />, path: "/principal/ninos" },
  { text: "Pulseras", icon: <WatchIcon />, path: "/principal/pulsera" },
  { text: "Ubicaciones", icon: <LocationOnIcon />, path: "/principal/ubicaciones" },
  { text: "Zonas Seguras", icon: <MapIcon />, path: "/principal/zonas" },
  { text: "Alertas", icon: <NotificationsIcon />, path: "/principal/alertas" },
];

const Sidebar = ({ onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box
      sx={{
        width: 220,
        background: "linear-gradient(90deg, #cabfdeff 0%, #ebe5f5ff 50%, #cabfdeff 100%)",
        display: "flex",
        flexDirection: "column",
        p: 2,
        height: "100vh", 
        overflow: "hidden",
      }}
    >
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                my: 0.5,
                borderRadius: 3,
                color: "black",
                bgcolor:
                  index % 2 === 0
                    ? "rgba(33, 67, 117, 0.35)"
                    : "rgba(34, 207, 223, 0.32)",
                "&.active": {
                  bgcolor: "linear-gradient(90deg,#42a5f5,#1e88e5)",
                  color: "white",
                },
                "&:hover": {
                  bgcolor: "rgba(244, 246, 237, 0.39)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        sx={{
          mt: "auto",
          py: 1.2,
          borderRadius: 3,
          fontWeight: "bold",
          boxShadow: 3,
          bgcolor: "#0d2648ff",
          "&:hover": { bgcolor: "#0e0e0ede" },
        }}
        onClick={() => {
          Swal.fire({
          title: "¿Está seguro de cerrar sesión?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí",
          cancelButtonText: "No",
          confirmButtonColor: '#126117c8',
          cancelButtonColor: '#c62828',
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
          onLogout();
        }
      });
    }}
      >
        Cerrar sesión
      </Button>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "flex", sm: "none" },
          background:
            "linear-gradient(90deg, #efe8faff 0%, #c7b8e0 50%, #efe8faff 100%)",
          boxShadow: 1,
        }}
      >
        <Toolbar variant="dense">
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon sx={{ color: "black" }} />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{ color: "black", fontWeight: "bold" }}
          >
            Menú
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
            height: "93vh",
            overflow: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          width: 250,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          overflow: "hidden",
          boxShadow: 3,
          zIndex: 100,
        }}
      >
        {drawerContent}
      </Box>
    </>
  );
};

export default Sidebar;
