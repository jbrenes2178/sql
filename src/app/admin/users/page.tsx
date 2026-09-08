import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateUserForm } from "@/components/create-user-form";
import { DisableUserButton } from "@/components/disable-user-button";
import { hasPermission, isSuperAdmin } from "@/modules/auth/application/authorize";
import { requireActor } from "@/modules/auth/application/session";
import { ROLE_LABELS, type RoleCode } from "@/modules/auth/domain/permissions";
import { listBranches } from "@/modules/branches/application/branches";
import { listUsers } from "@/modules/users/application/list-users";

export default async function UsersPage() {
  const actor = await requireActor();
  const users = await listUsers(actor);
  const branches = hasPermission(actor, "branches.read")
    ? await listBranches(actor)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <p className="text-sm text-slate-600">Alta interna. No existe registro público.</p>
      </div>
      {hasPermission(actor, "users.create") ? (
        <Card>
          <CardTitle>Crear usuario</CardTitle>
          <CardDescription>La organización se toma de la sesión, no del formulario.</CardDescription>
          <div className="mt-4">
            <CreateUserForm
              branches={branches.map((branch) => ({ id: branch.id, name: branch.name }))}
              canAssignSuperAdmin={isSuperAdmin(actor)}
            />
          </div>
        </Card>
      ) : null}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.userRoles
                    .map((item) => ROLE_LABELS[item.role.code as RoleCode] ?? item.role.code)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  <Badge variant={user.active ? "success" : "muted"}>
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {hasPermission(actor, "users.disable") && user.active && user.id !== actor.id ? (
                    <DisableUserButton userId={user.id} />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
