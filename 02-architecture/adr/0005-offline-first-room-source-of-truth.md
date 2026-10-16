# ADR-0005: Offline-first con Room como fuente de verdad del dispositivo

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** F08, RNF-02, RNF-03, RNF-05, REQ-TRX-08, REQ-SYN-01

## Contexto y problema

El rasgo central del SRS es que la app funcione completa sin conexión. El MVP mezcla red y base local en el arranque (`runBlocking` + `REPLACE`), lo que bloquea la UI y puede pisar cambios no enviados.

## Opciones consideradas

1. Room como única fuente de verdad; la red solo alimenta Room en segundo plano.
2. Repositorio con caché que consulta la red primero y Room como respaldo.
3. Un SDK de sincronización de terceros (por ejemplo, Couchbase Lite o Realm Sync).

## Decisión

Se elige **Room como única fuente de verdad del dispositivo**:

- La UI solo observa `Flow` de Room; ninguna pantalla espera a la red.
- Cada escritura local se hace en una transacción de Room y marca las filas tocadas con `syncState = PENDING`. Así, la tabla misma funciona como cola de cambios (*outbox* por fila), sin tabla de eventos aparte.
- La sincronización la ejecuta `SyncWorker` (WorkManager) con la restricción `NetworkType.CONNECTED`: una tarea única al guardar, una periódica cada 15 minutos y otra al recuperar la red.
- Los saldos y totales se calculan con consultas (`SUM` sobre los montos escalados) y no se almacenan (§8.2).

### Consecuencias

- Positivas: arranque inmediato con los datos locales (RNF-02); guardado en menos de 300 ms (RNF-03); la app sigue usable con el servidor dormido.
- Negativas: el dispositivo y la nube pueden diferir durante un tiempo; se comunica con el indicador "N pendientes" (REQ-SYN-05).

### Cómo se verifica

- Prueba instrumentada: con el modo avión activado, registrar, editar y eliminar funcionan, y al reconectar la cola queda vacía.
- Prueba de rendimiento (Macrobenchmark): Inicio en arranque en frío con 10.000 transacciones en menos de 2 s.
