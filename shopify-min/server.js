import express from "express";
import path from "path";
const app = express();

app.get("/", (req, res) => {
  res.sendFile("mini-golf-minimal.html", { root: path.__dirname });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
