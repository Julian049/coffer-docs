# Coffer — Documentación

Documentación de **Coffer**, app Android de finanzas personales *offline-first* con respaldo en la nube. Antes se llamó "Finance App".

| Repositorio | Contenido |
| --- | --- |
| [`Julian049/coffer-docs`](https://github.com/Julian049/coffer-docs) | Esta documentación |
| [`Julian049/coffer-app`](https://github.com/Julian049/coffer-app) | App Android (Kotlin, Compose, Room) |
| [`Julian049/coffer-server`](https://github.com/Julian049/coffer-server) | Servicio en la nube (Spring Boot 4, PostgreSQL, Flyway) |

## Mapa

| Carpeta | Documento | Norma o marco |
| --- | --- | --- |
| [01-requirements](01-requirements/) | SRS v1.0 (PDF y Markdown) · trazabilidad | ISO/IEC/IEEE 29148 |
| [02-architecture](02-architecture/architecture.md) | Arquitectura, [diagramas C4](02-architecture/diagrams/README.md), [ADR](02-architecture/adr/README.md), [legacy (MVP)](02-architecture/legacy/README.md) | ISO/IEC/IEEE 42010 + arc42 |
| [03-design](03-design/detailed-design.md) | Diseño detallado, [modelo de datos y Flyway](03-design/data-model.md), [secuencias](03-design/sequences/README.md) | IEEE 1016 |
| [04-api](04-api/openapi.yml) | Contrato de la API | OpenAPI 3.1 |
| [05-test](05-test/test-plan.md) | Plan de pruebas | ISO/IEC/IEEE 29119-3 |
| [06-settings](06-settings/manage-config.md) | Gestión de configuración: ramas, versiones, releases | IEEE 828 |
| [07-management](07-management/sprint-plan.md) | [Metodología Scrum](07-management/scrum.md) y plan de sprints | Scrum Guide 2020 |
| [08-ui](08-ui/README.md) | Prototipo de Figma y sistema de diseño | Material 3 |
| [09-user](09-user/README.md) | Manual de usuario (al final) | — |

## Versionado

Las líneas base se marcan con tags `docs-vX.Y.Z` (ver [gestión de configuración §3.1.5](06-settings/manage-config.md)). `docs-v1.0.0` = SRS 1.0 + arquitectura, diseño, contrato, plan de pruebas, plan de configuración y plan de sprints 1.0.
