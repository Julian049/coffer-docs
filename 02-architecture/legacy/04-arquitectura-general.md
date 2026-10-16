# Arquitectura general

## Estado del MVP (v0.1.0)

```mermaid
flowchart LR
    subgraph ANDROID ["finance-app (Android · Kotlin)"]
        direction TB
        subgraph UI_A [ui]
            MS[MainScreen]
            RT[RegisterTransaction]
        end
        VM[TransactionViewModel]
        subgraph DOM_A [domain]
            UCA["UseCases: Add, GetTransactions, GetTotal, Sync, HealthCheck"]
            RIA[["TransactionRepository (interface)"]]
        end
        subgraph DATA_A [data]
            RIMPL["TransactionRepositoryImpl: mapeos, formatDate, getTotalAmount, runBlocking"]
            ROOM[("Room: finance_db v1")]
            RETRO["Retrofit + Gson, baseUrl hardcodeada"]
        end
        DI["Hilt AppModule"]
        MS & RT --> VM --> UCA --> RIA
        RIMPL -.implementa.-> RIA
        RIMPL --> ROOM
        RIMPL --> RETRO
        DI -.provee.-> RIMPL
    end

    ZROK{{"zrok share pública (sin auth)"}}

    subgraph SERVER ["finance-server (Spring Boot 4 · Java 21)"]
        direction TB
        CTRL["TransactionController: GET/POST /transactions"]
        ACT["Actuator /actuator/health"]
        SVC[TransactionServiceImpl]
        MAP[MapStruct TransactionMapper]
        REPO[TransactionRepository JPA]
        EXC[GlobalExceptionHandler]
        FLY[Flyway V1, V2]
        CTRL --> SVC --> REPO
        SVC --> MAP
        CTRL -.errores.-> EXC
    end

    PG[("PostgreSQL 16 en Docker Compose")]

    RETRO -- "HTTPS, cleartext permitido" --> ZROK --> CTRL
    RETRO --> ACT
    REPO --> PG
    FLY --> PG
```

Resumen: el cliente usa MVVM con clean architecture pero tiene la lógica concentrada en `RepositoryImpl`. El servidor es un CRUD en capas con un solo recurso y sin seguridad. La sincronización es manual y frágil. No hay CI ni contenedor del servidor.
