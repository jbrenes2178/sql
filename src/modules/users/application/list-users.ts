import {
  authorize,
  type AuthorizationActor,
} from "@/modules/auth/application/authorize";
import { organizationIdFromActor } from "@/modules/auth/application/scope";
import { prisma } from "@/server/db/prisma";

export async function listUsers(actor: AuthorizationActor) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "users.read", { organizationId });

  return prisma.user.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      defaultBranchId: true,
      createdAt: true,
      userRoles: {
        select: {
          role: { select: { code: true, name: true } },
        },
      },
    },
  });
}
