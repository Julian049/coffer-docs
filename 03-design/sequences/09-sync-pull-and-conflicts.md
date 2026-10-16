# SEQ-09 · Sincronización: pull incremental y resolución de conflictos

Requisitos: REQ-SYN-02, 03, 05, RNF-07 · Decisión: [ADR-0006](../../02-architecture/adr/0006-sync-protocol.md)

## 9.1 Pull

```mermaid
sequenceDiagram
    autonumber
    participant W as SyncWorker
    participant DB as FinanceDatabase
    participant API as SyncApi
    participant PS as PullService
    participant PG as PostgreSQL
    participant M as ChangeApplier

    W->>DB: SELECT value FROM sync_meta WHERE key = 'pull_cursor'
    loop Mientras hasMore
        W->>API: GET /api/v1/sync/pull?since={cursor}&limit=500
        API->>PS: pull(userId, since, limit)
        PS->>PG: UNION ALL de las 13 tablas WHERE user_id = ? AND version > ? ORDER BY version LIMIT 501
        PS-->>API: changes (≤ 500), nextCursor = última version, hasMore, remaining
        API-->>W: PullResponse
        W->>M: apply(changes)
        loop Por cada cambio recibido
            M->>DB: SELECT syncState, updatedAt de la fila local por id
            alt No existe localmente
                M->>DB: INSERT (SYNCED)
            else Local SYNCED, o PENDING con updatedAt menor que el recibido
                M->>DB: UPDATE con los valores recibidos (SYNCED), o borrado lógico si deletedAt
            else Local PENDING con updatedAt mayor o igual
                M->>M: Se ignora (gana el cambio local, se enviará en el próximo push)
            end
        end
        M->>DB: UPDATE sync_meta pull_cursor = nextCursor (misma transacción que el lote)
    end
    W->>DB: sync_meta.last_sync_at = now y last_sync_result = OK
    Note over DB: El indicador de Ajustes muestra "Sincronizado · hace N min · 0 pendientes" (REQ-SYN-05) con estados genéricos (RNF-07)
```

## 9.2 Conflicto entre dos dispositivos (último cambio gana)

```mermaid
sequenceDiagram
    autonumber
    participant A as Teléfono A
    participant B as Teléfono B
    participant S as Coffer Server
    participant PG as PostgreSQL

    A->>S: push tx#7 (monto 12.000, updatedAt 10:00)
    S->>PG: INSERT, version 501
    Note over B: Sin red
    B->>B: Edita tx#7 (monto 14.000, updatedAt 10:05, PENDING)
    A->>A: Edita tx#7 (monto 13.000, updatedAt 10:03, PENDING)
    B->>S: push tx#7 @10:05
    S->>PG: 10:05 > 10:00, UPDATE, version 502
    S-->>B: APPLIED
    A->>S: push tx#7 @10:03
    S->>PG: 10:03 < 10:05, el WHERE no se cumple
    S-->>A: STALE
    A->>A: Marca SYNCED (su versión perdió)
    A->>S: pull since 501
    S-->>A: tx#7 (14.000, 10:05, version 502)
    A->>A: Reemplaza la fila local
    Note over A,B: Se pierde el cambio más antiguo (10:03), como acepta el SRS §2.5. Queda en change_log y se puede revertir (REQ-HIS-03)
```

## 9.3 Programación del worker

| Disparador | Trabajo | Política |
| --- | --- | --- |
| Cualquier escritura local (`requestSync()`) | `OneTimeWorkRequest` "sync" | `ExistingWorkPolicy.KEEP`, restricción `CONNECTED`, retraso inicial de 5 s para agrupar cambios |
| Periódico | `PeriodicWorkRequest` "sync-periodic" | Cada 15 min, `CONNECTED` |
| Recuperar la red | `ConnectivityObserver`, que llama a `requestSync()` | — |
| Primer login | "initial-sync" (SEQ-02) | `REPLACE`, *expedited* |
