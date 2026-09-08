# Óptica CR

Sistema de producción para una óptica en Costa Rica. Nombre interno: **`optica-cr`**.

- Idioma: español
- Zona horaria: `America/Costa_Rica`
- Moneda: CRC
- Fase actual: **1 — base técnica** (auth, RBAC, org/sucursal, auditoría, worker)

No hay POS, clientes, inventario ni Hacienda en esta fase.

## Requisitos

- Node.js **22** (ver `.nvmrc`). No usar 23+ ni 20.
- PostgreSQL **16+**
- npm 10+

## Arranque local

```bash
cp .env.example .env
# Edite SEED_ADMIN_PASSWORD (mínimo 12) y BETTER_AUTH_SECRET (≥ 32 caracteres)

# PostgreSQL de ejemplo:
#   sudo -u postgres createuser optica
#   sudo -u postgres createdb -O optica optica
#   sudo -u postgres createdb -O optica optica_test

npm ci
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

En otra terminal:

```bash
npm run worker
```

Abrir http://localhost:3000 — redirige a `/login`.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Next.js en desarrollo |
| `npm run build` / `start` | Producción HTTP |
| `npm run worker` | Worker pg-boss (proceso aparte) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unitario |
| `npm run test:integration` | Vitest + PostgreSQL real (`TEST_DATABASE_URL`) |
| `npm run test:e2e` | Playwright login → admin → logout |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Seed de **desarrollo** |

## Primer administrador

El `SUPER_ADMIN` no se registra por UI. Sale del seed:

```
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

El seed se niega en `APP_ENV=production` salvo `ALLOW_PRODUCTION_SEED=I_UNDERSTAND_THIS_IS_DESTRUCTIVE`.

## Documentación

- `docs/PHASE-1.md` — alcance y cierre de esta fase
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/SECURITY.md`
- `docs/TESTING.md`
- `docs/DECISIONS.md`
- `docs/ROADMAP.md`
- `docs/HACIENDA.md` — no aplica a Fase 1

## Hosting

Portable por variables de entorno (D-09). No hay acoplamiento a Vercel, Railway, AWS ni Fly.io. Dos procesos del mismo repo: app Next.js y `worker/index.ts`.
