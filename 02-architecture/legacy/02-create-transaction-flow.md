# Flujo: crear una transacción

## Estado del MVP (v0.1.0)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant RS as RegisterTransaction (Compose)
    participant VM as TransactionViewModel
    participant UC as AddTransactionUseCase
    participant SU as SyncTransactionsUseCase
    participant R as TransactionRepositoryImpl
    participant DB as Room (transactions)
    participant API as Retrofit ApiService
    participant Z as zrok (túnel público)
    participant C as TransactionController
    participant S as TransactionServiceImpl
    participant PG as PostgreSQL

    U->>RS: Llena título, valor, descripción, fecha y hora
    RS->>VM: addTransaction(title, value: String, desc, "millis H:m")
    VM->>VM: value.toDouble() y type = value < 0 (invertido respecto al servidor)
    VM->>UC: invoke(Transaction(UUID, ..., synced=false))
    UC->>R: addTransaction(t)
    R->>R: formatDate("millis H:m") a ISO (si falla, deja el texto crudo)
    R->>DB: INSERT (synced = 0)
    DB-->>VM: El Flow emite la lista nueva y se recalcula el total en memoria
    VM-->>RS: isTransactionAdded = true y navega a Main

    Note over U,PG: La sincronización NO es automática, el usuario debe pulsar el botón

    U->>VM: Botón sincronizar, syncTransactions()
    VM->>SU: invoke()
    SU->>R: syncTransactions()
    R->>DB: SELECT * WHERE synced = 0
    DB-->>R: N pendientes
    loop Por cada pendiente (1 request por fila)
        R->>API: POST /transactions (TransactionDto)
        API->>Z: HTTPS
        Z->>C: HTTP
        C->>S: save(dto) sin @Valid
        S->>S: UUID.fromString(localId) y type = value >= 0
        S->>PG: INSERT
        alt local_id nuevo
            PG-->>S: OK
            S-->>API: 200 TransactionDto(synced=true)
        else local_id ya existe (reintento)
            PG-->>S: DataIntegrityViolation
            S-->>API: 500 (handler genérico)
            Note over R: Exception, se sale del loop y NADA queda marcado
        end
    end
    R->>DB: UPDATE SET synced = 1 WHERE synced = 0
    Note over R,DB: Carrera: también marca filas creadas durante el loop que nunca se enviaron
```

Puntos de fallo:
1. Un error a mitad del loop provoca que la siguiente sincronización reenvíe las filas ya enviadas. El servidor responde 500 por duplicado y la sincronización queda **bloqueada para siempre**.
2. `UPDATE ... WHERE synced = 0` marca como sincronizadas filas que no se enviaron, así que **se pierden datos**.
3. `type` tiene un significado opuesto en el cliente y en el servidor.
4. No hay autenticación: cualquiera con la URL de zrok puede hacer POST.
