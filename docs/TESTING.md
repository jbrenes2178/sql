# Estrategia de pruebas

Ningún módulo se declara terminado sin pruebas. Un test que falla se corrige o se documenta el defecto; no se borra ni se relaja TypeScript/ESLint para obtener verde falso.

---

## 1. Pirámide

| Nivel | Herramienta | Qué cubre |
| --- | --- | --- |
| Unitarias | Vitest | Dinero, clave, consecutivo, políticas RBAC, parsers Zod, DocumentTypePolicy |
| Integración | Vitest + Testcontainers PostgreSQL | Transacciones de venta, stock, `SELECT FOR UPDATE` de consecutivos, idempotencia |
| Contrato XSD | Vitest + validador XML | Fixtures vs XSD oficiales v4.4 |
| HTTP Hacienda | Tests de contrato con fixtures del HTML oficial | POST 201, GET `ind-estado`, callback duplicado, 400/401/429 |
| E2E | Playwright | Login, POS feliz, reserva PWA, permisos denegados |
| Sandbox real | Suite opt-in `HACIENDA_SANDBOX_E2E=1` | Firma + aceptación real. No corre en CI sin secretos |

---

## 2. Dinero

Prohibido `number` en cálculos fiscales. Suite `money.test.ts`:

- Suma de líneas = totales de resumen según fórmulas del XSD (p. ej. `MontoTotalLinea`, `TotalVenta`, `TotalComprobante` — textos de documentación del propio XSD).
- Redondeo a 5 decimales según Anexo 1, con los ejemplos oficiales del PDF.
- Descuentos e impuestos. Casos con 0, 1 y N líneas.
- CRC vs USD: el tipo de cambio snapshot no se reaplica después.

---

## 3. Clave y consecutivo

- Longitud y charset (`\d{20}`, `\d{50}`).
- Padding de cédula Nota 4.1.
- Códigos de tipo 01–04.
- Situación 1/2/3.
- Dos cajeros simultáneos: no hay claves ni consecutivos duplicados (test de integración con transacciones paralelas).
- UNIQUE de Prisma/PostgreSQL como red de seguridad.

---

## 4. XML / XSD / Base64 / firma

Por cada tipo habilitado:

- Fixture válido (construido desde DTO) pasa XSD.
- Fixture con nodo prohibido (condición 4) falla XSD o validación Zod.
- CABYS ≠ 13 caracteres falla.
- Firma: el XML firmado sigue siendo XML well-formed; contiene `ds:Signature` enveloped. La **aceptación** solo se afirma con sandbox.
- Base64: UTF-8 roundtrip.

No se versionan certificados reales. Certificados de test locales, nunca de producción.

---

## 5. Envío, timeout, reintento, callback

- POST 201 → estado `SENT`, no `ACCEPTED`.
- GET `aceptado` → `ACCEPTED` + persistencia de `respuesta-xml`.
- GET `rechazado` → `REJECTED`, errores parseados del XML de respuesta cuando exista.
- Timeout de POST: GET por clave; si existe, no reenviar cuerpo distinto; si 400 “no existe”, un único reintento idempotente del **mismo** payload.
- Callback duplicado: segunda vez no duplica historial contradictorio.
- 401: refresh token y un reintento; si falla, `ERROR` sanitizado.
- 429: backoff; no tormenta de polling.

---

## 6. POS e inventario

- Stock no negativo (salvo flag).
- Reserva + venta concurrente.
- Pagos mixtos = total.
- Descuento sin permiso → 403.
- Apartado: abonos no superan saldo.

---

## 7. Citas

- Solape de profesional rechazado.
- Token expirado no confirma.
- Reprogramar: slot viejo libre, nuevo bloqueado atómicamente (dos requests al mismo hueco: uno gana).

---

## 8. Seguridad

- Rutas admin sin cookie → 401.
- Cajero no cambia permisos ni config Hacienda.
- Logs de un login fallido no contienen la contraseña.
- Env de producción no arranca con `HACIENDA_ENVIRONMENT` implícito.

---

## 9. E2E de UI

Playwright contra app local + Postgres de test:

1. Login admin.
2. Alta de cliente y receta (Fase 2+).
3. Producto con CABYS de fixture (mock de API pública).
4. Venta POS y movimiento de inventario.
5. Portal: reservar cita con token (Fase 8).

Fiscal sandbox no se mezcla con el E2E de CI por defecto.

---

## 10. Fixtures fiscales

`tests/fixtures/fiscal/v4.4/` — XML de ejemplo **sintéticos** alineados al XSD, sin datos reales de clientes.  
Al obtener aceptaciones de sandbox, se guarda evidencia **sin** certificados ni passwords en `docs/hacienda/sandbox-evidence/` (git-cignore de secretos).
