# Plan de pruebas — Coffer

Plan de pruebas del proyecto según **ISO/IEC/IEEE 29119-3:2021** (*Software testing — Part 3: Test documentation*), cláusula *Test Plan*. Los procesos siguen ISO/IEC/IEEE 29119-2 y las técnicas de diseño, ISO/IEC/IEEE 29119-4.

## 1. Información del documento

| Campo | Valor |
| --- | --- |
| Identificador | FA-TP-001 |
| Versión | 1.0 |
| Fecha | 2026-10-09 |
| Estado | Aprobado para la v1.0 |
| Autor | @Julian, con redacción asistida por Claude |
| Aprobación | @Julian (product owner) |
| Alcance | Plan de proyecto (*project test plan*) que cubre todos los niveles y tipos de prueba de la v1.0 |

### 1.1 Historial

| Versión | Fecha | Cambio |
| --- | --- | --- |
| 1.0 | 2026-10-09 | Versión inicial alineada con SRS 1.0, arquitectura 1.0 y diseño detallado 1.0 |

### 1.2 Referencias

| Id | Documento |
| --- | --- |
| [T1] | ISO/IEC/IEEE 29119-1, -2, -3 y -4 |
| [T2] | [SRS v1.0](../01-requirements/srs.md): requisitos, historias de usuario y criterios de aceptación |
| [T3] | [Arquitectura](../02-architecture/architecture.md) §10 (escenarios de calidad) y [ADR](../02-architecture/adr/README.md) |
| [T4] | [Diseño detallado](../03-design/detailed-design.md) §8 (trazabilidad) y [modelo de datos](../03-design/data-model.md) |
| [T5] | [Contrato de la API](../04-api/openapi.yml) |
| [T6] | [Plan de gestión de configuración](../06-settings/manage-config.md) (ramas, versiones, releases) |

### 1.3 Glosario

| Término | Definición (29119-1) |
| --- | --- |
| Elemento de prueba | Producto que se prueba: `coffer-app`, `coffer-server`, el contrato de la API, las migraciones. |
| Condición de prueba | Aspecto comprobable de un elemento (por ejemplo, "el saldo neto descuenta solo lo que vence"). |
| Caso de prueba | Precondiciones, entradas y resultado esperado para cubrir una condición. |
| Procedimiento de prueba | Secuencia de casos para ejecutar (manual o automatizada). |
| Criterio de finalización | Condición para dar por terminada una actividad de prueba. |
| Base de prueba | Documentación a partir de la cual se diseñan las pruebas (SRS, diseño, contrato). |

---

## 2. Contexto de las pruebas

### 2.1 Proyecto y elementos de prueba

| Elemento | Versión objetivo | Repositorio | Base de prueba |
| --- | --- | --- | --- |
| App Android `coffer-app` | 1.0.0 | `Julian049/coffer-app` | SRS, diseño §6, secuencias, prototipo de Figma |
| Servicio `coffer-server` | 1.0.0 | `Julian049/coffer-server` | Contrato `openapi.yml`, ADR, diseño §6 |
| Migraciones Flyway V3–V10 | — | `coffer-server` | `data-model.md` §4 |
| Migración local del MVP (`LegacyDatabaseMigrator`) | — | `coffer-app` | `data-model.md` §5.2 |
| Despliegue (Render + Neon) | — | — | ADR-0009, plan de configuración |

### 2.2 Alcance

**Incluido:** todos los requisitos *Must* y *Should* del SRS (F01–F15, F23–F25, F28–F31), los RNF-01 a RNF-18, el protocolo de sincronización, las migraciones de datos del MVP y la aceptación de cada incremento.

**Excluido:** funciones *Could* no planificadas (F16, F17, F19, F26) y *Won't (v1)* (F18, F20–F22, F27); pruebas de carga multiusuario (un solo usuario en la v1.0); pruebas en iOS o web; certificación formal de seguridad (se hacen pruebas de seguridad dirigidas, §5.1).

### 2.3 Supuestos y restricciones

