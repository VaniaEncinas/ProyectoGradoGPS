const trackerController = require("./trackerController");

exports.receiveFromGpsFisico = async (req, res) => {
  try {
    // Reutilizamos EXACTAMENTE el mismo flujo
    return trackerController.receiveLocation(req, res);
  } catch (error) {
    console.error("Error GPS físico:", error);
    return res.status(500).json({ error: "Error GPS físico" });
  }
};
