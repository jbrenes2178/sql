import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/server/logging/logger";
import { sanitizeMetadata } from "@/modules/audit/application/sanitize-metadata";

export { sanitizeMetadata };

export type AuditInput = {
  organizationId: string;
  branchId?: string | null;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function recordAudit(
  input: AuditInput,
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<void> {
  await client.auditLog.create({
    data: {
      organizationId: input.organizationId,
      branchId: input.branchId ?? null,
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: sanitizeMetadata(input.metadata),
    },
  });
}

export async function listAuditLogs(params: {
  organizationId: string;
  take?: number;
}): Promise<
  Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    actorUserId: string | null;
    createdAt: Date;
    metadata: Prisma.JsonValue;
  }>
> {
  const rows = await prisma.auditLog.findMany({
    where: { organizationId: params.organizationId },
    orderBy: { createdAt: "desc" },
    take: params.take ?? 100,
  });
  logger.debug("audit.listed", {
    module: "audit",
    organizationId: params.organizationId,
    count: rows.length,
  });
  return rows;
}