| Tipo | Descripción |
| --- | --- |
| Supuesto | Un desarrollador (con asistencia de IA) escribe el código y las pruebas automatizadas; el product owner revisa y prueba manualmente cada PR o release. |
| Supuesto | GitHub Actions y Docker están disponibles para ejecutar Testcontainers y emuladores. |
| Restricción | Hosting gratuito con arranque en frío: las pruebas en staging toleran una primera petición lenta. |
| Restricción | Sin presupuesto para granjas de dispositivos: se prueba en emulador (API 31 y 36) y en el teléfono del product owner. |
| Restricción | Los datos reales del usuario no se usan en pruebas; el CSV de Cashew se anonimiza. |

### 2.4 Partes interesadas

| Parte interesada | Interés en las pruebas |
| --- | --- |
| Product owner (@Julian) | Que cada incremento funcione en su teléfono antes de aprobar el PR o el release |
| Desarrollador (@Julian + Claude) | Retroalimentación rápida en CI; no romper lo existente |
| Evaluador académico | Evidencia trazable de verificación y validación |

---

## 3. Comunicación de las pruebas

| Información | Medio | Frecuencia | Responsable |
| --- | --- | --- | --- |
| Resultado de las pruebas automatizadas | Checks de GitHub Actions en cada PR + reporte JUnit y JaCoCo/Kover como artefacto | Cada push | CI |
| Instrucciones de prueba manual del PR | Sección "Cómo probar" de la plantilla de PR, con los casos de aceptación afectados | Cada PR | Desarrollador |
| Resultado de la prueba manual | Comentario de aprobación o solicitud de cambios en el PR | Cada PR | Product owner |
| Reporte de pruebas del incremento | `docs/05-test/reports/sprint-NN.md` (estado de casos, defectos y cobertura) | Fin de cada sprint | Desarrollador |
| Defectos | GitHub Issues con etiqueta `bug` y severidad | Al detectarse | Quien lo detecte |

---

## 4. Registro de riesgos

Las pruebas se priorizan por riesgo (29119-2, enfoque basado en riesgo). P = probabilidad, I = impacto (1 a 3); exposición = P × I.

### 4.1 Riesgos de producto

| Id | Riesgo | P | I | Exp. | Tratamiento en pruebas |
| --- | --- | --- | --- | --- | --- |
| RP-01 | La sincronización duplica o pierde transacciones | 2 | 3 | 6 | Integración del push/pull con Testcontainers; casos de reintento, corte de red y edición durante el envío (§6.2, SYN) |
| RP-02 | Cálculos de cuotas, intereses o saldos incorrectos | 2 | 3 | 6 | Unitarias con los ejemplos del SRS, valores límite y pruebas basadas en propiedades (Σ cuotas = monto) |
| RP-03 | Un usuario accede a datos de otro | 1 | 3 | 3 | Pruebas de propiedad (owner) en push/pull y FK compuestas |
| RP-04 | La migración del MVP pierde o corrompe datos | 2 | 3 | 6 | `FlywayMigrationIT` sobre datos del MVP; prueba instrumentada de `LegacyDatabaseMigrator` |
| RP-05 | La app falla o se bloquea sin conexión | 2 | 3 | 6 | Pruebas en modo avión; regla "ninguna pantalla espera a la red" |
| RP-06 | Rendimiento insuficiente con 10.000 transacciones | 2 | 2 | 4 | Macrobenchmark de arranque y guardado (RNF-02, 03) |
| RP-07 | La importación de Cashew no reconoce el formato | 3 | 2 | 6 | Pruebas con el CSV real anonimizado y archivos con errores |
| RP-08 | Tokens o base local legibles en el dispositivo | 1 | 3 | 3 | Prueba instrumentada de cifrado (RNF-08, 09) |
| RP-09 | Avisos de pendientes duplicados o ausentes | 2 | 2 | 4 | Unitarias de `RecurrenceCalculator` y `ReminderWorker` con `Clock` simulado |
| RP-10 | Cliente y servidor divergen del contrato | 2 | 2 | 4 | Prueba de contrato contra `openapi.yml` en ambos repositorios |

### 4.2 Riesgos de proyecto

