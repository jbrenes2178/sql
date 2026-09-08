import { describe, expect, it } from "vitest";

import { createUserSchema, loginSchema } from "@/modules/auth/dto/schemas";

describe("validaciones Zod", () => {
  it("rechaza login sin correo válido", () => {
    const result = loginSchema.safeParse({ email: "no-es-correo", password: "x" });
    expect(result.success).toBe(false);
  });

  it("acepta login con correo y contraseña", () => {
    const result = loginSchema.safeParse({
      email: "admin@optica-cr.local",
      password: "secreto",
    });
    expect(result.success).toBe(true);
  });

  it("exige contraseña de 12 caracteres al crear usuario", () => {
    const result = createUserSchema.safeParse({
      name: "Ana",
      email: "ana@optica-cr.local",
      password: "corta",
      roleCode: "SALES",
    });
    expect(result.success).toBe(false);
  });

  it("no admite organizationId en el DTO de creación", () => {
    const result = createUserSchema.safeParse({
      name: "Ana",
      email: "ana@optica-cr.local",
      password: "password1234",
      roleCode: "SALES",
      organizationId: "33333333-3333-7333-8333-333333333333",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("organizationId" in result.data).toBe(false);
    }
  });
});
