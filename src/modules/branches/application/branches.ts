import { recordAudit } from "@/modules/audit/application/audit";
import {
  authorize,
  type AuthorizationActor,
} from "@/modules/auth/application/authorize";
import { organizationIdFromActor } from "@/modules/auth/application/scope";
import { ConflictError, NotFoundError } from "@/modules/auth/domain/errors";
import type { CreateBranchInput, UpdateBranchInput } from "@/modules/auth/dto/schemas";
import { prisma } from "@/server/db/prisma";

export async function listBranches(actor: AuthorizationActor) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "branches.read", { organizationId });

  return prisma.branch.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    include: {
      terminals: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, code: true, active: true },
      },
    },
  });
}

export async function createBranch(actor: AuthorizationActor, input: CreateBranchInput) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "branches.create", { organizationId });

  return prisma.$transaction(async (tx) => {
    const existing = await tx.branch.findUnique({
      where: { organizationId_code: { organizationId, code: input.code } },
    });
    if (existing) {
      throw new ConflictError("Ya existe una sucursal con ese código");
    }

    const branch = await tx.branch.create({
      data: {
        organizationId,
        name: input.name,
        code: input.code,
        timezone: input.timezone,
      },
    });

    await recordAudit(
      {
        organizationId,
        branchId: branch.id,
        actorUserId: actor.id,
        action: "BRANCH_CREATED",
        entityType: "Branch",
        entityId: branch.id,
        metadata: { code: branch.code, name: branch.name },
      },
      tx,
    );

    return branch;
  });
}

export async function updateBranch(actor: AuthorizationActor, input: UpdateBranchInput) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "branches.update", { organizationId });

  return prisma.$transaction(async (tx) => {
    const branch = await tx.branch.findFirst({
      where: { id: input.branchId, organizationId },
    });
    if (!branch) {
      throw new NotFoundError("Sucursal no encontrada");
    }

    const updated = await tx.branch.update({
      where: { id: branch.id },
      data: {
        name: input.name,
        timezone: input.timezone,
        active: input.active,
      },
    });

    await recordAudit(
      {
        organizationId,
        branchId: branch.id,
        actorUserId: actor.id,
        action: "BRANCH_UPDATED",
        entityType: "Branch",
        entityId: branch.id,
        metadata: { name: input.name, active: input.active },
      },
      tx,
    );

    return updated;
  });
}
