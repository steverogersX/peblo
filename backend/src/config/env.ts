import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  MISTRAL_API_KEY: z.string().min(1, "MISTRAL_API_KEY is required"),
  MISTRAL_MODEL: z.string().default("mistral-small-latest"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("[config] Invalid or missing environment variables:\n");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error("\nCheck your .env file against .env.example and fix the above.");
  process.exit(1);
}

export const env = parsed.data;
