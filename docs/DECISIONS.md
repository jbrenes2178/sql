# Decisiones de arquitectura

Las decisiones de Fase 0 fueron **aprobadas el 2026-09-07 (America/Costa_Rica)** con los ajustes de este documento. Lo que sigue es la fuente de verdad para implementación.

Leyenda: **Cerrada** = se implementa así. **Aplazada** = no bloquea Fase 1; se retoma en la fase indicada.

---

## D-01 — Autenticación — CERRADA

**Usar Better Auth + Prisma + PostgreSQL.** No construir un sistema de autenticación propio.

Better Auth es responsable de:

- autenticación email/password
- sesiones en base de datos
- cookies httpOnly (`Secure` en producción, SameSite apropiado)
- credenciales (hashing; ver `docs/SECURITY.md`)
- infraestructura para MFA futura (plugin 2FA **no habilitado** en Fase 1)

El dominio de la aplicación es responsable de:

- `User` (campos de negocio: `active`, `organizationId`, `defaultBranchId`)
- `Role`, `Permission`, `UserRole`, `RolePermission`
- permisos por sucursal
- políticas RBAC (`authorize`)

Nunca autorizar solo en frontend. Todo permiso se comprueba en servidor (Server Actions, Route Handlers, servicios).

Registro público **deshabilitado** (`emailAndPassword.disableSignUp: true`). Los usuarios los crea un administrador. El primer `SUPER_ADMIN` sale del seed de desarrollo.

---

## D-02 — Firma XAdES — CERRADA (implementación en Fase 6)

Mantener la interfaz `ElectronicDocumentSigner`. **No implementar firma en Fase 1.**

En Fase 6:

1. Evaluar una solución Node madura.
2. Probar contra sandbox real de Hacienda.
3. Criterio de aceptación = comprobante **aceptado** por Hacienda (no un HTTP 201).
4. Si no cumple, sidecar Java/.NET detrás de la misma interfaz.

Prohibido implementar criptografía propia.

---

## D-03 — Datos reales del emisor — CERRADA (aplazada a fases fiscales)

No son necesarios todavía. Fase 1 usa **seed de desarrollo**:

- Organization: «Óptica Demo»
- Branch: «Sucursal Central»
- PosTerminal: «Caja 1»

No solicitar credenciales Hacienda, certificado P12/PFX, contraseña Hacienda ni consecutivos reales hasta las fases fiscales (5–6). No añadir campos fiscales v4.4 arbitrarios a `Organization` en Fase 1.

---

## D-04 — FE vs TE — CERRADA (implementación en Fase 5)

No implementar reglas fiscales definitivas ahora. La política se documentará e implementará desde la normativa oficial vigente en Fase 5. **No enviar ningún documento a Hacienda en Fase 1.**

---

## D-05 — REP — CERRADA

REP permanece deshabilitado. No condiciona Fase 1.

El tratamiento comercial de crédito/apartados vs emisión de REP se retoma cuando exista POS (Fase 4) y el motor fiscal (Fase 5–6). No se inventa comportamiento fiscal mientras tanto.

---

## D-06 — Consecutivos al agotar 10 dígitos — CERRADA (no implementar aún)

Aprobado: alerta preventiva y bloqueo controlado. No reinicio silencioso. Implementación en Fase 5 junto al generador de consecutivos.

---

## D-07 — PDF — CERRADA (no implementar aún)

Aprobado inicialmente: `@react-pdf/renderer` en servidor. Fase 7.

---

## D-08 — Protección de datos — CERRADA (parcial)

No implementar expediente clínico en Fase 1.

La arquitectura debe permitir cifrado de campos sensibles y almacenamiento protegido después. No diseñar dependencias que obliguen a guardar secretos o documentos sensibles como texto público. Adjuntos futuros van a storage con ACL, no a columnas de texto libre en la UI.

---

## D-09 — Hosting — APLAZADA

Pendiente el proveedor. Por lo tanto:

- **No** acoplar la aplicación a Vercel, Railway, AWS, Fly.io u otro PaaS.
- Portable mediante variables de entorno.
- Dos entrypoints del mismo repo: app Next.js y worker Node de pg-boss.

---

## D-10 — WhatsApp — CERRADA (no implementar aún)

Aprobado el puerto `MessagingProvider`. WhatsApp Cloud API en Fase 9. No scraping.

---

## D-11 — Nombre interno — CERRADA

Nombre interno temporal: **`optica-cr`**. No usar `sql` como nombre de aplicación en código, `package.json`, UI ni logs.

---

## D-12 — Multi-sucursal — CERRADA

Modelo multi-sucursal desde el esquema. Seed inicial: 1 organización, 1 sucursal, 1 terminal POS.

---

## D-13 / D-14 — Anexos y sandbox Hacienda — APLAZADAS

Se resuelven antes de la implementación fiscal real (Fases 5–6). No bloquean Fase 1.

---

## D-15 — Job queue — CERRADA

**pg-boss sobre PostgreSQL.** Sin Redis.

El procesamiento de jobs **no** depende del lifecycle del proceso web de Next.js.

Dos entrypoints desplegables desde el mismo repositorio:

1. aplicación Next.js (puede **encolar**)
2. worker Node (`worker/index.ts`) que **procesa**

Ambos pertenecen al mismo monolito modular y comparten dominio, servicios y PostgreSQL. No iniciar workers dentro de cada request de Next.js.

Job inicial de Fase 1: `system.health-check` únicamente.

---

## Defaults vigentes

- Monolito Next.js + Prisma + PostgreSQL + Zod + shadcn/ui.
- Español, `America/Costa_Rica`, CRC.
- `HACIENDA_ENVIRONMENT=sandbox` por defecto cuando exista config fiscal.
- FEC / FEE / REP deshabilitados.
- IDs: UUIDv7 en todas las PK de dominio (política única; ver `docs/DATABASE.md`).
- No microservicios.
- No migraciones destructivas automáticas.
