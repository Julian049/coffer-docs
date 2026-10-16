# Plan de sprints y product backlog — Coffer

| Campo | Valor |
| --- | --- |
| Identificador | FA-PM-002 · versión 1.0 · 2026-10-11 |
| Metodología | [Scrum adaptado](scrum.md) |
| Base | [SRS v1.0](../01-requirements/srs.md) · [Arquitectura](../02-architecture/architecture.md) · [Diseño detallado](../03-design/detailed-design.md) · [Modelo de datos](../03-design/data-model.md) · [Secuencias](../03-design/sequences/README.md) · [Contrato API](../04-api/openapi.yml) · [Plan de pruebas](../05-test/test-plan.md) · [Gestión de configuración](../06-settings/manage-config.md) · [UI y Figma](../08-ui/README.md) |

## 1. Hoja de ruta

Cada sprint entrega una versión **instalable y probable**. El orden es obligatorio: cada sprint depende de los anteriores.

| Sprint | Objetivo | Versión | Incremento (arq. §4.3) | Requisitos principales | Lo que el PO puede probar al cerrar |
| --- | --- | --- | --- | --- | --- |
| **S0** | Preparación del proyecto | `docs-v1.0.0` | — | — | Repositorios, ramas y documentación versionados |
| **S1** | Cimientos técnicos y nuevo diseño | `v0.2.0` | I0 | RNF-01, RNF-10, RNF-16, RNF-18 | App con el diseño nuevo y 4 pestañas; servidor en staging respondiendo |
| **S2** | Identidad y sesión | `v0.3.0` | I1 | REQ-AUT-01, 02, 04, 06 · RNF-09, 11 | Registrarse, iniciar sesión, sesión persistente y cerrar sesión |
| **S3** | Base local cifrada y sincronización | `v0.4.0` | I2 | F08 · REQ-SYN-01 a 05 · REQ-AUT-05 · RNF-05 a 08 · REQ-CAT-01 | Descarga inicial con progreso, datos del MVP migrados, indicador de sincronización |
| **S4** | Cuentas, categorías e Inicio | `v0.5.0` | I3 (1/2) | F03, F06, F07, F25 · REQ-CTA-01 a 07 · REQ-CAT-02, 03 · REQ-INI-01, 02 | Crear, editar, desactivar y quitar cuentas; categorías; Inicio con saldo y carrusel |
| **S5** | Transacciones e historial | `v0.6.0` | I3 (2/2) | F04, F05 · REQ-TRX-01 a 12 · REQ-HIS-01 · RNF-14, 15 | Gastos, ingresos, transferencias, historial con filtros y búsqueda, sin conexión |
| **S6** | Gastos recurrentes y avisos | `v0.7.0` | I4 | F11 · REQ-REC-01 a 11 · REQ-INI-03 | Recurrentes, pendientes en Inicio, pagar, omitir, finalizar y notificaciones |
| **S7** | Tarjetas de crédito | `v0.8.0` | I5 | F14 · REQ-TC-01 a 15 | Compras a cuotas, detalle de tarjeta, pago mínimo o total |
| **S8** | Importar, exportar y producción | **`v1.0.0`** | I6 + I8 | F09, F10 · REQ-IMP-01 a 06 · REQ-EXP-01 · RNF-02 a 04 | Importar el histórico de Cashew, exportar CSV; **versión 1.0 en producción** |
| **S9** | Reportes y etiquetas | `v1.1.0` | I7 (1/3) | F12, F13, F31 · REQ-REP-01 a 05 · REQ-ETQ-01 a 04 | Pestaña Reportes, etiquetas y etiquetas fijadas en Inicio |
| **S10** | Préstamos | `v1.2.0` | I7 (2/3) | F15, F29 · REQ-PRE-01 a 10 | Préstamo detallado y simple, cuotas, abono a capital |
| **S11** | Historial de cambios, saldo neto, Google y personalización | `v1.3.0` | I7 (3/3) | F23, F24, F28, F30 · REQ-HIS-02 a 04 · REQ-CTA-08, 09 · REQ-AUT-03 · REQ-INI-04 · RNF-13 | Restaurar borrados, saldo neto/disponible, login con Google, personalizar Inicio |

`v1.0.0` cubre todo lo *Must* del SRS. S9–S11 completan lo *Should*. Las funciones *Could* (F16, F17, F19, F26) quedan en el backlog para después de `v1.3.0`.

### 1.1 Convenciones de este plan

- Ids: `S03-H02` = sprint 3, historia 2. Tareas por área dentro de cada historia:

| Área | Prefijo | Repositorio |
| --- | --- | --- |
| Base de datos (Flyway) | `DB` | coffer-server |
| Servidor (Spring Boot) | `SRV` | coffer-server |
| App: dominio | `DOM` | coffer-app |
| App: datos (Room, red, sincronización, workers) | `DAT` | coffer-app |
| App: interfaz (Compose) | `UI` | coffer-app |
| Pruebas | `QA` | ambos |
| DevOps y documentación | `OPS` | ambos / coffer-docs |

- Cada historia es un issue y un PR (o dos PR enlazados si toca servidor y app). Los puntos son una estimación inicial que se ajusta en la planificación del sprint.
- Pantallas: nombres de los frames del prototipo de Figma (ver [UI](../08-ui/README.md)).

---

