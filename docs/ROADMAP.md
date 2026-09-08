# Roadmap de implementación

Trabajo por fases. Cada fase termina con lint, typecheck, tests de lo construido, revisión de migraciones, documentación actualizada y un informe de riesgos. **No se declara un módulo terminado sin pruebas.**

No se estiman calendarios. El orden es técnico y de dependencia.

---

## Criterios de salida de cada fase

- `lint` limpio (sin desactivar reglas para esconder errores).
- `typecheck` estricto (sin `any` injustificado).
- Tests del alcance de la fase en verde. Un test que falla se corrige o se documenta; no se borra.
- Migraciones revisadas; ninguna destructiva automática.
- Documentación de la fase actualizada.
- Decisiones de arquitectura nuevas explicadas, no silenciosas.

---

## Fase 0 — Arquitectura

**Objetivo:** inspeccionar el repo, fijar arquitectura, modelo, seguridad, estrategia Hacienda y pendientes.

**Entregables:** `/docs/*`, copias oficiales en `/docs/hacienda/`.

**Salida:** `/docs/DECISIONS.md` aprobado el 2026-09-07 America/Costa_Rica, con ajustes.

---

## Fase 1 — Base técnica, PostgreSQL, Prisma, autenticación y usuarios

**Estado:** implementada. Detalle en `docs/PHASE-1.md`. **No iniciar Fase 2.**

**Construye:**

- Next.js + TypeScript + Tailwind + shadcn/ui + Prisma.
- PostgreSQL, `Organization`, `Branch`, `PosTerminal`, `User`, `Role`, `Permission`, `UserRole`.
- Better Auth (sesiones DB, cookies, `disableSignUp`); RBAC de dominio en servidor.
- Worker pg-boss independiente (`worker/index.ts`).
- Layout admin con sidebar filtrado por permisos (la UI no es la fuente de verdad).
- Reloj `America/Costa_Rica`, moneda CRC, logging estructurado.
- Seed de desarrollo: 1 org, 1 sucursal, 1 terminal, roles y `SUPER_ADMIN` vía env.

**Pruebas:** unitarias de RBAC/scope/Zod; integración PostgreSQL; Playwright login/logout.

**Bloquea Fase 2 si:** no hay sesión persistente segura ni RBAC servidor.

---

## Fase 2 — Clientes, expedientes y recetas

**Construye:**

- Clientes, direcciones, contactos, notas, consentimiento de comunicaciones.
- Profesionales y horarios (mínimo para asociar recetas).
- Recetas inmutables: `Prescription` + `PrescriptionEyeDetail` + adjuntos. Nunca overwrite.
- Línea de tiempo del cliente (citas/ventas/facturas se irán enganchando en fases siguientes).
- Consulta de contribuyente `GET /fe/ae` con caché (sin llamar en cada render).

**Pruebas:** historial de recetas, validación de identificación, caché de AE.

---

## Fase 3 — Productos, CABYS e inventario

**Construye:**

- Marcas, categorías, productos, variantes (monturas, lentes, LC, accesorios).
- CABYS persistido en producto (13 caracteres según XSD / API). Selector con API oficial + caché + 429.
- Inventario por sucursal, mínimos, movimientos.
- Compras a proveedor (sin FEC todavía).
- Política de stock negativo configurable.

**Pruebas:** movimiento transaccional, no negativo, búsqueda CABYS cacheada.

---

## Fase 4 — POS, ventas y pagos

**Construye:**

- POS escritorio/tablet: cliente, scan, cantidades, descuentos autorizados, mix de pagos.
- Cotizaciones, ventas, apartados, abonos, crédito.
- Copia de precio/impuesto/CABYS a la línea.
- Totales con Decimal (política en `/src/lib/money`, alineada a `DecimalDineroType` del XSD: 18 dígitos, 5 decimales).
- Evento de dominio `SaleConfirmed` **sin** emitir XML todavía (o emitiendo solo DRAFT interno si se adelanta el esqueleto).

**Pruebas:** totales, descuentos, pagos mixtos, concurrencia de stock, apartado.

**No incluye:** envío a Hacienda.

---

## Fase 5 — Motor fiscal local y XML v4.4

**Construye:**

- Re-descarga y comparación de XSD/Anexos (`/docs/hacienda/SOURCES.md`).
- Copia de XSD oficiales a `src/modules/electronic-invoicing/infrastructure/schemas/v4.4/` (sin modificar).
- Catálogo de campos obligatorio/condicional/opcional **extraído del XSD y del Anexo 1**, no de memoria.
- DTOs Zod + builders: FE, TE, NC, ND.
- `HaciendaKeyGenerator`, `HaciendaConsecutiveGenerator` atómico + UNIQUE.
- Validación XML vs XSD.
- Fixtures válidos e inválidos.
- FEC, FEE, REP: interfaces y enum, **feature flag off**.

