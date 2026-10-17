# ADR-0013: Cola de sincronización en el dispositivo con WorkManager, sin broker

- **Estado:** Aceptado
- **Fecha:** 2026-10-17
- **Decisores:** @Julian
- **Requisitos relacionados:** REQ-SYN-01 a 05, RNF-06, RNF-08

## Contexto y problema

REQ-SYN-01 pide guardar en cola los cambios hechos sin conexión y enviarlos solos al recuperarla. La palabra "cola" invita a pensar en un broker de mensajes (por ejemplo, RabbitMQ) entre la app y el servidor. Pero la cola que importa está en el teléfono: los cambios nacen sin red y deben esperar allí, y el servidor es uno solo (ADR-0002) en un plan gratuito que se duerme (ADR-0009). Hay que dejar escrito dónde vive la cola y quién la ejecuta.

## Factores de decisión

- Los cambios se crean sin conexión: una cola en la nube no los puede recibir hasta que haya red.
- RNF-06: tolerar el arranque en frío del servidor con reintentos y sin bloquear la interfaz.
- ADR-0009: hosting gratuito; un broker administrado sería otro servicio que mantener y pagar.
- Que la sincronización ocurra aunque la app esté cerrada y sobreviva a reinicios del teléfono.

## Opciones consideradas

1. **Cola en la propia base local + WorkManager en el teléfono**
2. Broker de mensajes (RabbitMQ u otro) entre la app y el servidor
3. Servicio en primer plano o hilo propio de la app

## Decisión

Se elige la **opción 1**. La cola son las filas de Room con `syncState = PENDING` (ADR-0006): no hay una tabla de mensajes aparte, y un cambio queda encolado en la misma transacción que lo guarda. `SyncWorker` (WorkManager) corre **en el teléfono** y hace push de esas filas y pull incremental:

| Trabajo | Nombre único | Cuándo |
| --- | --- | --- |
| Puntual | `sync` (KEEP) | Tras cada cambio y al abrir la app con sesión; espera red, 5 s de demora |
| Periódico | `sync-periodic` (KEEP) | Cada 15 minutos con red |
| Descarga inicial | `initial-sync` (REPLACE, expedito) | Primera sesión en una instalación; la pantalla Descargando tus datos sigue su progreso |

Los tres comparten la etiqueta `sync` (cerrar sesión los cancela todos) y un candado en `SyncEngine`, así que dos rondas nunca se cruzan. Errores de red, 5xx, 408 y 429 reintentan con backoff exponencial desde 30 s; cualquier otro error detiene el trabajo. El servidor no encola nada: recibe lotes por HTTPS y responde en la misma petición.

### Consecuencias

- Positivas: funciona sin red por diseño; ninguna pieza de infraestructura extra; el reintento ante el servidor dormido lo hace WorkManager, con las restricciones de batería del sistema; el estado de la cola se lee con una consulta (`SyncBadge`, REQ-SYN-05).
- Negativas o riesgos: Android puede demorar el trabajo periódico (Doze, ahorro de batería), así que "cada 15 minutos" es un mínimo, no una garantía; el envío no es instantáneo para otros dispositivos (aceptable para un usuario único).

### Cómo se verifica

- `SyncEngineTest` (MockWebServer): reintento ante 503, corte a mitad, edición durante el envío, cuenta ajena.
- `SessionViewModelTest`: con sesión y descarga terminada se piden la sincronización puntual y la periódica.
- En el teléfono: crear datos sin red y ver "N pendientes"; al volver la red, "Sincronizado".

## Pros y contras de las opciones

### Opción 1 · Base local + WorkManager
- A favor: la cola y los datos son atómicos; sobrevive a reinicios; sin costo; API estándar de Android para trabajo diferible.
- En contra: los tiempos los decide el sistema operativo.

### Opción 2 · Broker de mensajes
- A favor: desacopla productores y consumidores en el servidor.
- En contra: no resuelve el caso sin conexión (el teléfono igual necesita una cola local); otro servicio que hospedar; no hay varios consumidores que desacoplar en un monolito modular.

### Opción 3 · Servicio en primer plano o hilo propio
- A favor: control total del momento del envío.
- En contra: muere con la app o exige una notificación permanente; reintentos y restricciones de red escritos a mano.