## Sprint 0 — Preparación del proyecto

**Objetivo:** dejar repositorios, ramas, documentación y plataformas listos para trabajar con PR y releases.
**Entregable:** `coffer-docs` con tag `docs-v1.0.0` (líneas base BL-1 y BL-2), rama `develop` protegida en ambos repositorios, plantillas y etiquetas.

| Id | Tarea | Responsable |
| --- | --- | --- |
| S0-T01 | Crear el repositorio vacío `Julian049/coffer-docs` en GitHub | PO |
| S0-T02 | Inicializar Git en `docs/`, primer commit, push y tag `docs-v1.0.0` | Claude |
| S0-T03 | Commitear `CLAUDE.md` en `coffer-app` y `coffer-server`; actualizar las rutas a la documentación (`../docs/...`) y enlazar este plan | Claude |
| S0-T04 | Crear `develop` desde `main` (`v0.1.0`) en ambos repositorios | Claude |
| S0-T05 | Proteger `main` y `develop` (PR obligatorio, 1 aprobación, CI obligatorio cuando exista, sin *force-push*) | PO |
| S0-T06 | Plantillas de issue (historia, bug, tarea) y de PR; etiquetas (`type:*`, `area:*`, `priority:*`, `sprint:*`); milestones S1–S11; tablero de GitHub Projects | Claude |
| S0-T07 | Guardar en Figma la versión con nombre `v1.0-srs-prototype` | PO |
| S0-T08 | Crear cuentas de Render y Neon (proyecto `coffer`, base `coffer`, ramas `production` y `staging`) | PO |
| S0-T09 | Generar el keystore de release (`keytool`) y guardarlo fuera del repositorio; cargarlo como secreto en GitHub (lo usa S1) | PO (con instrucciones de Claude) |

---

## Sprint 1 — Cimientos técnicos y nuevo diseño · `v0.2.0`

**Objetivo:** reestructurar ambos proyectos según la arquitectura, con CI/CD y staging funcionando, y la app mostrando el nuevo sistema de diseño.
**Prueba del PO:** instalar el APK `staging`, recorrer las 4 pestañas en tema claro y oscuro, y ver en Ajustes "Servidor: disponible" y la versión.

### S1-H01 · CI/CD y contenedor del servidor (5 pts)

| Id | Tarea |
| --- | --- |
| S1-OPS01 | `Dockerfile` multi-etapa (Maven + `eclipse-temurin:21-jre` con versión exacta) y `.dockerignore` |
| S1-OPS02 | `.github/workflows/ci.yml`: `./mvnw -B verify` en PR y push a `develop`/`main`; reportes JUnit y JaCoCo como artefactos |
| S1-OPS03 | `render.yaml` (blueprint) con los servicios `coffer-server-staging` (rama `develop`) y `coffer-server` (rama `main`), health check `/actuator/health`; variables por entorno (manage-config §5.3) |
| S1-OPS04 | Dependabot (Maven y Actions) y OWASP Dependency-Check en CI |
| S1-SRV01 | Perfiles `application-local.yaml`, `application-staging.yaml`, `application-prod.yaml`; `DB_URL` en lugar de host y puerto separados; Hikari con `DB_POOL_SIZE`; `ddl-auto=validate`; hilos virtuales |
| S1-QA01 | Reemplazar la prueba de contexto del MVP para que use Testcontainers (ya no exige una base local) |

### S1-H02 · Estructura modular del servidor y errores RFC 9457 (5 pts)

| Id | Tarea |
| --- | --- |
| S1-SRV02 | Paquetes `config`, `shared`, `identity`, `ledger`, `sync` (diseño §6.2.1). El código del MVP se mueve a `legacy` hasta S3 |
| S1-SRV03 | `ProblemDetailsAdvice` + `ErrorCode` (`FIN-*`) en lugar de `GlobalExceptionHandler`; `ClockConfig`; `JacksonConfig` (BigDecimal como string, fechas ISO) |
| S1-SRV04 | springdoc-openapi (`/v3/api-docs`); copia de `openapi.yml` en `src/test/resources/contract/` |
| S1-SRV05 | Actuator `health` e `info` (versión del `pom.xml`) |
| S1-QA02 | `ArchitectureTest` (ArchUnit): reglas de módulos y sin `double`/`float` en `ledger`; `ProblemDetailsAdviceTest`; prueba de contrato (swagger-request-validator con MockMvc) sobre `/actuator/health` |

### S1-H03 · Base del proyecto Android (5 pts)

| Id | Tarea |
| --- | --- |
| S1-DAT01 | `minSdk 31`, `targetSdk 36`; quitar el desugaring; versión `0.2.0` / `versionCode 200` (manage-config §3.1.2) |
| S1-DAT02 | `buildTypes` `debug` (`.debug`), `staging` (`.staging`) y `release`, con `BuildConfig.API_BASE_URL` por tipo; `network_security_config` (cleartext solo `10.0.2.2` en debug) |
| S1-DAT03 | Retrofit 3 + OkHttp + **kotlinx.serialization** (reemplaza Gson); `NetworkModule`; `HealthApi` |
| S1-DAT04 | Estructura de paquetes `ui`, `domain`, `data`, `di` (diseño §6.2.2); `DispatchersModule`; puerto `Clock` |
| S1-OPS05 | `ci.yml` de la app: `lint`, `ktlintCheck`, `testDebugUnitTest`, `assembleStaging` y APK como artefacto del PR; Dependabot |
| S1-OPS06 | `release.yml` (tag `v*`): `assembleRelease bundleRelease` firmados con los secretos y GitHub Release con checksums |
| S1-QA03 | Reglas Konsist: `domain` sin `android.*` y sin `Double`/`Float`; `ui` no importa `data` |

