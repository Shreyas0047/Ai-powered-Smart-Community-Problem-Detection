const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/db");

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Express API running at http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
