import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { requireActor } from "@/modules/auth/application/session";
import { UnauthorizedError } from "@/modules/auth/domain/errors";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let actor;
  try {
    actor = await requireActor();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }
    throw error;
  }

  return <AdminShell actor={actor}>{children}</AdminShell>;
}