### S1-H04 · Sistema de diseño y navegación (8 pts)

Pantallas: barra de navegación del prototipo (componente "Barra de navegación"), Inicio, Historial, Reportes, Gestión de cuentas y Ajustes como contenedores vacíos.

| Id | Tarea |
| --- | --- |
| S1-UI01 | Tema Material 3 con los tokens de `design-system.md` (colores claro y oscuro, tipografía 400/500, formas 12/16/14/20 px, bordes de 1 px sin sombras) |
| S1-UI02 | Componentes base: `MoneyText` (formato es-CO), botones, `AppCard`, chips, `SegmentedSelector`, `AppBottomSheet`, `ConfirmDialog`, `EmptyState`, `SyncBadge`, encabezado con avatar |
| S1-UI03 | Navegación con rutas tipadas; `BottomBar` de 4 pestañas; avatar → Ajustes; pantallas vacías con `EmptyState` |
| S1-UI04 | Ajustes (versión mínima): versión de la app y estado del servidor (`GET /actuator/health` de staging) |
| S1-QA04 | Pruebas de componentes con Robolectric y *screenshots* (Roborazzi) de los componentes base en claro y oscuro |

**Release:** `v0.2.0` en ambos repositorios; staging desplegado (Render + Neon `staging`).

---

## Sprint 2 — Identidad y sesión · `v0.3.0`

**Objetivo:** registro, inicio de sesión con usuario o correo, sesión que no expira por uso normal y cierre de sesión.
**Prueba del PO:** AT-AUT-01, AT-AUT-02, AT-AUT-04 y AT-HU06-2 del plan de pruebas.
**Secuencias:** [SEQ-01](../03-design/sequences/01-authentication.md), [SEQ-03](../03-design/sequences/03-session-refresh-and-logout.md).

### S2-H01 · API de autenticación (8 pts)

| Id | Tarea |
| --- | --- |
| S2-DB01 | `V3__create_identity.sql` (data-model §4.3) |
| S2-SRV01 | Entidades `User` y `RefreshToken`; repositorios |
| S2-SRV02 | `UserService`: registro con BCrypt de costo 12, unicidad sin distinguir mayúsculas y validación del nombre de usuario |
| S2-SRV03 | `TokenService`: JWT RS256 de 15 min (`JwtEncoder` con claves de `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY`); refresh opaco con hash SHA-256, rotación, familia y revocación por reutilización |
| S2-SRV04 | `AuthController`: `register`, `login` (usuario o correo), `refresh`, `logout`; `MeController` (`GET /me`) — contrato `openapi.yml` |
| S2-SRV05 | `SecurityConfig`: rutas públicas y resource server JWT sin sesión HTTP; `CurrentUser` |
| S2-SRV06 | `LoginRateLimiter` (5 intentos por minuto) → 429 `FIN-RATE-LIMIT`; `RefreshTokenPurgeJob` |
| S2-OPS01 | Generar las claves RSA de staging y cargarlas en Render (instrucciones en el PR) |
| S2-QA01 | `AuthControllerIT` (registro, duplicado, login, credenciales erróneas con mensaje genérico, 429); `TokenServiceTest` (rotación y reutilización); contrato de los 5 endpoints |

### S2-H02 · Sesión en la app (5 pts)

| Id | Tarea |
| --- | --- |
| S2-DAT01 | `SessionStore`: DataStore Proto cifrado con una clave AES-GCM de Android Keystore; `DeviceIdProvider` |
| S2-DAT02 | `AuthApi`; `AuthInterceptor` (Bearer) y `TokenAuthenticator` (refresh único con mutex; si falla, sesión `EXPIRED`) |
| S2-DAT03 | `AuthRepositoryImpl` |
| S2-DOM01 | Casos de uso `RegisterUser`, `Login`, `Logout`, `ObserveSession` con validaciones de formulario |
| S2-QA02 | `TokenAuthenticatorTest` (MockWebServer: 401 → refresh → reintento; refresh revocado → expira), `SessionStoreTest` instrumentada |

### S2-H03 · Pantallas de acceso (5 pts)

Pantallas: **Iniciar Sesión**, **Registro**, **Ajustes** (perfil y cerrar sesión), **Diálogo · Cerrar sesión**.

| Id | Tarea |
| --- | --- |
| S2-UI01 | `LoginScreen` y `RegisterScreen` con errores por campo; botón de Google visible y deshabilitado ("Disponible pronto", S11) |
| S2-UI02 | Arranque según la sesión: sin sesión → Iniciar sesión; con sesión → Inicio (S3 añadirá la descarga inicial); sesión expirada → Iniciar sesión conservando los datos |
| S2-UI03 | Ajustes: tarjeta de perfil (`GET /me`) y cerrar sesión con el diálogo de REQ-AUT-06 |
| S2-QA03 | `LoginViewModelTest`, `RegisterViewModelTest`; pruebas de UI de validación |

---

