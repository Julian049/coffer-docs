# ADR-0001: Registrar decisiones de arquitectura con ADR (MADR)

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** ISO/IEC/IEEE 42010 (justificación de la arquitectura), arc42 §9

## Contexto y problema

El MVP se construyó sin dejar registro de por qué se tomaron sus decisiones (por ejemplo, el doble identificador `server_id`/`local_id` o el signo del monto como tipo). Varias resultaron contradictorias entre cliente y servidor. La v1.0 introduce muchas decisiones nuevas (sincronización, seguridad, hosting) y el desarrollo lo apoyan asistentes de IA, así que hace falta una fuente única y estable de "por qué".

## Opciones consideradas

1. ADR en Markdown dentro del repositorio (MADR).
2. Una sección de decisiones dentro de `architecture.md`.
3. Una wiki externa.

## Decisión

Se elige **ADR en Markdown con la plantilla MADR**, en `docs/02-architecture/adr/`, versionados junto al código. `architecture.md` solo los resume en su sección 9.

### Consecuencias

- Positivas: historial auditable en Git; cada cambio de diseño queda ligado a su motivo; los archivos `CLAUDE.md` de cada repositorio pueden enlazarlos.
- Negativas: requiere disciplina para escribir un ADR antes de implementar un cambio estructural.

### Cómo se verifica

En las revisiones de PR: un cambio de dependencia principal, de esquema transversal o de protocolo debe referenciar un ADR.
