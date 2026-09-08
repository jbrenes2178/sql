import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().min(1).default("http://localhost:3000"),
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  TZ: z.string().default("America/Costa_Rica"),
  DEFAULT_CURRENCY: z.string().default("CRC"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  TEST_DATABASE_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
  ALLOW_PRODUCTION_SEED: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

function readEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Variables de entorno inválidas: ${issues}`);
  }
  return parsed.data;
}

let cached: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (!cached) {
    cached = readEnv();
  }
  return cached;
}

export function resetEnvCache(): void {
  cached = undefined;
}

export function isProduction(): boolean {
  return getEnv().APP_ENV === "production";
}
