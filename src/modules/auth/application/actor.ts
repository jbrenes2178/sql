import type { AuthorizationActor } from "@/modules/auth/application/authorize";
import type { PermissionCode, RoleCode } from "@/modules/auth/domain/permissions";
import { ROLE_CODES } from "@/modules/auth/domain/permissions";
import { prisma } from "@/server/db/prisma";

function isRoleCode(value: string): value is RoleCode {
  return (ROLE_CODES as readonly string[]).includes(value);
}

export async function loadActor(userId: string): Promise<AuthorizationActor | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const roleCodes = user.userRoles
    .map((assignment) => assignment.role.code)
    .filter(isRoleCode);
  const permissionCodes = [
    ...new Set(
      user.userRoles.flatMap((assignment) =>
        assignment.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.code as PermissionCode,
        ),
      ),
    ),
  ];

  return {
    id: user.id,
    organizationId: user.organizationId,
    roleCodes,
    permissionCodes,
  };
}
