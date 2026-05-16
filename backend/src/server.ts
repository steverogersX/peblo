import "./config/env"; // validates env at startup — must be first
import { createServer } from "http";
import { env } from "./config/env";
import app from "./app";
import { checkDbConnection } from "./db";
import { attachPresence } from "./realtime/presence";

async function start() {
  try {
    await checkDbConnection();
    console.log("[db] Connected to database.");
  } catch (err) {
    console.error("[db] Could not connect to database:", err);
    process.exit(1);
  }

  const httpServer = createServer(app);
  attachPresence(httpServer, env.CORS_ORIGIN);

  httpServer.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}

start();
