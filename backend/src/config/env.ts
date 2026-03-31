import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  API_KEY: z.string().min(1).default("dev-api-key"),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/darient"),
  MQTT_URL: z.string().default("mqtt://localhost:1883"),
  MQTT_TOPIC: z.string().default("telemetry/#")
});

export const env = envSchema.parse(process.env);
