import { recordAudit } from "@/modules/audit/application/audit";
import {
  authorize,
  isSuperAdmin,
  type AuthorizationActor,
} from "@/modules/auth/application/authorize";
import { organizationIdFromActor } from "@/modules/auth/application/scope";
import { ForbiddenError, NotFoundError, ConflictError } from "@/modules/auth/domain/errors";
import type { RoleCode } from "@/modules/auth/domain/permissions";
import { prisma } from "@/server/db/prisma";

export async function assignRole(
  actor: AuthorizationActor,
  userId: string,
  roleCode: RoleCode,
) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "users.assign_role", { organizationId });

  if (roleCode === "SUPER_ADMIN" && !isSuperAdmin(actor)) {
    throw new ForbiddenError("Solo SUPER_ADMIN puede asignar SUPER_ADMIN");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: userId, organizationId },
    });
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    const role = await tx.role.findUnique({
      where: { organizationId_code: { organizationId, code: roleCode } },
    });
    if (!role) {
      throw new NotFoundError("Rol no encontrado");
    }

    const existing = await tx.userRole.findUnique({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
    });
    if (existing) {
      throw new ConflictError("El usuario ya tiene ese rol");
    }

    await tx.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    await recordAudit(
      {
        organizationId,
        actorUserId: actor.id,
        action: "ROLE_ASSIGNED",
        entityType: "UserRole",
        entityId: user.id,
        metadata: { roleCode },
      },
      tx,
    );
  });
}

export async function removeRole(
  actor: AuthorizationActor,
  userId: string,
  roleCode: RoleCode,
) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "users.assign_role", { organizationId });

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: userId, organizationId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    const assignment = user.userRoles.find((item) => item.role.code === roleCode);
    if (!assignment) {
      throw new NotFoundError("El usuario no tiene ese rol");
    }

    if (roleCode === "SUPER_ADMIN" && actor.id === userId) {
      throw new ForbiddenError("No puede quitarse el rol SUPER_ADMIN a sí mismo");
    }

    await tx.userRole.delete({ where: { id: assignment.id } });

    await recordAudit(
      {
        organizationId,
        actorUserId: actor.id,
        action: "ROLE_REMOVED",
        entityType: "UserRole",
        entityId: user.id,
        metadata: { roleCode },
      },
      tx,
    );
  });
}
