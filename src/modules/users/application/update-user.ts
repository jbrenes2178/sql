import { recordAudit } from "@/modules/audit/application/audit";
import {
  authorize,
  type AuthorizationActor,
} from "@/modules/auth/application/authorize";
import { organizationIdFromActor } from "@/modules/auth/application/scope";
import { ForbiddenError, NotFoundError } from "@/modules/auth/domain/errors";
import type { UpdateUserInput } from "@/modules/auth/dto/schemas";
import { prisma } from "@/server/db/prisma";

export async function updateUser(actor: AuthorizationActor, input: UpdateUserInput) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "users.update", { organizationId });

  const defaultBranchId = input.defaultBranchId ? input.defaultBranchId : null;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: input.userId, organizationId },
    });
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    if (defaultBranchId) {
      const branch = await tx.branch.findFirst({
        where: { id: defaultBranchId, organizationId },
      });
      if (!branch) {
        throw new NotFoundError("Sucursal no encontrada");
      }
    }

    const updated = await tx.user.update({
      where: { id: user.id },
      data: {
        name: input.name,
        defaultBranchId,
      },
    });

    await recordAudit(
      {
        organizationId,
        branchId: defaultBranchId,
        actorUserId: actor.id,
        action: "USER_UPDATED",
        entityType: "User",
        entityId: user.id,
        metadata: { name: input.name },
      },
      tx,
    );

    return updated;
  });
}

export async function disableUser(actor: AuthorizationActor, userId: string) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "users.disable", { organizationId });

  if (actor.id === userId) {
    throw new ForbiddenError("No puede deshabilitar su propia cuenta");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: userId, organizationId },
    });
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    const updated = await tx.user.update({
      where: { id: user.id },
      data: { active: false },
    });

    await tx.session.deleteMany({ where: { userId: user.id } });

    await recordAudit(
      {
        organizationId,
        actorUserId: actor.id,
        action: "USER_DISABLED",
        entityType: "User",
        entityId: user.id,
        metadata: { email: user.email },
      },
      tx,
    );

    return updated;
  });
}
