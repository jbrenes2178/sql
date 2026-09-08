import type { AuthorizationActor } from "@/modules/auth/application/authorize";
import { ForbiddenError } from "@/modules/auth/domain/errors";

/**
 * El organizationId de negocio siempre sale de la sesión, nunca del cuerpo HTTP.
 */
export function organizationIdFromActor(actor: AuthorizationActor): string {
  return actor.organizationId;
}

export function assertOrganizationScope(
  actor: AuthorizationActor,
  organizationId: string,
): void {
  if (organizationId !== actor.organizationId) {
    throw new ForbiddenError("No puede operar sobre otra organización");
  }
}

export function assertBranchInList(
  branchId: string | null | undefined,
  allowedBranchIds: readonly string[] | undefined,
): void {
  if (!branchId || !allowedBranchIds) {
    return;
  }
  if (!allowedBranchIds.includes(branchId)) {
    throw new ForbiddenError("No puede operar sobre esa sucursal");
  }
}
