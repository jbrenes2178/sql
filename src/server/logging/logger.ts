type LogLevel = "debug" | "info" | "warn" | "error";

const SECRET_KEYS = [
  "password",
  "token",
  "cookie",
  "authorization",
  "secret",
  "DATABASE_URL",
  "AUTH_SECRET",
  "BETTER_AUTH_SECRET",
  "HACIENDA_PASSWORD",
  "HACIENDA_CERTIFICATE_PASSWORD",
  "SEED_ADMIN_PASSWORD",
];

export type LogContext = {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  branchId?: string;
  module?: string;
  action?: string;
  [key: string]: unknown;
};

function shouldRedact(key: string): boolean {
  const lower = key.toLowerCase();
  return SECRET_KEYS.some((secret) => lower.includes(secret.toLowerCase()));
}

function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      output[key] = shouldRedact(key) ? "[redacted]" : sanitize(nested);
    }
    return output;
  }
  return value;
}

function write(level: LogLevel, message: string, context: LogContext = {}): void {
  const sanitized = sanitize(context);
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(typeof sanitized === "object" && sanitized !== null
      ? (sanitized as Record<string, unknown>)
      : {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    process.stderr.write(`${line}\n`);
    return;
  }
  process.stdout.write(`${line}\n`);
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};
