# ADR-0010: La lógica financiera vive en el dominio del cliente

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** RNF-05, REQ-CTA-06, 08, REQ-TC-02, 07, 08, 12, 15, REQ-PRE-03, 06, 07, REQ-REC-08, REQ-REP-01 a 05

## Contexto y problema

Los cálculos del SRS (saldos neto y disponible, plan de cuotas, conversión EA↔MV, interés sobre mes de 30 días, próxima ocurrencia de un recurrente, abonos a capital, reportes) deben estar disponibles **sin conexión** (RNF-05). Si también vivieran en el servidor, habría dos implementaciones que podrían divergir.

## Opciones consideradas

1. Toda la lógica en el dominio Kotlin del cliente; el servidor guarda, valida integridad y sincroniza.
2. Lógica en el servidor y el cliente la replica para el modo offline.
3. Una biblioteca compartida (Kotlin Multiplatform o JVM) usada por ambos.

## Decisión

Se elige la **opción 1**. El paquete `domain/finance` de la app (Kotlin puro) es la **única implementación** de:

| Componente | Responsabilidad | Requisitos |
| --- | --- | --- |
| `RateConverter` | `MV = (1 + EA)^(1/12) − 1` y su inversa | REQ-TC-02 |
| `InstallmentCalculator` | Capital fijo (monto ÷ n) + interés sobre el saldo con mes de 30 días; primera cuota sin intereses; ajuste del redondeo en la última cuota | REQ-TC-03, 07, 15, REQ-PRE-03 |
| `CardPeriodCalculator` | Periodo según el día de corte; lo que vence; pago mínimo y total; liquidación anticipada | REQ-TC-08, 10, 12 |
| `LoanScheduler` | Plan de préstamo detallado o simple; abono a capital que reduce plazo o cuota | REQ-PRE-01 a 08 |
| `BalanceCalculator` | Saldo por cuenta y saldo total neto y disponible | REQ-CTA-06, 08, REQ-PRE-07 |
| `RecurrenceCalculator` | Próxima ocurrencia por frecuencia, ventana de anticipación y urgencia | REQ-REC-02, 04, 05, 08 |
| `ReportAggregator` | Totales por categoría y periodo, evolución, intereses, conteos; reconocimiento de cuotas en su fecha de pago | REQ-REP-01 a 05, REQ-TC-09 |

El servidor **no recalcula**. Guarda las cuotas y transacciones que genera el cliente y solo valida integridad: montos positivos, referencias del mismo usuario, cuentas distintas en una transferencia y la suma de las cuotas igual al monto de la compra.

### Consecuencias

- Positivas: una sola fuente de verdad del cálculo; funciona sin red; el dominio se prueba con JUnit puro.
- Negativas: una futura versión web necesitará esta lógica. Se plantea entonces extraer `domain/finance` a un módulo Kotlin Multiplatform (opción 3) sin cambiar el contrato de sincronización.

### Cómo se verifica

- Pruebas del dominio con los ejemplos del SRS: $1.200.000 a 12 cuotas al 2 % MV; saldo neto $200.000 con $1.000.000 en cuentas y $800.000 que vencen; préstamo de $5.000.000 a 24 cuotas.
- Cobertura mínima del 90 % en `domain/finance`.
