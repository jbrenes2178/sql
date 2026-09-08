# Fuentes oficiales capturadas — 2026-09-07 America/Costa_Rica (2026-09-08 UTC)

Este archivo registra **exactamente** qué se descargó, desde dónde, y qué no se pudo verificar. No completa huecos con memoria ni con blogs de terceros.

## 1. Documentos oficiales utilizados

| Documento | URL oficial | Resultado de captura | SHA-256 |
| --- | --- | --- | --- |
| Anexos y Estructuras v4.4 (PDF) | https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/docs/esquemas/2024/v4.4/ANEXOS%20Y%20ESTRUCTURAS_V4.4.pdf | OK, PDF 1.7, 98 páginas | `2e36bd1101bbcabbb391ab1ec8ffc3773b93031341c7d98a05a5d0f0887d4305` |
| Portal Anexos y Estructuras | https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/frmAnexosyEstructuras.aspx | OK (portal dinámico) | n/a |
| API de recepción (HTML) | https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/docs/esquemas/2024/v4.4/comprobantes-electronicos-api.html | OK | `b6e7c49ed71ecf19436017046fb2d20ce160f739f5d042fab0a4d95828e2a9df` |
| APIs públicas | https://api.hacienda.go.cr/docs/ | OK | `15198c891c874fa29490dc97c9def545fa77bf457bacbc475eb589801898846c` |

## 2. XSD oficiales v4.4 (ATV)

Descargados desde:

`https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/docs/esquemas/2024/v4.4/{archivo}`

| Archivo | `targetNamespace` | Elemento raíz | SHA-256 |
| --- | --- | --- | --- |
| `FacturaElectronica_V4.4.xsd` | `https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica` | `FacturaElectronica` | `d384afef665573606f6499b2182d6070850ada8c93bc40fa7f0f3901a25b9cc8` |
| `TiqueteElectronico_V4.4.xsd` | `.../v4.4/tiqueteElectronico` | `TiqueteElectronico` | `cda1c7dd97f9a235111c29948f05d7893864663cd73792fd3b51e3dae582cfdb` |
| `NotaCreditoElectronica_V4.4.xsd` | `.../v4.4/notaCreditoElectronica` | `NotaCreditoElectronica` | `9af7dff4ee0c2787f8fc30cb63aef37b574c96846007be327d442e30e0ddf804` |
| `NotaDebitoElectronica_V4.4.xsd` | `.../v4.4/notaDebitoElectronica` | `NotaDebitoElectronica` | `ac2c63f93602502af22980a81f26032c6a561ed3a8c516ac28184ce1433b7b61` |
| `FacturaElectronicaCompra_V4.4.xsd` | `.../v4.4/facturaElectronicaCompra` | `FacturaElectronicaCompra` | `ae1e5b782b568d225b34e046858012ed808b2587fc5b1b5161fa707b4bdd8253` |
| `FacturaElectronicaExportacion_V4.4.xsd` | `.../v4.4/facturaElectronicaExportacion` | `FacturaElectronicaExportacion` | `d710032a05cd3d41272c0cceb8130b4add37ce139b491dbaa7bd6a59163809bd` |
| `ReciboElectronicoPago_V4.4.xsd` | `.../v4.4/reciboElectronicoPago` | `ReciboElectronicoPago` | `81d7be9cd9fc3792c2bb3822079784b8d62a3e643e708df0c99bc67d1edcbdfa` |
| `MensajeHacienda_V4.4.xsd` | `.../v4.4/mensajeHacienda` | `MensajeHacienda` | `411d858b0e2e293322910a0d4204243d34a874a6e7939c7c492721246900f390` |
| `MensajeReceptor_V4.4.xsd` | `.../v4.4/mensajeReceptor` | `MensajeReceptor` | `37bc1ffcf06a66a5a0b63b2908740dbd8f63fe0a4120426ea6a957862355c1c3` |

Observación: el atributo `version` de `xs:schema` en todos estos XSD es `4.4`. El `<?xml version="1.0"?>` es solo la declaración XML, no la versión de comprobantes.

## 3. CDN de namespaces (Nota 2 del Anexo 1)

El Anexo 1, Nota 2, publica estos namespaces (no se modifican):

