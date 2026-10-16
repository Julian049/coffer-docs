# ADR-0006: Sincronización push/pull con cursor y último cambio gana

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** REQ-SYN-01 a 05, REQ-AUT-05, RNF-06, RNF-07, §8.1

## Contexto y problema

El MVP envía una petición por fila, marca como sincronizado todo lo pendiente (aunque no se haya enviado) y responde 500 ante un reintento duplicado, lo que bloquea la sincronización para siempre. El SRS exige un envío automático e idempotente, la propagación de borrados y el criterio "último cambio gana".

## Opciones consideradas

1. Protocolo propio push/pull por lotes, con id del cliente, `updated_at` para los conflictos y una secuencia global como cursor.
2. Endpoints REST por recurso (CRUD) llamados uno por uno.
3. CRDT o *event sourcing*.

## Decisión

Se elige el **protocolo propio push/pull**:

**Push** — `POST /api/v1/sync/push`

```json
{
  "deviceId": "b1f…",
  "changes": [
    { "entity": "transaction", "id": "uuid", "updatedAt": "2026-10-09T13:10:00Z",
      "deletedAt": null, "data": { "type": "EXPENSE", "amount": "28000.0000", "...": "..." } }
  ]
}
```

- Lotes de hasta 200 cambios; el servidor procesa cada lote en una transacción.
- Por cada cambio: `INSERT … ON CONFLICT (id) DO UPDATE … WHERE excluded.updated_at > t.updated_at AND t.user_id = :userId`.
- Respuesta por id: `APPLIED`, `STALE` (había una versión más nueva) o `REJECTED` (con un código de error, por ejemplo, una referencia a otra cuenta del usuario que no existe).
- Orden de envío por dependencias: settings, accounts y details, categories, tags, transactions, deferred_purchases, installments, recurring_expenses y change_log.

**Pull** — `GET /api/v1/sync/pull?since={version}&limit=500`

- Devuelve los cambios de todas las entidades del usuario con `version > since`, ordenados por `version`, incluidos los borrados (`deletedAt`), junto con `nextCursor`, `hasMore` y `remaining`; `remaining` permite mostrar el progreso de la descarga inicial (REQ-AUT-05).
- En el cliente, un cambio recibido reemplaza la fila local si esta no está `PENDING` o si su `updatedAt` es menor.

**Reglas**

- Siempre push antes que pull.
- Los ids son UUID v4 generados en el dispositivo, así que un reenvío nunca duplica (REQ-SYN-04).
- Las marcas de tiempo vienen del reloj del dispositivo en UTC. Riesgo aceptado: un reloj desfasado puede ganar un conflicto (SRS §2.5).
- Errores 5xx o de red: `Result.retry()` con backoff exponencial (30 s a 5 min), sin bloquear la UI (RNF-06).
- El indicador de la UI solo muestra estados genéricos (RNF-07): Sincronizado, Sincronizando, N pendientes, Sin conexión.

### Consecuencias

- Positivas: una o pocas peticiones por sincronización; idempotente; pull incremental; los borrados se propagan.
- Negativas: el último cambio gana a nivel de registro completo (no por campo). Se acepta para un solo usuario.

### Cómo se verifica

- Pruebas de integración del servidor: reenviar el mismo lote da `APPLIED` y luego `STALE`, sin duplicados; un `user_id` ajeno da `REJECTED`.
- Prueba del worker con MockWebServer: un corte a mitad del lote deja las filas no confirmadas en `PENDING`.
