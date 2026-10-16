# SEQ-08 · Sincronización: push de cambios locales

Requisitos: REQ-SYN-01, 02, 04, RNF-06, RNF-07 · Decisión: [ADR-0006](../../02-architecture/adr/0006-sync-protocol.md)

```mermaid
sequenceDiagram
    autonumber
    participant WM as WorkManager
    participant W as SyncWorker
    participant OB as OutboxReader
    participant DB as FinanceDatabase
    participant API as SyncApi
    participant SC as SyncController
    participant PS as PushService
    participant REG as SyncEntityRegistry
    participant H as SyncHandler (por entidad)
    participant V as LedgerValidators
    participant PG as PostgreSQL

    WM->>W: doWork() (hay red)
    W->>OB: nextBatch(max = 200)
    OB->>DB: SELECT de cada tabla WHERE syncState = 'PENDING', en orden de dependencias
    OB-->>W: changes con id, entity, updatedAt, deletedAt y data (instantánea enviada)
    alt Lote vacío
        W->>W: Pasa al pull (SEQ-09)
    else Hay cambios
        W->>API: POST /api/v1/sync/push {deviceId, changes}
        API->>SC: PushRequest (con @Valid)
        SC->>PS: push(userId del JWT, changes)
        PS->>PG: BEGIN y SET CONSTRAINTS ALL DEFERRED
        loop Por cada cambio
            PS->>REG: handlerFor(entity)
            REG-->>PS: TransactionSyncHandler, AccountSyncHandler y demás
            PS->>H: apply(userId, change)
            H->>V: validate(change)
            alt Inválido (monto ≤ 0, enum desconocido…)
                H-->>PS: REJECTED con code
            else Válido
                H->>PG: INSERT … ON CONFLICT (id) DO UPDATE SET … WHERE t.user_id = :userId AND excluded.updated_at > t.updated_at RETURNING version
                alt Fila insertada o actualizada
                    H-->>PS: APPLIED con version
                else El WHERE no se cumplió
                    H->>PG: SELECT user_id FROM tabla WHERE id = ?
                    H-->>PS: STALE si es del usuario, REJECTED (FIN-NOT-OWNER) si no
                end
            end
        end
        PS->>PG: COMMIT (se validan las FK diferidas)
        alt Una FK diferida falla
            PS->>PG: ROLLBACK
            PS->>PS: Reintenta cambio por cambio (SAVEPOINT) para aislar el culpable
        end
        PS-->>SC: results [{id, status, code?}]
        SC-->>W: 200 PushResponse
        W->>DB: withTransaction: SYNCED donde status es APPLIED o STALE y updatedAt local sigue igual al enviado, FAILED (con syncError = code) donde REJECTED
        W->>OB: nextBatch() hasta vaciar la cola
    end
    alt Error de red, timeout o 5xx (arranque en frío)
        W-->>WM: Result.retry() (backoff exponencial de 30 s a 5 min)
    end
```

Garantías:
- **Idempotencia:** reenviar un lote ya aplicado devuelve `STALE`, sin duplicar (REQ-SYN-04).
- **Sin pérdidas:** si el usuario editó una fila mientras el lote viajaba, su `updatedAt` cambió y la fila sigue `PENDING` para el próximo push.
- **Aislamiento:** el `user_id` viene del JWT; un id ajeno se rechaza (RNF-17).
