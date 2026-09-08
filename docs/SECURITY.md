# Seguridad

Alcance: óptica en Costa Rica, datos de clientes y **datos de salud visual**, credenciales de Hacienda, certificados de firma, pagos y auditoría.

---

## 1. Amenazas principales

- Robo de sesión de cajero o admin.
- Escalada de privilegios desde el POS (el navegador no es de confianza).
- Emisión duplicada de comprobantes por doble clic, timeout o dos cajeros.
- Filtrado de P12/password/token de Hacienda.
- Manipulación de precios, descuentos o stock.
- XSS en notas de cliente o plantillas.
- Abuso de APIs públicas de Hacienda (429 / bloqueo de IP).
- Acceso no autorizado a recetas e imágenes.
- Callback de Hacienda o webhook de WhatsApp falsos.

---

## 2. Autenticación y sesión

- Sesión de servidor. Cookie `HttpOnly`, `Secure` (en HTTPS), `SameSite=Lax` o `Strict` según el flujo.
- `AUTH_SECRET` de alta entropía. Rotación documentada en Fase 12.
- Contraseñas: **Argon2id**. Nunca bcrypt como destino final si Argon2 está disponible; no SHA ni MD5.
- Expiración de sesión y reauth para descuentos altos, anulación y cambios de config Hacienda.
- MFA: el modelo tiene `mfaEnabled` / factores; **no se activa en Fase 1** (decisión D-01). La arquitectura no debe impedir TOTP después.
- Logout invalida la fila `Session`.
- No JWT de larga vida en `localStorage`. No tokens de Hacienda en el cliente.

---

## 3. Autorización (RBAC)

La UI oculta menús. **El servidor deniega.**

Roles iniciales:

| Rol | Intención |
| --- | --- |
| `SUPER_ADMIN` | Configuración global, Hacienda, permisos |
| `ADMIN` | Operación completa de la óptica salvo secretos de firma si se separa |
| `MANAGER` | Reportes, descuentos, sucursal |
| `OPTOMETRIST` | Agenda propia, recetas, expediente |
| `SALES` | Clientes, cotizaciones, POS limitado |
| `CASHIER` | POS, cobros, no cambia costos ni CABYS masivo |
| `INVENTORY` | Productos, compras, ajustes de stock |

Permisos como datos, no ifs repartidos en React. Ejemplos: `sale.discount.authorize`, `inventory.allow_negative`, `hacienda.submit`, `prescription.read`.

---

## 4. Frontera HTTP

- Validación Zod en Server Actions y Route Handlers.
- CSRF: cookies SameSite + origin check en mutaciones; tokens CSRF si se usan cookies cross-site.
- Rate limit: login, callback Hacienda (además de auth), webhooks, portal público de citas, proxy CABYS/AE.
- Headers: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Uploads: mime allowlist, tamaño máximo, virus scan en Fase 12 si hay adjuntos de receta; nombres no ejecutables.
- IDs públicos: UUID/token. No enumerar `/customers/1`.

---

## 5. Datos y SQL

- Solo Prisma parametrizado. Cero SQL concatenado con input de usuario.
- Recetas e identificaciones: cifrado en reposo del disco (volumen) como mínimo; evaluar cifrado de columnas de identificación en Fase 12 (D-08).
- Soft-delete. Retención fiscal de XML: al menos el plazo legal de conservación de comprobantes (verificar en Decreto 44739-H / Código Tributario al implementar backups; no inventar años aquí).
- Ley 8968 (protección de datos personales) y datos de salud: consentimiento, minimización, acceso por rol, no usar recetas para marketing.

---

## 6. Secretos y Hacienda

| Secreto | Dónde | Prohibido |
| --- | --- | --- |
| `HACIENDA_PASSWORD` | env / secret manager, servidor | logs, frontend, git |
| `HACIENDA_CERTIFICATE_PASSWORD` | igual | igual |
| P12/PFX | disco protegido o KMS, no repo | imprimir, backups no cifrados |
| Access token IdP | memoria servidor, TTL ~5 min (Anexo 3) | localStorage, cookies de app |
| `WHATSAPP_ACCESS_TOKEN` | servidor | frontend |
| `AUTH_SECRET` | env | |

`HACIENDA_ENVIRONMENT` default `sandbox`. Production requiere valor explícito **y** `APP_ENV=production`. Un arranque mal configurado no debe apuntar a recepción productiva.

El certificado de firma no se sirve por HTTP. El signer corre en proceso servidor o sidecar interno.

---

## 7. Callbacks y webhooks

`POST /api/hacienda/callback`:

- HTTPS.
- Validar JSON contra el esquema oficial de `GET /recepcion/{clave}` (`clave`, `fecha`, `ind-estado`, `respuesta-xml`).
- Idempotente por `clave` + `ind-estado` + hash de `respuesta-xml`.
- Responder 200 rápido; procesar persistencia breve o encolar.
- No confiar solo en el callback: poll complementario (Anexo 3 lo permite vía GET).
- No autenticar el callback con secretos de usuario; si Hacienda no firma el POST, la verdad se confirma con GET autenticado al API de recepción.

WhatsApp: validar `WHATSAPP_WEBHOOK_SECRET` (Meta).

URLs de cita: HMAC + expiración; un solo uso para confirmar/cancelar si se desea.

---

## 8. POS

- Terminales autenticadas. Cierre de caja no borra ventas.
- Descuentos auditados.
- Doble submit: idempotency key por venta en el cliente + UNIQUE de clave fiscal.
- Timeout de Hacienda: no crear segunda factura.

---

## 9. Auditoría

Ver modelo `AuditLog` en `/docs/DATABASE.md`. Acciones críticas listadas en el requerimiento. Los administradores leen auditoría; no la editan.

---

## 10. Dependencias y supply chain

- Lockfile committed.
- No deshabilitar ESLint ni `any` para “pasar CI”.
- Revisar librería de firma en Fase 6: mantenimiento, tests, y si no hay evidencia de XAdES-EPES compatible con Hacienda, sidecar, no fork cripto.

---

## 11. Variables de entorno

Plantilla en `/.env.example`. Completar el mapa en Fase 1 con validación Zod de env al boot (`src/server/env.ts`). Falta de `AUTH_SECRET` o URL de base = proceso no arranca.
