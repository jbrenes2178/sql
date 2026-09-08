import { describe, expect, it } from "vitest";

import {
  organizationIdFromActor,
  assertOrganizationScope,
  assertBranchInList,
} from "@/modules/auth/application/scope";
import { ForbiddenError } from "@/modules/auth/domain/errors";
import type { AuthorizationActor } from "@/modules/auth/application/authorize";

const actor: AuthorizationActor = {
  id: "11111111-1111-7111-8111-111111111111",
  organizationId: "22222222-2222-7222-8222-222222222222",
  roleCodes: ["ADMIN"],
  permissionCodes: [],
};

describe("scope", () => {
  it("expone organizationId de la sesión, no del cliente", () => {
    expect(organizationIdFromActor(actor)).toBe(actor.organizationId);
  });

  it("rechaza otra organización", () => {
    expect(() =>
      assertOrganizationScope(actor, "33333333-3333-7333-8333-333333333333"),
    ).toThrow(ForbiddenError);
  });

  it("rechaza sucursal fuera de la lista", () => {
    expect(() => assertBranchInList("b2", ["b1"])).toThrow(ForbiddenError);
    expect(() => assertBranchInList("b1", ["b1"])).not.toThrow();
  });
});
