# SEQ-14 · Editar, eliminar y restaurar transacciones

Requisitos: REQ-TRX-07, REQ-HIS-01 a 04, HU-12 · Pantallas: Detalle de transacción, Diálogo eliminar, Historial de cambios

## 14.1 Editar y eliminar

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant D as TransactionDetailScreen
    participant VM as TransactionDetailViewModel
    participant UPD as UpdateTransaction
    participant DEL as DeleteTransaction
    participant TR as TransactionRepositoryImpl
    participant CL as ChangeLogWriter
    participant DB as FinanceDatabase

    alt Editar
        U->>D: Editar, cambia el monto de 12.000 a 14.000 y Guardar
        D->>VM: onSave(draft)
        VM->>UPD: invoke(id, draft)
        UPD->>TR: withTransaction
        TR->>DB: SELECT before
        TR->>DB: UPDATE transactions (updatedAt = now, PENDING)
        TR->>CL: log(UPDATE, before, after)
    else Eliminar
        U->>D: Eliminar
        D-->>U: "¿Eliminar esta transacción? Podrás restaurarla durante 90 días."
        U->>VM: Eliminar
        VM->>DEL: invoke(id)
        DEL->>TR: withTransaction
        TR->>DB: UPDATE transactions SET deleted_at = now (PENDING)
        TR->>CL: log(DELETE, before, null)
    end
    Note over TR,DB: Si la transacción es una compra diferida, eliminarla también marca deleted_at en su deferred_purchase y sus cuotas SCHEDULED
```

## 14.2 Restaurar o revertir desde el historial

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant H as ChangeLogScreen
    participant VM as ChangeLogViewModel
    participant RS as RestoreTransaction
    participant RV as RevertEdit
    participant TR as TransactionRepositoryImpl
    participant DB as FinanceDatabase

    H->>VM: init
    VM->>DB: change_log WHERE changedAt ≥ now − 90 días ORDER BY changedAt DESC
    VM-->>H: Agrupado por día
    alt Restaurar un borrado
        U->>VM: Restaurar "Almuerzo"
        VM->>RS: invoke(entry)
        RS->>TR: withTransaction
        TR->>DB: UPDATE transactions SET deleted_at = null, valores = before_value, updatedAt = now (PENDING)
        TR->>DB: INSERT change_log RESTORE
    else Revertir una edición
        U->>VM: Revertir "Taxi" ($12.000 a $14.000)
        VM->>RV: invoke(entry)
        RV->>TR: withTransaction
        TR->>DB: UPDATE transactions con before_value, updatedAt = now (PENDING)
        TR->>DB: INSERT change_log UPDATE (before = actual, after = restaurado)
    end
    Note over DB: Las entradas de más de 90 días se purgan en el dispositivo (al iniciar la app) y en el servidor (job diario), REQ-HIS-04
```