| Id | Riesgo | Tratamiento |
| --- | --- | --- |
| RJ-01 | Poco tiempo para la prueba manual en cada PR | PR pequeños (una historia); lista "Cómo probar" de máximo 10 pasos |
| RJ-02 | Pruebas inestables (*flaky*) en CI por emuladores | Pruebas de UI con Robolectric en CI; emulador solo en el pipeline de release |
| RJ-03 | Cambios en el hosting gratuito impiden probar en staging | Entorno local equivalente con Docker Compose (§7) |
| RJ-04 | Código generado con IA sin pruebas suficientes | Criterio de salida: ningún PR sin pruebas de sus casos; cobertura mínima por paquete (§5.4) |

---

## 5. Estrategia de pruebas

### 5.1 Niveles y tipos de prueba

| Nivel o tipo | Objetivo | Elementos | Herramientas | Quién | Dónde |
| --- | --- | --- | --- | --- | --- |
| **Unitarias** | Lógica aislada | `domain/finance`, casos de uso, ViewModels, servicios y validadores del servidor | JUnit 5, MockK, Turbine, kotest-property · JUnit 5, Mockito, AssertJ | Desarrollador | Local y CI |
| **Integración (servidor)** | Servicio + PostgreSQL real | `PushService`, `PullService`, auth, migraciones, repositorios | `@SpringBootTest`, Testcontainers PostgreSQL 16, MockMvc | Desarrollador | CI |
| **Integración (app)** | Room, worker y red simulada | DAO, migraciones, `SyncWorker`, `ChangeApplier`, `ImportWorker` | Robolectric, Room in-memory, MockWebServer, WorkManager TestDriver | Desarrollador | CI |
| **Componente (UI)** | Pantallas y estados | Composables de cada feature | Compose UI Test (Robolectric en CI), *screenshot tests* con Roborazzi | Desarrollador | CI |
| **Contrato** | Cliente y servidor cumplen `openapi.yml` | Controladores y DTO | springdoc + comparación con `openapi.yml`; validación de JSON de ejemplo en la app | Desarrollador | CI |
| **Arquitectura** | Límites entre módulos y reglas (sin `double`) | Paquetes | ArchUnit · Konsist | Desarrollador | CI |
| **Sistema (E2E)** | Flujos completos app ↔ servidor | APK `staging` + servidor staging | Pruebas instrumentadas en emulador; procedimientos manuales | Desarrollador | Pipeline de release |
| **Aceptación** | Validar las historias de usuario | Incremento completo | Procedimientos manuales derivados de los criterios Dado/Cuando/Entonces (§9) | Product owner | Teléfono del PO + staging |
| **Rendimiento** | RNF-02, RNF-03, RNF-04 | Arranque, guardado, importación | Jetpack Macrobenchmark; medición de la importación | Desarrollador | Release (dispositivo de gama media) |
| **Seguridad** | RNF-07 a RNF-11, RNF-17 | Auth, cifrado, propiedad, errores | Pruebas de integración dirigidas; OWASP Dependency-Check; revisión de `ProblemDetail` | Desarrollador | CI |
| **Resiliencia offline** | RNF-05, RNF-06 | App sin red; servidor dormido | Modo avión; MockWebServer con retrasos y 503 | Desarrollador y PO | CI y manual |
| **Regresión** | No romper lo existente | Todo | Suite automatizada completa + humo manual (§5.7) | CI y PO | Cada PR y release |

### 5.2 Técnicas de diseño de pruebas (29119-4)

| Técnica | Dónde se aplica | Ejemplo |
| --- | --- | --- |
| Partición de equivalencia | Validaciones de formularios y DTO | Monto: negativo, cero, positivo; usuario: válido o inválido según `^[a-z0-9._]{3,40}$` |
| Análisis de valores límite | Montos, días del mes, cuotas, ventana de avisos | Cuotas 1, 2, 72, 73; día de corte 28, 29, 30, 31 en febrero; `reminderLeadDays` 0, 5, 30 |
| Tablas de decisión | Reglas combinadas | Quitar cuenta (opción × estado × tiene transacciones); tipo de transacción × categoría × destino |
| Transición de estados | Ciclos de vida del diseño §6.8 | `syncState`, sesión, cuota, recurrente, cuenta: cubrir todas las transiciones válidas y probar las inválidas |
| Casos de uso y escenarios | Historias HU-01 a HU-14 | Cada criterio Dado/Cuando/Entonces es un caso de aceptación (§9) |
| Pruebas basadas en propiedades | Motor financiero | Para todo monto P > 0 y n entre 1 y 72: Σ capital = P; EA→MV→EA ≈ EA; saldo neto ≤ disponible |
| Predicción de errores | Sincronización y fechas | Zona horaria, cambio de día a medianoche, reintento duplicado, reloj del dispositivo desfasado |
| Cobertura de sentencias y decisiones (caja blanca) | Código | Umbrales de §5.4 |

