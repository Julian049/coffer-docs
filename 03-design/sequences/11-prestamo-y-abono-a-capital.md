# SEQ-11 · Préstamos: registro, pago de cuota y abono a capital

Requisitos: REQ-PRE-01 a 10, HU-14, F29 · Pantallas: Nuevo préstamo (detallado o simple), Detalle de préstamo, Hoja Abono a capital

## 11.1 Registrar un préstamo detallado

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant VM as NewLoanViewModel
    participant UC as CreateLoan
    participant RC as RateConverter
    participant LS as LoanScheduler
    participant LR as LoanRepository
    participant DB as FinanceDatabase

    U->>VM: Modo detallado: $5.000.000, 24 cuotas, 1,5 % MV, primera cuota 5 nov, seguro $8.000, destino Bancolombia
    VM->>LS: preview(input)
    LS-->>VM: Primera cuota estimada $291.333
    U->>VM: Crear préstamo
    VM->>UC: invoke(LoanInput.Detailed)
    UC->>RC: toMonthly(1,5 %, MV)
    UC->>LS: schedule(principal, n = 24, i, firstDueDate, paymentDay, insurance, otherCosts)
    LS-->>UC: 24 cuotas: capital = P/n, interés = saldo × i (mes de 30 días) y seguro + costos
    UC->>LR: create(account LOAN, loanDetails, installments, disbursement)
    LR->>DB: withTransaction
    LR->>DB: INSERT accounts (type LOAN, initial_balance = 0)
    LR->>DB: INSERT loan_details (DETAILED)
    LR->>DB: INSERT 24 installments (SCHEDULED, loan_account_id)
    LR->>DB: INSERT transactions TRANSFER del préstamo a Bancolombia por $5.000.000 (no es ingreso)
    LR->>DB: change_log, todo PENDING
    UC-->>VM: Success, navega a Detalle de préstamo
    Note over DB: La deuda del préstamo es −$5.000.000 por la transferencia de salida. Cada cuota aparece como pendiente (REQ-PRE-04)
```

## 11.2 Pagar una cuota

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant UC as PayLoanInstallment
    participant TR as TransactionRepositoryImpl
    participant DB as FinanceDatabase

    U->>UC: Pagar cuota 4 desde Bancolombia ($281.958)
    UC->>DB: SELECT installment 4 (capital 208.333, interés 65.625, seguro 8.000)
    UC->>TR: withTransaction
    TR->>DB: INSERT transactions TRANSFER Bancolombia a préstamo, principal = 208.333, interest = 65.625, fees = 8.000, installment_id, payment_kind = LOAN_INSTALL
    TR->>DB: UPDATE installments SET status = PAID, paid_at
    Note over DB: El capital reduce la deuda. Intereses y seguro cuentan como "Intereses y cargos financieros" (REQ-PRE-05)
```

## 11.3 Abono extraordinario a capital

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant SH as ExtraPaymentSheet
    participant UC as ExtraPayment
    participant LS as LoanScheduler
    participant TR as TransactionRepositoryImpl
    participant DB as FinanceDatabase

    U->>SH: Abono de $1.000.000
    SH->>LS: simulate(loan, 1.000.000, REDUCE_TERM) y simulate(…, REDUCE_PAYMENT)
    LS-->>SH: Plazo: 16 cuotas restantes en lugar de 21. Cuota: baja a ≈ $230.000
    U->>SH: Reducir el plazo, desde Nu, Registrar abono
    SH->>UC: invoke(loanId, 1.000.000, REDUCE_TERM, sourceAccount)
    UC->>LS: reschedule(saldo − 1.000.000, mode, desde la próxima cuota)
    LS-->>UC: Plan nuevo
    UC->>TR: withTransaction
    TR->>DB: INSERT transactions TRANSFER (principal = 1.000.000, payment_kind = LOAN_EXTRA)
    TR->>DB: UPDATE installments SCHEDULED a CANCELLED
    TR->>DB: INSERT installments del plan nuevo (números a partir de la próxima cuota)
    TR->>DB: change_log, todo PENDING
```

## 11.4 Préstamo en modo simple

En modo simple (REQ-PRE-08), `CreateLoan` recibe el saldo actual, la cuota mensual y el día de pago:
1. Crea la cuenta `LOAN` con `initial_balance = saldo` (deuda inicial) y `loan_details(mode = SIMPLE)`, sin plan de cuotas.
2. El pendiente mensual se calcula con `payment_day` y `monthly_payment`.
3. Cada pago es una `TRANSFER` sin desglose que reduce la deuda por su valor completo.
4. Pasar a detallado (REQ-PRE-09) usa `CreateLoan` en modo `DETAILED` sobre la misma cuenta y genera el plan desde la fecha actual.