## Sprint 3 — Base local cifrada y sincronización · `v0.4.0`

**Objetivo:** que los datos vivan en una base cifrada en el teléfono y se respalden solos en la nube, incluida la migración de los datos del MVP.
**Prueba del PO:** AT-HU05-2, AT-HU06-1, AT-AUT-05; ver los movimientos del MVP migrados en Historial (lista básica) y el estado "Sincronizado" en Ajustes.
**Secuencias:** [SEQ-02](../03-design/sequences/02-initial-download.md), [SEQ-08](../03-design/sequences/08-sync-push.md), [SEQ-09](../03-design/sequences/09-sync-pull-and-conflicts.md).

### S3-H01 · Esquema del libro y protocolo de sincronización (5 + 8 pts, dos PR: H01a pull, H01b push)

| Id | Tarea |
| --- | --- |
| S3-DB01 | `V4__create_sync_infrastructure.sql`, `V5__create_ledger_core.sql`, `V6__migrate_transactions_v2.sql` |
| S3-SRV01 | `SyncableEntity` y entidades JPA `UserSettings`, `Account`, `Category`, `Tag`, `Transaction`; eliminar el código `legacy` del MVP (`/transactions`) |
| S3-SRV02 | **(H01a)** `SyncController` + `PullService` (UNION ALL paginado, `remaining` con `since=0`) |
| S3-SRV03 | **(H01b)** `PushService` (transacción con FK diferidas, *savepoint* para aislar fallos), `SyncEntityRegistry`, `SyncHandler` para las 5 entidades con `ON CONFLICT … WHERE updated_at` (diseño §6.9.7) |
| S3-SRV04 | `LedgerValidators` (montos > 0, reglas de transferencia y categoría, propiedad) |
| S3-QA01 | `FlywayMigrationIT` (base vacía y con datos del MVP); `PushServiceIT` (APPLIED, reenvío STALE, REJECTED de otro usuario, FK diferida); `PullServiceIT` (paginación, borrados, `remaining`); contrato de `/sync/*` |
| S3-OPS01 | Ejecutar en staging el procedimiento de reclamo de datos del MVP (data-model §4.4) tras registrar al PO |

### S3-H02 · Base local cifrada y migración del MVP (8 pts)

| Id | Tarea |
| --- | --- |
| S3-DAT01 | `FinanceDatabase` (`finance.db`, versión 1, `exportSchema`) con SQLCipher y `DatabaseKeyProvider` (clave envuelta con Keystore) |
| S3-DAT02 | Entidades y DAO de `settings`, `accounts`, `categories`, `tags`, `transactions`, `sync_meta`; convertidores (montos ×10⁴, `Instant`, `LocalDate`, `UUID`); índices (data-model §5) |
| S3-DAT03 | `LegacyDatabaseMigrator` (data-model §5.2) |
| S3-DOM01 | Modelos `Money`, `Account`, `Category`, `Tag`, `Transaction`, `Settings`, `SyncStatus` y puertos de lectura |
| S3-QA02 | `LegacyDatabaseMigratorTest`, `EncryptionInstrumentedTest`, pruebas de DAO |

### S3-H03 · Worker de sincronización y descarga inicial (8 pts)

| Id | Tarea |
| --- | --- |
| S3-DAT04 | `SyncApi`, `EntityCodec` (entidad ↔ `Change`), `OutboxReader`, `ChangeApplier` (último cambio gana en el cliente) |
| S3-DAT05 | `SyncWorker` (HiltWorker): push por lotes de 200 y pull de 500; backoff exponencial; marcado SYNCED/FAILED (SEQ-08) |
| S3-DAT06 | `SyncSchedulerImpl`: tarea única al escribir (KEEP, 5 s), periódica cada 15 min, al recuperar la red (`ConnectivityObserver`), e *initial-sync* expedita |
| S3-DAT07 | `BaseCatalogSeeder`: categorías base de gasto e ingreso, incluida `FINANCIAL_CHARGES`, y `user_settings` por defecto, solo si la cuenta es nueva (pregunta abierta del SRS: lista concreta de categorías, a confirmar con el PO en la planificación) |
| S3-UI01 | **Descargando tus datos** con progreso por tipo; arranque: sesión sin descarga completa → esta pantalla |
| S3-UI02 | `SyncBadge` en Inicio y en Ajustes ("Sincronizado · hace N min", "N pendientes", "Sin conexión"), con estados genéricos (RNF-07) |
| S3-UI03 | Historial y Gestión de cuentas en modo lectura básica (lista por día y lista de cuentas), para ver los datos sincronizados; se reemplazan en S4 y S5 |
| S3-QA03 | `SyncWorkerTest` (MockWebServer: 503 → reintento, corte a mitad, edición durante el envío), `ChangeApplierTest` (LWW), `InitialDownloadViewModelTest` |
| S3-OPS02 | ADR-0013 "Cola de sincronización en el dispositivo con WorkManager (sin broker)" y aclarar en el C4-2 que el worker corre en el teléfono |

---

## Sprint 4 — Cuentas, categorías e Inicio · `v0.5.0`

**Objetivo:** administrar cuentas y categorías y ver el saldo en Inicio.
**Prueba del PO:** AT-HU13-1, AT-HU13-2; crear cuentas de efectivo, débito y ahorros y verlas en el carrusel y en el saldo total; crear, renombrar y eliminar (con reasignación) categorías.
**Secuencias:** [SEQ-12](../03-design/sequences/12-remove-account.md).