### 5.3 Entregables de prueba

| Entregable (29119-3) | Forma | Ubicación |
| --- | --- | --- |
| Plan de pruebas | Este documento | `docs/05-test/test-plan.md` |
| Especificación de diseño y casos de prueba | Código de las pruebas automatizadas (nombres `dado_cuando_entonces`) y tabla de casos de aceptación (§9) | Repositorios y este documento |
| Procedimientos de prueba manual | Sección "Cómo probar" de cada PR; procedimiento de humo (§5.7) | PR y este documento |
| Datos de prueba | Fixtures y *builders*; CSV de ejemplo | `src/test/resources`, `app/src/test/resources` |
| Registros de ejecución | Reportes JUnit de CI; comentarios del PO en el PR | GitHub Actions y PR |
| Reporte de incidentes | GitHub Issues (`bug`) | Repositorio afectado |
| Reporte de estado y de finalización | `reports/sprint-NN.md` y `reports/release-X.Y.Z.md` | `docs/05-test/reports/` |

### 5.4 Criterios de entrada, salida y finalización

| Actividad | Entrada | Salida o finalización |
| --- | --- | --- |
| PR a `develop` | Historia con criterios de aceptación; rama actualizada | CI en verde; cobertura de líneas y ramas: `domain/finance` ≥ 90 %, `domain` ≥ 80 %, servidor ≥ 75 %; sin reglas de arquitectura rotas; casos de aceptación de la historia automatizados o documentados; aprobación del PO tras la prueba manual |
| Fin de sprint (release candidata) | Todas las historias del sprint en `develop`; staging desplegado | Suite de regresión en verde; humo manual completo; sin defectos abiertos de severidad crítica o alta; reporte del sprint publicado |
| Release a `main` (producción) | Release candidata aprobada | Migraciones aplicadas en staging sin error; checklist de release (plan de configuración §6) completo |
| Release 1.0.0 | Todas las historias Must | 100 % de los casos de aceptación Must aprobados; escenarios de calidad E1–E9 (arquitectura §10.2) cumplidos |

### 5.5 Datos de prueba

| Conjunto | Contenido | Uso |
| --- | --- | --- |
| Ejemplos del SRS | $1.200.000 a 12 cuotas al 2 % MV; saldo neto $200.000; préstamo $5.000.000 a 24 cuotas; recurrente a 5 días | Unitarias del motor financiero y aceptación |
| `TestData` (*builders*) | `aTransaction().expense().amount("28000")…`, `anAccount().creditCard()…` | Unitarias e integración |
| Base del MVP | Filas V1/V2 con ingreso, gasto y monto cero | `FlywayMigrationIT`, `LegacyDatabaseMigratorTest` |
| Volumen | Generador de 10.000 transacciones repartidas en 2 años | Macrobenchmark (RNF-02) |
| Importación | `cashew-sample.csv` (anonimizado), `plantilla.csv`, `errores.csv` (fechas y montos inválidos), `duplicados.csv`, `cashew-5000.csv` | `CsvReaderTest`, `DuplicateDetectorTest`, RNF-04 |
| Usuarios | `ana` y `beto` con datos propios | Pruebas de propiedad (RP-03) |

Regla: ningún dato real del usuario en los repositorios; los secretos de prueba (claves JWT de test) se generan en el arranque de la prueba.

### 5.6 Entorno de pruebas

