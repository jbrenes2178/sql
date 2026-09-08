import type { Prisma } from "@/generated/prisma/client";

const FORBIDDEN_METADATA_KEYS = [
  "password",
  "token",
  "cookie",
  "authorization",
  "secret",
  "hash",
  "DATABASE_URL",
  "AUTH_SECRET",
  "BETTER_AUTH_SECRET",
];

export function sanitizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | undefined {
  if (!metadata) {
    return undefined;
  }
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_METADATA_KEYS.some((forbidden) => lower.includes(forbidden.toLowerCase()))) {
      continue;
    }
    clean[key] = value;
  }
  return clean as Prisma.InputJsonValue;
}
