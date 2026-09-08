import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireActor } from "@/modules/auth/application/session";
import { listOrganizationAudit } from "@/modules/audit/application/list-audit";

export default async function AuditPage() {
  const actor = await requireActor();
  const logs = await listOrganizationAudit(actor);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Auditoría</h1>
        <p className="text-sm text-slate-600">Bitácora append-only. Sin contraseñas ni secretos.</p>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Actor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {log.createdAt.toLocaleString("es-CR", { timeZone: "America/Costa_Rica" })}
                </TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  {log.entityType}
                  {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                </TableCell>
                <TableCell>{log.actorUserId ? log.actorUserId.slice(0, 8) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
