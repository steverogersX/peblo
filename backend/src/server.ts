import "dotenv/config";
import app from "./app";
import { checkDbConnection } from "./db";

const PORT = process.env.PORT ?? 3001;

async function start() {
  try {
    await checkDbConnection();
    console.log("[db] Connected to database.");
  } catch (err) {
    console.error("[db] Could not connect to database:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start();
