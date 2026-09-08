import { z } from "zod";

import { AppError, ValidationError } from "@/modules/auth/domain/errors";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) {
    return fail(error.message);
  }
  if (error instanceof z.ZodError) {
    const first = error.issues[0];
    return fail(first?.message ?? "Datos inválidos");
  }
  if (error instanceof ValidationError) {
    return fail(error.message);
  }
  return fail("Ha ocurrido un error. Intente de nuevo.");
}

export function parseForm<T>(schema: z.ZodType<T>, formData: FormData): T {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      raw[key] = value;
    }
  }
  return schema.parse(raw);
}
