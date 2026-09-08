import {
  authorize,
  type AuthorizationActor,
} from "@/modules/auth/application/authorize";
import { organizationIdFromActor } from "@/modules/auth/application/scope";
import { NotFoundError } from "@/modules/auth/domain/errors";
import { prisma } from "@/server/db/prisma";

export async function getOrganizationOverview(actor: AuthorizationActor) {
  const organizationId = organizationIdFromActor(actor);
  authorize(actor, "organization.read", { organizationId });

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organization) {
    throw new NotFoundError("Organización no encontrada");
  }

  const [branchCount, userCount, terminalCount] = await Promise.all([
    prisma.branch.count({ where: { organizationId } }),
    prisma.user.count({ where: { organizationId } }),
    prisma.posTerminal.count({ where: { organizationId } }),
  ]);

  return { organization, branchCount, userCount, terminalCount };
}
