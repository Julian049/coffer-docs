# Diagramas de arquitectura

Diagramas en Mermaid (se ven directamente en GitHub, GitLab y VS Code con la extensión de Mermaid). Siguen el modelo **C4** y sirven como *vistas* en el sentido de ISO/IEC/IEEE 42010. Su documento principal es [`../architecture.md`](../architecture.md).

| Archivo | Nivel o vista C4 | Punto de vista (42010) | arc42 |
| --- | --- | --- | --- |
| [c4-1-context.md](c4-1-context.md) | Nivel 1: contexto del sistema | Contexto | §3 |
| [c4-2-containers.md](c4-2-containers.md) | Nivel 2: contenedores | Composición | §5.1 |
| [c4-3-components-server.md](c4-3-components-server.md) | Nivel 3: componentes de Coffer Server | Composición | §5.2 |
| [c4-3-components-app.md](c4-3-components-app.md) | Nivel 3: componentes de la app Android | Composición | §5.3 |
| [dynamic-views.md](dynamic-views.md) | Diagramas dinámicos (D1–D5) | Comportamiento | §6 |
| [c4-4-deployment.md](c4-4-deployment.md) | Diagrama de despliegue | Despliegue | §7 |
| [data-model.md](data-model.md) | Complementario (ER) | Información | §8.1 |

Convenciones:
- Los nombres de componentes coinciden con las clases o paquetes que se van a implementar.
- Si un diagrama cambia, se actualiza en el mismo commit que el código o el ADR que lo motiva.
- La sintaxis C4 de Mermaid aún es experimental. Si un visor no la soporta, el texto del diagrama sigue siendo legible.
