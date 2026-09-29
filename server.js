const app = require("./src/routes/apiRoutes");
const { env } = require("./src/config/env");

app.listen(env.port, env.host, () => {
  console.log(`Elixir Medics backend running at http://${env.host}:${env.port}`);
});
