
const app = require("./elixirmedics-api");

const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Elixir Medics backend running at http://${host}:${port}`);
});
