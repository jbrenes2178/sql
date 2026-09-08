import { ForbiddenError } from "@/modules/auth/domain/errors";
import {
  type PermissionCode,
  type RoleCode,
  ROLE_PERMISSIONS,
} from "@/modules/auth/domain/permissions";

export type AuthorizationActor = {
  id: string;
  organizationId: string;
  roleCodes: RoleCode[];
  permissionCodes: PermissionCode[];
};

export type AuthorizeContext = {
  organizationId?: string;
  branchId?: string;
  allowedBranchIds?: string[];
};

export function hasRole(actor: AuthorizationActor, role: RoleCode): boolean {
  return actor.roleCodes.includes(role);
}

export function isSuperAdmin(actor: AuthorizationActor): boolean {
  return hasRole(actor, "SUPER_ADMIN");
}

export function hasPermission(
  actor: AuthorizationActor,
  permission: PermissionCode,
): boolean {
  if (isSuperAdmin(actor)) {
    return true;
  }
  return actor.permissionCodes.includes(permission);
}

/**
 * Única API de autorización del dominio.
 * SUPER_ADMIN tiene bypass explícito (testeado).
 * organizationId del contexto, si se envía, debe coincidir con la sesión.
 * branchId, si se envía, debe estar en allowedBranchIds cuando se proveen.
 */
export function authorize(
  actor: AuthorizationActor,
  permission: PermissionCode,
  context: AuthorizeContext = {},
): void {
  if (context.organizationId && context.organizationId !== actor.organizationId) {
    throw new ForbiddenError("No puede operar sobre otra organización");
  }

  if (
    context.branchId &&
    context.allowedBranchIds &&
    !context.allowedBranchIds.includes(context.branchId)
  ) {
    throw new ForbiddenError("No puede operar sobre esa sucursal");
  }

  if (isSuperAdmin(actor)) {
    return;
  }

  const grantedByRoles = actor.roleCodes.flatMap(
    (role) => ROLE_PERMISSIONS[role] ?? [],
  );
  const allowed = new Set([...actor.permissionCodes, ...grantedByRoles]);
  if (!allowed.has(permission)) {
    throw new ForbiddenError("Permiso insuficiente");
  }
}
