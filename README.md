# Sistema de óptica — Costa Rica

Plataforma de producción para administrar una óptica en Costa Rica: expediente visual, inventario, POS, laboratorio, citas y **facturación electrónica v4.4** del Ministerio de Hacienda.

Este repositorio está en **Fase 0 (arquitectura)**. No hay aplicación ejecutable todavía.

## Documentación

| Documento | Contenido |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura, carpetas, flujos de venta / Hacienda / citas |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Fases 0–12 y orden de construcción |
| [docs/DATABASE.md](docs/DATABASE.md) | Modelo entidad-relación e invariantes |
| [docs/SECURITY.md](docs/SECURITY.md) | RBAC, sesiones, secretos, Hacienda |
| [docs/HACIENDA.md](docs/HACIENDA.md) | Integración fiscal 4.4 (solo fuentes oficiales) |
| [docs/TESTING.md](docs/TESTING.md) | Estrategia de pruebas |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decisiones que requieren aprobación |
| [docs/hacienda/](docs/hacienda/) | PDF, XSD y HTML oficiales capturados el 2026-09-08 |

## Principios fiscales

- Comprobantes Electrónicos **versión 4.4**.
- XML validado contra XSD oficiales **antes** de firmar y enviar.
- Un HTTP 201 de recepción **no** es aceptación.
- Documentos aceptados son inmutables; ajustes vía nota de crédito o débito.
- Sandbox por defecto. Producción nunca es el default.

## Arranque (a partir de Fase 1)

```bash
cp .env.example .env
# completar secretos fuera de git
```

No incluir certificados `.p12` ni contraseñas de Hacienda en el repositorio.
