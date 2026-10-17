# Reporte de pruebas — Sprint 03 (incremento I2 · Sincronización)

| Campo | Valor |
| --- | --- |
| Sprint | S3 · Base local cifrada y sincronización |
| Versión | `v0.4.0` (coffer-server y coffer-app) |
| Fecha | 2026-10-17 |
| Historias | S3-H01 (coffer-server#26: H01a pull, H01b push), S3-H02 (coffer-app#26), S3-H03 (coffer-app#27: H03a datos, H03b UI): 3 de 3 hechas, 29 puntos |

## 1. Resumen

| Métrica | Valor |
| --- | --- |
| Casos de aceptación planificados / aprobados / fallidos | 3 / 1 / 0, más 1 parcial y 1 sin ejecutar (ver §2). Además, el PO probó en staging la bajada de datos creados en el servidor (§2) |
| Pruebas automatizadas (servidor / app) | 39 / 70 métodos de prueba, todos en verde en CI; 3 instrumentadas en la app que se corren a mano |
| Cobertura domain/finance · domain · servidor | — (aún no existe) · no medida (Kover no está configurado) · no medida en este sprint |
| Defectos abiertos por severidad | C: 0 · A: 0 · M: 0 · B: 0 |
| Riesgos de §4 afectados y estado | Migración local del MVP sin prueba con datos reales: aceptado, porque producción queda vacía hasta la importación de S8. Ver §4 |
| Recomendación | **Liberar** `v0.4.0` siguiendo el orden de §4 |

## 2. Aceptación del PO

| Caso | Qué cubre | Estado |
| --- | --- | --- |
| Bajada en staging (fuera del plan) | Cuentas y movimientos creados en el servidor aparecen en el teléfono (Historial por día y Cuentas) | **Aprobado** por el PO el 2026-10-17 con `julianstage` |
| AT-HU06-1 | Reinstalar e iniciar sesión: descarga con barra de progreso | **Parcial:** el PO vio *Descargando tus datos* al registrarse, sin datos que descargar. La descarga con datos queda cubierta por `SyncEngineTest` e `InitialDownloadViewModelTest` |
| AT-HU05-2 | Servidor dormido: la app sigue usable y reintenta | Sin ejecutar a propósito. Automatizado: `SyncEngineTest`/`SyncWorker` (503 → reintento con backoff). La UI nunca espera a la red (ADR-0005) |
| AT-AUT-05 | Error del servidor sin detalles técnicos | Automatizado: `PushServiceIT` (rechazos con `code` y mensaje en español), `ProblemDetailsAdviceTest` |
| Movimientos del MVP en Historial | Migración local del MVP | No ejecutado: la app de staging no tiene base del MVP y el PO decidió no llevar los datos del MVP a producción (§4). Cubierto por `LegacyDatabaseMigratorTest` |

S3-OPS01: en staging el usuario `owner` solo tenía datos de prueba (1 cuenta, 2 categorías, 1 movimiento). El PO lo eliminó en lugar de reclamarlo (2026-10-17).

## 3. Pruebas automatizadas

| Repositorio | Suite | Qué cubre |
| --- | --- | --- |
| coffer-server | `FlywayMigrationIT` | V1–V6 sobre base vacía y sobre base con datos del MVP (filas al `owner`) |
| coffer-server | `PullServiceIT` | Paginación por `version`, borrados lógicos, `remaining` en la descarga inicial, aislamiento por usuario |
| coffer-server | `PushServiceIT` | Orden por dependencias, reenvío sin duplicados (`STALE`), último cambio gana, borrados, id de otro usuario (`FIN-NOT-OWNER`), fallos aislados con *savepoint*, 413 sobre 200 |
| coffer-server | Contrato `/sync/*` | Respuestas validadas contra `openapi.yml` (`Contract.matchesComposed` para `oneOf` con discriminador) |
| coffer-app | `LegacyDatabaseMigratorTest`, DAOs | Migración del MVP con los UUID fijos del servidor, todo `PENDING`; consultas de sincronización |
| coffer-app | `SyncEngineTest` (MockWebServer) | Push por lotes, marcar `SYNCED`/`FAILED` solo si la fila no cambió, pull con progreso por tipo, catálogo base en la primera ronda, base de otra cuenta nunca se sincroniza |
| coffer-app | `ChangeApplierTest` | Último cambio gana en el cliente, cursor guardado por página |
| coffer-app | `InitialDownloadViewModelTest`, `SessionViewModelTest`, `HistoryViewModelTest`, `SyncedLabelTest` | Descarga inicial y reintento, sincronizar solo con sesión y descarga terminada, Historial por día, "hace N min" |
| coffer-app | `ComponentsScreenshotTest` | Nuevas: Descargando tus datos (claro y oscuro), Historial, Cuentas; indicador en Inicio y Ajustes |
| coffer-app | `EncryptionInstrumentedTest`, `SessionStoreTest` (instrumentadas, a mano) | Base cifrada con SQLCipher, sesión en Keystore. **Pendientes de correr** |

## 4. Riesgo aceptado y decisión sobre producción

**Decisión del PO (2026-10-17):** producción queda **vacía**. Los datos del MVP no se reclaman; los datos reales se cargarán con la importación por CSV (S8-H01, `v1.0.0`). Por eso, en el release:

1. Antes de fusionar el release del servidor: rama `pre-v0.4.0` en Neon `production` (procedimiento normal).
2. Release del servidor. V6 pasa los datos del MVP al usuario `owner`; después se **borra el `owner`** (sus filas se borran en cascada). La tabla `transactions_mvp` queda hasta V10.
3. Release de la app. Para no subir los datos del MVP del teléfono, el PO **desinstala la app anterior** antes de instalar `v0.4.0`; si la instala encima, `LegacyDatabaseMigrator` migraría esos datos y los subiría a su cuenta.

Riesgo aceptado: la migración local del MVP (`LegacyDatabaseMigrator`) solo está probada con pruebas automáticas, nunca con los datos reales.

## 5. Hallazgos durante el sprint

| Hallazgo | Detectado por | Resolución |
| --- | --- | --- |
| `CategorySyncHandler` fallaba con `Optional.map` que devolvía null | `PushServiceIT` | Corregido en H01b |
| Las filas migradas del MVP debían subirse | Revisión de diseño | Migran como `PENDING` (coffer-docs#10) |
| El validador de contrato no maneja `oneOf` + discriminador + `allOf` | Prueba de contrato | `Contract.matchesComposed()`, comprobado con mutaciones |
| Robolectric no carga la librería nativa de SQLCipher | Pruebas de la app | `robolectric.properties` con `Application` simple; el cifrado se prueba en un test instrumentado |
| Los trabajos puntual, periódico e inicial podían cruzarse | Revisión de H03b | `SyncEngine` corre una ronda a la vez (candado) |
| Daemons de Gradle que bloquean `build/` en Windows | Builds locales | Matar el daemon colgado y borrar la carpeta |

## 6. Pendientes que pasan al siguiente sprint

- Aceptación en el teléfono de S2 (AT-AUT-01, 02, 04, AT-HU06-2) y las pruebas instrumentadas `SessionStoreTest` y `EncryptionInstrumentedTest`.
- AT-HU06-1 con datos: reinstalar la app de staging e iniciar sesión con `julianstage`.
- Kover en la app antes de la lógica financiera (S4).
- APK de release de 54 MB (sin R8/minify).
- Usuario de prueba `claudeprueba4195` en staging.
- El usuario actual del PO en producción se conserva o se borra a criterio del PO; el inicio con Google (S11) vincula por correo, así que no hace falta borrarlo para usar Google después.

## 7. Retrospectiva

**Qué funcionó**
- Partir H01 y H03 en dos PR cada una mantuvo las revisiones pequeñas.
- Probar la bajada metiendo datos por SQL en staging validó todo el flujo sin esperar a los formularios de S4.
- Las capturas de pantalla en CI detectaron cada cambio visual.

**Qué no funcionó**
- La consulta de reclamo confundió: hubo que explicar el objetivo dos veces.
- La aceptación del sprint anterior sigue sin hacerse en el teléfono.

**Qué cambiamos en el siguiente sprint**
- Los procedimientos sobre la base de datos se explican primero en una frase (qué y por qué) y luego van los pasos.
- Reservar un momento del sprint para la aceptación en el teléfono, incluida la de S2.
