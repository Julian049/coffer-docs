# Reporte de pruebas — Sprint 02 (incremento I1 · Identidad)

| Campo | Valor |
| --- | --- |
| Sprint | S2 · Identidad y sesión |
| Versión | `v0.3.0` (coffer-server y coffer-app) |
| Fecha | 2026-10-16 |
| Historias | S2-H01 (coffer-server#22), S2-H02 (coffer-app#16), S2-H03 (coffer-app#17): 3 de 3 hechas, 18 puntos |

## 1. Resumen

| Métrica | Valor |
| --- | --- |
| Casos de aceptación planificados / aprobados / fallidos | 4 / 0 / 0. **No ejecutados en el teléfono:** el PO decidió cerrar el sprint sin la prueba manual (ver §2) |
| Pruebas automatizadas (servidor / app) | 31 / 42, todas en verde en CI |
| Cobertura domain/finance · domain · servidor | — (aún no existe) · no medida (Kover no está configurado) · 94 % de líneas sin `legacy` (`identity` 96 %, total 83 %) |
| Defectos abiertos por severidad | C: 0 · A: 0 · M: 0 · B: 0 |
| Riesgos de §4 afectados y estado | Seguridad de la sesión: cubierta por pruebas automáticas (rotación, reutilización, otro dispositivo, límite de intentos, cifrado). Ver §4 |
| Recomendación | **Liberar** `v0.3.0`, con el riesgo de §4 aceptado por el PO |

## 2. Aceptación del PO

| Caso | Qué cubre | Estado |
| --- | --- | --- |
| AT-AUT-01 | Registrarse desde la app y entrar | No ejecutado en el teléfono. Verificado a nivel API en staging (registro 201) y en `AuthControllerIT` |
| AT-AUT-02 | Entrar con el correo | No ejecutado en el teléfono. Verificado a nivel API en staging (login por correo 200) y en `AuthControllerIT` |
| AT-AUT-04 | Cerrar sesión conservando los datos | No ejecutado en el teléfono. Cubierto por `SettingsViewModelTest` y `AuthRepositoryImplTest` (cerrar sesión sin red) |
| AT-HU06-2 | Cerrar y abrir la app sin pedir credenciales | No ejecutado en el teléfono. La persistencia cifrada (`SessionStoreTest`, instrumentada) **tampoco se ha corrido** |
| AT-AUT-05 | Error del servidor sin detalles técnicos | Automatizado: `AuthControllerIT`, `ProblemDetailsAdviceTest`, `AuthViewModelsTest` |

El PO cerró el sprint sin la prueba manual (decisión del 2026-10-16). Los casos quedan pendientes y se ejecutarán en el siguiente uso real de la app o al inicio del Sprint 3.

## 3. Pruebas automatizadas

| Repositorio | Suite | Qué cubre |
| --- | --- | --- |
| coffer-server | `AuthControllerIT` (8, PostgreSQL 16) | Registro, duplicados sin distinguir mayúsculas, validación, login por usuario o correo con el mismo mensaje si el usuario no existe, 429 con `Retry-After`, rotación y reutilización del refresh, logout idempotente, rutas protegidas. Cada respuesta validada contra `openapi.yml` |
| coffer-server | `TokenServiceTest` (4), `LoginRateLimiterTest` (2) | JWT RS256 de 15 min, familia revocada por reutilización u otro dispositivo, purga de tokens vencidos; ventana deslizante |
| coffer-server | `ArchitectureTest` (7) | Regla nueva: los módulos no dependen de `config` |
| coffer-app | `TokenAuthenticatorTest` (4, MockWebServer) | 401 → refresh → reintento; **4 llamadas simultáneas, un solo refresh**; refresh revocado → expirada conservando el perfil; las rutas públicas no llevan token |
| coffer-app | `AuthRepositoryImplTest` (4), `AuthUseCasesTest` (3) | Mapeo de 400/401/409/429/500 y sin conexión; formulario inválido nunca llega a la red |
| coffer-app | `AuthViewModelsTest` (7), `SettingsViewModelTest` (3), `ComponentsBehaviorTest` (5) | Mensajes por campo y generales, perfil, cierre de sesión con confirmación |
| coffer-app | `ComponentsScreenshotTest` (10 imágenes) | Iniciar sesión (claro y oscuro), registro con errores, Ajustes con perfil y diálogo de cierre |
| coffer-app | `SessionStoreTest` (instrumentada, a mano) | Cifrado con Android Keystore. **Pendiente de correr** |

## 4. Riesgo aceptado

Las pantallas de acceso y la sesión nunca se ejecutaron en un dispositivo real:
- La `SessionStoreTest` no corrió: el emulador disponible es API 37.1 y AGP no lo acepta.
- OkHttp 5 (actualizado en este sprint) solo se probó con MockWebServer en la JVM.

Si algo falla en el teléfono, se corrige con un PATCH (`v0.3.1`) desde `main` (manage-config §3.7, hotfix).

## 5. Hallazgos durante el sprint

| Hallazgo | Detectado por | Resolución |
| --- | --- | --- |
| `AuthControllerIT` no corría: Surefire solo toma `*Test`/`*Tests` | Revisión del log de CI | Surefire incluye `**/*IT.java` |
| `TokenService` (`identity`) dependía de `config` | Revisión de diseño | `JwtProperties` pasa a `identity`; nueva regla de ArchUnit |
| `compileSdk 37` quedó fuera de un PR fusionado antes de tiempo | CI de Dependabot en rojo | PR aparte con `compileSdk 37` + Kotlin 2.4 / Hilt 2.60.1 / KSP |
| El diseño pedía DataStore Proto | Implementación | DataStore tipado con kotlinx.serialization y el mismo cifrado (coffer-docs#7) |
| Memoria insuficiente al compilar en local (emulador + IDE + WSL) | Builds locales | `--max-workers=1`; el CI valida el build completo |

## 6. Pendientes que pasan al siguiente sprint

- Ejecutar AT-AUT-01, AT-AUT-02, AT-AUT-04 y AT-HU06-2 en el teléfono, y la `SessionStoreTest` instrumentada (teléfono o emulador API 31–36).
- Medir la cobertura de la app (Kover) antes de la lógica financiera.
- APK de release de 54 MB (sin R8/minify).
- Usuario de prueba `claudeprueba4195` y transacción "dup" en staging.

## 7. Retrospectiva

**Qué funcionó**
- Resolver todas las dependencias antes de arrancar evitó romper el sprint a mitad de camino.
- La prueba de contrato y las ITs dejaron la API lista a la primera en staging.
- Probar la API con `curl` en staging dio confianza sin necesidad del teléfono.

**Qué no funcionó**
- La máquina local no alcanza para compilar Android con el emulador y el IDE abiertos.
- Un PR se fusionó antes de que llegara un commit, y hubo que repetir el trabajo.
- La aceptación en el teléfono no se hizo, así que la UI no tiene validación humana.

**Qué cambiamos en el siguiente sprint**
- Antes de fusionar, confirmar que el PR tiene el último commit, sobre todo cuando Claude acaba de anunciar un push.
- Cerrar el emulador y el IDE mientras Claude compila, o dejar el build completo al CI.
- Hacer la aceptación en el teléfono al menos en la historia final de cada sprint.
