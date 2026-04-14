import { z } from "zod";

const envSchema = z.object({
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  BASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
