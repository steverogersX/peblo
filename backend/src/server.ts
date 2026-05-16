import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { checkDbConnection } from "./db";
import { attachPresence } from "./realtime/presence";

const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

async function start() {
  try {
    await checkDbConnection();
    console.log("[db] Connected to database.");
  } catch (err) {
    console.error("[db] Could not connect to database:", err);
    process.exit(1);
  }

  const httpServer = createServer(app);
  attachPresence(httpServer, CORS_ORIGIN);

  httpServer.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start();
