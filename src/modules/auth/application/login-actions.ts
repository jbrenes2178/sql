"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  recordLoginFailure,
  recordLoginSuccess,
  recordLogout,
} from "@/modules/auth/application/auth-events";
import { requireActor } from "@/modules/auth/application/session";
import { loginSchema } from "@/modules/auth/dto/schemas";
import { auth } from "@/server/auth/auth";
import { fail, type ActionResult } from "@/server/http/action-result";
import { logger } from "@/server/logging/logger";

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  try {
    const result = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });

    const userId = result.user?.id;
    if (userId) {
      await recordLoginSuccess(userId);
    }
  } catch {
    await recordLoginFailure(parsed.data.email);
    logger.warn("auth.login_failed", { module: "auth", action: "login" });
    return fail("Credenciales inválidas");
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  try {
    const actor = await requireActor();
    await recordLogout(actor.id);
  } catch {
    // Sesión ausente: igual se limpia la cookie.
  }

  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/login");
}
