# Modelo de datos (vista de información)

Modelo lógico objetivo, derivado del SRS §7.4. El **modelo físico completo** (diccionario de datos, restricciones y scripts de Flyway) es [`docs/03-design/data-model.md`](../../03-design/data-model.md), que prevalece si hay diferencias.

## Columnas comunes de sincronización

Todas las tablas sincronizables, es decir, todas menos `users` y `refresh_tokens`, llevan estas columnas:

| Columna | Tipo (PostgreSQL) | Regla |
| --- | --- | --- |
| `id` | `UUID` PK | Generado en el dispositivo (UUID v4). Hace idempotente el reenvío. |
| `user_id` | `UUID` FK → `users` | Lo asigna el servidor desde el JWT; nunca se acepta del cliente. |
| `created_at` | `TIMESTAMPTZ` | Momento de creación en el dispositivo. |
| `updated_at` | `TIMESTAMPTZ` | Momento de la última modificación en el dispositivo. Decide el **último cambio gana**. |
| `deleted_at` | `TIMESTAMPTZ NULL` | Borrado lógico. Se sincroniza como un cambio más. |
| `version` | `BIGINT` | `nextval('sync_version')` en cada escritura del servidor. Es el cursor de `GET /sync/pull`. |

En el diagrama se omiten para no repetirlas.

## Diagrama entidad-relación (PostgreSQL)

