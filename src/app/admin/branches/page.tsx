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
import { CreateBranchForm } from "@/components/create-branch-form";
import { hasPermission } from "@/modules/auth/application/authorize";
import { requireActor } from "@/modules/auth/application/session";
import { listBranches } from "@/modules/branches/application/branches";

export default async function BranchesPage() {
  const actor = await requireActor();
  const branches = await listBranches(actor);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sucursales</h1>
        <p className="text-sm text-slate-600">
          Códigos listos para uso fiscal posterior. Sin reglas de Hacienda en esta fase.
        </p>
      </div>
      {hasPermission(actor, "branches.create") ? (
        <Card>
          <CardTitle>Nueva sucursal</CardTitle>
          <CardDescription>La organización se resuelve desde la sesión.</CardDescription>
          <div className="mt-4">
            <CreateBranchForm />
          </div>
        </Card>
      ) : null}
      {branches.map((branch) => (
        <Card key={branch.id}>
          <CardTitle>{branch.name}</CardTitle>
          <CardDescription>
            Código {branch.code} · {branch.timezone} ·{" "}
            {branch.active ? "activa" : "inactiva"}
          </CardDescription>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Terminal POS</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branch.terminals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>Sin terminales</TableCell>
                  </TableRow>
                ) : (
                  branch.terminals.map((terminal) => (
                    <TableRow key={terminal.id}>
                      <TableCell>{terminal.name}</TableCell>
                      <TableCell>{terminal.code}</TableCell>
                      <TableCell>
                        <Badge variant={terminal.active ? "success" : "muted"}>
                          {terminal.active ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ))}
    </div>
  );
}
