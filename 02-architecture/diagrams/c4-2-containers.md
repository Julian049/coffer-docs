# C4 · Nivel 2 · Contenedores

Vista de contenedores (punto de vista *Composición*). Responde a: ¿qué unidades se despliegan o ejecutan por separado y cómo se comunican?

```mermaid
C4Container
    title Contenedores · Coffer

    Person(usuario, "Usuario", "Product owner")

    System_Boundary(device, "Teléfono Android (API 31+)") {
        Container(app, "App Android", "Kotlin, Jetpack Compose, Hilt", "UI, dominio financiero (saldos, cuotas, intereses), importación y exportación, avisos.")
        ContainerDb(room, "Base local", "Room 2.8 + SQLCipher", "Fuente de trabajo del usuario. Todas las entidades y su estado de sincronización.")
        Container(worker, "Worker de sincronización", "WorkManager, CoroutineWorker", "Push de la cola local y pull incremental. Reintentos con backoff.")
        ContainerDb(secrets, "Almacén de secretos", "Android Keystore + DataStore cifrado", "Tokens de acceso y refresco, clave de SQLCipher.")
    }

    System_Boundary(cloudb, "Nube (hosting gratuito)") {
        Container(api, "Coffer Server", "Java 21, Spring Boot 4, Spring Security", "API REST /api/v1: auth y sync. Valida pertenencia y aplica último cambio gana.")
        ContainerDb(pg, "Base de respaldo", "PostgreSQL 16, Flyway", "Copia de los datos por usuario con versión de sincronización.")
    }

    System_Ext(google, "Google Identity", "ID tokens")

    Rel(usuario, app, "Usa")
    Rel(app, room, "Lee y escribe", "Room DAO, Flow")
    Rel(app, worker, "Solicita sincronización", "WorkManager enqueueUniqueWork")
    Rel(worker, room, "Lee pendientes y aplica cambios", "Room")
    Rel(worker, secrets, "Lee el token", "Keystore")
    Rel(worker, api, "POST /sync/push, GET /sync/pull", "HTTPS, JSON, Bearer JWT")
    Rel(app, api, "Registro, login, Google, refresh", "HTTPS, JSON")
    Rel(app, google, "Obtiene un ID token", "Credential Manager")
    Rel(api, google, "Verifica la firma del ID token", "HTTPS, JWKS")
    Rel(api, pg, "Lee y escribe", "JDBC, Spring Data JPA")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

## Contenedores

| Contenedor | Tecnología | Responsabilidad | Decisiones |
| --- | --- | --- | --- |
| App Android | Kotlin 2.2, Compose, Material 3, Hilt, Navigation | Toda la funcionalidad del SRS sin red. Calcula saldos, planes de cuotas e intereses. | [ADR-0005](../adr/0005-offline-first-room-source-of-truth.md), [ADR-0010](../adr/0010-financial-logic-on-client.md), [ADR-0011](../adr/0011-android-client-stack.md) |
| Base local | Room + SQLCipher | Fuente de verdad del dispositivo; cola de cambios por fila (`syncState`). | [ADR-0005](../adr/0005-offline-first-room-source-of-truth.md), [ADR-0008](../adr/0008-on-device-security.md) |
| Worker de sincronización | WorkManager | Ejecuta push y pull con red, aunque la app esté cerrada. | [ADR-0006](../adr/0006-sync-protocol.md) |
| Almacén de secretos | Keystore + DataStore cifrado | Tokens que sobreviven al cierre de la app y a limpiar la caché. | [ADR-0008](../adr/0008-on-device-security.md) |
| Coffer Server | Spring Boot 4.0, Java 21 | Autenticación, emisión de JWT, protocolo de sincronización, aislamiento por usuario. | [ADR-0002](../adr/0002-single-spring-boot-cloud-service.md), [ADR-0007](../adr/0007-self-issued-jwt-auth.md) |
| Base de respaldo | PostgreSQL 16 + Flyway | Persistencia por usuario; migraciones versionadas. | [ADR-0003](../adr/0003-flyway-for-migrations.md), [ADR-0004](../adr/0004-numeric-bigdecimal-amounts.md) |
