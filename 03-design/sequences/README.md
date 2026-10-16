# Secuencias (vista de interacción)

Diagramas de secuencia en Mermaid de los flujos del sistema. Forman la **vista de interacción** del [Detailed Design](../detailed-design.md#67-vista-de-interacción) (IEEE 1016-2009). Los participantes son las clases y componentes definidos en ese documento.

| Id | Flujo | Requisitos | Pantallas del prototipo |
| --- | --- | --- | --- |
| [SEQ-01](01-autenticacion.md) | Registro, login y Google | REQ-AUT-01 a 03 | Iniciar sesión, Registro |
| [SEQ-02](02-descarga-inicial.md) | Descarga inicial con progreso | REQ-AUT-05, REQ-CAT-01 | Descargando tus datos |
| [SEQ-03](03-sesion-renovar-y-cerrar.md) | Renovar y cerrar sesión | REQ-AUT-04, 06 | Ajustes, Cerrar sesión |
| [SEQ-04](04-registrar-gasto-o-ingreso.md) | Registrar un gasto o un ingreso | REQ-TRX-01, 05, RNF-14 | Nueva transacción |
| [SEQ-05](05-transferencia.md) | Transferencia entre cuentas | REQ-TRX-02 a 04 | Nueva transferencia |
| [SEQ-06](06-compra-con-tarjeta-a-cuotas.md) | Compra con tarjeta a cuotas | REQ-TC-05 a 09, 15 | Nueva transacción con tarjeta |
| [SEQ-07](07-pagar-tarjeta.md) | Pagar la tarjeta (mínimo o total) | REQ-TC-10 a 12 | Hoja Pagar tarjeta |
| [SEQ-08](08-sincronizacion-push.md) | Sincronización: push | REQ-SYN-01, 02, 04 | — |
| [SEQ-09](09-sincronizacion-pull-y-conflictos.md) | Sincronización: pull y conflictos | REQ-SYN-02, 03, 05 | Ajustes (estado) |
| [SEQ-10](10-pendientes-recurrentes-y-avisos.md) | Pendientes, pagar, omitir, finalizar y avisos | REQ-REC-01 a 11 | Inicio, Hoja Pendiente, Gastos recurrentes |
| [SEQ-11](11-prestamo-y-abono-a-capital.md) | Préstamo, cuota y abono a capital | REQ-PRE-01 a 10 | Nuevo préstamo, Detalle de préstamo |
| [SEQ-12](12-quitar-cuenta.md) | Quitar una cuenta | REQ-CTA-03 a 05 | Hojas de eliminar cuenta |
| [SEQ-13](13-importar-y-exportar.md) | Importar y exportar | REQ-IMP-01 a 06, REQ-EXP-01 | Importar y exportar |
| [SEQ-14](14-editar-eliminar-y-restaurar.md) | Editar, eliminar y restaurar | REQ-TRX-07, REQ-HIS-01 a 04 | Detalle de transacción, Historial de cambios |

Convenciones:
- Las escrituras locales siempre van en `FinanceDatabase.withTransaction` y dejan las filas en `PENDING`.
- "PENDING" significa que la fila espera el próximo push ([SEQ-08](08-sincronizacion-push.md)).
- En Mermaid, el texto de los mensajes no usa `;` porque el lenguaje lo interpreta como separador.
