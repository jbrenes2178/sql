"use server";

import { revalidatePath } from "next/cache";

import { requireActor } from "@/modules/auth/application/session";
import {
  assignRoleSchema,
  createUserSchema,
  disableUserSchema,
  updateUserSchema,
} from "@/modules/auth/dto/schemas";
import { assignRole, removeRole } from "@/modules/users/application/assign-role";
import { createUser } from "@/modules/users/application/create-user";
import { disableUser, updateUser } from "@/modules/users/application/update-user";
import { ok, toActionError, type ActionResult } from "@/server/http/action-result";
import type { RoleCode } from "@/modules/auth/domain/permissions";

export async function createUserAction(
  formData: FormData,
): Promise<ActionResult<{ id: string; email: string; name: string }>> {
  try {
    const actor = await requireActor();
    const parsed = createUserSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      roleCode: formData.get("roleCode"),
      defaultBranchId: formData.get("defaultBranchId") || undefined,
    });
    const created = await createUser(actor, parsed);
    revalidatePath("/admin/users");
    return ok(created);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateUserAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireActor();
    const parsed = updateUserSchema.parse({
      userId: formData.get("userId"),
      name: formData.get("name"),
      defaultBranchId: formData.get("defaultBranchId") || undefined,
    });
    await updateUser(actor, parsed);
    revalidatePath("/admin/users");
    return ok(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function disableUserAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireActor();
    const parsed = disableUserSchema.parse({
      userId: formData.get("userId"),
    });
    await disableUser(actor, parsed.userId);
    revalidatePath("/admin/users");
    return ok(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function assignRoleAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireActor();
    const parsed = assignRoleSchema.parse({
      userId: formData.get("userId"),
      roleCode: formData.get("roleCode"),
    });
    await assignRole(actor, parsed.userId, parsed.roleCode);
    revalidatePath("/admin/users");
    return ok(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeRoleAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireActor();
    const parsed = assignRoleSchema.parse({
      userId: formData.get("userId"),
      roleCode: formData.get("roleCode"),
    });
    await removeRole(actor, parsed.userId, parsed.roleCode as RoleCode);
    revalidatePath("/admin/users");
    return ok(undefined);
  } catch (error) {
    return toActionError(error);
  }
}
