"use server";

import { authorize } from "@/modules/auth/application/authorize";
import { requireActor } from "@/modules/auth/application/session";
import { enqueueHealthCheck } from "@/server/jobs/client";
import { ok, toActionError, type ActionResult } from "@/server/http/action-result";

export async function enqueueHealthCheckAction(): Promise<ActionResult<{ jobId: string | null }>> {
  try {
    const actor = await requireActor();
    authorize(actor, "organization.read", { organizationId: actor.organizationId });
    const jobId = await enqueueHealthCheck({ source: "admin" });
    return ok({ jobId });
  } catch (error) {
    return toActionError(error);
  }
}
