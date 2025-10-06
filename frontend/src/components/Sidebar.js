import GroupIcon from "@mui/icons-material/Group";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import WatchIcon from '@mui/icons-material/Watch';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";

const menuItems = [
  { text: "Perfil", icon: <PersonIcon />, path: "/principal/perfil" },
  { text: "Niños", icon: <GroupIcon />, path: "/principal/ninos" },
  { text: "Pulsera", icon: <WatchIcon />, path: "/principal/pulsera" },
  { text: "Ubicaciones", icon: <LocationOnIcon />, path: "/principal/ubicaciones" },
  { text: "Zonas Seguras", icon: <MapIcon />, path: "/principal/zonas" },
  { text: "Alertas", icon: <NotificationsIcon />, path: "/principal/alertas" },
];

const Sidebar = ({ onLogout }) => (
  <Box
    sx={{
      width: { xs: "100%", sm: 220 },
      background: "linear-gradient(135deg, #3a6c83b7 0%, #95a0b5ff 100%)",
      display: "flex",
      flexDirection: "column",
      p: 2,
      minHeight: "80vh",
    }}
  >
    <List sx={{ flexGrow: 1 }}>
      {menuItems.map((item, index) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            component={NavLink}
            to={item.path}
            sx={{
              my: 0.5,
              borderRadius: 2,
              color: "black",
              bgcolor: index % 2 === 0 ? "rgba(26, 68, 131, 0.67)" : "rgba(49, 143, 151, 0.68)",
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
      color="primary"
      sx={{
        mt: "auto",
        py: 1.2,
        borderRadius: 3,
        fontWeight: "bold",
        boxShadow: 3,
        "&:hover": { bgcolor: "#032b53ff" },
      }}
      onClick={onLogout}
    >
      Cerrar sesión
    </Button>
  </Box>
);

export default Sidebar;
