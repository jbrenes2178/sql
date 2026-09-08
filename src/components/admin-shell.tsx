import Link from "next/link";

import { logoutAction } from "@/modules/auth/application/login-actions";
import { hasPermission, type AuthorizationActor } from "@/modules/auth/application/authorize";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Inicio", permission: "organization.read" as const },
  { href: "/admin/users", label: "Usuarios", permission: "users.read" as const },
  { href: "/admin/branches", label: "Sucursales", permission: "branches.read" as const },
  { href: "/admin/audit", label: "Auditoría", permission: "audit.read" as const },
];

export function AdminShell({
  actor,
  children,
}: {
  actor: AuthorizationActor;
  children: React.ReactNode;
}) {
  const items = NAV.filter((item) => hasPermission(actor, item.permission));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <p className="text-sm font-semibold text-teal-900">Óptica CR</p>
          <p className="text-xs text-slate-500">Panel de administración</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="border-t border-slate-100 p-3">
          <Button type="submit" variant="outline" className="w-full" data-testid="logout-button">
            Cerrar sesión
          </Button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