| Entorno | Composición | Uso |
| --- | --- | --- |
| Local | JDK 21, Docker Compose (PostgreSQL 16), Android Studio, emulador API 31 y 36 | Desarrollo y depuración |
| CI | GitHub Actions `ubuntu-latest`: Maven + Testcontainers; Gradle + Robolectric; emulador API 31 (*reactivecircus/android-emulator-runner*) solo en el workflow de release | Unitarias, integración, componente, contrato, arquitectura |
| Staging | Render (servicio `staging`, rama `develop`) + Neon (rama de base `staging`) · APK `staging` firmado como debug y publicado como artefacto | Sistema y aceptación manual |
| Producción | Render (`main`) + Neon (`production`) · APK `release` | Humo posterior al despliegue |
| Dispositivos | Emulador Pixel API 31 (mínimo) y API 36 (objetivo) · teléfono del PO | Compatibilidad (RNF-01) y aceptación |

### 5.7 Re-prueba y regresión

- **Re-prueba:** cada defecto corregido incluye una prueba automatizada que falla antes del arreglo (`regression/BUG-<n>`).
- **Regresión automatizada:** la suite completa corre en cada PR.
- **Humo manual (10 min, en cada release candidata):**
  1. Login.
  2. Registrar un gasto sin conexión.
  3. Reconectar y ver "Sincronizado".
  4. Transferencia desde Inicio.
  5. Compra con tarjeta a 3 cuotas.
  6. Pagar un pendiente.
  7. Ver el reporte del mes.
  8. Exportar CSV.
  9. Cerrar y abrir la app: no pide credenciales.

### 5.8 Suspensión y reanudación

| Suspender cuando | Reanudar cuando |
| --- | --- |
| CI en rojo en `develop` | Se corrige el build o la prueba |
| Staging no despliega o las migraciones fallan | Despliegue sano (`/actuator/health` = UP) |
| Defecto crítico que bloquea más del 30 % de los casos de aceptación del sprint | Defecto corregido y re-probado |

### 5.9 Gestión de defectos

| Severidad | Definición | Atención |
| --- | --- | --- |
| Crítica | Pérdida o corrupción de datos, exposición de datos, la app no abre | Bloquea el release; *hotfix* si está en producción |
| Alta | Una función Must no se puede usar o calcula mal | Se corrige en el sprint |
| Media | Función con alternativa, o error en una función Should | Se planifica |
| Baja | Cosmético o de texto | Backlog |

Ciclo: `abierto` → `en progreso` → `corregido` (PR enlazado) → `verificado` (PO) → `cerrado`.

---

## 6. Diseño de pruebas por área

Suites automatizadas mínimas por área funcional, con su trazabilidad.

