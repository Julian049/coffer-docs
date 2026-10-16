# ADR-0003: Flyway como única vía de cambio del esquema

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** RNF-17, RNF-18, §7.4

## Contexto y problema

El servidor ya usa Flyway (`V1__first_schema.sql`, `V2__fix_schema.sql`). La v1.0 requiere un esquema nuevo y mucho más amplio (usuarios, cuentas, tarjetas, préstamos, cuotas, etc.) y migrar los datos del MVP sin perderlos. Hace falta una regla clara de cómo evoluciona el esquema en local, CI y producción.

## Opciones consideradas

1. Flyway con migraciones SQL versionadas.
2. Liquibase (changelogs en YAML o XML).
3. `spring.jpa.hibernate.ddl-auto=update`.

## Decisión

Se mantiene **Flyway** (`spring-boot-starter-flyway`, `flyway-database-postgresql`) con migraciones **SQL** en `src/main/resources/db/migration/`:

- Nombres `V{n}__{descripcion_snake_case}.sql`. Una migración aplicada **nunca se edita**; los cambios se hacen con una nueva.
- Hibernate en modo `ddl-auto=validate`: si las entidades JPA no coinciden con el esquema, el arranque falla.
- Cambios incompatibles en dos pasos (*expand / contract*): primero se añade, después se elimina, en versiones distintas.
- El servidor no siembra datos de negocio. Las categorías base, incluida la de sistema `FINANCIAL_CHARGES`, las crea el cliente en el primer uso (REQ-CAT-01) y llegan por sincronización. La v1.0 no usa migraciones repetibles `R__`.
- El esquema físico, el diccionario y los scripts completos están en [`docs/03-design/data-model.md`](../../03-design/data-model.md).

Plan de migraciones de la v1.0 (nombres definitivos y scripts en `docs/03-design/data-model.md` §4; el sprint de cada una en `docs/07-management/sprint-plan.md`):

| Migración | Contenido |
| --- | --- |
| `V3__create_identity.sql` | `users`, `refresh_tokens`; usuario "owner" para los datos del MVP |
| `V4__create_sync_infrastructure.sql` | `SEQUENCE sync_version` y función `set_sync_version()`; cada tabla sincronizable tiene un trigger que asigna `version` en cada INSERT/UPDATE |
| `V5__create_ledger_core.sql` | `user_settings`, `accounts`, `categories`, `tags` |
| `V6__migrate_transactions_v2.sql` | Nueva `transactions` (con `type`, `account_id`, desglose); migra las filas del MVP: `local_id` pasa a `id`, `abs(value)` a `amount`, el signo a `type`, `date` a `occurred_at`, y crea una cuenta "Efectivo (migrada)" |
| `V7__create_recurring_and_history.sql` | `recurring_expenses`, `change_log` |
| `V8__create_credit_and_loans.sql` | `credit_card_details`, `loan_details`, `deferred_purchases`, `installments` |
| `V9__add_cross_references_and_indexes.sql` | FK de `transactions` hacia cuotas y recurrentes; índices `(user_id, version)` |
| `V10__drop_transactions_mvp.sql` | *Contract*: elimina la tabla del MVP cuando la migración esté verificada en producción |

### Consecuencias

- Positivas: esquema reproducible en local, Testcontainers y producción; historial en Git; el arranque migra solo.
- Negativas: el SQL es específico de PostgreSQL. Se acepta: no se prevé cambiar de motor.

### Cómo se verifica

- Prueba `FlywayMigrationTest` con Testcontainers: aplica V1 a Vn sobre una base vacía y sobre una copia con datos del MVP, y valida conteos y montos.
- `ddl-auto=validate` en todos los perfiles.
