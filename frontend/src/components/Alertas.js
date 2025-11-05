import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import {
  Box,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNino, setSelectedNino] = useState(null);
  const [alertasNino, setAlertasNino] = useState([]);

  const isMobile = useMediaQuery("(max-width: 600px)");

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
          id_nino: nino.id_nino,
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
    const swalStyles = document.createElement("style");
    swalStyles.innerHTML = `
      .swal2-container {
        z-index: 99999 !important;
        backdrop-filter: blur(6px);
        background-color: rgba(0, 0, 0, 0.35) !important;
      }
    `;
    document.head.appendChild(swalStyles);

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
        await Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "Alerta eliminada correctamente",
          showConfirmButton: false,
          timer: 2000,
        });

        setAlertas((prev) => prev.filter((a) => a.id_alerta !== id_alerta));

        if (modalOpen) {
          setAlertasNino((prev) => prev.filter((a) => a.id_alerta !== id_alerta));
        }
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

  const openHistorial = (nino) => {
    const filtradas = alertas.filter((a) => a.id_nino === nino.id_nino);
    setSelectedNino(nino);
    setAlertasNino(filtradas);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedNino(null);
    setAlertasNino([]);
  };

  const ultimasAlertas = Object.values(
    alertas.reduce((acc, alerta) => {
      if (
        !acc[alerta.id_nino] ||
        new Date(alerta.fecha_hora) >
          new Date(acc[alerta.id_nino].fecha_hora)
      ) {
        acc[alerta.id_nino] = alerta;
      }
      return acc;
    }, {})
  );

  return (
    <Box
      sx={{
        height: "85vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        maxWidth: "1400px",
        width: "100%",
        mx: "auto",
        px: { xs: 1, sm: 2, md: 6 },
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

      <Box sx={{ flex: 1, mt: 5 }}>
        {alertas.length === 0 ? (
          <Typography sx={{ p: 2 }}>No hay alertas disponibles</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              width: "100%",
              overflowX: "hidden", 
            }}
          >
            <Table
              sx={{
                minWidth: "100%",
                tableLayout: "auto",
                "& th, & td": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                "& th": {
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                },
                "& td": {
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                },
              }}
            >
              <TableHead sx={{ bgcolor: "#7886f35f" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Tipo de alerta
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ultimasAlertas.map((alerta) => (
                  <TableRow key={alerta.id_nino}>
                    <TableCell>{alerta.nombre}</TableCell>
                    <TableCell>
                      {alerta.tipo_alerta.replace("_", " ")}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver historial">
                        <IconButton
                          onClick={() =>
                            openHistorial({
                              id_nino: alerta.id_nino,
                              nombre: alerta.nombre,
                            })
                          }
                          color="primary"
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)", 
              backgroundColor: "rgba(0, 0, 0, 0.35)",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "85%", md: "70%", lg: "60%" },
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            maxHeight: "85vh",
            overflowY: "auto",
            zIndex: 1500,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Historial de {selectedNino?.nombre}
            </Typography>
            <IconButton onClick={closeModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          {alertasNino.length === 0 ? (
            <Typography>No hay alertas registradas</Typography>
          ) : (
            alertasNino.map((alerta) => (
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
                <Box sx={{ maxWidth: "80%" }}>
                  <Typography>
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
      </Modal>
    </Box>
  );
};

export default Alertas;