- `https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica`
- `https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/tiqueteElectronico`
- `https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/notaCreditoElectronica`
- `https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/notaDebitoElectronica`
- `https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronicaCompra`
- `https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronicaExportacion`
- `https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/reciboElectronicoPago`

Al consultar esas URLs el 2026-09-07 America/Costa_Rica (2026-09-08 UTC) el CDN respondió **HTTP 403**. Por eso la copia de trabajo se tomó de ATV, que sí entregó los XSD. En Fase 5 se reintentará el CDN y se comparará integridad.

## 4. Documentos oficiales que este entorno no pudo descargar

| URL | Resultado | Impacto |
| --- | --- | --- |
| https://www.hacienda.go.cr/docs/ANEXOS_Y_ESTRUCTURAS_V4.4.pdf | HTTP 400 (WAF) | Puede existir una bitácora más reciente (se observó mención a ajustes al 22/04/2026 en indexaciones previas). **Debe re-descargarse en Fase 5 y compararse con el PDF de ATV.** |
| https://www.hacienda.go.cr/docs/ComprobantesElectronicosAPI.html | HTTP 400 | Se usó el HTML equivalente en ATV v4.4, que sí descargó. |
| https://www.hacienda.go.cr/docs/GuiaCredencialesProduccionparaTicoFacturayotrossistemas.pdf | HTTP 400 | El flujo de credenciales ATV queda como tarea de verificación en Fase 6. |
| Token URL / Client ID de **sandbox** | No aparecen en el Anexo 3 capturado | El Anexo 3 documenta producción (`realms/rut`, `Client Id = api-prod`). El sandbox de recepción sí está documentado. Realm/client de pruebas: **configurables por env y deben confirmarse contra la guía oficial de credenciales de pruebas antes de usarlos.** |

## 5. Normativa citada, no copiada íntegramente en este repo

Estas normas rigen el diseño; no se copió el texto completo porque no se obtuvo un PDF íntegro verificable desde `www.hacienda.go.cr` en esta captura:

- Decreto Ejecutivo N.º 44739-H, Reglamento de Comprobantes Electrónicos para efectos tributarios.
- Resolución MH-DGT-RES-0027-2024, disposiciones técnicas, estructura 4.4.
- Resolución MH-DGT-RES-0001-2025, modificación del Transitorio I (vigencia 4.4 al 1 de setiembre de 2025 según el propio documento de preguntas de Hacienda).
- Presentación institucional: https://www.hacienda.go.cr/docs/ComprobantesElectronicos-GeneralidadesyVersion4.4.marzo2025.pdf (indexada; descarga directa bloqueada en este entorno).

En Fase 5/6 se deben archivar copias locales de esas normas si el acceso lo permite.

## 6. APIs públicas verificadas en vivo (2026-09-07 America/Costa_Rica / 2026-09-08 UTC)

Consultas de humo contra https://api.hacienda.go.cr (documentación oficial `/docs/`):

- `GET /fe/ae?identificacion=3101123456` → HTTP 200. Campos observados: `nombre`, `tipoIdentificacion`, `regimen`, `situacion`, `actividades`.
- `GET /fe/cabys?codigo=2132100000100` → HTTP 200. Campos observados: `codigo`, `descripcion`, `impuesto`, `categorias`. `codigo` de 13 dígitos.
- `GET /indicadores/tc` → HTTP 200. Campos observados: `dolar.compra`, `dolar.venta`, `euro`.

Límites oficiales publicados en `/docs/`:

- Burst: 20 solicitudes/seg en 5 seg (máx. 100 / 5 s) → bloqueo de IP 10 min.
- Promedio: 10 solicitudes/seg en 120 seg (máx. 1200 / 2 min) → bloqueo de IP 10 min.
- HTTP 400 parámetro inválido, 404 inexistente, 429 rate limit.

## 7. Política de actualización

Antes de implementar builders XML (Fase 5) y antes de sandbox (Fase 6):

1. Volver a descargar Anexos, XSD y HTML del API.
2. Comparar SHA-256 con `SHA256SUMS.txt`.
3. Si hay diferencia, no implementar la copia vieja. Registrar la nueva versión y actualizar `docs/HACIENDA.md`.
4. No habilitar un tipo de comprobante hasta validar su XSD vigente y pruebas de sandbox.
