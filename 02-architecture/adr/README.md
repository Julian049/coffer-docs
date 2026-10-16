# Registro de decisiones de arquitectura (ADR)

Cada decisión significativa se registra como un ADR con el formato [MADR 4](https://adr.github.io/madr/). Los ADR son la *justificación de la arquitectura* (architecture rationale) que exige ISO/IEC/IEEE 42010 y forman la sección 9 de arc42 en [`../architecture.md`](../architecture.md).

## Reglas

- Un archivo por decisión: `NNNN-titulo-en-minusculas.md`, numerado de forma consecutiva.
- Estados: `Propuesto` → `Aceptado` → (`Reemplazado por ADR-XXXX` | `Obsoleto`).
- Un ADR aceptado no se edita: si la decisión cambia, se escribe uno nuevo que lo reemplaza.
- Se parte de la plantilla [`0000-plantilla.md`](0000-plantilla.md).

## Índice

| ADR | Decisión | Estado |
| --- | --- | --- |
| [0001](0001-registrar-decisiones-con-adr.md) | Registrar decisiones de arquitectura con ADR (MADR) | Aceptado |
| [0002](0002-servicio-unico-en-la-nube-spring-boot.md) | Un único servicio en la nube con Spring Boot 4 (monolito modular) | Aceptado |
| [0003](0003-flyway-para-migraciones.md) | Flyway como única vía de cambio del esquema | Aceptado |
| [0004](0004-montos-numeric-bigdecimal.md) | Montos exactos: `NUMERIC(19,4)` y `BigDecimal` | Aceptado |
| [0005](0005-offline-first-room-fuente-de-verdad.md) | Offline-first: Room como fuente de verdad del dispositivo | Aceptado |
| [0006](0006-protocolo-de-sincronizacion.md) | Sincronización push/pull con cursor y último cambio gana | Aceptado |
| [0007](0007-autenticacion-jwt-propio.md) | Autenticación con JWT propio, refresh rotativo y Google | Aceptado |
| [0008](0008-seguridad-en-el-dispositivo.md) | Room cifrada con SQLCipher y tokens en Android Keystore | Aceptado |
| [0009](0009-hosting-gratuito.md) | Hosting gratuito: Render (API) + Neon (PostgreSQL) | Propuesto |
| [0010](0010-logica-financiera-en-el-cliente.md) | La lógica financiera vive en el dominio del cliente | Aceptado |
| [0011](0011-stack-del-cliente-android.md) | Stack del cliente Android (minSdk 31, Compose, Hilt, kotlinx.serialization) | Aceptado |
| [0012](0012-contrato-api-v1-y-errores.md) | Contrato `/api/v1`, OpenAPI y errores RFC 9457 | Aceptado |
