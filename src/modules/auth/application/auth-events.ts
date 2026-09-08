import { recordAudit } from "@/modules/audit/application/audit";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/server/logging/logger";

export async function recordLoginSuccess(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, organizationId: true, defaultBranchId: true, email: true },
  });
  if (!user) {
    return;
  }
  await recordAudit({
    organizationId: user.organizationId,
    branchId: user.defaultBranchId,
    actorUserId: user.id,
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
  });
}

export async function recordLoginFailure(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, organizationId: true, defaultBranchId: true },
  });
  if (!user) {
    logger.warn("auth.login_failure_unknown", { module: "auth", action: "LOGIN_FAILURE" });
    return;
  }
  await recordAudit({
    organizationId: user.organizationId,
    branchId: user.defaultBranchId,
    actorUserId: user.id,
    action: "LOGIN_FAILURE",
    entityType: "User",
    entityId: user.id,
    metadata: { reason: "invalid_credentials" },
  });
}

export async function recordLogout(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, organizationId: true, defaultBranchId: true },
  });
  if (!user) {
    return;
  }
  await recordAudit({
    organizationId: user.organizationId,
    branchId: user.defaultBranchId,
    actorUserId: user.id,
    action: "LOGOUT",
    entityType: "User",
    entityId: user.id,
  });
}