### S4-H01 · Gestión de cuentas (8 pts)

Pantallas: **Gestión de Cuentas**, **Nueva Cuenta**, **Detalle de cuenta**, **Editar cuenta**, **Hoja · Opciones de la cuenta**, **Hoja · Eliminar cuenta** (3 estados), **Hoja · Confirmar eliminación**, **Cuentas desactivadas**.

| Id | Tarea |
| --- | --- |
| S4-DOM01 | `BalanceCalculator` para cuentas de activo (diseño §6.9.5); `CreateAccount`, `UpdateAccount` (nombre y saldo inicial), `RemoveAccount` (DEACTIVATE, MOVE, DELETE_ALL), `ReactivateAccount`, `AccountImpact` |
| S4-DAT01 | `AccountRepositoryImpl` con la consulta de saldos (diseño §6.6.3); escrituras atómicas en `PENDING` |
| S4-UI01 | Pantallas de cuentas. En "Nueva cuenta", los tipos Tarjeta de crédito y Préstamo aparecen deshabilitados con "Disponible pronto" (S7 y S10) |
| S4-UI02 | Confirmación reforzada: botón habilitado solo si el nombre coincide (REQ-CTA-05) |
| S4-SRV01 | Validadores de cuenta (tipo inmutable al actualizar) |
| S4-QA01 | `BalanceCalculatorTest`; `RemoveAccountTest` (tabla de decisión); pruebas de UI de la confirmación |

### S4-H02 · Categorías (5 pts)

Pantallas: **Categorías**, **Hoja · Nueva categoría**.

| Id | Tarea |
| --- | --- |
| S4-DOM02 | `CreateCategory`, `RenameCategory`, `DeleteCategory` (exige una categoría destino si tiene transacciones), regla de un solo nivel |
| S4-DAT02 | `CategoryRepositoryImpl` con totales por categoría |
| S4-UI03 | Categorías (gastos e ingresos con subcategorías), hoja de nueva categoría y hoja de reasignación al eliminar |
| S4-SRV02 | Validador: el `kind` de la subcategoría es igual al del padre; la profundidad es 1 |
| S4-QA02 | `DeleteCategoryTest`, `CategoryRepositoryTest` |

### S4-H03 · Inicio (5 pts)

Pantalla: **Inicio (con Próximos Pagos)** (sin pendientes ni etiquetas todavía).

| Id | Tarea |
| --- | --- |
| S4-DOM03 | `ObserveHomeDashboard`: saldo total disponible (cuentas incluidas), cuentas activas, movimientos de los últimos 5 días |
| S4-UI04 | Inicio: tarjeta de saldo con el indicador mensual, accesos rápidos (deshabilitados hasta S5), carrusel de cuentas, "Últimos 5 días" agrupado por Hoy, Ayer, Antier y fecha (REQ-TRX-11) |
| S4-QA03 | `HomeViewModelTest` (solo cuentas activas e incluidas) |

---

## Sprint 5 — Transacciones e historial · `v0.6.0`

**Objetivo:** registrar gastos, ingresos y transferencias (también sin conexión), consultarlos con filtros y búsqueda, editarlos y eliminarlos.
**Prueba del PO:** AT-HU01-1 a 3, AT-HU02-1, AT-HU03-1 a 3, AT-HU05-1.
**Secuencias:** [SEQ-04](../03-design/sequences/04-record-expense-or-income.md), [SEQ-05](../03-design/sequences/05-transfer.md), [SEQ-14 §14.1](../03-design/sequences/14-edit-delete-and-restore.md).

### S5-H01 · Registrar gasto, ingreso y transferencia (8 pts)

Pantallas: **Nueva Transacción**, **Nueva Transferencia**; accesos rápidos y botón + de Inicio.

| Id | Tarea |
| --- | --- |
| S5-DB01 | `V7__create_recurring_and_history.sql` (se usa `change_log`; `recurring_expenses` queda lista para S6) |
| S5-DOM01 | `RegisterTransaction`, `RegisterTransfer` (validaciones de REQ-TRX-01, 02) y `ChangeLogWriter` |
| S5-DAT01 | `TransactionRepositoryImpl` (insertar con `change_log` en la misma transacción), entidad y DAO de `change_log` |
| S5-UI01 | Formulario con pestañas Gasto, Ingreso y Transferencia; monto, categoría, cuenta (última usada), fecha y hora prellenadas y editables, nota y **etiqueta** (selector con "crear etiqueta" en línea, REQ-TRX-01) |
| S5-UI02 | Accesos rápidos y botón + de Inicio activos (≤ 2 toques a la transferencia, ≤ 4 interacciones para un gasto) |
| S5-SRV01 | `SyncHandler` de `changeLog`; validador: el `kind` de la categoría coincide con el `type` de la transacción |
| S5-QA01 | `RegisterTransactionTest`, `RegisterTransferTest`; benchmark de guardado < 300 ms |

### S5-H02 · Historial completo, búsqueda y filtros (8 pts)

Pantallas: **Historial**, **Hoja · Filtros del historial**.

