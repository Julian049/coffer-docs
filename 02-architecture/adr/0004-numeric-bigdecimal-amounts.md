# ADR-0004: Montos exactos con `NUMERIC(19,4)` y `BigDecimal`

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** RNF-12, RNF-13, RNF-16, REQ-TC-02, REQ-TC-07, REQ-TC-15, REQ-PRE-03

## Contexto y problema

El MVP guarda `value` como `NUMERIC` en PostgreSQL pero lo maneja como `double` en Java y Kotlin, y usa el signo para indicar si es ingreso o gasto. RNF-12 prohíbe el punto flotante. Además, la v1.0 calcula intereses mensuales, convierte tasas EA↔MV y genera planes de cuotas, operaciones con decimales intermedios. La moneda por defecto es COP (sin decimales visibles), pero el usuario puede elegir mostrar 2 decimales (RNF-13).

## Opciones consideradas

1. `NUMERIC(19,4)` en PostgreSQL y `BigDecimal` en servidor y cliente.
2. Entero en unidad mínima (`BIGINT` en centavos) en ambos lados.
3. `double` (estado actual).

## Decisión

Se elige **`NUMERIC(19,4)` + `BigDecimal`**:

- **Servidor:** columnas `NUMERIC(19,4)` para montos y `NUMERIC(9,6)` para tasas; entidades con `BigDecimal`. Jackson serializa los montos como **string JSON** (`"28000.0000"`) para no perder precisión en el cliente.
- **Cliente:** el dominio usa un *value object* `Money(amount: BigDecimal, currency: Currency)`. Room guarda los montos como `Long` escalado ×10⁴ (exacto y sumable en SQL) y el mapper lo convierte a `BigDecimal`.
- **Redondeo:** se calcula con escala 10 y `RoundingMode.HALF_EVEN`. Cada cuota se redondea a la escala de la moneda (COP: 0 decimales) y la diferencia acumulada se absorbe en la última cuota, para que la suma de las cuotas sea exactamente el monto.
- **Signo:** el monto siempre es positivo (`CHECK amount > 0`); el sentido lo da `type` (`EXPENSE`, `INCOME`, `TRANSFER`). Se elimina la ambigüedad del MVP.
- **Presentación:** formato es-CO con punto de miles; 0 o 2 decimales según `user_settings.amount_decimals`.

### Consecuencias

- Positivas: sin errores de punto flotante; las tasas y los intereses se calculan con la precisión necesaria; el JSON es legible.
- Negativas: `BigDecimal` es más verboso que `Long`; hay que fijar siempre la escala y el modo de redondeo (se centraliza en `Money` y en `FinanceMath`).

### Cómo se verifica

- Pruebas del dominio: un plan de 12 cuotas de $1.200.000 suma exactamente $1.200.000 en capital.
- Regla de ArchUnit o Detekt: prohibido `Double` o `Float` en `domain/` y en las entidades del servidor.
