import "dotenv/config";

import {
  PERMISSION_CATALOG,
  ROLE_CODES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from "../src/modules/auth/domain/permissions";
import { createId } from "../src/lib/ids";
import { hashPassword } from "../src/server/auth/password";
import { prisma } from "../src/server/db/prisma";
import { logger } from "../src/server/logging/logger";

const PRODUCTION_SEED_TOKEN = "I_UNDERSTAND_THIS_IS_DESTRUCTIVE";

function assertSeedAllowed(): void {
  const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV;
  if (appEnv === "production") {
    if (process.env.ALLOW_PRODUCTION_SEED !== PRODUCTION_SEED_TOKEN) {
      throw new Error(
        "Seed bloqueado en producción. Solo se permite con ALLOW_PRODUCTION_SEED=I_UNDERSTAND_THIS_IS_DESTRUCTIVE",
      );
    }
  }
}

async function seed(): Promise<void> {
  assertSeedAllowed();

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD son obligatorios para el seed");
  }
  if (adminPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD debe tener al menos 12 caracteres");
  }

  await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.upsert({
      where: { id: "00000000-0000-7000-8000-000000000001" },
      update: {
        legalName: "Óptica Demo S.A.",
        tradeName: "Óptica Demo",
        timezone: "America/Costa_Rica",
        defaultCurrency: "CRC",
        active: true,
      },
      create: {
        id: "00000000-0000-7000-8000-000000000001",
        legalName: "Óptica Demo S.A.",
        tradeName: "Óptica Demo",
        timezone: "America/Costa_Rica",
        defaultCurrency: "CRC",
        active: true,
      },
    });

    const branch = await tx.branch.upsert({
      where: {
        organizationId_code: { organizationId: organization.id, code: "001" },
      },
      update: {
        name: "Sucursal Central",
        timezone: "America/Costa_Rica",
        active: true,
      },
      create: {
        organizationId: organization.id,
        name: "Sucursal Central",
        code: "001",
        timezone: "America/Costa_Rica",
        active: true,
      },
    });

    await tx.posTerminal.upsert({
      where: {
        branchId_code: { branchId: branch.id, code: "001" },
      },
      update: {
        name: "Caja 1",
        organizationId: organization.id,
        active: true,
      },
      create: {
        organizationId: organization.id,
        branchId: branch.id,
        name: "Caja 1",
        code: "001",
        active: true,
      },
    });

    for (const permission of PERMISSION_CATALOG) {
      await tx.permission.upsert({
        where: { code: permission.code },
        update: { name: permission.name, description: permission.description },
        create: {
          code: permission.code,
          name: permission.name,
          description: permission.description,
        },
      });
    }

    const permissions = await tx.permission.findMany();
    const permissionByCode = new Map(permissions.map((item) => [item.code, item]));

    for (const roleCode of ROLE_CODES) {
      const role = await tx.role.upsert({
        where: {
          organizationId_code: { organizationId: organization.id, code: roleCode },
        },
        update: { name: ROLE_LABELS[roleCode] },
        create: {
          organizationId: organization.id,
          code: roleCode,
          name: ROLE_LABELS[roleCode],
        },
      });

      const codes = ROLE_PERMISSIONS[roleCode];
      for (const code of codes) {
        const permission = permissionByCode.get(code);
        if (!permission) {
          throw new Error(`Permiso faltante: ${code}`);
        }
        await tx.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: permission.id },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    const superAdminRole = await tx.role.findUniqueOrThrow({
      where: {
        organizationId_code: { organizationId: organization.id, code: "SUPER_ADMIN" },
      },
    });

    const passwordHash = await hashPassword(adminPassword);
    const existingAdmin = await tx.user.findUnique({ where: { email: adminEmail } });

    const adminId = existingAdmin?.id ?? createId();
    const admin = await tx.user.upsert({
      where: { email: adminEmail },
      update: {
        name: "Super Admin Demo",
        active: true,
        organizationId: organization.id,
        defaultBranchId: branch.id,
        emailVerified: true,
      },
      create: {
        id: adminId,
        name: "Super Admin Demo",
        email: adminEmail,
        emailVerified: true,
        active: true,
        organizationId: organization.id,
        defaultBranchId: branch.id,
      },
    });

    // Better Auth exige accountId === user.id para el proveedor credential.
    await tx.account.deleteMany({
      where: {
        userId: admin.id,
        providerId: "credential",
        NOT: { accountId: admin.id },
      },
    });

    await tx.account.upsert({
      where: {
        providerId_accountId: { providerId: "credential", accountId: admin.id },
      },
      update: { password: passwordHash, userId: admin.id },
      create: {
        id: createId(),
        accountId: admin.id,
        providerId: "credential",
        userId: admin.id,
        password: passwordHash,
      },
    });

    await tx.userRole.upsert({
      where: {
        userId_roleId: { userId: admin.id, roleId: superAdminRole.id },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    });
  });

  logger.info("seed.completed", {
    module: "seed",
    action: "db:seed",
    email: adminEmail,
  });
}

seed()
  .catch((error: unknown) => {
    logger.error("seed.failed", {
      module: "seed",
      message: error instanceof Error ? error.message : "unknown",
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
