# Integración Ministerio de Hacienda — Comprobantes Electrónicos 4.4

**Estado:** diseño. Ningún XML se genera en Fase 0.  
**Versión objetivo:** 4.4, según copias oficiales en `/docs/hacienda/` capturadas el 2026-09-07 America/Costa_Rica (2026-09-08 UTC).  
**Regla:** si este documento y un XSD/PDF oficial discrepan, prevalece el artefacto oficial versionado. No se rellenan huecos con memoria.

Índice de fuentes: `/docs/hacienda/SOURCES.md`.

---

## 1. Qué se implementará y qué queda apagado

| Tipo | Código consecutivo (Anexo 1 Nota 3) | XSD local | v1 |
| --- | --- | --- | --- |
| Factura Electrónica | 01 | `FacturaElectronica_V4.4.xsd` | Sí, tras sandbox |
| Nota de Débito Electrónica | 02 | `NotaDebitoElectronica_V4.4.xsd` | Sí, tras sandbox |
| Nota de Crédito Electrónica | 03 | `NotaCreditoElectronica_V4.4.xsd` | Sí, tras sandbox |
| Tiquete Electrónico | 04 | `TiqueteElectronico_V4.4.xsd` | Sí, tras sandbox |
| Confirmaciones receptor 05–07 | — | `MensajeReceptor_V4.4.xsd` | Fuera de POS v1 (arquitectura lista) |
| Factura Electrónica de Compra | 08 | `FacturaElectronicaCompra_V4.4.xsd` | No emitir |
| Factura Electrónica de Exportación | 09 | `FacturaElectronicaExportacion_V4.4.xsd` | No emitir |
| Recibo Electrónico de Pago | 10 | `ReciboElectronicoPago_V4.4.xsd` | No emitir |

Mensaje de Hacienda: `MensajeHacienda_V4.4.xsd` (respuesta del validador).

Adapter: `CostaRicaHaciendaAdapter`. Puerto estable para una futura versión 4.x.

---

## 2. Corrección de documentos

Anexo 1: *“Toda corrección de un documento electrónico debe ser realizada vía nota de crédito o débito electrónica ya que no se permite la modificación ni la eliminación del mismo.”*

Un documento `aceptado` no se edita. El POS puede registrar una anulación comercial interna solo si **aún no** existe comprobante enviado; si existe, el camino es NC/ND referenciando la clave original (Anexo 1, Información de referencia).

---

## 3. Clave y consecutivo (Anexo 1 Nota 3 + XSD)

### Consecutivo — 20 dígitos numéricos (`NumeroConsecutivoType` = `\d{20}`)

| Posiciones | Contenido |
| --- | --- |
| 1–3 | Local/establecimiento. `001` casa matriz; `002+` sucursales |
| 4–8 | Terminal / punto de venta. Una sola terminal: `00001` |
| 9–10 | Tipo de comprobante (tabla de la sección 1) |
| 11–20 | Numeración por sucursal o terminal, inicia en 1 |

Si se agota, el Anexo permite reiniciar en 1. El sistema no reiniciará en silencio: alarma de saturación (decisión operativa D-06).

Generación: fila `HaciendaConsecutiveCounter` + `SELECT FOR UPDATE`. UNIQUE en BD. Prohibido `MAX()+1` sin bloqueo.

### Clave — 50 dígitos numéricos (`ClaveType` = `\d{50}`)

| Posiciones | Contenido |
| --- | --- |
| 1–3 | País `506` |
| 4–5 | Día de generación |
| 6–7 | Mes |
| 8–9 | Año (dos dígitos) |
| 10–21 | Cédula del emisor, 12 caracteres según Nota 4.1 (ceros a la izquierda por tipo) |
| 22–41 | El consecutivo de 20 dígitos |
| 42 | Situación: `1` Normal, `2` Contingencia, `3` Sin internet |
| 43–50 | Código de seguridad generado por el sistema del obligado |

La fecha de emisión del XML debe coincidir con la fecha embebida en la clave (Anexo 1, validación de `FechaEmision`).

Nombres de archivo (Nota 3): `clave.xml`, `clave_respuesta.xml`, `clave.pdf`.

---

## 4. Tipos de identificación (Anexo 1 Nota 4)

| Código | Tipo |
| --- | --- |
| 01 | Cédula Física |
| 02 | Cédula Jurídica |
| 03 | DIMEX |
| 04 | NITE |
| 05 | Extranjero No Domiciliado |
| 06 | No Contribuyente |

El Anexo restringe **cuándo** 05 y 06 son válidos (p. ej. 05/06 en emisor de FEC; 05 en receptor de FE solo con condición de venta 12, etc.). Esas reglas se transcribirán campo a campo en Fase 5 desde el PDF/XSD, no desde este resumen.

Nota 4.1 (padding a 12 para la **clave**):

- Física: tres ceros + cédula
- Jurídica: dos ceros (o un cero si ya tiene 11 dígitos)
- NITE: dos ceros

