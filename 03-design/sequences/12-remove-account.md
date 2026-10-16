# SEQ-12 · Quitar una cuenta (desactivar, mover o eliminar)

Requisitos: REQ-CTA-03, 04, 05, HU-13 · Pantallas: Gestión de cuentas (menú ⋮), Hoja Opciones de la cuenta, Hojas Eliminar cuenta (3 estados), Hoja Confirmar eliminación, Cuentas desactivadas

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant SH as RemoveAccountSheet
    participant VM as RemoveAccountViewModel
    participant UC as RemoveAccount
    participant AR as AccountRepository
    participant TR as TransactionRepositoryImpl
    participant DB as FinanceDatabase
    participant SCH as SyncScheduler

    U->>SH: ⋮ y luego Eliminar cuenta
    SH->>VM: load(accountId)
    VM->>AR: impact(accountId)
    AR->>DB: COUNT de transacciones, saldo actual, rango de fechas, recurrentes que la usan
    AR-->>VM: AccountImpact(38 movimientos, $850.000, jun – oct 2026)
    VM-->>SH: 3 opciones, Desactivar preseleccionada (recomendada)
    alt Desactivar
        U->>VM: Desactivar cuenta
        VM->>UC: invoke(DEACTIVATE)
        UC->>AR: UPDATE accounts SET active = false, deactivated_at = now (PENDING)
        Note over DB: Desaparece de inicio, selectores y saldo total, pero conserva sus transacciones en reportes (REQ-CTA-04)
    else Mover transacciones a otra cuenta
        U->>VM: Elige destino "Cuenta Ahorros Nu"
        VM->>UC: invoke(MOVE, targetId)
        UC->>UC: Valida que el destino esté activo, sea distinto y no deje transferencias de la cuenta a sí misma
        UC->>TR: withTransaction
        TR->>DB: UPDATE transactions SET account_id = destino WHERE account_id = origen
        TR->>DB: UPDATE transactions SET destination_account_id = destino WHERE destination_account_id = origen
        TR->>DB: UPDATE recurring_expenses SET account_id = destino
        TR->>DB: UPDATE accounts SET deleted_at = now (origen) y change_log, todo PENDING
    else Eliminar definitivamente
        U->>VM: Eliminar definitivamente
        VM-->>SH: Aviso "Atención con esta cuenta" y Confirmar eliminación
        U->>VM: Escribe "Bancolombia Débito"
        VM->>VM: El botón solo se habilita si el texto coincide (sin distinguir mayúsculas), REQ-CTA-05
        VM->>UC: invoke(DELETE_ALL, confirmation)
        UC->>TR: withTransaction
        TR->>DB: UPDATE transactions, installments y deferred_purchases relacionados SET deleted_at = now
        TR->>DB: UPDATE recurring_expenses de la cuenta SET active = false, deleted_at = now
        TR->>DB: UPDATE accounts SET deleted_at = now y change_log DELETE por transacción, todo PENDING
    end
    UC->>SCH: requestSync()
    Note over DB: Los borrados son lógicos y se propagan a la nube y a otros dispositivos (REQ-SYN-03)
```

Reactivar (REQ-CTA-04): desde "Cuentas desactivadas", `ReactivateAccount` hace `UPDATE accounts SET active = true, deactivated_at = null` (PENDING).
