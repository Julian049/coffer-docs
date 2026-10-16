# SEQ-10 · Gastos recurrentes: pendientes, pago, omisión, finalización y avisos

Requisitos: REQ-REC-01 a 11, HU-07 · Pantallas: Inicio (Próximos pagos), Hoja Pendiente, Hoja Pagar pendiente, Gastos recurrentes

## 10.1 Mostrar pendientes en Inicio

```mermaid
sequenceDiagram
    autonumber
    participant HVM as HomeViewModel
    participant UC as ObservePendingPayments
    participant RR as RecurringRepository
    participant IR as InstallmentRepository
    participant RCC as RecurrenceCalculator
    participant SR as SettingsRepository

    HVM->>UC: invoke(today)
    UC->>SR: observeSettings()
    SR-->>UC: reminderLeadDays = 5
    UC->>RR: observeActive()
    UC->>IR: observeScheduled(dueBefore = today + 5)
    RR-->>UC: recurrentes con nextDueDate
    IR-->>UC: cuotas de préstamo y tarjeta del periodo
    UC->>RCC: urgency(dueDate, today, leadDays)
    RCC-->>UC: OVERDUE si ya venció, SOON si faltan ≤ 2 días, UPCOMING en el resto de la ventana
    UC-->>HVM: Flow de PendingPayment ordenados por fecha (no afectan saldos, REQ-REC-04)
```

## 10.2 Pagar, omitir o finalizar

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant SH as PendingSheet
    participant VM as PendingViewModel
    participant PAY as PayPending
    participant SKIP as SkipPending
    participant FIN as EndRecurrence
    participant RCC as RecurrenceCalculator
    participant TR as TransactionRepositoryImpl
    participant DB as FinanceDatabase

    U->>SH: Toca el pendiente "Arriendo"
    alt Pagar
        SH->>VM: onPay()
        VM-->>U: Diálogo con monto = lastPaidAmount o estimatedAmount, fecha = hoy y cuenta por defecto, todo editable (REQ-REC-07)
        U->>VM: Confirmar pago
        VM->>PAY: invoke(recurringId, amount, date, accountId)
        PAY->>RCC: next(nextDueDate, frequency, interval)
        RCC-->>PAY: nueva nextDueDate
        PAY->>TR: withTransaction
        TR->>DB: INSERT transactions (EXPENSE, recurring_id, categoría del recurrente)
        TR->>DB: UPDATE recurring_expenses SET last_paid_amount, next_due_date, last_notified_on = null
        TR->>DB: INSERT change_log, todo PENDING
    else Omitir esta vez
        SH->>SKIP: invoke(recurringId)
        SKIP->>RCC: next(nextDueDate, …)
        SKIP->>DB: UPDATE recurring_expenses SET next_due_date (sin transacción, REQ-REC-08)
    else Finalizar recurrencia
        SH->>FIN: invoke(recurringId)
        FIN->>DB: UPDATE recurring_expenses SET active = false (no genera más pendientes)
    end
```

## 10.3 Avisos (notificaciones locales)

```mermaid
sequenceDiagram
    autonumber
    participant WM as WorkManager
    participant RW as ReminderWorker
    participant SR as SettingsRepository
    participant UC as ObservePendingPayments
    participant DB as FinanceDatabase
    participant NP as NotificationPublisher
    participant OS as Android

    WM->>RW: doWork() (periódico diario, cerca de las 08:00 locales, sin requerir red)
    RW->>SR: settings()
    alt notificationsEnabled = false o falta el permiso POST_NOTIFICATIONS
        RW-->>WM: Result.success() sin avisar (REQ-REC-10)
    else Activadas
        RW->>UC: pendingFor(today)
        loop Por cada pendiente
            alt Entra hoy en la ventana (dueDate − leadDays = hoy) y no se ha avisado
                RW->>NP: notify("Arriendo vence el 9 oct · $900.000")
                RW->>DB: last_notified_on = hoy
            else Vence hoy y sigue sin pagar
                RW->>NP: notify("Hoy vence Arriendo")
                RW->>DB: last_notified_on = hoy
            end
        end
        NP->>OS: NotificationManagerCompat.notify (canal "Pagos pendientes", intent a la Hoja Pendiente)
    end
```
