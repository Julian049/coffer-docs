# ADR-0009: Hosting gratuito con Render (API) y Neon (PostgreSQL)

- **Estado:** Propuesto
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** §2.4, §10.2 (pregunta abierta), RNF-06, RNF-10

## Contexto y problema

El servicio en la nube debe desplegarse **sin costo**. Necesita: ejecutar un contenedor Docker con Java 21, HTTPS gestionado, un PostgreSQL persistente (no temporal) y despliegue desde GitHub. Se aceptan arranques en frío porque la app no depende de la red (RNF-05, RNF-06).

## Opciones consideradas

| Opción | API | Base de datos | Observaciones |
| --- | --- | --- | --- |
| A | Render Web Service gratuito (Docker) | Neon (PostgreSQL serverless gratuito) | Despliegue desde GitHub; HTTPS incluido; el servicio se duerme sin tráfico; Neon no caduca y separa cómputo de almacenamiento. |
| B | Koyeb (instancia gratuita) | Neon | Similar a A; menos documentación y comunidad. |
| C | Oracle Cloud Always Free (VM) | PostgreSQL en la misma VM | Sin arranque en frío y más recursos, pero se administra el servidor, el TLS y los respaldos a mano. |
| D | Render + Render PostgreSQL gratuito | — | La base gratuita de Render expira tras un periodo de prueba; no sirve como respaldo permanente. |

> Las condiciones de los planes gratuitos cambian con frecuencia. Antes de aceptar este ADR, hay que confirmar en la página de cada proveedor los límites vigentes (horas de cómputo, almacenamiento, suspensión por inactividad).

## Decisión (propuesta)

Se propone la **opción A: Render para la API y Neon para PostgreSQL**:

- Render construye la imagen desde el `Dockerfile` del repositorio `coffer-server` en cada merge a `main`.
- Conexión a Neon con TLS (`sslmode=require`) y un pool de Hikari de 3–5 conexiones.
- Configuración solo por variables de entorno (12-factor).
- Respaldo adicional: un job semanal de GitHub Actions ejecuta `pg_dump`, lo cifra con `age` y lo guarda como artefacto privado.

La arquitectura no depende del proveedor: cualquier plataforma que ejecute un contenedor OCI con HTTPS y un PostgreSQL 16 sirve. Cambiar de proveedor solo afecta la configuración.

### Consecuencias

- Positivas: costo cero, HTTPS sin configuración, despliegue continuo.
- Negativas: la primera sincronización tras un periodo de inactividad tarda mientras el servicio despierta. Se mitiga con el backoff del worker y un timeout de conexión de 60 s solo para el worker.
- Riesgo: cambios en las condiciones gratuitas. Se mitiga con la portabilidad del contenedor y los respaldos semanales.

### Cómo se verifica

- Después del despliegue: `GET /actuator/health` responde `UP` y una sincronización de prueba completa push y pull desde la app en `release`.
