# Marca y mascota — Coffer

Identidad visual de Coffer: un **zorro** cuyo cuerpo forma un **grano de café**. El ícono y la mascota se generaron con IA a partir del sistema de diseño ([design-system.md](../design-system.md)). Las piezas finales se recortaron, se les quitó el fondo y se vectorizaron con [`tools/build.py`](tools/build.py).

![Vista previa en modo claro y oscuro](preview.png)

## Contenido

| Carpeta | Qué hay |
| --- | --- |
| `brand/` | Ícono, logotipo e íconos de la app |
| `mascot/` | Los 8 estados del zorro |
| `source/` | Imágenes originales generadas (no editar; son la fuente de `build.py`) |
| `tools/` | Script que produce `brand/` y `mascot/` |

Cada pieza está en **SVG** (vector, es la fuente para la app) y en **PNG** renderizado del SVG (vista previa y uso rápido).

## Marca (`brand/`)

| Archivo | Uso | Tamaño |
| --- | --- | --- |
| `coffer-mark.svg` | Ícono del zorro a color, para fondos claros | 1024 × 1024 |
| `coffer-mark-dark.svg` | Ícono en tonos latte, para fondos oscuros | 1024 × 1024 |
| `coffer-mark-mono.svg` | Silueta de un solo color (`primary` `#4A3328`): ícono temático de Android 13+ y notificaciones | 1024 × 1024 |
| `coffer-logo-horizontal.svg` | Ícono + palabra "Coffer" (sin lema), fondos claros | 1920 × 879 |
| `coffer-logo-horizontal-dark.svg` | Igual, con la palabra en `#F5F5F4`, fondos oscuros | 1920 × 879 |
| `app-icon-light.png` / `-512` | Ícono de la app sobre `#FAFAF9` (1024 y 512 px; el de 512 es el de Google Play) | — |
| `app-icon-dark.png` / `-512` | Ícono de la app sobre `#121110` | — |

El glifo ocupa el 66 % central del ícono de app: es la zona segura del **ícono adaptativo** de Android. En la app, el `ic_launcher` se arma con `coffer-mark.svg` como *foreground* (convertido a VectorDrawable), fondo `#FAFAF9` y `coffer-mark-mono.svg` como *monochrome*.

**Sin lema** por ahora: el producto todavía no tiene uno.

## Mascota (`mascot/`)

Todos los estados tienen el mismo lienzo (1024 × 1024, fondo transparente), la **misma escala** y la misma línea de suelo, así que se pueden intercambiar sin que el zorro "salte".

| Estado | Archivo | Cuándo se muestra |
| --- | --- | --- |
| Normal | `mascot-normal` | Finanzas estables, sin novedades |
| Bien | `mascot-bien` | Mes con balance positivo / ahorro |
| Meta cumplida | `mascot-meta` | Presupuesto o meta cumplida |
| Atento | `mascot-atento` | Pago pendiente próximo a vencer |
| Preocupado | `mascot-preocupado` | Presupuesto superado |
| Deudas | `mascot-deudas` | Saldo negativo o deudas altas |
| Descanso | `mascot-descanso` | Estados vacíos (sin movimientos) |
| Bienvenida | `mascot-bienvenida` | Inicio de sesión y primer uso |

Las reglas exactas (umbrales de cada estado) se definen en la historia que introduzca la mascota en la app.

## Regenerar

Copiar `source/fox-sheet.png`, `source/fox-deudas.jpg` y `source/fox-preocupado.jpg` junto a `tools/build.py` como `src-sheet.png`, `src-a.jpg` y `src-b.jpg`, y ejecutar `python build.py` (requiere `pillow`, `numpy`, `vtracer`, `resvg-py`). Si se reemplaza una ilustración, basta con regenerar y revisar la vista previa en claro y oscuro.
