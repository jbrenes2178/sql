"use server";

import { revalidatePath } from "next/cache";

import { requireActor } from "@/modules/auth/application/session";
import { createBranchSchema, updateBranchSchema } from "@/modules/auth/dto/schemas";
import { createBranch, updateBranch } from "@/modules/branches/application/branches";
import { ok, toActionError, type ActionResult } from "@/server/http/action-result";

export async function createBranchAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireActor();
    const parsed = createBranchSchema.parse({
      name: formData.get("name"),
      code: formData.get("code"),
      timezone: formData.get("timezone") || "America/Costa_Rica",
    });
    await createBranch(actor, parsed);
    revalidatePath("/admin/branches");
    return ok(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateBranchAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireActor();
    const parsed = updateBranchSchema.parse({
      branchId: formData.get("branchId"),
      name: formData.get("name"),
      timezone: formData.get("timezone"),
      active: formData.get("active") === "true" || formData.get("active") === "on",
    });
    await updateBranch(actor, parsed);
    revalidatePath("/admin/branches");
    return ok(undefined);
  } catch (error) {
    return toActionError(error);
  }
}
