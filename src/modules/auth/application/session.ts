import { headers } from "next/headers";

import { loadActor } from "@/modules/auth/application/actor";
import type { AuthorizationActor } from "@/modules/auth/application/authorize";
import { UnauthorizedError } from "@/modules/auth/domain/errors";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

export async function getSessionUser() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireActor(): Promise<AuthorizationActor> {
  const session = await getSessionUser();
  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { active: true },
  });
  if (!user?.active) {
    throw new UnauthorizedError("La cuenta está deshabilitada.");
  }

  const actor = await loadActor(session.user.id);
  if (!actor) {
    throw new UnauthorizedError();
  }
  return actor;
}
