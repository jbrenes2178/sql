# Decisiones pendientes de aprobación

Fase 0 se detiene aquí. No se escribe el monolito hasta que estas decisiones se cierren o se acepte el default propuesto.

Leyenda: **Propuesta** = lo que se implementará en Fase 1+ si no hay objeción. **Bloqueante** = no se puede implementar bien sin respuesta.

---

## D-01 — Librería de autenticación (bloqueante de Fase 1)

Opciones:

1. **better-auth** + Prisma: sesiones, MFA futuro, cookies.
2. **Auth.js (v5)** + session strategy database.
3. Módulo propio mínimo: Argon2id + tabla `Session` + cookie firmada.

**Propuesta:** opción 3 (módulo `auth` propio, superficie pequeña, RBAC del dominio). MFA como tabla lista y no activa.

¿Se acepta, o se prefiere better-auth/Auth.js?

---

## D-02 — Firma XAdES (bloqueante de Fase 6, se diseña ya)

Opciones:

1. Evaluar librería Node existente en Fase 6 contra sandbox.
2. Comprometer desde ahora un sidecar Java o .NET con librería madura, misma interfaz `ElectronicDocumentSigner`.

**Propuesta:** interfaz primero; spike de Node en Fase 6 con criterio de salida = documento **aceptado** en sandbox. Si falla, sidecar. Cero cripto artesanal.

¿Hay preferencia de runtime para el sidecar (Java 21 / .NET 8)?

---

## D-03 — Datos fiscales del emisor (bloqueante de Fase 5)

Necesarios para XML y clave:

- Tipo y número de identificación de la óptica
- Razón social, nombre comercial, ubicación, teléfonos, correos
- Código de actividad económica
- Si el software se registrará como proveedor de sistemas o se usará la cédula propia (Anexo 1, `ProveedorSistemas`)
- Código establecimiento 001 y terminales
- Consecutivos actuales si ya emiten con otro sistema (el Anexo exige **continuar** la numeración al cambiar de plataforma)

Sin estos datos se puede construir el motor con fixtures, no un emisor real.

---

## D-04 — Política FE vs TE en el POS (bloqueante de Fase 4–5)

Hay que transcribir el Decreto 44739-H y la resolución vigente, no inventar.

Preguntas de producto, una vez leída la norma:

- ¿El cajero elige FE/TE o el sistema lo infiere si el cliente tiene identificación de contribuyente?
- ¿Existe “cliente genérico” y en qué casos legales se emite tiquete?
- ¿Se exige FE siempre que el cliente pida crédito fiscal?

**Propuesta temporal de producto (no es norma):** el POS ofrece ambos; el servidor valida la combinación contra la política implementada desde la norma en Fase 5. Hasta entonces no se envía nada a Hacienda.

---

## D-05 — Crédito, apartados y Recibo Electrónico de Pago

REP (tipo 10) existe en 4.4 y queda **apagado** en v1.

¿Los apartados y ventas a crédito de la óptica deben:

1. Emitir FE/TE al cierre de la venta y tratar abonos solo en cartera interna hasta que REP esté implementado, o
2. Bloquear crédito/apartado en POS hasta tener REP sandbox, o
3. Priorizar REP justo después de FE/TE/NC/ND (Fase 6b)?

**Propuesta:** opción 1 para no frenar el POS, con advertencia contable explícita en UI y en este documento. Confirmar con el contador de la óptica.

---

## D-06 — Consecutivos al agotar 10 dígitos

El Anexo permite reiniciar en 1. **Propuesta:** no reiniciar automático; alerta a `SUPER_ADMIN` al 90% y bloqueo controlado. ¿De acuerdo?

---

## D-07 — Motor de PDF

Opciones: `@react-pdf/renderer`, Puppeteer, o servicio de impresión.

**Propuesta:** `@react-pdf/renderer` en servidor (sin Chrome). Si el QR o el layout oficial no se logran, se evalúa Chromium en Fase 7.

---

## D-08 — Cifrado de expediente óptico

**Propuesta Fase 2:** recetas en PostgreSQL + archivos en storage con ACL. Cifrado de columna de identificaciones en Fase 12 si se exige. ¿Hay requisito de cifrado de campo ya?

---

## D-09 — Hosting y backups

¿Dónde correrá (VPS Costa Rica, Fly, Railway, on-prem)? ¿PostgreSQL gestionado? Define PITR y residencia de datos (Ley 8968).

**Propuesta de diseño:** un servidor + Postgres; object storage S3-compatible para XML/PDF. Ajustable.

---

## D-10 — WhatsApp

¿Ya existe cuenta WhatsApp Business Platform (Cloud API) y plantillas aprobadas por Meta? Sin eso, Fase 9 queda en email + cola.

**Propuesta:** interfaz `MessagingProvider` en Fase 9; WhatsApp se conecta cuando haya credenciales.

---

## D-11 — Marca y nombre del producto

El repo se llama `sql`. ¿Nombre comercial del sistema y de la óptica para UI, PDF y `ProveedorSistemas`?

**Propuesta de código interno:** `optica-cr` hasta tener marca.

---

## D-12 — Alcance de la primera sucursal

¿Inventario y caja únicos, o hay que nacer con N sucursales reales (códigos 001, 002…)? El modelo soporta N. El seed de Fase 1 puede ser una sucursal.

---

## D-13 — Confirmación de Anexos 22/04/2026

`www.hacienda.go.cr/docs/ANEXOS_Y_ESTRUCTURAS_V4.4.pdf` no se pudo descargar (HTTP 400). ATV sí. En Fase 5 se comparará. Si el PDF de hacienda.go.cr es más nuevo, **ese** pasa a ser la copia canónica.

¿Hay un archivo interno más reciente que deba usarse como fuente?

---

## D-14 — Ambiente sandbox de Hacienda

¿La óptica ya tiene usuario/contraseña y llave criptográfica de **pruebas** en ATV? Fase 6 no puede cerrarse sin eso. Las URLs de token sandbox deben copiarse de la guía oficial, no de foros.

---

## D-15 — Cola de trabajos

**Propuesta:** pg-boss (misma PostgreSQL). Alternativa: Graphile Worker. ¿Objeción a no introducir Redis en v1?

---

## Defaults que se consideran aprobados si no se objeta

- Monolito Next.js 16 + Prisma + PostgreSQL + Zod + shadcn.
- Español, `America/Costa_Rica`, CRC.
- `HACIENDA_ENVIRONMENT=sandbox` por defecto.
- FEC/FEE/REP deshabilitados.
- No microservicios.
- No WhatsApp Web scraping.
- No migraciones destructivas automáticas.
