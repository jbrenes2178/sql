import { describe, expect, it } from "vitest";

import {
  authorize,
  hasPermission,
  isSuperAdmin,
  type AuthorizationActor,
} from "@/modules/auth/application/authorize";
import { ForbiddenError } from "@/modules/auth/domain/errors";

function actor(overrides: Partial<AuthorizationActor> = {}): AuthorizationActor {
  return {
    id: "11111111-1111-7111-8111-111111111111",
    organizationId: "22222222-2222-7222-8222-222222222222",
    roleCodes: ["SALES"],
    permissionCodes: ["organization.read", "branches.read"],
    ...overrides,
  };
}

describe("authorize", () => {
  it("SUPER_ADMIN bypasea permisos en su organización", () => {
    const superAdmin = actor({
      roleCodes: ["SUPER_ADMIN"],
      permissionCodes: [],
    });
    expect(isSuperAdmin(superAdmin)).toBe(true);
    expect(hasPermission(superAdmin, "users.disable")).toBe(true);
    authorize(superAdmin, "users.disable", {
      organizationId: superAdmin.organizationId,
    });
  });

  it("SUPER_ADMIN no opera sobre otra organización", () => {
    const superAdmin = actor({ roleCodes: ["SUPER_ADMIN"], permissionCodes: [] });
    expect(() =>
      authorize(superAdmin, "users.read", {
        organizationId: "33333333-3333-7333-8333-333333333333",
      }),
    ).toThrow(ForbiddenError);
  });

  it("niega permisos que el rol no tiene", () => {
    const sales = actor();
    expect(() => authorize(sales, "users.create")).toThrow(ForbiddenError);
    expect(() => authorize(sales, "audit.read")).toThrow(ForbiddenError);
  });

  it("permite un permiso concedido al rol", () => {
    const admin = actor({
      roleCodes: ["ADMIN"],
      permissionCodes: [],
    });
    authorize(admin, "users.create");
    authorize(admin, "audit.read");
  });

  it("aplica scope de organización", () => {
    const manager = actor({
      roleCodes: ["MANAGER"],
      permissionCodes: [],
    });
    expect(() =>
      authorize(manager, "users.read", {
        organizationId: "33333333-3333-7333-8333-333333333333",
      }),
    ).toThrow(ForbiddenError);
  });

  it("aplica scope de sucursal cuando hay lista permitida", () => {
    const cashier = actor({
      roleCodes: ["CASHIER"],
      permissionCodes: [],
    });
    authorize(cashier, "pos_terminals.read", {
      branchId: "branch-a",
      allowedBranchIds: ["branch-a", "branch-b"],
    });
    expect(() =>
      authorize(cashier, "pos_terminals.read", {
        branchId: "branch-c",
        allowedBranchIds: ["branch-a"],
      }),
    ).toThrow(ForbiddenError);
  });
});
