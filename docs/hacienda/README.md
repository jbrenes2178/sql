# Referencias oficiales — Comprobantes Electrónicos Costa Rica

Este directorio conserva **copias locales inmutables** de la documentación y esquemas oficiales utilizados para diseñar el módulo fiscal.

**Regla:** no modificar los XSD ni los PDF oficiales. Si Hacienda publica una actualización, se descarga una nueva versión, se registra en `SOURCES.md` y se decide explícitamente el corte de implementación.

## Versión implementada (objetivo)

| Campo | Valor |
| --- | --- |
| Especificación | Comprobantes Electrónicos **versión 4.4** |
| Fuente de esquemas XSD | Portal ATV, `docs/esquemas/2024/v4.4/` |
| Fecha de captura de esta copia | 2026-09-07 America/Costa_Rica (2026-09-08 UTC) |
| Estado de implementación en código | **No implementado.** Fase 0 solo conserva referencias. |

## Contenido

- `ANEXOS_Y_ESTRUCTURAS_V4.4.pdf` — Anexos 1, 2 y 3 oficiales descargados desde ATV.
- `api/comprobantes-electronicos-api.html` — documentación HTML oficial del API de recepción.
- `api/api-hacienda-go-cr-docs.html` — documentación de APIs públicas (`/fe/ae`, `/fe/cabys`, indicadores de tipo de cambio).
- `schemas/v4.4/*.xsd` — XML Schema oficiales, sin modificación.
- `schemas/xmldsig-core-schema.xsd` — esquema W3C XMLDSig requerido por el `xs:import` de los XSD de Hacienda. No es un documento de Hacienda; se incluye porque los XSD oficiales lo importan.
- `SHA256SUMS.txt` — integridad de los archivos capturados.
- `SOURCES.md` — URLs, hashes, limitaciones de captura y huecos oficiales.

Ver también `/docs/HACIENDA.md`.
