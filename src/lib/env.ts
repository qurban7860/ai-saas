import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

/**
 * Validates the environment variables on boot and exports them strictly typed.
 * This prevents the application from booting in production if critical keys are missing.
 */
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