---

## 5. XML: builders y validación

Antes de cada builder (FE, TE, NC, ND), Fase 5 hará:

1. Releer el XSD oficial y el Anexo 1 (condiciones 1 obligatoria, 2 condicional, 3 opcional, 4 inexistente).
2. Documentar cada nodo.
3. DTO TypeScript + Zod.
4. Generar XML con el `targetNamespace` v4.4 del XSD.
5. Validar contra el XSD (libxml o equivalente).
6. Fixtures válidos e inválidos + pruebas.

No se listan aquí todos los nodos: el XSD es la fuente. Copias en `/docs/hacienda/schemas/v4.4/`.

Canonicalización citada en Anexo 1: C14n-20010315. Decimales: punto decimal, sin separador de miles.

### Dinero (`DecimalDineroType` en XSD FE)

- `xs:decimal`
- `totalDigits` 18
- `fractionDigits` 5
- `minInclusive` 0
- `maxInclusive` 9999999999999.99999

Política central `/src/lib/money` usará esa escala. El método de redondeo del Anexo 1 (sección de especificaciones técnicas, ejemplos a 5 decimales) se implementará con tests; si el texto del PDF resulta ambiguo frente al validador, se documenta el caso y se ajusta **solo** contra XSD + sandbox, no contra intuición.

CABYS en línea: el XSD de FE exige `CodigoCABYS` longitud **13**. La API pública documenta `codigo` de 13 dígitos.

---

## 6. Firma (Anexo 2)

Hechos oficiales extraídos del Anexo 2 (PDF ATV capturado):

- XMLDSig + **XAdES-EPES** según ETSI TS 101 903 **v1.3.2 o superior**.
- Empaquetado **ENVELOPED**. Ningún otro.
- XPath de la firma en factura: `/FacturaElectronica/ds:Signature` (análogo para los otros roots).
- Certificados RSA 2048 o 4096; digest SHA-256 o SHA-512.
- URL de política XAdES-EPES (texto del Anexo 2; la URL contiene espacios en el PDF: se usará el valor **exacto** que Hacienda espere, verificado con el ejemplo de firma del Anexo y con sandbox):

  `https://cdn.comprobanteselectronicos.go.cr/xml schemas/Resoluci%C3%B3n_General_sobre_disposiciones_t%C3%A9cnicas_comprobantes_electr%C3%B3nicos_para_efectos_tributarios.pdf`

- Alternativa a firma digital SINPE: llave criptográfica de Hacienda (RSA 2048 + SHA-256), distinta para pruebas y producción, obtenida vía ATV / Tico Factura.

**No se implementará una “firma parecida”.** Interfaz:

```
ElectronicDocumentSigner.sign({ xml, certificate, certificatePassword }) → signedXml
```

Si en Fase 6 no hay librería TypeScript/Node **madura y verificable** que produzca XAdES-EPES enveloped aceptada en sandbox, se usará un sidecar interno (Java/`xades4j` o .NET con librería consolidada) detrás de la misma interfaz. Está prohibida una implementación cripto artesanal.

Contrafirmas de receptor/endoso: el Anexo las describe; **no forman parte de v1 del POS**.

---

## 7. API de recepción (Anexo 3 + HTML oficial v4.4)

### URLs (Anexo 3)

| Ambiente | URI |
| --- | --- |
| Producción | `https://api.comprobanteselectronicos.go.cr/recepcion/v1/` |
| Sandbox | `https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1/` |
| IdP | `https://idp.comprobanteselectronicos.go.cr/auth` |

HTTPS obligatorio. JSON UTF-8.

### Autenticación (Anexo 3) — valores de **producción**

- OpenID Connect sobre OAuth 2.0.
- Grant: Resource Owner Password Credentials (`password`).
- Access Token URL: `https://idp.comprobanteselectronicos.go.cr/auth/realms/rut/protocol/openid-connect/token`
- Client Id: `api-prod`
- Client Secret: vacío. Scope: vacío.
- Username: identificación del contribuyente (ejemplo del Anexo: `cpf-01-1234-5678@comprobanteselectronicos.go.cr`)
- Password: generada en ATV.
- Token en header `Authorization` con prefijo `bearer`.
- Expiración documentada: **5 minutos**. El cliente debe renovar. Mutex para no disparar N refrescos paralelos.

Sandbox: la URL de recepción sí está en el Anexo 3. **Realm y Client Id de pruebas no están en ese Anexo.** Se configuran por env y se confirman con la guía oficial de credenciales de pruebas antes de Fase 6. No se copian valores de blogs.

### POST `/recepcion` (HTML oficial ATV v4.4)

JSON Schema extraído de `docs/hacienda/api/comprobantes-electronicos-api.html`:

**Requeridos:** `clave`, `fecha`, `emisor`, `comprobanteXml`  
**Opcionales:** `receptor`, `callbackUrl`, `consecutivoReceptor`

