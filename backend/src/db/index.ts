import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.error("[db] DATABASE_URL is not set. Exiting.");
  process.exit(1);
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

export const db = drizzle(pool, { schema });

export async function checkDbConnection(): Promise<void> {
  const client = await pool.connect();
  client.release();
}
