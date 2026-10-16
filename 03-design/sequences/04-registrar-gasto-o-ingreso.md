# SEQ-04 · Registrar un gasto o un ingreso

Requisitos: REQ-TRX-01, 05, 08, RNF-03, RNF-14, RNF-15, REQ-HIS-01 · Pantalla: Nueva transacción

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant H as HomeScreen
    participant TS as TransactionScreen
    participant VM as TransactionViewModel
    participant UC as RegisterTransaction
    participant TR as TransactionRepositoryImpl
    participant CL as ChangeLogWriter
    participant DB as FinanceDatabase
    participant SCH as SyncScheduler

    U->>H: Toca + o el acceso rápido "Gasto"
    H->>TS: navigate(TransactionRoute(type = EXPENSE))
    TS->>VM: init
    VM->>VM: Prellena occurredAt = now (Clock), cuenta = la última usada (REQ-TRX-05)
    U->>TS: Monto y categoría, luego Guardar (4 interacciones, RNF-14)
    TS->>VM: onSave()
    VM->>UC: invoke(TransactionDraft)
    UC->>UC: amount > 0, cuenta activa, categoría del mismo tipo (EXPENSE o INCOME)
    alt Inválido
        UC-->>VM: Failure(ValidationError)
        VM-->>TS: Error en el campo (por ejemplo, "El monto debe ser mayor que cero")
    else La cuenta es una tarjeta
        UC-->>VM: Delegado a DeferCardPurchase (SEQ-06)
    else Válido
        UC->>TR: insert(transaction)
        TR->>DB: withTransaction
        TR->>DB: INSERT transactions (id = UUID v4, syncState = PENDING, createdAt = updatedAt = now)
        TR->>CL: log(CREATE, null, after)
        CL->>DB: INSERT change_log (PENDING)
        DB-->>TR: commit (menos de 300 ms, RNF-03)
        TR-->>UC: Success(id)
        UC->>SCH: requestSync()
        UC-->>VM: Success
        VM-->>TS: popBackStack()
        Note over H,DB: Inicio se actualiza solo: los Flows de Room emiten la lista, los saldos y el indicador "1 pendiente"
    end
```

Notas de diseño:
- El tipo "Ingreso" usa el mismo flujo con `type = INCOME` y categorías de ingreso.
- RNF-15: el formulario solo muestra cuotas y tasa si la cuenta elegida es `CREDIT_CARD` (estado `showCardFields` en `TransactionUiState`).
