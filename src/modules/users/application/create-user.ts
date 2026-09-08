import { recordAudit } from "@/modules/audit/application/audit";
import {
  authorize,
  type AuthorizationActor,
  isSuperAdmin,
} from "@/modules/auth/application/authorize";
import { organizationIdFromActor } from "@/modules/auth/application/scope";
import { ConflictError, NotFoundError, ForbiddenError } from "@/modules/auth/domain/errors";
import type { CreateUserInput } from "@/modules/auth/dto/schemas";
import { createId } from "@/lib/ids";
import { hashPassword } from "@/server/auth/password";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/server/logging/logger";

export async function createUser(actor: AuthorizationActor, input: CreateUserInput) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "users.create", { organizationId });

  if (input.roleCode === "SUPER_ADMIN" && !isSuperAdmin(actor)) {
    throw new ForbiddenError("Solo SUPER_ADMIN puede asignar SUPER_ADMIN");
  }

  const email = input.email.toLowerCase();
  const defaultBranchId = input.defaultBranchId ? input.defaultBranchId : null;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError("Ya existe un usuario con ese correo");
    }

    if (defaultBranchId) {
      const branch = await tx.branch.findFirst({
        where: { id: defaultBranchId, organizationId },
      });
      if (!branch) {
        throw new NotFoundError("Sucursal no encontrada");
      }
    }

    const role = await tx.role.findUnique({
      where: { organizationId_code: { organizationId, code: input.roleCode } },
    });
    if (!role) {
      throw new NotFoundError("Rol no encontrado");
    }

    const userId = createId();
    const passwordHash = await hashPassword(input.password);

    const user = await tx.user.create({
      data: {
        id: userId,
        name: input.name,
        email,
        emailVerified: true,
        active: true,
        organizationId,
        defaultBranchId,
      },
    });

    await tx.account.create({
      data: {
        id: createId(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    });

    await recordAudit(
      {
        organizationId,
        branchId: defaultBranchId,
        actorUserId: actor.id,
        action: "USER_CREATED",
        entityType: "User",
        entityId: user.id,
        metadata: { email, roleCode: input.roleCode },
      },
      tx,
    );

    logger.info("user.created", {
      module: "users",
      action: "create",
      userId: actor.id,
      organizationId,
      targetUserId: user.id,
    });

    return { id: user.id, email: user.email, name: user.name };
  });
}