| Id | Tarea |
| --- | --- |
| S5-DOM02 | `SearchTransactions(filter, query)`: tipo, categoría y subcategoría, cuenta, etiqueta, rango de fechas y texto parcial en nota, categoría, cuenta y etiqueta |
| S5-DAT02 | Consulta paginada (Paging 3) ordenada por `occurredAt`; agrupación por mes y día |
| S5-UI03 | Historial: selector de mes, búsqueda en vivo, chips de tipo, hoja de filtros combinables, encabezados por mes y día |
| S5-QA02 | `TransactionDaoTest` (orden, filtros combinados, búsqueda), `HistoryViewModelTest` |

### S5-H03 · Detalle, edición y eliminación (5 pts)

Pantallas: **Detalle de transacción**, **Diálogo · Eliminar transacción**.

| Id | Tarea |
| --- | --- |
| S5-DOM03 | `UpdateTransaction`, `DeleteTransaction` (borrado lógico + `change_log`) |
| S5-UI04 | Detalle, edición (reutiliza el formulario) y diálogo de eliminación |
| S5-QA03 | Pruebas de edición y eliminación, incluido sin conexión |

---

## Sprint 6 — Gastos recurrentes y avisos · `v0.7.0`

**Objetivo:** programar gastos recurrentes, verlos como pendientes en Inicio, pagarlos, omitirlos o finalizarlos y recibir avisos.
**Prueba del PO:** AT-HU07-1 a 3; recibir la notificación de un pendiente.
**Secuencia:** [SEQ-10](../03-design/sequences/10-pending-recurring-and-reminders.md).

### S6-H01 · Recurrentes (8 pts)

Pantallas: **Gastos Recurrentes**, **Nuevo gasto recurrente**.

| Id | Tarea |
| --- | --- |
| S6-DOM01 | `RecurrenceCalculator` (todas las frecuencias, personalizada, día 31 y febrero); `CreateRecurring`, `UpdateRecurring` |
| S6-DAT01 | Entidad y DAO de `recurring_expenses`; repositorio |
| S6-SRV01 | `SyncHandler` de `recurringExpense`; validador (la categoría es de gasto, REQ-REC-11) |
| S6-UI01 | Lista con compromisos del mes y filtros por estado; formulario con frecuencias |
| S6-QA01 | `RecurrenceCalculatorTest` (valores límite de fechas) |

### S6-H02 · Pendientes en Inicio: pagar, omitir y finalizar (5 pts)

Pantallas: **Inicio** (Próximos pagos), **Hoja · Pendiente**, **Hoja · Pagar pendiente**.

| Id | Tarea |
| --- | --- |
| S6-DOM02 | `ObservePendingPayments` (ventana y urgencia), `PayPending`, `SkipPending`, `EndRecurrence` |
| S6-UI02 | Sección Próximos pagos con urgencia (UPCOMING, SOON, OVERDUE); hojas de acción y de pago con monto, fecha y cuenta editables |
| S6-QA02 | `PayPendingTest` (crea el gasto, avanza la fecha, guarda el último monto) |

### S6-H03 · Avisos y ajustes (5 pts)

| Id | Tarea |
| --- | --- |
| S6-DAT02 | `ReminderWorker` diario, `NotificationPublisher` (canal "Pagos pendientes"), solicitud del permiso `POST_NOTIFICATIONS`; *deep link* a la Hoja · Pendiente |
| S6-UI03 | Ajustes: interruptor de notificaciones y anticipación de avisos (0–30, por defecto 5) |
| S6-QA03 | `ReminderWorkerTest` con `Clock` simulado (aviso al abrir la ventana y el día de vencimiento, sin duplicados, desactivado) |

---

## Sprint 7 — Tarjetas de crédito · `v0.8.0`

**Objetivo:** registrar tarjetas, compras a cuotas con su tasa y pagar la tarjeta (mínimo o total).
**Prueba del PO:** AT-HU08-1 a 3, AT-HU09-1 y 2.
**Secuencias:** [SEQ-06](../03-design/sequences/06-card-purchase-in-installments.md), [SEQ-07](../03-design/sequences/07-pay-credit-card.md).

### S7-H01 · Tarjetas y motor de cuotas (8 pts)

Pantallas: **Nueva Tarjeta de Crédito**, **Detalle de tarjeta**.

| Id | Tarea |
| --- | --- |
| S7-DB01 | `V8__create_credit_and_loans.sql` y `V9__add_cross_references_and_indexes.sql` |
| S7-DOM01 | `RateConverter`, `InstallmentCalculator` (capital fijo, interés con mes de 30 días, primera cuota sin intereses, ajuste del redondeo), `CardPeriodCalculator` |
| S7-DOM02 | `BalanceCalculator` para cuentas de deuda (saldo negativo; los pagos reducen la deuda por su capital) |
| S7-DAT01 | Entidades y DAO de `credit_card_details`, `deferred_purchases`, `installments`; repositorio |
| S7-SRV01 | `SyncHandler` de `creditCardDetails`, `deferredPurchase` e `installment`; validadores (dueño XOR, suma de capital igual al monto) |
| S7-UI01 | Nueva tarjeta (cupo, deuda actual, corte, pago, tasa EA/MV con conversión visible, primera cuota sin intereses); habilitar el tipo en Nueva cuenta; detalle con deuda, cupo, lo que vence, condiciones y compras diferidas |
| S7-QA01 | `RateConverterTest`, `InstallmentCalculatorTest` (+ propiedades), `CardPeriodCalculatorTest` (cortes 28 a 31) |

