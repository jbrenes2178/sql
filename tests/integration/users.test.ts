import { execSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadActor } from "@/modules/auth/application/actor";
import { authorize } from "@/modules/auth/application/authorize";
import { createUser } from "@/modules/users/application/create-user";
import { assignRole } from "@/modules/users/application/assign-role";
import { disableUser } from "@/modules/users/application/update-user";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { createId } from "@/lib/ids";
import {
  PERMISSION_CATALOG,
  ROLE_CODES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from "@/modules/auth/domain/permissions";
import { auth } from "@/server/auth/auth";

const ORG_ID = "aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa";

async function ensureCatalog() {
  const organization = await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: {},
    create: {
      id: ORG_ID,
      legalName: "Óptica Test",
      tradeName: "Óptica Test",
      timezone: "America/Costa_Rica",
      defaultCurrency: "CRC",
    },
  });

  const branch = await prisma.branch.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "T01" } },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Sucursal Test",
      code: "T01",
      timezone: "America/Costa_Rica",
    },
  });

  for (const permission of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: {
        code: permission.code,
        name: permission.name,
        description: permission.description,
      },
    });
  }

  const permissions = await prisma.permission.findMany();
  const byCode = new Map(permissions.map((item) => [item.code, item]));

  for (const roleCode of ROLE_CODES) {
    const role = await prisma.role.upsert({
      where: { organizationId_code: { organizationId: organization.id, code: roleCode } },
      update: {},
      create: {
        organizationId: organization.id,
        code: roleCode,
        name: ROLE_LABELS[roleCode],
      },
    });
    for (const code of ROLE_PERMISSIONS[roleCode]) {
      const permission = byCode.get(code);
      if (!permission) {
        throw new Error(`permiso ${code}`);
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  return { organization, branch };
}

async function createActorUser(email: string) {
  const passwordHash = await hashPassword("IntegrationAdmin123!");
  const user = await prisma.user.create({
    data: {
      id: createId(),
      name: "Actor Admin",
      email,
      emailVerified: true,
      active: true,
      organizationId: ORG_ID,
    },
  });
  await prisma.account.create({
    data: {
      id: createId(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: passwordHash,
    },
  });
  const role = await prisma.role.findUniqueOrThrow({
    where: { organizationId_code: { organizationId: ORG_ID, code: "SUPER_ADMIN" } },
  });
  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });
  const actor = await loadActor(user.id);
  if (!actor) {
    throw new Error("actor");
  }
  return { user, actor, password: "IntegrationAdmin123!" };
}

describe("integración usuarios / sesión / auditoría", () => {
  beforeAll(() => {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("crea usuario, asigna rol, sesión, deshabilita y audita", async () => {
    await ensureCatalog();
    const suffix = `${Date.now()}@optica-cr.local`;
    const { actor, user: admin, password } = await createActorUser(`actor-${suffix}`);

    const created = await createUser(actor, {
      name: "Cajero Test",
      email: `cajero-${suffix}`,
      password: "CajeroClave123!",
      roleCode: "CASHIER",
    });

    const cashier = await prisma.user.findUniqueOrThrow({
      where: { id: created.id },
      include: { userRoles: { include: { role: true } }, accounts: true },
    });
    expect(cashier.userRoles.map((item) => item.role.code)).toContain("CASHIER");
    expect(cashier.accounts[0]?.password).toBeTruthy();
    expect(cashier.accounts[0]?.password).not.toContain("CajeroClave123!");

    await assignRole(actor, cashier.id, "SALES");
    const withSales = await prisma.userRole.findMany({ where: { userId: cashier.id } });
    expect(withSales).toHaveLength(2);

    const signIn = await auth.api.signInEmail({
      body: { email: admin.email, password },
    });
    expect(signIn.user.id).toBe(admin.id);
    const sessions = await prisma.session.findMany({ where: { userId: admin.id } });
    expect(sessions.length).toBeGreaterThan(0);

    await disableUser(actor, cashier.id);
    const disabled = await prisma.user.findUniqueOrThrow({ where: { id: cashier.id } });
    expect(disabled.active).toBe(false);
    const cashierSessions = await prisma.session.findMany({ where: { userId: cashier.id } });
    expect(cashierSessions).toHaveLength(0);

    const logs = await prisma.auditLog.findMany({
      where: { organizationId: ORG_ID, entityId: cashier.id },
      orderBy: { createdAt: "asc" },
    });
    const actions = logs.map((log) => log.action);
    expect(actions).toContain("USER_CREATED");
    expect(actions).toContain("ROLE_ASSIGNED");
    expect(actions).toContain("USER_DISABLED");
    expect(JSON.stringify(logs)).not.toMatch(/CajeroClave123!/i);
    expect(JSON.stringify(logs)).not.toMatch(/password/i);

    const cashierActor = await loadActor(cashier.id);
    expect(cashierActor).toBeTruthy();
    expect(() => authorize(cashierActor!, "users.create")).toThrow();
  });
});
