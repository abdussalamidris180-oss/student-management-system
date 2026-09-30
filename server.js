
const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
