import { describe, expect, it } from "vitest";

import { sanitizeMetadata } from "@/modules/audit/application/sanitize-metadata";

describe("auditoría", () => {
  it("omite secretos del metadata", () => {
    const cleaned = sanitizeMetadata({
      email: "admin@optica-cr.local",
      password: "no-debe-guardarse",
      token: "abc",
      cookie: "session",
      AUTH_SECRET: "x",
      DATABASE_URL: "postgresql://",
      roleCode: "ADMIN",
    });
    expect(cleaned).toEqual({
      email: "admin@optica-cr.local",
      roleCode: "ADMIN",
    });
  });
});
