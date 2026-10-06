import env from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { createApp } from "./app.js";

await connectDB(env.MONGODB_URI);
const server = createApp().listen(env.PORT, env.HOST, () => {
  console.log(`Restro POS API listening on http://${env.HOST}:${env.PORT}`);
});

// Arret propre: kansaliw les requetes li jarya 9bel ma nsdo DB
async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
