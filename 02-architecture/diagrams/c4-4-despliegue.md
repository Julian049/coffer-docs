# C4 · Despliegue

Vista de despliegue (punto de vista *Despliegue*). Muestra dónde corre cada contenedor en la v1.0. El proveedor recomendado se justifica en [ADR-0009](../adr/0009-hosting-gratuito.md).

```mermaid
C4Deployment
    title Despliegue · v1.0

    Deployment_Node(phone, "Teléfono del usuario", "Android 12+ (API 31)") {
        Deployment_Node(apk, "APK Coffer", "release firmado") {
            Container(app, "App Android", "Kotlin, Compose", "UI y dominio")
            ContainerDb(room, "finance.db", "Room + SQLCipher", "Datos cifrados")
            Container(worker, "SyncWorker", "WorkManager", "Sincronización en segundo plano")
        }
        Deployment_Node(ks, "Android Keystore", "TEE / StrongBox") {
            ContainerDb(keys, "Claves", "AES-GCM", "Clave de SQLCipher y cifrado de tokens")
        }
    }

    Deployment_Node(render, "Render · Web Service (plan gratuito)", "Contenedor Docker, HTTPS gestionado") {
        Container(api, "Coffer Server", "Spring Boot 4 · Java 21 · JRE 21", "Imagen OCI construida desde el Dockerfile del repositorio")
    }

    Deployment_Node(neon, "Neon · PostgreSQL serverless (plan gratuito)", "PostgreSQL 16, TLS obligatorio") {
        ContainerDb(pg, "coffer", "PostgreSQL", "Esquema gestionado por Flyway")
    }

    Deployment_Node(gh, "GitHub", "Repositorios y Actions") {
        Container(ci, "CI", "GitHub Actions", "mvnw verify con Testcontainers; gradlew test lint assembleRelease")
    }

    Rel(worker, api, "push / pull", "HTTPS 443, JSON, JWT")
    Rel(app, api, "auth", "HTTPS 443")
    Rel(api, pg, "JDBC", "TLS 5432, pool Hikari pequeño")
    Rel(app, room, "SQL")
    Rel(room, keys, "Clave de cifrado")
    Rel(ci, api, "Despliegue automático al hacer merge en main", "Render deploy hook")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="2")
```

## Entornos

| Entorno | Servidor | Base de datos | URL que usa la app (`BuildConfig.API_BASE_URL`) |
| --- | --- | --- | --- |
| Local | `./mvnw spring-boot:run` | PostgreSQL 16 en `docker compose` | `http://10.0.2.2:8080/` (solo `debug`; cleartext limitado a esa IP) |
| Pruebas automáticas | Spring Boot en CI | Testcontainers PostgreSQL 16 | — |
| Producción | Render (Docker) | Neon | `https://<servicio>.onrender.com/` (`release`) |

## Consideraciones del plan gratuito

- **Arranque en frío:** el servicio se suspende sin tráfico y tarda en despertar. La app nunca espera a la red y el worker reintenta con backoff exponencial (RNF-06).
- **Conexiones:** pool de Hikari con 3–5 conexiones para no superar los límites de Neon.
- **Secretos:** `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `GOOGLE_CLIENT_ID` se configuran como variables de entorno en Render; nunca se guardan en el repositorio.
- **Respaldo de la base:** la base de la nube ya es el respaldo de los teléfonos. Además, un job semanal de GitHub Actions ejecuta `pg_dump` cifrado como respaldo del respaldo.