```mermaid
erDiagram
    users ||--o{ refresh_tokens : "sesiones"
    users ||--|| user_settings : "ajustes"
    users ||--o{ accounts : "posee"
    users ||--o{ categories : "define"
    users ||--o{ tags : "define"
    accounts ||--o| credit_card_details : "si es tarjeta"
    accounts ||--o| loan_details : "si es préstamo"
    accounts ||--o{ transactions : "origen"
    accounts |o--o{ transactions : "destino (transferencia)"
    categories |o--o{ categories : "subcategoría de"
    categories |o--o{ transactions : "clasifica"
    tags |o--o{ transactions : "agrupa"
    accounts ||--o{ deferred_purchases : "tarjeta"
    transactions ||--o| deferred_purchases : "compra a cuotas"
    deferred_purchases |o--o{ installments : "plan de cuotas"
    accounts |o--o{ installments : "plan de pagos (préstamo)"
    installments |o--o| transactions : "pagada con"
    accounts ||--o{ recurring_expenses : "se paga desde"
    categories ||--o{ recurring_expenses : "clasifica"
    transactions ||--o{ change_log : "historial"

    users {
        UUID id PK
        VARCHAR_40 username UK "NOT NULL"
        VARCHAR_255 email UK "NOT NULL"
        VARCHAR_100 display_name "NOT NULL"
        VARCHAR_100 password_hash "NULL si solo usa Google, BCrypt"
        VARCHAR_255 google_subject UK "NULL"
        CHAR_3 currency "NOT NULL DEFAULT COP"
        TIMESTAMPTZ created_at "NOT NULL"
    }
    refresh_tokens {
        UUID id PK
        UUID user_id FK "ON DELETE CASCADE"
        VARCHAR_64 token_hash UK "SHA-256 del token"
        VARCHAR_64 device_id "NOT NULL"
        TIMESTAMPTZ expires_at "NOT NULL"
        TIMESTAMPTZ revoked_at "NULL"
        UUID replaced_by "NULL, rotación"
    }
    user_settings {
        UUID id PK "= user_id"
        SMALLINT reminder_lead_days "DEFAULT 5"
        BOOLEAN notifications_enabled "DEFAULT true"
        VARCHAR_10 home_balance_view "AVAILABLE o NET"
        SMALLINT amount_decimals "0 o 2"
        JSONB home_cards "orden y visibilidad"
    }
    accounts {
        UUID id PK
        VARCHAR_60 name "NOT NULL"
        VARCHAR_12 type "CASH, DEBIT, SAVINGS, CREDIT_CARD, LOAN"
        NUMERIC_19_4 initial_balance "NOT NULL DEFAULT 0"
        BOOLEAN include_in_total "NOT NULL DEFAULT true"
        BOOLEAN active "NOT NULL DEFAULT true"
        VARCHAR_60 institution "NULL"
        VARCHAR_30 icon "NULL"
        CHAR_7 color "NULL, #RRGGBB"
        INTEGER sort_order "NOT NULL DEFAULT 0"
    }
    credit_card_details {
        UUID id PK "= account_id"
        NUMERIC_19_4 credit_limit "NOT NULL"
        SMALLINT cut_off_day "1..31"
        SMALLINT payment_day "1..31"
        NUMERIC_9_6 rate "NOT NULL"
        CHAR_2 rate_type "EA o MV"
        BOOLEAN first_installment_interest_free "NOT NULL"
    }
    loan_details {
        UUID id PK "= account_id"
        VARCHAR_10 mode "DETAILED o SIMPLE"
        NUMERIC_19_4 principal "NULL en SIMPLE"
        SMALLINT installments_count "NULL en SIMPLE"
        NUMERIC_9_6 rate "NULL en SIMPLE"
        CHAR_2 rate_type "EA o MV, NULL en SIMPLE"
        DATE first_due_date "NULL en SIMPLE"
        SMALLINT payment_day "1..31"
        NUMERIC_19_4 monthly_payment "solo SIMPLE"
        NUMERIC_19_4 life_insurance_monthly "DEFAULT 0"
        NUMERIC_19_4 other_costs_monthly "DEFAULT 0"
    }
    categories {
        UUID id PK
        UUID parent_id FK "NULL, un nivel"
        VARCHAR_50 name "NOT NULL"
        VARCHAR_7 kind "EXPENSE o INCOME"
        BOOLEAN is_base "precargada"
        VARCHAR_30 icon "NULL"
        VARCHAR_40 system_key "NULL, p. ej. FINANCIAL_CHARGES"
    }
    tags {
        UUID id PK
        VARCHAR_50 name "NOT NULL"
        BOOLEAN pinned "fijada en inicio"
    }
    transactions {
        UUID id PK
        VARCHAR_8 type "EXPENSE, INCOME, TRANSFER"
        NUMERIC_19_4 amount "CHECK > 0"
        TIMESTAMPTZ occurred_at "fecha y hora del movimiento"
        UUID account_id FK "NOT NULL"
        UUID destination_account_id FK "solo TRANSFER, distinta de account_id"
        UUID category_id FK "obligatoria en EXPENSE e INCOME"
        UUID tag_id FK "NULL, máximo una"
        VARCHAR_500 note "NULL"
        SMALLINT installments "1 por defecto en compras con tarjeta"
        NUMERIC_19_4 principal "desglose, NULL"
        NUMERIC_19_4 interest "desglose, NULL"
        NUMERIC_19_4 fees "desglose (seguro y cargos), NULL"
        UUID installment_id FK "NULL, cuota que paga"
        UUID recurring_id FK "NULL, pendiente que paga"
    }
    deferred_purchases {
        UUID id PK
        UUID card_account_id FK "NOT NULL"
        UUID purchase_transaction_id FK "UK"
        NUMERIC_19_4 amount "NOT NULL"
        SMALLINT installments_count "2 o más"
        NUMERIC_9_6 rate "aplicada, editable"
        CHAR_2 rate_type "EA o MV"
        DATE first_due_date "NOT NULL"
    }
    installments {
        UUID id PK
        UUID deferred_purchase_id FK "XOR con loan_account_id"
        UUID loan_account_id FK "XOR con deferred_purchase_id"
        SMALLINT number "1..n"
        DATE due_date "NOT NULL"
        NUMERIC_19_4 principal "NOT NULL"
        NUMERIC_19_4 interest "NOT NULL"
        NUMERIC_19_4 insurance "DEFAULT 0"
        NUMERIC_19_4 other_costs "DEFAULT 0"
        VARCHAR_10 status "SCHEDULED, PAID, CANCELLED"
    }
    recurring_expenses {
        UUID id PK
        VARCHAR_60 name "NOT NULL"
        NUMERIC_19_4 estimated_amount "NOT NULL"
        NUMERIC_19_4 last_paid_amount "NULL"
        UUID account_id FK "NOT NULL"
        UUID category_id FK "NOT NULL"
        DATE start_date "NOT NULL"
        VARCHAR_10 frequency "WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM"
        SMALLINT interval_count "solo CUSTOM"
        VARCHAR_5 interval_unit "DAY, WEEK, MONTH"
        DATE next_due_date "NOT NULL"
        BOOLEAN active "false = finalizada"
    }
    change_log {
        UUID id PK
        UUID transaction_id "sin FK, sobrevive al borrado"
        VARCHAR_6 action "CREATE, UPDATE, DELETE"
        JSONB before_value "NULL en CREATE"
        JSONB after_value "NULL en DELETE"
        TIMESTAMPTZ changed_at "purga a los 90 días"
    }
```

