# C4 · Nivel 3 · Componentes del servidor (Coffer Server)

Vista de componentes del contenedor *Coffer Server*. Es un único servicio Spring Boot organizado como **monolito modular**: cada módulo es un paquete de primer nivel con su API interna, y los límites se verifican con pruebas de ArchUnit.

```mermaid
C4Component
    title Componentes · Coffer Server (Spring Boot 4)

    Container_Ext(app, "App Android", "Kotlin", "Cliente offline-first")
    ContainerDb_Ext(pg, "PostgreSQL 16", "Flyway", "Base de respaldo")
    System_Ext(google, "Google Identity", "JWKS")

    Container_Boundary(srv, "Coffer Server") {
        Component(sec, "SecurityConfig", "Spring Security, oauth2-resource-server", "Valida el JWT en /api/v1/**; deja públicos /auth/* y /actuator/health.")

        Component(authc, "AuthController", "Spring MVC", "POST /auth/register, /login, /google, /refresh, /logout")
        Component(users, "UserService", "Servicio", "Registro, BCrypt, unicidad de usuario y correo.")
        Component(tokens, "TokenService", "Nimbus JOSE + JWT", "Emite el JWT de acceso y rota los refresh tokens (guardados con hash).")
        Component(gverif, "GoogleTokenVerifier", "Servicio", "Valida firma, audiencia y expiración del ID token de Google.")

        Component(syncc, "SyncController", "Spring MVC", "POST /sync/push, GET /sync/pull")
        Component(push, "PushService", "Servicio transaccional", "Upsert idempotente por id, último cambio gana por updated_at, pertenencia por user_id.")
        Component(pull, "PullService", "Servicio", "Cambios con version > cursor, paginados, incluidos los borrados.")
        Component(registry, "SyncEntityRegistry", "Estrategia por entidad", "Mapea cada tipo (account, transaction, installment…) a su validador y repositorio.")

        Component(ledger, "Ledger", "Entidades JPA + repositorios", "Cuentas, tarjetas, préstamos, compras diferidas, cuotas, categorías, etiquetas, transacciones, recurrentes, historial, ajustes.")
        Component(rules, "LedgerValidators", "Bean Validation + reglas", "Integridad mínima: monto > 0, referencias del mismo usuario, cuenta destino distinta.")

        Component(errors, "ProblemDetailsAdvice", "@RestControllerAdvice", "Errores RFC 9457 con código estable (FIN-xxx).")
        Component(obs, "Observabilidad", "Actuator, logs JSON", "Health, info y métricas básicas; sin datos personales en logs.")
    }

    Rel(app, sec, "Llama a la API", "HTTPS, JSON")
    Rel(sec, authc, "Pasa (ruta pública)")
    Rel(sec, syncc, "Pasa con userId del JWT")
    Rel(authc, users, "Usa")
    Rel(authc, tokens, "Usa")
    Rel(authc, gverif, "Usa")
    Rel(gverif, google, "Descarga las claves", "HTTPS, JWKS")
    Rel(syncc, push, "Usa")
    Rel(syncc, pull, "Usa")
    Rel(push, registry, "Resuelve la entidad")
    Rel(pull, registry, "Resuelve la entidad")
    Rel(registry, rules, "Valida")
    Rel(registry, ledger, "Persiste")
    Rel(ledger, pg, "JPA, JDBC")
    Rel(users, pg, "JPA")
    Rel(tokens, pg, "refresh_tokens")

    UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")
```

## Módulos y paquetes

Paquete base: `com.dev.julian09.financeserver`

| Módulo (paquete) | Componentes | Puede depender de |
| --- | --- | --- |
| `identity` | `AuthController`, `UserService`, `TokenService`, `GoogleTokenVerifier`, `User`, `RefreshToken` | `shared` |
| `sync` | `SyncController`, `PushService`, `PullService`, `SyncEntityRegistry`, DTO `ChangeDto` | `ledger` (solo su API pública), `shared` |
| `ledger` | Entidades JPA y repositorios del dominio, `LedgerValidators` | `shared` |
| `shared` | `ProblemDetailsAdvice`, `ErrorCode`, configuración, `Clock`, utilidades de dinero | — |
| `config` | `SecurityConfig`, `OpenApiConfig`, `JacksonConfig` | todos |

Reglas verificadas con ArchUnit:
- `ledger` no conoce `sync` ni `identity`.
- Ningún controlador accede a un repositorio directamente.
- `user_id` nunca se lee del cuerpo de la petición: siempre sale de `@AuthenticationPrincipal Jwt`.
