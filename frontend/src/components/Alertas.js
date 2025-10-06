import { Box, Paper, Typography } from "@mui/material";

function Alertas() {
  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
        minHeight: "80vh",
      }}
    >
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: 5,
          maxWidth: 900,
          width: "80%",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Alertas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualiza las alertas generadas por el sistema en tiempo real.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Alertas;
