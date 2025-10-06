import { Box, Paper, Typography } from "@mui/material";

function Zonas() {
  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f1f8e9 0%, #aed581 100%)",
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
          Zonas Seguras
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configura y gestiona las zonas seguras para los niños.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Zonas;