| Área | Suites (clase de prueba) | Casos clave | Requisitos |
| --- | --- | --- | --- |
| Autenticación | `AuthControllerIT`, `TokenServiceTest`, `GoogleTokenVerifierTest`, `LoginViewModelTest` | Registro correcto o duplicado; login con usuario y con correo; contraseña errónea con mensaje genérico; 6.º intento → 429; refresh rota y revoca; refresh reutilizado revoca la familia; Google con `aud` incorrecto → 401 | REQ-AUT-01 a 06, RNF-11 |
| Sesión | `SessionStoreTest` (instrumentada), `TokenAuthenticatorTest` | Tokens persisten al cerrar la app; 401 → un solo refresh concurrente; sesión expirada conserva los datos | REQ-AUT-04, 06, RNF-09 |
| Cuentas y saldos | `BalanceCalculatorTest`, `AccountRepositoryTest`, `RemoveAccountTest` | Saldo = inicial + ingresos − gastos ± transferencias; deuda negativa; neto vs disponible (HU-04); desactivar, mover y eliminar (tabla de decisión); confirmación por nombre | REQ-CTA-01 a 09 |
| Transacciones | `RegisterTransactionTest`, `TransactionDaoTest`, `HistoryViewModelTest` | Monto 0 rechazado; fecha editable y orden por `occurredAt` (HU-02); transferencia misma cuenta rechazada; filtros combinados; búsqueda parcial; agrupación Hoy/Ayer/Antier; agrupación por mes y día | REQ-TRX-01 a 12 |
| Categorías y etiquetas | `BaseCatalogSeederTest`, `DeleteCategoryTest`, `TagSummaryTest` | Semilla con `FINANCIAL_CHARGES`; eliminar exige reasignar; total de etiqueta por mes y rango | REQ-CAT-01 a 03, REQ-ETQ-01 a 04 |
| Recurrentes | `RecurrenceCalculatorTest`, `PayPendingTest`, `ReminderWorkerTest` | Cada frecuencia; día 31 → febrero; ventana de 5 días; urgencia; pagar, omitir y finalizar; un aviso al abrir la ventana y otro el día de vencimiento; notificaciones desactivadas | REQ-REC-01 a 11 |
| Tarjetas | `RateConverterTest`, `InstallmentCalculatorTest` (+ propiedades), `CardPeriodCalculatorTest`, `PayCreditCardTest` | 2 % MV ↔ 26,82 % EA; plan de HU-08; primera cuota sin intereses; tasa 0; corte el 31; mínimo vs total; liquidación sin intereses futuros; deuda inicial como 1 cuota | REQ-TC-01 a 15 |
| Préstamos | `LoanSchedulerTest`, `ExtraPaymentTest`, `CreateLoanTest` | Plan de HU-14; seguro y costos en cada cuota; abono que reduce plazo o cuota; modo simple; desembolso no es ingreso | REQ-PRE-01 a 10 |
| Reportes | `ReportAggregatorTest` | Por categoría y subcategoría; semana, mes o rango; transferencias excluidas; diferidas por cuota en su fecha de pago; intereses por tarjeta y préstamo; conteo | REQ-REP-01 a 05, REQ-TC-09 |
| Inicio | `HomeViewModelTest`, `CustomizeHomeTest` | Carrusel solo con cuentas activas; pendientes; etiquetas fijadas; ocultar y reordenar tarjetas | REQ-INI-01 a 04 |
| Importar y exportar | `CsvReaderTest`, `XlsxReaderTest`, `DuplicateDetectorTest`, `ImportWorkerTest`, `ExportCsvTest` | Mapeo; vista previa con errores; duplicados omitidos por defecto; entidades desconocidas; resumen; ida y vuelta exportar → importar | REQ-IMP-01 a 06, REQ-EXP-01 |
| Sincronización | `PushServiceIT`, `PullServiceIT`, `SyncWorkerTest`, `ChangeApplierTest` | APPLIED → reenvío STALE sin duplicar; edición durante el envío sigue PENDING; REJECTED de otro usuario; borrado propagado; LWW en ambos sentidos; paginación del pull; reintento ante 503 | REQ-SYN-01 a 05, RNF-06 |
| Historial | `ChangeLogRepositoryTest`, `ChangeLogPurgeJobIT` | Crear, editar y eliminar quedan registrados; restaurar y revertir; purga a los 90 días | REQ-HIS-01 a 04 |
| Datos y migraciones | `FlywayMigrationIT`, `LegacyDatabaseMigratorTest`, `RoomMigrationTest` | V1–V9 sobre base vacía y con datos del MVP; fila con monto 0 omitida; UUID conservados; restricciones activas | §4 de data-model |
| No funcionales | `StartupBenchmark`, `SaveTransactionBenchmark`, `EncryptionInstrumentedTest`, `ArchitectureTest` | Inicio < 2 s con 10.000 filas; guardar < 300 ms; base ilegible sin clave; sin `double` en el dominio | RNF-02, 03, 08, 12, 18 |

---

## 7. Actividades de prueba por incremento

Los incrementos son los de la arquitectura §4.3. Cada sprint entrega uno o más incrementos y su reporte de pruebas.

| Incremento | Pruebas nuevas | Aceptación manual del PO |
| --- | --- | --- |
| I0 · Cimientos | Pipelines de CI, `ArchitectureTest`, `ProblemDetailsAdviceTest`, prueba de contrato base | La app compila y abre con el tema nuevo; `/actuator/health` en staging |
| I1 · Identidad | Autenticación y sesión | AT-AUT-01 a 05 |
| I2 · Sincronización | Push, pull, `FlywayMigrationIT`, `LegacyDatabaseMigratorTest`, cifrado | AT-HU05, AT-HU06 |
| I3 · Núcleo diario | Cuentas, transacciones, historial, categorías | AT-HU01, AT-HU02, AT-HU03, AT-HU13 |
| I4 · Recurrentes | Recurrentes y avisos | AT-HU07 |
| I5 · Tarjetas | Motor de tarjetas | AT-HU08, AT-HU09 |
| I6 · Importar y exportar | Lectores, duplicados, worker | AT-HU11 |
| I7 · Should | Reportes, etiquetas, préstamos, historial, saldo neto, Google, personalizar | AT-HU04, AT-HU10, AT-HU12, AT-HU14 |
| I8 · Producción | Benchmarks, humo en producción | Humo completo en producción; escenarios E1–E9 |

