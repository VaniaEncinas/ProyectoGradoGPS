import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Swal from "sweetalert2";

import {
  deleteAlertaRequest,
  getAlertasByNinoRequest,
  getNinosByUsuarioRequest,
} from "../services/api";

const socket = io("http://localhost:4000");

const Alertas = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const id_usuario = user?.id_usuario || user?.id;

  const [alertas, setAlertas] = useState([]);

  const fetchAlertas = async () => {
    try {
      const resNinos = await getNinosByUsuarioRequest(id_usuario);
      const ninos = resNinos.data;
      const alertasAcumuladas = [];

      for (let nino of ninos) {
        const res = await getAlertasByNinoRequest(nino.id_nino);
        const alertasDelNino = res.data.map((a) => ({
          ...a,
          nombre: nino.nombre,
        }));
        alertasAcumuladas.push(...alertasDelNino);
      }

      alertasAcumuladas.sort(
        (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)
      );
      setAlertas(alertasAcumuladas);
    } catch (err) {
      console.error("Error cargando alertas:", err);
      Swal.fire("Error", "No se pudieron cargar las alertas", "error");
    }
  };

  useEffect(() => {
    const initAlertas = async () => {
      if (!id_usuario) {
        Swal.fire(
          "Sesión expirada",
          "Por favor inicia sesión nuevamente",
          "warning"
        ).then(() => {
          localStorage.clear();
          navigate("/");
        });
      } else {
        await fetchAlertas();
        socket.emit("joinUser", id_usuario);
        socket.on("nuevaAlerta", (alerta) => {
          setAlertas((prev) => [alerta, ...prev]);
        });
      }
    };
    initAlertas();
    return () => socket.off("nuevaAlerta");
  }, [id_usuario, navigate]);

  const handleDelete = async (id_alerta) => {
    const result = await Swal.fire({
      title: "¿Eliminar alerta?",
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
        await deleteAlertaRequest(id_alerta);
        Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "Alerta eliminada correctamente",
          showConfirmButton: false,
          timer: 2000,
        });
        fetchAlertas();
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la alerta",
          showConfirmButton: true,
        });
      }
    }
  };

  return (
    <Box
      sx={{
        height: "85vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <IconButton
        onClick={() => navigate("/principal")}
        sx={{
          position: "fixed",
          bgcolor: "white",
          boxShadow: 2,
          "&:hover": { bgcolor: "#f5f2f2c9" },
          zIndex: 1300,
          top: { xs: 68, sm: 30 },
          left: { xs: 12, sm: 280 },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ flexShrink: 0, mt: { xs: 3, sm: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Alertas
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          mt: 1,
          overflowY: "auto",
          pr: 1,
          px: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {alertas.length === 0 ? (
          <Typography sx={{ p: 2 }}>No hay alertas disponibles</Typography>
        ) : (
          alertas.map((alerta) => (
            <Box
              key={alerta.id_alerta}
              sx={{
                p: 2,
                mb: 1,
                border: "1px solid #ccc",
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor:
                  alerta.tipo_alerta === "salida_zona_segura"
                    ? "#1b254c26"
                    : "#08f3083b",
              }}
            >
              <Box>
                <Typography>
                  <strong>{alerta.nombre || "Niño/a"}</strong> -{" "}
                  {alerta.tipo_alerta.replace("_", " ")}
                </Typography>
                <Typography>
                  {alerta.mensaje}
                  {alerta.nombre_zona && (
                    <> <strong>(Zona segura: {alerta.nombre_zona})</strong></>
                  )}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(alerta.fecha_hora).toLocaleString()}
                </Typography>
              </Box>
              <Tooltip title="Eliminar alerta">
                <IconButton
                  color="error"
                  onClick={() => handleDelete(alerta.id_alerta)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Alertas;
