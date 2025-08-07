const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the shopify directory
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "game.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Development server running on http://localhost:${PORT}`);
});
