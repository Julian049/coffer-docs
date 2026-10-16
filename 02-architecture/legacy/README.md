# Arquitectura legacy (MVP v0.1.0)

Esta carpeta describe la arquitectura **tal como está implementada hoy** en `finance-app` (Android) y `finance-server` (Spring Boot), antes de aplicar el SRS v1.0. Es la línea base de la que parte la migración descrita en [`../architecture.md`](../architecture.md).

| Documento | Contenido |
| --- | --- |
| [01-physical-database.md](01-physical-database.md) | Esquema físico actual: tabla `transactions` en PostgreSQL (V1 + V2) y en Room v1. |
| [02-create-transaction-flow.md](02-create-transaction-flow.md) | Secuencia actual para crear y sincronizar una transacción, con sus puntos de fallo. |
| [03-app-startup-flow.md](03-app-startup-flow.md) | Flujo actual al abrir la app (`runBlocking`, descarga completa, `REPLACE`). |
| [04-general-architecture.md](04-general-architecture.md) | Vista general de componentes del MVP. |

## Qué pasó con la "propuesta" anterior

Los documentos originales tenían también una sección "Propuesta". Esa propuesta se **reemplazó** por la arquitectura objetivo de [`../architecture.md`](../architecture.md), refinada contra el SRS. Las ideas que se conservaron están registradas como ADR en [`../adr/`](../adr/); estas son las diferencias principales:

| Tema | Propuesta anterior | Arquitectura objetivo |
| --- | --- | --- |
| Montos | `BIGINT amount_minor` (centavos) | `NUMERIC(19,4)` + `BigDecimal` ([ADR-0004](../adr/0004-numeric-bigdecimal-amounts.md)) |
| Alcance del dominio | Transacciones y categorías | Cuentas, tarjetas, préstamos, cuotas, recurrentes, etiquetas, historial y ajustes (SRS §7.4) |
| Tipos de transacción | `INCOME`, `EXPENSE` | `INCOME`, `EXPENSE`, `TRANSFER` con desglose de capital, intereses y cargos |
| Tokens en el dispositivo | DataStore | Android Keystore + DataStore cifrado ([ADR-0008](../adr/0008-on-device-security.md)) |
| Base local | Room sin cifrar | Room cifrada con SQLCipher (RNF-08) |
| Autenticación | Correo y contraseña | Nombre de usuario y contraseña + Google ([ADR-0007](../adr/0007-self-issued-jwt-auth.md)) |
| Lógica financiera | En el servidor (`ledger`) | En el dominio del cliente; el servidor guarda y valida ([ADR-0010](../adr/0010-financial-logic-on-client.md)) |
| minSdk | 24 | 31, Android 12 (RNF-01) |