`comprobanteXml`: XML firmado XAdES-EPES, bytes UTF-8 en Base64.

Respuesta de éxito documentada: **HTTP 201** — *“Se recibió correctamente… queda pendiente la validación… y el envío de la respuesta de parte de Hacienda.”*  
Header `Location` apunta a la consulta de estado. Headers `X-Ratelimit-*`.  
HTTP 400: error de validación, `X-Error-Cause`.

**201 no significa aceptado.**

### GET `/recepcion/{clave}` (mismo HTML)

Cuerpo:

| Campo | Obligatorio | Notas |
| --- | --- | --- |
| `clave` | sí | max 50 |
| `fecha` | sí | date-time RFC3339 |
| `ind-estado` | sí | enum: `recibido`, `procesando`, `aceptado`, `rechazado`, `error` |
| `respuesta-xml` | no | XML de Hacienda firmado XAdES-XL, Base64 UTF-8 |

### Callback (Anexo 3 + HTML)

El POST puede incluir `callbackUrl`. Hacienda envía **el mismo JSON que el GET**. El URL debe responder HTTP 200. Si no, el Anexo 3 indica 3 reintentos y luego deja de enviar; el obligado consulta el GET.

Nota de consistencia: un ejemplo del Anexo 3 usa `indEstado` / `respuestaXml` / `RECIBIDO`; el JSON Schema del HTML usa `ind-estado` / `respuesta-xml` / minúsculas. **La implementación seguirá el JSON Schema del HTML oficial** y se verificará en sandbox. Se aceptará parseo defensivo documentado si el sandbox enviara la variante del PDF.

### Recursos adicionales (Anexo 3)

- GET `/comprobantes`
- GET `/comprobantes/{clave}`

---

## 8. Mapeo de estados

Estados de Hacienda (`ind-estado`) ≠ estados internos.

| `ind-estado` oficial | Estado local |
| --- | --- |
| (aún no hay POST 201) | `DRAFT` / `GENERATED` / `SIGNED` / `QUEUED` |
| POST 201 | `SENT` |
| `recibido` | `RECEIVED` |
| `procesando` | `PROCESSING` |
| `aceptado` | `ACCEPTED` |
| `rechazado` | `REJECTED` |
| `error` | `ERROR` |
| timeout / 5xx / 429 tras enviar | `RETRY_PENDING` (misma `clave`) |

Timeout **no** genera otra factura. Se consulta GET por clave.

---

## 9. APIs públicas (https://api.hacienda.go.cr/docs/)

Todas desde servidor, con caché, backoff en 429.

| Recurso | Uso en el sistema |
| --- | --- |
| `GET /fe/ae?identificacion=` | Contribuyente: nombre, tipo ID, régimen, situación, actividades. Parámetro 9–12 dígitos numéricos. |
| `GET /fe/cabys?codigo=` o `?q=` | Selector de productos. `codigo` 13 dígitos; `q` mínimo 3 caracteres. |
| `GET /indicadores/tc` | Tipo de cambio dólar/euro. Snapshot en la factura. Nunca recalcular una factura vieja. |
| `GET /fe/ex` | Exoneraciones (`autorizacion` formato `AL-XXXXXXXX-XX`). Preparado; no es núcleo POS v1. |

Límites publicados: 20 req/s burst / 10 req/s sostenido; bloqueo 10 min. No consultar AE en cada render de React.

---

## 10. FE vs TE (pendiente de regla operativa D-04)

Hechos, no algoritmo inventado:

- El Anexo 1 introduce el tiquete electrónico “para que opere en los puntos de venta”.
- El Decreto 44739-H (citado por la presentación institucional de Hacienda, marzo 2025) distingue factura (respaldo que un receptor inscrito puede usar para gastos/créditos) y tiquete (consumidor final; no justifica créditos). El texto íntegro del Decreto debe archivarse en Fase 5 cuando el acceso lo permita.

El POS **no** adivinará el tipo. Habrá un servicio `DocumentTypePolicy` implementado **después** de transcribir los artículos vigentes, con tests. Hasta D-04, el diseño asume que ambos builders existen y que la venta lleva un `intendedDocumentType` validado en servidor.

---

## 11. PDF

El Anexo 1 Nota 1 exige que en la representación gráfica queden juntos tipo de documento, clave y consecutivo. El PDF no sustituye el XML firmado ni el mensaje de aceptación.

---

## 12. Checklist de no-invención (Fase 5)

Antes de escribir un builder:

- [ ] XSD re-descargado y hash comparado
- [ ] Cada campo mapeado desde XSD + Anexo (obligatorio/condicional/opcional/inexistente por tipo)
- [ ] Códigos de impuesto, medio de pago, condición de venta, unidades, descuentos: **tablas del Anexo**, no listas memorizadas
- [ ] Fixtures que Hacienda sandbox acepte o rechace de forma explicable
- [ ] Ningún namespace, URL o código copiado de un blog sin contraste oficial
