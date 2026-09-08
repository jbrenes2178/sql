# Fase 1 — Base técnica

**Estado:** implementada. **No avanzar a Fase 2.**  
**Timezone de negocio:** `America/Costa_Rica`.  
**Nombre interno:** `optica-cr`.

## Objetivo

Base técnica únicamente:

1. Next.js App Router  
2. TypeScript strict  
3. PostgreSQL  
4. Prisma  
5. Better Auth  
6. Usuarios  
7. Roles y permisos  
8. Organización  
9. Sucursales  
10. Terminales POS  
11. Auditoría básica  
12. Worker pg-boss  
13. Seed de desarrollo  
14. Testing base  
15. Calidad CI  

**No implementado (TODO de fases posteriores, no de esta):**

- clientes, recetas, expedientes clínicos
- inventario, productos, CABYS
- ventas, POS, citas
- WhatsApp
- Hacienda, XML, XAdES, PDF fiscal

## Runtime y versiones exactas

| Pieza | Versión |
| --- | --- |
| Node.js | 22 (`.nvmrc`, `engines.node`: `>=22.0.0 <23`) |
| next | 16.3.4 |
| react / react-dom | 19.2.8 |
| typescript | 5.9.3 |
| tailwindcss / `@tailwindcss/postcss` | 4.3.3 |
| prisma / `@prisma/client` / `@prisma/adapter-pg` | 7.10.0 |
| better-auth | 1.7.3 |
| zod | 4.5.4 |
| pg-boss | 12.30.0 |
| pg | 8.16.3 |
| `@node-rs/argon2` | 2.0.2 |
| uuid | 13.0.0 |
| vitest | 3.2.4 |
| @playwright/test | 1.55.1 |
| eslint / eslint-config-next | 9.39.5 / 16.3.4 |

Lockfile: `package-lock.json`. Sin versiones beta/canary.

## Comandos

Ver `README.md`. Resumen:

```bash
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev          # HTTP
npm run worker       # jobs
npm run lint && npx tsc --noEmit && npm test && npm run test:integration && npm run build
```

PostgreSQL local de desarrollo:

```
DATABASE_URL=postgresql://optica:optica@localhost:5432/optica?schema=public
TEST_DATABASE_URL=postgresql://optica:optica@localhost:5432/optica_test?schema=public
```

No se usa SQLite. Testcontainers/Docker no son obligatorios; las pruebas de integración hablan a PostgreSQL real. En CI hay un servicio `postgres:16`.

## Arquitectura de autenticación

- Better Auth + Prisma + PostgreSQL (D-01).
- Email/password. `disableSignUp: true` — no hay registro público ni ruta `/register`.
- Sesiones en tabla `session`. Logout borra la sesión.
- Cookies httpOnly, SameSite=Lax, `Secure` solo en producción.
- Hasher Argon2id (`@node-rs/argon2`) enchufado en `emailAndPassword.password`.
- Usuarios `active=false` no obtienen sesión (`databaseHooks.session.create.before`) y se les revocan sesiones al deshabilitar.
- MFA: infraestructura de Better Auth disponible; plugin 2FA **no habilitado**.
- El primer `SUPER_ADMIN` nace del seed (`SEED_ADMIN_*`), nunca hardcoded.
- Cuentas `credential`: Better Auth 1.7 exige `account.accountId === user.id` (no el email).

El dominio posee `Role`, `Permission`, `UserRole`, `RolePermission` y campos de `User` (`active`, `organizationId`, `defaultBranchId`).

## RBAC

Única API: `authorize(actor, permission, context)` en `src/modules/auth/application/authorize.ts`.

- Roles: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `OPTOMETRIST`, `SALES`, `CASHIER`, `INVENTORY`.
- Permisos granulares (`users.read`, `branches.create`, `audit.read`, …).
- `SUPER_ADMIN` bypasea permisos **dentro de su organización**. No bypasea el scope de otra org (evita fuga multi-tenant).
- La UI filtra el sidebar; **el servidor deniega**.
- Prohibido `if (user.role === "ADMIN")` repartido.

`organizationId` y sucursal autorizada salen de la sesión (`organizationIdFromActor`). Los formularios no envían `organizationId`.

## Worker

Dos entrypoints del mismo monolito:

1. Next.js — puede **encolar** (`src/server/jobs/client.ts`)
2. `worker/index.ts` — **procesa** (`src/server/jobs/worker.ts`)

Job de Fase 1: `system.health-check`. Sin recordatorios, Hacienda ni WhatsApp. Sin Redis (D-15). pg-boss usa PostgreSQL.

El worker maneja SIGTERM/SIGINT, errores y logs JSON. No se arranca dentro de un request de Next.js.

## Seed

Crea:

- Organization «Óptica Demo»
- Branch «Sucursal Central» (`001`)
- PosTerminal «Caja 1» (`001`)
- catálogo de roles/permisos
- `SUPER_ADMIN` con hash Argon2id

Bloqueado en producción salvo token explícito.

## UI

Español. Rutas: `/login`, `/admin`, `/admin/users`, `/admin/branches`, `/admin/audit`.

## IDs

Política única: **UUIDv7** (`String @id @db.Uuid`, Prisma `@default(uuid(7))` en dominio; Better Auth `generateId` = `uuidv7` para user/session/account/verification).

## Criterio de cierre

| Ítem | Estado |
| --- | --- |
| Next.js levanta | sí |
| PostgreSQL + migraciones | sí |
| Better Auth login/logout | sí |
| Registro público deshabilitado | sí |
| SUPER_ADMIN seed | sí |
| Usuarios / RBAC servidor | sí |
| Org / sucursal / POS | sí |
| Auditoría | sí |
| Worker independiente | sí |
| lint / typecheck / tests / build | ver PR / CI |
| Documentación | este archivo + docs/* |
| Secretos no commiteados | `.env` gitignored |

## Desviaciones respecto a Fase 0

- Prisma **7.10.0** (no 8 RC): cliente generado en `src/generated/prisma` + adapter `pg`.
- Next.js 16 usa `src/proxy.ts` (gate por cookie) en lugar de `middleware.ts`.
- Testcontainers no se usa: no hay Docker obligatorio; PostgreSQL real (local o servicio CI).
- shadcn/ui materializado a mano (Button/Input/Card/Table) sobre Tailwind 4 + `radix-ui`; no se usó el CLI interactivo.
- `SUPER_ADMIN` no es global inter-organización: el bypass es de permisos, no de tenant.
- No se añadió `engines` de PaaS ni `vercel.json`.