## 8. Personal y responsabilidades

| Rol | Persona | Responsabilidades |
| --- | --- | --- |
| Gestor de pruebas | @Julian | Aprueba este plan, prioriza riesgos, decide la finalización |
| Desarrollador y probador técnico | Claude (asistente) bajo dirección de @Julian | Diseña y automatiza las pruebas de cada historia; mantiene CI; redacta "Cómo probar" y el reporte del sprint |
| Probador de aceptación | @Julian (product owner) | Ejecuta la prueba manual de cada PR y release en su teléfono; reporta defectos |

Formación: no se requiere; las herramientas son las estándar de Android y Spring.

## 9. Casos de prueba de aceptación

Derivados de los criterios Dado/Cuando/Entonces del SRS §5. El PO los ejecuta manualmente sobre staging y quedan además automatizados cuando es posible (columna "Auto").

| Id | Historia | Caso (resumen) | Resultado esperado | Auto |
| --- | --- | --- | --- | --- |
| AT-HU01-1 | HU-01 | Desde Inicio: + → monto 28.000 → categoría → Guardar | Gasto con fecha y hora actuales y la cuenta por defecto; ≤ 4 toques | UI |
| AT-HU01-2 | HU-01 | Igual, en modo avión | Se guarda al instante y aparece "1 pendiente" | UI |
| AT-HU01-3 | HU-01 | Monto vacío o 0 → Guardar | No guarda y muestra el error en el campo | UI |
| AT-HU02-1 | HU-02 | Registrar 13:00 y luego 09:00 del mismo día | El listado muestra 09:00 antes que 13:00 (orden cronológico) | Unit |
| AT-HU03-1 | HU-03 | Desde Inicio llegar a la transferencia | ≤ 2 toques | UI |
| AT-HU03-2 | HU-03 | Misma cuenta como origen y destino | No permite guardar | Unit |
| AT-HU03-3 | HU-03 | Ver el reporte del mes tras una transferencia | No aparece como gasto ni ingreso | Unit |
| AT-HU04-1 | HU-04 | $1.000.000 en cuentas y $800.000 de tarjeta que vence | Neto $200.000; disponible $1.000.000 | Unit |
| AT-HU04-2 | HU-04 | Elegir "disponible" para inicio y tocar el saldo | Inicio muestra disponible; la hoja muestra el neto | UI |
| AT-HU05-1 | HU-05 | 3 transacciones sin red → reconectar | Se envían solas; el indicador pasa a "Sincronizado" | Int |
| AT-HU05-2 | HU-05 | Servidor dormido (staging recién despertando) | La app sigue usable y reintenta | Manual |
| AT-HU05-3 | HU-05 | Repetir un envío (corte a mitad) | Sin duplicados en la nube | Int |
| AT-HU06-1 | HU-06 | Reinstalar la app e iniciar sesión | Se descargan todos los datos con barra de progreso | Manual |
| AT-HU06-2 | HU-06 | Cerrar y abrir la app | No pide credenciales | Manual |
| AT-HU07-1 | HU-07 | Recurrente que vence en ≤ 5 días | Aparece como pendiente en Inicio y no cambia el saldo | Unit |
| AT-HU07-2 | HU-07 | Pagar | Monto del último pago editable; se crea el gasto y avanza la próxima fecha | UI |
| AT-HU07-3 | HU-07 | Omitir esta vez | No se registra gasto; aparece la siguiente ocurrencia | Unit |
| AT-HU08-1 | HU-08 | Tarjeta al 2 % MV: $1.200.000 a 12 cuotas | Deuda +$1.200.000; el neto solo descuenta la cuota del periodo | Unit |
| AT-HU08-2 | HU-08 | Elegir 2 o más cuotas | Aparece la tasa prellenada (2 % MV) y se puede poner 0 % | UI |
| AT-HU08-3 | HU-08 | Compra a 1 cuota | No aparece la tasa; cuenta en reportes en la fecha de compra | Unit |
| AT-HU09-1 | HU-09 | Pendiente de tarjeta → Pago mínimo | Monto propuesto = lo que vence; pide la cuenta de origen | UI |
| AT-HU09-2 | HU-09 | Confirmar | Transferencia con desglose; intereses en "Intereses y cargos financieros" | Unit |
| AT-HU10-1 | HU-10 | Gastos de 3 categorías con "Viaje Cartagena" | La etiqueta muestra el total y el detalle de los tres | Unit |
| AT-HU10-2 | HU-10 | Fijar "Salidas" | Inicio muestra su total del mes | UI |
| AT-HU11-1 | HU-11 | Cargar el CSV de Cashew | Asociar columnas y ver la vista previa | Manual |
| AT-HU11-2 | HU-11 | Categorías inexistentes | Se listan y se pueden crear o asociar | Unit |
| AT-HU11-3 | HU-11 | Filas duplicadas | Pregunta, las omite por defecto y muestra el resumen | Unit |
| AT-HU12-1 | HU-12 | Restaurar una transacción borrada hace < 90 días | Vuelve con sus datos originales | Unit |
| AT-HU12-2 | HU-12 | Entrada de hace > 90 días | Ya no aparece | Int |
| AT-HU13-1 | HU-13 | Quitar una cuenta | Ofrece desactivar (recomendado), mover o eliminar | UI |
| AT-HU13-2 | HU-13 | Eliminar todo | Exige escribir el nombre y muestra el impacto | UI |
| AT-HU14-1 | HU-14 | Préstamo de $5.000.000 a 24 cuotas | Plan con cuota fija de capital; cada cuota aparece como pendiente | Unit |
| AT-HU14-2 | HU-14 | Abono a capital | Pregunta si reduce plazo o cuota y recalcula el plan | Unit |
| AT-AUT-01 | REQ-AUT-01 | Registrarse con un usuario nuevo | Entra a la descarga inicial | Int |
| AT-AUT-02 | REQ-AUT-02 | Login con correo en lugar de usuario | Entra | Int |
| AT-AUT-03 | REQ-AUT-03 | Continuar con Google | Entra y vincula la cuenta | Manual |
| AT-AUT-04 | REQ-AUT-06 | Cerrar sesión | Los datos siguen en el teléfono y la sincronización se detiene con aviso | Manual |
| AT-AUT-05 | RNF-07 | Forzar un error del servidor | Mensaje genérico, sin detalles técnicos | Int |