**Pruebas:** clave, consecutivo, totales, impuestos, descuentos, CABYS, IDs, moneda, XML, XSD, concurrencia de cajeros.

**No incluye:** firma real ni POST a Hacienda.

---

## Fase 6 — Firma XAdES y sandbox Hacienda

**Construye:**

- `ElectronicDocumentSigner` (interfaz estable).
- Evaluación de librería Node madura; si no cumple XAdES-EPES enveloped + política oficial, **sidecar aislado** (ver D-02). No hay cripto casera.
- `HaciendaAuthClient` (token servidor, expiry 5 min según Anexo 3, mutex de refresh, 401).
- `HaciendaReceptionClient`: POST, GET estado, callback, timeout, retry, idempotencia por clave.
- `POST /api/hacienda/callback`.
- Poll de `SENT` / `RECEIVED` / `PROCESSING`.
- Ambiente default `sandbox`. Production exige flag explícito.

**Puerta de producción:** documentos **aceptados** en sandbox. Un 201 no basta.

---

## Fase 7 — PDF y entrega de comprobantes

**Construye:**

- Representación gráfica con los campos que el Anexo 1 exige juntos: tipo, clave, consecutivo (Nota 1).
- Entrega al cliente: XML, XML respuesta, PDF. El PDF no es el comprobante fiscal.
- Reenvío de documentos. UI de admin de solo lectura para XML firmado y respuesta.

---

## Fase 8 — Agenda y portal de citas

**Construye:**

- Agenda día/semana/mes, por sucursal y profesional.
- PWA pública con tokens.
- Estados e historial.
- Reprogramación atómica.

---

## Fase 9 — WhatsApp, correo y automatizaciones

**Construye:**

- `MessagingProvider`, `WhatsAppProvider` (Cloud API oficial), `EmailProvider`.
- Plantillas listadas en el requerimiento.
- Eventos de cita + recordatorio 24 h.
- Estados `queued/sent/delivered/read/failed` cuando el proveedor los entregue.

---

## Fase 10 — Órdenes de laboratorio

**Construye:**

- Workflow `CREATED` → `DELIVERED`.
- Relación cliente, venta, montura, lentes, receta, laboratorio.
- Notificación en `READY_FOR_PICKUP`.

---

## Fase 11 — Dashboard y reportes

**Construye:**

- KPIs: ventas hoy/mes, citas, no-show, clientes nuevos, órdenes, bajo stock, CxC, ticket promedio.
- Reportes: ventas, utilidad, inventario, CABYS, impuestos, pagos, profesionales, documentos rechazados por Hacienda.

Los reportes fiscales leen **snapshots** de documentos emitidos, no recalculan IVA con tarifas actuales.

---

## Fase 12 — Hardening, backups, auditoría y preparación de producción

**Construye:**

- Auditoría completa de acciones críticas.
- Rate limiting, headers, revisión CSRF, secretos, backups, runbooks.
- MFA opcional (si D-01 lo contempla).
- Checklist de producción: sandbox aceptado, `HACIENDA_ENVIRONMENT` no default prod, certificados en almacén protegido, backups restaurados al menos una vez.

**Producción fiscal bloqueada** hasta Fase 6+12 con evidencia de aceptación sandbox.

---

## Orden exacto de construcción (resumen)

```
0 Arquitectura
1 Auth + sucursales + usuarios
2 Clientes + recetas
3 Productos + CABYS + inventario
4 POS + ventas + pagos
5 XML v4.4 local + clave/consecutivo + XSD
6 Firma + sandbox Hacienda
7 PDF + entrega
8 Citas + PWA
9 WhatsApp/email
10 Laboratorio
11 Dashboard
12 Hardening y backups
```

Dependencias fuertes: 4 necesita 3; 5 necesita 4; 6 necesita 5; 7 necesita 6 para el XML definitivo (el PDF puede esbozarse antes, pero no se declara fiscalmente listo); 10 se beneficia de 4 y 2; 11 necesita datos de 4, 8 y 6.

---

## Fuera de alcance de v1 (explícito)

- Multi-empresa SaaS (sí multi-sucursal de una óptica).
- Factura electrónica de compra, exportación y recibo electrónico de pago (arquitectura lista, emisión apagada).
- App nativa móvil de cajero.
- Contabilidad general (asientos). El sistema registra ventas/impuestos; no sustituye un contador.
- Scraping de WhatsApp Web.
