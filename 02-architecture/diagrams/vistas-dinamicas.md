# Vistas dinámicas (escenarios en ejecución)

Escenarios clave del SRS a nivel de componentes C4. Complementan la sección 6 de [`../architecture.md`](../architecture.md).

## D1 · Registrar un gasto sin conexión y respaldarlo (HU-01, HU-05)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant UI as TransactionScreen
    participant VM as TransactionViewModel
    participant UC as RegisterTransaction
    participant FIN as Motor financiero
    participant REP as TransactionRepository
    participant DB as Room (SQLCipher)
    participant SCH as SyncScheduler
    participant W as SyncWorker
    participant API as Coffer Server
    participant PG as PostgreSQL

    U->>UI: Monto, categoría, Guardar (≤ 4 interacciones, RNF-14)
    UI->>VM: onSave()
    VM->>UC: invoke(draft)
    UC->>UC: Valida monto > 0, cuenta y categoría (REQ-TRX-01)
    opt La cuenta es tarjeta y hay 2 o más cuotas
        UC->>FIN: planDeCuotas(monto, n, tasa MV, mes de 30 días)
        FIN-->>UC: cuotas (capital fijo + interés sobre saldo)
    end
    UC->>REP: save(transaction, plan?)
    REP->>DB: Una sola transacción de Room: INSERT transaction, deferred_purchase e installments (syncState = PENDING) e INSERT change_log CREATE
    DB-->>VM: Los Flows emiten: lista, saldos y pendientes
    Note over UI,DB: Guardado local en menos de 300 ms, con o sin red (RNF-03)
    UC->>SCH: requestSync()
    SCH->>W: enqueueUniqueWork("sync", KEEP, NetworkType.CONNECTED)

    Note over W,PG: Más tarde, cuando hay red (aunque la app esté cerrada)
    W->>DB: SELECT * WHERE syncState = 'PENDING' LIMIT 200 (todas las tablas)
    W->>API: POST /api/v1/sync/push {changes[]} con Bearer JWT
    API->>API: userId sale del JWT, @Valid por cambio
    loop Por cada cambio, en una transacción
        API->>PG: INSERT … ON CONFLICT (id) DO UPDATE … WHERE excluded.updated_at > t.updated_at AND t.user_id = :userId
    end
    API-->>W: 200 results[{id, APPLIED | STALE | REJECTED}]
    W->>DB: SYNCED si APPLIED o STALE y updatedAt no cambió desde el envío
    W->>DB: FAILED si REJECTED (se muestra en Ajustes › Sincronización)
```

## D2 · Primer inicio de sesión y descarga completa (HU-06, REQ-AUT-05)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant UI as Login / Descarga
    participant AUTH as AuthRepository
    participant SS as SessionStore (Keystore)
    participant W as SyncWorker
    participant API as Coffer Server
    participant DB as Room

    U->>UI: Usuario y contraseña (o Google)
    UI->>AUTH: login(...)
    AUTH->>API: POST /api/v1/auth/login (o /auth/google con idToken)
    API-->>AUTH: 200 {accessToken (15 min), refreshToken (rotativo), user}
    AUTH->>SS: Guarda los tokens cifrados
    UI->>W: Encola "initial-sync" (expedited)
    loop Hasta hasMore = false
        W->>API: GET /api/v1/sync/pull?since=0&limit=500
        API-->>W: {changes[], nextCursor, hasMore, remaining}
        W->>DB: Upsert del lote + guarda pull_cursor (misma transacción)
        W-->>UI: setProgress(recibidos / total)
    end
    UI-->>U: Inicio con los datos completos
    Note over UI,DB: A partir de aquí la sesión no expira por tiempo: solo al reinstalar, borrar datos o cerrar sesión (REQ-AUT-04)
```

## D3 · Sincronización periódica y conflicto entre dos dispositivos (REQ-SYN-02)

```mermaid
sequenceDiagram
    autonumber
    participant A as Teléfono A
    participant B as Teléfono B
    participant API as Coffer Server
    participant PG as PostgreSQL

    A->>API: push tx#7 {monto 12.000, updatedAt 10:00}
    API->>PG: upsert, version = 501
    B->>B: Sin red, edita tx#7 {monto 14.000, updatedAt 10:05}
    B->>API: Al reconectar: push tx#7 (updatedAt 10:05 > 10:00)
    API->>PG: Aplica, version = 502
    A->>API: GET /sync/pull?since=501
    API-->>A: tx#7 {14.000, 10:05, version 502}
    A->>A: Fila local no PENDING (o PENDING pero más vieja): se reemplaza
    Note over A,B: Si A también la hubiera editado offline a las 10:03, el servidor responde STALE a A y su pull trae la versión de las 10:05. Se pierde el cambio más antiguo, como acepta el SRS §2.5.
```

## D4 · Pagar la tarjeta (HU-09, REQ-TC-10 a 12)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant H as Inicio · Pendientes
    participant VM as PayCardViewModel
    participant FIN as Motor financiero
    participant UC as PayCreditCard
    participant REP as Repositorios
    participant DB as Room

    H->>VM: Toca "Pago Tarjeta Visa"
    VM->>FIN: dueThisPeriod(card, hoy)
    FIN-->>VM: mínimo = compras a 1 cuota + cuotas del periodo + intereses + cargos, total = deuda
    U->>VM: Elige mínimo o total, cuenta de origen y ajusta el monto
    VM->>UC: invoke(card, option, sourceAccount, amount)
    UC->>FIN: desglose(amount) en capital, intereses y cargos
    alt Pago total
        UC->>FIN: liquidar cuotas restantes sin intereses futuros (REQ-TC-12)
    end
    UC->>REP: Una transacción de Room: TRANSFER origen a tarjeta con principal, interest y fees, cuotas a PAID, change_log
    REP->>DB: syncState = PENDING en todas las filas tocadas
    Note over DB: Los intereses y cargos cuentan en "Intereses y cargos financieros" en la fecha del pago (REQ-TC-09)
```

## D5 · Renovar la sesión (RNF-09, REQ-AUT-04)

```mermaid
sequenceDiagram
    autonumber
    participant W as SyncWorker
    participant OK as OkHttp Authenticator
    participant SS as SessionStore
    participant API as Coffer Server

    W->>API: POST /sync/push (access token vencido)
    API-->>OK: 401
    OK->>SS: refreshToken
    OK->>API: POST /api/v1/auth/refresh {refreshToken, deviceId}
    alt Refresh válido
        API-->>OK: Nuevo access token y nuevo refresh (el anterior queda revocado)
        OK->>SS: Guarda
        OK->>API: Reintenta la petición original
    else Refresh revocado o reutilizado
        API-->>OK: 401 FIN-AUTH-REVOKED (revoca toda la familia de tokens)
        OK->>SS: Marca la sesión como inválida
        Note over W: Los datos locales se conservan, la UI pide iniciar sesión y la cola espera
    end
```