## 10. Calendario

Las fechas concretas se fijan en la planificación de sprints (`docs/07-management`). Cada sprint sigue este ritmo de pruebas:

| Momento | Actividad |
| --- | --- |
| Planificación del sprint | Se identifican los casos de aceptación de las historias y los riesgos afectados |
| Durante el sprint | Cada historia llega en su PR con pruebas automatizadas; el PO prueba el PR (APK de staging del PR o de `develop`) |
| Cierre del sprint | Regresión + humo manual en staging; reporte del sprint; release candidata |
| Release | Despliegue a producción y humo en producción |

## Anexo A. Plantilla de procedimiento manual (sección "Cómo probar" del PR)

```markdown
### Cómo probar
- **Build:** APK staging del PR (artefacto de Actions) o `develop` en staging
- **Precondiciones:** sesión iniciada con el usuario de prueba `ana`, 2 cuentas
- **Casos:** AT-HU01-1, AT-HU01-3
1. Abrir la app → tocar + …
2. …
- **Resultado esperado:** …
- [ ] Probado en el teléfono del PO (Android __)
```

## Anexo B. Plantilla de reporte del sprint (`reports/sprint-NN.md`)

```markdown
# Reporte de pruebas — Sprint NN (incrementos …)
| Métrica | Valor |
| --- | --- |
| Casos de aceptación planificados / aprobados / fallidos | … |
| Pruebas automatizadas (servidor / app) | … / … (todas en verde: sí/no) |
| Cobertura domain/finance · domain · servidor | … % · … % · … % |
| Defectos abiertos por severidad | C: · A: · M: · B: |
| Riesgos de §4 afectados y estado | … |
| Recomendación | Liberar / no liberar |
```
