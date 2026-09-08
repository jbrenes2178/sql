import { redirect } from "next/navigation";

import { getSessionUser } from "@/modules/auth/application/session";

export default async function HomePage() {
  const session = await getSessionUser();
  redirect(session?.user ? "/admin" : "/login");
}
