# Reporte de pruebas — Sprint 01 (incremento I0 · Cimientos)

| Campo | Valor |
| --- | --- |
| Sprint | S1 · Cimientos técnicos y nuevo diseño |
| Versión | `v0.2.0` (coffer-server y coffer-app) |
| Fecha | 2026-10-16 |
| Historias | S1-H01 (coffer-server#3), S1-H02 (coffer-server#4), S1-H03 (coffer-app#4), S1-H04 (coffer-app#5): 4 de 4 hechas, 23 puntos |

## 1. Resumen

| Métrica | Valor |
| --- | --- |
| Casos de aceptación planificados / aprobados / fallidos | 4 / 4 / 0 (criterios de aceptación de cada historia, I0 de §7 del plan de pruebas) |
| Pruebas automatizadas (servidor / app) | 16 / 17, todas en verde en CI |
| Cobertura domain/finance · domain · servidor | — (aún no existe) · no medida (Kover no está configurado) · 92 % de líneas sin `legacy` (60 % con el MVP) |
| Defectos abiertos por severidad | C: 0 · A: 0 · M: 0 · B: 0 |
| Riesgos de §4 afectados y estado | RJ-03 (hosting gratuito): staging funciona; el arranque en frío tarda cerca de 1 min, absorbido por los timeouts de 60 s de la app |
| Recomendación | **Liberar** `v0.2.0` |

## 2. Aceptación del PO

| Prueba (plan de sprints, S1) | Resultado |
| --- | --- |
| Servidor en staging respondiendo (`/actuator/health` → `UP`, `/actuator/info` → `0.2.0-SNAPSHOT`) | Aprobado |
| APK `staging` instalado junto a la app actual, en Android 12+ | Aprobado (coffer-app#6) |
| Recorrer las 4 pestañas en claro y oscuro | Aprobado (coffer-app#7) |
| Ajustes muestra "Servidor: disponible" y la versión | Aprobado (coffer-app#7) |

El humo manual de §5.7 todavía no aplica: sus pasos (login, gastos, sincronización…) llegan desde S2.

## 3. Pruebas automatizadas

| Repositorio | Suite | Qué cubre |
| --- | --- | --- |
| coffer-server | `FinanceServerApplicationTests` (Testcontainers, PostgreSQL 16) | Arranque completo, Flyway y `ddl-auto=validate`; contrato de `/actuator/health` contra `openapi.yml`; `/actuator/info`; `/v3/api-docs`; dinero como string y fechas ISO |
| coffer-server | `ArchitectureTest` (ArchUnit, 6 reglas) | Dependencias entre módulos; sin `double`/`float` en `ledger` |
| coffer-server | `ProblemDetailsAdviceTest` (6) | Errores RFC 9457 con código `FIN-*`; un 500 no expone detalles |
| coffer-app | `ArchitectureTest` (Konsist, 3 reglas) | `domain` sin Android, `data` ni `Double`/`Float`; `ui` no importa `data` |
| coffer-app | `MoneyFormatTest`, `SettingsViewModelTest` | Formato de pesos y signos; estado del servidor y reintento |
| coffer-app | `ComponentsBehaviorTest` (Robolectric) | Barra de navegación, chip y Ajustes |
| coffer-app | `ComponentsScreenshotTest` (Roborazzi, 6 imágenes) | Componentes, Inicio y Ajustes en claro y oscuro; CI compara contra las referencias |

Las reglas de arquitectura de ambos repositorios se probaron a propósito con una violación (un `double` en `ledger`/`domain` y una dependencia prohibida), y fallaron como se esperaba.

## 4. Hallazgos durante el sprint

| Hallazgo | Detectado por | Resolución |
| --- | --- | --- |
| El MVP del servidor mapeaba `transactions.value` (`NUMERIC`) como `double` | `ddl-auto=validate` (S1-H01) | Pasa a `BigDecimal` (ADR-0004) |
| Dependencias con CVSS ≥ 7 (`jackson-databind` 3.1.2, driver de PostgreSQL 42.7.10) | OWASP Dependency-Check | Spring Boot 4.0.6 → 4.0.8; alertas de Dependabot activadas en ambos repositorios |
| `/actuator/health` devolvía `groups` y, en local, `components` | Prueba de contrato (S1-H02) | Solo `{"status": …}` en todos los perfiles (RNF-07) |
| Contraseña de ejemplo realista en `openapi.yml` | GitGuardian | Reemplazada por `'********'` (coffer-docs#5) |
| Sin `Accept: application/json`, Actuator responde con su propio tipo `vnd` | Prueba de contrato | `HealthApi` envía el header |

## 5. Pendientes que pasan al siguiente sprint

- Confirmar con Dependabot o con una corrida manual de Dependency-Check que con Boot 4.0.8 no quedan CVSS ≥ 7. La API de NVD es lenta: el escaneo corre los lunes y a mano, no en los PR.
- Medir la cobertura de la app (Kover), como pide manage-config §5.2, antes de que haya lógica financiera (S3–S4).
- Borrar la transacción de prueba "dup" de la base de staging, o dejar que desaparezca cuando S3 reemplace la tabla.

## 6. Retrospectiva

**Qué funcionó**
- Las pruebas automáticas encontraron problemas reales antes de producción: el esquema, las vulnerabilidades, el contrato y un secreto en la documentación.
- Leer las medidas del código del plugin del prototipo evitó gastar llamadas al MCP de Figma, que son escasas.
- Los screenshots de referencia dan una red de seguridad visual barata.

**Qué no funcionó**
- Dependency-Check con la API pública de NVD: corridas de 16 min a más de una hora, una colgada en el 5 %.
- El entorno local: cortes de DNS en WSL, falta de memoria al compilar Kotlin y bloqueos de `app/build` con Android Studio abierto.
- Se perdió tiempo esperando corridas largas en lugar de usar el CI como compilador.

**Qué cambiamos en el siguiente sprint**
- Compilar Android con `gradlew.bat` de Windows y cerrar Android Studio mientras Claude compila.
- Dejar que el CI valide las pruebas con Testcontainers, que localmente son lentas.
- Correr Dependency-Check solo los lunes y a mano.
