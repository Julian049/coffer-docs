# Flujo: al entrar a la app

## Estado del MVP (v0.1.0)

```mermaid
flowchart TD
    A([Usuario abre la app]) --> B[MainActivity con Hilt y NavHost]
    B --> C[MainScreen obtiene TransactionViewModel]
    C --> D[ViewModel init]

    D --> E[verifyHealth]
    D --> F[loadTransactions]

    E --> E1["GET actuator/health vía zrok"]
    E1 -->|200| E2[isApiHealthy = true]
    E1 -->|error o timeout| E3[isApiHealthy = false]
    E2 & E3 --> UI

    F --> G["GetTransactionsUseCase llama a repository.getTransactions()"]
    G --> H{{"runBlocking: bloquea el hilo principal"}}
    H --> I["GET /transactions: TODAS las filas, sin paginar"]
    I -->|OK| J["dao.insertAll(REPLACE): sobrescribe las filas locales"]
    I -->|error| K[Log.e y continúa]
    J & K --> L["Devuelve el Flow de dao.getAllTransactions()"]
    L --> M["collect: por cada emisión, getTotalAmount suma en memoria con Double"]
    M --> UI[UiState: lista, saldo e indicador de API]
    UI --> N([Pantalla principal])

    N -. "botón sync (manual)" .-> S[syncTransactions: ver flujo de creación]

    classDef bad fill:#fde2e1,stroke:#c0392b,color:#000
    class H,I,J,M bad
```

Problemas en el arranque:
- `runBlocking` bloquea la UI mientras dura la petición de red, con riesgo de ANR si zrok tarda.
- Se descarga **todo** el historial en cada apertura.
- `REPLACE` puede pisar un cambio local que todavía no se ha sincronizado.
- El health check solo dice si el servidor está vivo, no si hay datos pendientes ni si la sesión es válida.