## Restricciones e índices

| Objeto | Definición | Requisito |
| --- | --- | --- |
| `SEQUENCE sync_version` | global y monotónica | REQ-SYN-01, pull incremental |
| `ix_<tabla>_user_version` | `(user_id, version)` en cada tabla sincronizable | `GET /sync/pull` |
| `ix_tx_user_occurred` | `transactions(user_id, occurred_at DESC) WHERE deleted_at IS NULL` | REQ-TRX-06, 12 |
| `ix_tx_user_account` | `transactions(user_id, account_id, occurred_at DESC)` | Detalle de cuenta |
| `ck_tx_amount` | `amount > 0` | REQ-TRX-01 |
| `ck_tx_transfer` | `type <> 'TRANSFER' OR (destination_account_id IS NOT NULL AND destination_account_id <> account_id)` | REQ-TRX-02 |
| `ck_tx_category` | `type = 'TRANSFER' OR category_id IS NOT NULL` | REQ-TRX-01 |
| `ck_inst_owner` | `num_nonnulls(deferred_purchase_id, loan_account_id) = 1` | REQ-TC-07, REQ-PRE-03 |
| `uq_cat_name` | `(user_id, kind, coalesce(parent_id, '00000000-…'), lower(name)) WHERE deleted_at IS NULL` | REQ-CAT-02 |
| `uq_tag_name` | `(user_id, lower(name)) WHERE deleted_at IS NULL` | REQ-ETQ-01 |
| `ix_change_log_changed` | `change_log(user_id, changed_at)` | Purga de 90 días (REQ-HIS-04) |

## Datos que no se guardan (se calculan)

| Dato | Cómo se obtiene | Requisito |
| --- | --- | --- |
| Saldo de una cuenta | `initial_balance + ingresos − gastos ± transferencias` | REQ-CTA-06 |
| Saldo neto y disponible | Cuentas incluidas, menos lo que vence en el periodo | REQ-CTA-08 |
| Pendientes | `recurring_expenses.next_due_date` dentro de la ventana, cuotas `SCHEDULED` del periodo y pago de la tarjeta | REQ-REC-04, REQ-TC-10, REQ-PRE-04 |
| Lo que vence en el periodo de una tarjeta | Compras a 1 cuota del periodo + cuotas del periodo + intereses + cargos | REQ-TC-08 |

## Diferencias en Room (dispositivo)

| Aspecto | PostgreSQL | Room |
| --- | --- | --- |
| Montos | `NUMERIC(19,4)` | `INTEGER` escalado ×10⁴ (`Long`), convertido a `BigDecimal` en el mapper. Exacto y sumable en SQL. |
| Fechas con hora | `TIMESTAMPTZ` | `INTEGER` epoch en milisegundos UTC |
| Fechas sin hora | `DATE` | `TEXT` ISO-8601 (`2026-10-09`) |
| `user_id`, `version` | Sí | No, porque el dispositivo es de un solo usuario y el cursor vive en `sync_meta` |
| Estado de sincronización | — | `syncState TEXT` (`PENDING`, `SYNCED`, `FAILED`) indexado: la cola de cambios por fila |
| Tablas extra | — | `sync_meta(key, value)` para `pull_cursor` y `last_sync_at` |
| Cifrado | En tránsito (TLS) y en reposo del proveedor | SQLCipher con clave en Keystore (RNF-08) |