### S7-H02 · Compra con tarjeta a cuotas (5 pts)

Pantalla: **Nueva Transacción · Tarjeta de crédito**.

| Id | Tarea |
| --- | --- |
| S7-DOM03 | `DeferCardPurchase` (1 cuota o plan); deuda inicial como compra a 1 cuota (REQ-TC-13) |
| S7-UI02 | Al elegir una tarjeta se despliegan "Condiciones del crédito"; con 2 o más cuotas aparece la tasa prellenada y editable (RNF-15) |
| S7-QA02 | `DeferCardPurchaseTest` (ejemplo de HU-08) |

### S7-H03 · Pago de la tarjeta (5 pts)

Pantallas: **Hoja · Pagar tarjeta**, **Detalle de transacción · Pago de tarjeta**; pendiente de la tarjeta en Inicio.

| Id | Tarea |
| --- | --- |
| S7-DOM04 | `PayCreditCard` (mínimo, total con liquidación sin intereses futuros, desglose de un monto editado); pendiente de tarjeta en `ObservePendingPayments` |
| S7-UI03 | Hoja de pago (opciones, cuenta de origen, monto, desglose); detalle del pago con desglose |
| S7-QA03 | `PayCreditCardTest`; los intereses cuentan en `FINANCIAL_CHARGES` |

---

## Sprint 8 — Importar, exportar y producción · `v1.0.0`

**Objetivo:** traer el histórico de Cashew, exportar a CSV y publicar la versión 1.0 en producción.
**Prueba del PO:** AT-HU11-1 a 3; humo completo en producción; escenarios de calidad E1–E9.
**Secuencia:** [SEQ-13](../03-design/sequences/13-import-and-export.md).

### S8-H01 · Importación (8 pts)

Pantalla: **Importar y exportar** (más los pasos de mapeo, vista previa y resumen, con los componentes del sistema de diseño).

| Id | Tarea |
| --- | --- |
| S8-DAT01 | `CsvReader` y `XlsxReader` en streaming (`TabularReader`); detección del separador y la codificación |
| S8-DOM01 | Mapeo de columnas (sugerido para Cashew y para la plantilla), `PreviewImport` (errores por fila), `DuplicateDetector`, resolución de cuentas y categorías desconocidas |
| S8-DAT02 | `CommitImport` + `ImportWorker` (lotes de 500 con progreso; todo queda `PENDING`); resumen |
| S8-UI01 | Flujo: elegir archivo (SAF) → mapear → vista previa → resolver desconocidas y duplicados → importar → resumen |
| S8-QA01 | `CsvReaderTest`, `XlsxReaderTest`, `DuplicateDetectorTest`, `ImportWorkerTest` (5.000 filas < 60 s) con el CSV de Cashew anonimizado (pregunta abierta: columnas exactas; el PO aporta un ejemplo en la planificación) |

### S8-H02 · Exportación y plantilla (3 pts)

| Id | Tarea |
| --- | --- |
| S8-DOM02 | `ExportCsv(range)` y `CsvWriter` (mismas columnas que la plantilla) |
| S8-UI02 | Exportar con rango opcional (todo, este mes, mes anterior, personalizado) y "Descargar plantilla" |
| S8-QA02 | Ida y vuelta: exportar → importar sin cambiar el mapeo |

### S8-H03 · Salida a producción (5 pts)

| Id | Tarea |
| --- | --- |
| S8-OPS01 | Servicio `coffer-server` en Render (rama `main`) y Neon `production`; secretos de producción; snapshot `pre-v1.0.0` |
| S8-OPS02 | Pipeline de release de la app con pruebas instrumentadas en emulador API 31 |
| S8-QA03 | Macrobenchmark de arranque con 10.000 transacciones (< 2 s) y de guardado (< 300 ms); humo en producción; auditorías funcional y física |
| S8-OPS03 | Reclamo de los datos del MVP en producción (data-model §4.4); `V10__drop_transactions_mvp.sql` en un PATCH posterior, cuando el PO confirme que los datos están bien |
| S8-OPS04 | Línea base **BL-3** (`v1.0.0`) |

---

## Sprint 9 — Reportes y etiquetas · `v1.1.0`

**Objetivo:** entender en qué se gasta: reportes por categoría y periodo, intereses pagados y etiquetas transversales.
**Prueba del PO:** AT-HU10-1 y 2; revisar el reporte del mes contra los movimientos reales.

### S9-H01 · Reportes (8 pts)

Pantalla: **Reportes**.

| Id | Tarea |
| --- | --- |
| S9-DOM01 | `ReportAggregator`: por categoría y subcategoría; semana, mes o rango; evolución de 6 periodos; transferencias excluidas; diferidas por cuota en su fecha de pago; intereses y cargos por tarjeta y préstamo; conteo de transacciones |
| S9-UI01 | Pestaña Reportes (selector de periodo, resumen, gráfico de evolución, por categoría, intereses, actividad) |
| S9-QA01 | `ReportAggregatorTest` |

### S9-H02 · Etiquetas (5 pts)

Pantallas: **Etiquetas**, **Detalle de etiqueta**, **Hoja · Nueva etiqueta**; sección "Etiquetas fijadas" de Inicio.

