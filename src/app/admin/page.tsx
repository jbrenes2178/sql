import { HealthCheckButton } from "@/components/health-check-button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/modules/auth/application/authorize";
import { requireActor } from "@/modules/auth/application/session";
import { getOrganizationOverview } from "@/modules/organization/application/get-organization";

export default async function AdminHomePage() {
  const actor = await requireActor();
  const overview = await getOrganizationOverview(actor);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inicio</h1>
        <p className="text-sm text-slate-600">
          Base técnica de Fase 1. Sin POS, clientes ni Hacienda.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle>{overview.organization.tradeName}</CardTitle>
          <CardDescription>
            {overview.organization.legalName} · {overview.organization.timezone} ·{" "}
            {overview.organization.defaultCurrency}
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>{overview.branchCount} sucursales</CardTitle>
          <CardDescription>{overview.terminalCount} terminales POS</CardDescription>
        </Card>
        <Card>
          <CardTitle>{overview.userCount} usuarios</CardTitle>
          <CardDescription>RBAC y sesiones en servidor</CardDescription>
        </Card>
      </div>
      {hasPermission(actor, "organization.read") ? (
        <Card>
          <CardTitle>Cola de trabajos</CardTitle>
          <CardDescription>
            El worker independiente procesa `system.health-check`. El proceso web solo encola.
          </CardDescription>
          <div className="mt-4">
            <HealthCheckButton />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
