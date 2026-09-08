import { listAuditLogs } from "@/modules/audit/application/audit";
import {
  authorize,
  type AuthorizationActor,
} from "@/modules/auth/application/authorize";
import { organizationIdFromActor } from "@/modules/auth/application/scope";

export async function listOrganizationAudit(actor: AuthorizationActor) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "audit.read", { organizationId });
  return listAuditLogs({ organizationId, take: 100 });
}
