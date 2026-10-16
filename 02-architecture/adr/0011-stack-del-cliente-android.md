# ADR-0011: Stack del cliente Android

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** RNF-01, RNF-02, RNF-14, RNF-15, RNF-16, REQ-REC-09, REQ-IMP-01, §7.2

## Contexto y problema

El MVP usa Kotlin, Compose, Hilt, Room y Retrofit con Gson, con minSdk 24 y una URL de API fija en el código. El SRS fija Android 12 (API 31) como mínimo y añade notificaciones, importación de CSV y .xlsx, Google Sign-In y cifrado.

## Decisión

| Aspecto | Elección | Cambio frente al MVP |
| --- | --- | --- |
| SDK | `minSdk 31`, `targetSdk` y `compileSdk 36` | Antes minSdk 24 |
| Lenguaje | Kotlin 2.2, corrutinas y Flow | — |
| UI | Jetpack Compose + Material 3; tema con los tokens del `design.md` (claro y oscuro) | Se adopta el sistema de diseño |
| Navegación | Navigation Compose con rutas tipadas (`@Serializable`) | Antes, rutas de texto |
| DI | Hilt (KSP) + `hilt-work` | Se añade `hilt-work` |
| Persistencia | Room 2.8 + SQLCipher (ADR-0008), `exportSchema = true` con migraciones probadas | Antes sin exportar el esquema |
| Red | Retrofit 3 + OkHttp + **kotlinx.serialization** | Gson se reemplaza: no respeta la nulabilidad de Kotlin |
| Segundo plano | WorkManager (sincronización y avisos) | Nuevo |
| Notificaciones | `NotificationCompat`, canal "Pagos pendientes"; permiso `POST_NOTIFICATIONS` | Nuevo |
| Autenticación | Credential Manager + `googleid` | Nuevo |
| Archivos | Storage Access Framework; CSV con un parser propio en streaming; .xlsx con un lector en streaming ligero (sin Apache POI completo) | Nuevo |
| Configuración | `BuildConfig.API_BASE_URL` por tipo de build | Antes fija en `AppModule` |
| Pruebas | JUnit 4/5 + MockK + Turbine (Flows) + Robolectric + Compose UI Test + MockWebServer; Macrobenchmark para RNF-02 | Se amplía |
| Calidad | ktlint, Android Lint con `warningsAsErrors` en CI | Nuevo |

### Consecuencias

- Positivas: menos fragmentación (API 31+); APIs modernas de Keystore y notificaciones; tipos seguros en red y navegación.
- Negativas: con minSdk 31 quedan fuera los dispositivos con Android 11 o anterior (aceptado por el SRS). El desugaring de `java.time` deja de ser necesario.

### Cómo se verifica

- CI ejecuta `./gradlew lint test assembleRelease`.
- Una prueba instrumentada cubre `LegacyDatabaseMigrator`, que copia la base del MVP (`finance_db`, sin cifrar) a la nueva `finance.db` cifrada (ver `docs/03-design/data-model.md` §5.2).