| Id | Tarea |
| --- | --- |
| S9-DOM02 | `CreateTag`, `RenameTag`, `DeleteTag`, `PinTag`, `ObserveTagSummary(rango)` |
| S9-UI02 | Lista, detalle (mes actual, mes anterior, rango; por categoría; movimientos) y etiquetas fijadas en Inicio |
| S9-QA02 | `TagSummaryTest` |

---

## Sprint 10 — Préstamos · `v1.2.0`

**Objetivo:** registrar préstamos recibidos (detallado o simple), pagar sus cuotas y hacer abonos a capital.
**Prueba del PO:** AT-HU14-1 y 2.
**Secuencia:** [SEQ-11](../03-design/sequences/11-loan-and-principal-payment.md).

### S10-H01 · Registro y plan del préstamo (8 pts)

Pantallas: **Nuevo préstamo · Detallado**, **Nuevo préstamo · Simple**, **Detalle de préstamo**.

| Id | Tarea |
| --- | --- |
| S10-DOM01 | `LoanScheduler` (plan con seguro y costos), `CreateLoan` (detallado con transferencia de desembolso, simple), conversión simple → detallado |
| S10-SRV01 | `SyncHandler` de `loanDetails`; validador por modo |
| S10-UI01 | Formularios (aviso de REQ-PRE-10), detalle con plan de pagos; habilitar el tipo Préstamo en Nueva cuenta; tarjeta del préstamo en Gestión de cuentas |
| S10-QA01 | `LoanSchedulerTest` (ejemplo de HU-14) |

### S10-H02 · Cuotas y abonos (5 pts)

Pantalla: **Hoja · Abono a capital**; cuotas como pendientes.

| Id | Tarea |
| --- | --- |
| S10-DOM02 | `PayLoanInstallment` (transferencia con desglose), `ExtraPayment` (reducir plazo o cuota, recalcular el plan); cuotas en `ObservePendingPayments` |
| S10-UI02 | Hoja de abono con simulación de ambas opciones |
| S10-QA02 | `ExtraPaymentTest` |

---

## Sprint 11 — Historial de cambios, saldo neto, Google y personalización · `v1.3.0`

**Objetivo:** completar las funciones *Should* restantes.
**Prueba del PO:** AT-HU04-1 y 2, AT-HU12-1 y 2, AT-AUT-03.

### S11-H01 · Historial de cambios (5 pts)

Pantalla: **Historial de cambios**.

| Id | Tarea |
| --- | --- |
| S11-DOM01 | `RestoreTransaction`, `RevertEdit`; purga local de más de 90 días al iniciar |
| S11-SRV01 | `ChangeLogPurgeJob` (diario) y `TombstonePurgeJob` (mensual) |
| S11-UI01 | Historial agrupado por día con Restaurar y Revertir |
| S11-QA01 | `ChangeLogRepositoryTest`, `ChangeLogPurgeJobIT` |

### S11-H02 · Saldo neto y disponible (3 pts)

Pantallas: **Hoja · Detalle del saldo**, Ajustes (vista del saldo).

| Id | Tarea |
| --- | --- |
| S11-DOM02 | Saldo neto (cuentas incluidas − lo que vence de tarjetas − cuota del periodo de préstamos) |
| S11-UI02 | Hoja de detalle del saldo y elección de la vista para Inicio |
| S11-QA02 | `BalanceCalculatorTest` (HU-04) |

### S11-H03 · Inicio con Google (5 pts)

| Id | Tarea |
| --- | --- |
| S11-SRV02 | `GoogleTokenVerifier` + `POST /auth/google` (vincular por correo o crear usuario) |
| S11-DAT01 | Credential Manager + `googleid`; registrar las huellas SHA-1 de `staging` y `release` en Google Cloud |
| S11-UI03 | Botón "Continuar con Google" activo en Iniciar sesión y Registro |
| S11-QA03 | `GoogleTokenVerifierTest` (aud, exp, firma) |

### S11-H04 · Personalizar Inicio y decimales (3 pts)

Pantalla: **Personalizar inicio**; Ajustes.

| Id | Tarea |
| --- | --- |
| S11-UI04 | Mostrar, ocultar y reordenar tarjetas de Inicio (`homeCards`) |
| S11-UI05 | Decimales 0 o 2 (RNF-13) |
| S11-QA04 | `CustomizeHomeTest` |

---

## 2. Después de `v1.3.0`

| Pendiente | Origen |
| --- | --- |
| Manual de usuario (`docs/09-user`) | Plan del proyecto |
| Funciones *Could*: calendario de saldos (F16), presupuestos (F17), registro automático (F19), proyección del mes (F26) | SRS §9 |
| `V10__drop_transactions_mvp.sql` si no se aplicó en S8 | data-model §4.2 |

## 3. Preguntas abiertas que bloquean historias

| Pregunta (SRS §10.2) | Historia bloqueada | Cuándo resolver |
| --- | --- | --- |
| Lista concreta de categorías base | S3-DAT07 | Planificación de S3 |
| Columnas exactas del CSV de Cashew (y un archivo de ejemplo) | S8-H01 | Planificación de S8 |
| Intereses de compras entre corte y pago | S7-DOM01 (`interestForGracePeriod`, hoy 0) | Planificación de S7 |
| Proveedor de hosting (ADR-0009 *Propuesto*) | S1-OPS03 | Antes de S1 |
