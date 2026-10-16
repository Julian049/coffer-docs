# Sistema de diseño — Coffer

Guía visual base: colores, bordes, formas y estilo de los elementos. **No define distribución ni composición de pantallas**; la organización de cada vista está en el prototipo de Figma ([README](README.md)).

Plataforma: Android, Material Design 3 como base. Idioma de la interfaz: español. Moneda: pesos colombianos sin decimales, con punto como separador de miles (ejemplo: `$1.250.000`).

| Versión | Fecha | Cambio |
| --- | --- | --- |
| 2.2 | 2026-10-15 | Ícono, logotipo y mascota (zorro-grano de café) en [icons/](icons/README.md) |
| 2.1 | 2026-10-15 | Base **neutra** (blanco y grises cálidos) con detalles **caramelo** en selección e íconos; los botones conservan el **espresso** |
| 2.0 | 2026-10-15 | Paleta Espresso para la marca Coffer: claro "Porcelana" y oscuro espresso |
| 1.0 | 2026-10-07 | Paleta salvia original ("Finance App") |

---

## 1. Concepto

- **Neutro y familiar.** Fondo y superficies en blanco y grises apenas cálidos, como las apps de finanzas habituales; nada de pantallas teñidas de café o beige.
- **El café en tres lugares precisos:**
  1. **Botones** (principales y flotante) en `primary`: espresso en claro, latte en oscuro.
  2. **Selección y navegación** (chips, pestañas, indicador de la barra) en caramelo suave (`primary-container` / `on-primary-container`).
  3. **Íconos de categoría** en caramelo (`icon-on-container`), además del logo y el ícono de la app.
- **Bordes finos** en todas las superficies elevadas, en lugar de sombras: contornos de 1 px sutiles, sin desenfoques ni transparencias.
- **El significado financiero manda sobre la marca:** verde para ingresos, rojo para gastos y deudas, dorado para avisos. Ningún color de marca se parece a esos tres.
- La app tiene **modo claro y modo oscuro** con los mismos tokens.

---

## 2. Paleta

### Modo claro

| Token | Hex | Uso |
| --- | --- | --- |
| `background` | `#FAFAF9` | Fondo general de la pantalla |
| `surface` | `#FFFFFF` | Tarjetas, listas, campos, hojas |
| `surface-highlight` | `#FFFFFF` | Tarjeta destacada (por ejemplo, saldo principal) |
| `border` | `#ECEAE7` | Borde de tarjetas, divisores, campos |
| `border-highlight` | `#DAD6D1` | Borde de la tarjeta destacada |
| `text-primary` | `#1C1917` | Texto principal y montos neutros |
| `text-secondary` | `#78716C` | Etiquetas, subtítulos, metadatos, placeholders |
| `primary` | `#4A3328` | Botones principales y flotante, enlaces (espresso) |
| `on-primary` | `#FFFFFF` | Texto e íconos sobre `primary` |
| `primary-container` | `#F6E9DD` | Chip, filtro o pestaña seleccionada e indicador de navegación (caramelo suave) |
| `on-primary-container` | `#7A4520` | Texto e ícono sobre `primary-container` |
| `icon-container` | `#F8F0E8` | Fondo circular de íconos de categoría |
| `icon-on-container` | `#9C5F33` | Ícono dentro de `icon-container` (caramelo) |

### Modo oscuro

| Token | Hex | Uso |
| --- | --- | --- |
| `background` | `#121110` | Fondo general de la pantalla |
| `surface` | `#1C1A19` | Tarjetas, listas, campos, hojas |
| `surface-highlight` | `#242120` | Tarjeta destacada |
| `border` | `#2E2B29` | Borde de tarjetas, divisores, campos |
| `border-highlight` | `#3F3B38` | Borde de la tarjeta destacada |
| `text-primary` | `#F5F5F4` | Texto principal y montos neutros |
| `text-secondary` | `#A8A29E` | Etiquetas, subtítulos, metadatos, placeholders |
| `primary` | `#D9B99A` | Botones principales y flotante, enlaces (latte) |
| `on-primary` | `#2A1C14` | Texto e íconos sobre `primary` |
| `primary-container` | `#3A2A1E` | Chip, filtro o pestaña seleccionada e indicador de navegación |
| `on-primary-container` | `#F0C9A6` | Texto e ícono sobre `primary-container` |
| `icon-container` | `#2A221C` | Fondo circular de íconos de categoría |
| `icon-on-container` | `#D08D58` | Ícono dentro de `icon-container` (caramelo) |

### Colores semánticos (finanzas)

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `income` | `#2F7A45` | `#8CC77F` | Montos de ingreso (con signo `+`) |
| `expense` | `#B03A2E` | `#F0897C` | Montos de gasto (con signo `−`) y deudas en negativo |
| `transfer` | = `text-secondary` | = `text-secondary` | Montos de transferencias entre cuentas (sin signo) |
| `warning` | `#9A6B1F` | `#E0B25E` | Pagos pendientes próximos a vencer |
| `danger` | = `expense` | = `expense` | Pendientes vencidos, acciones destructivas |

Todos los pares de texto y fondo cumplen WCAG AA (≥ 4.5:1) sobre `background` y `surface` en su modo.

Reglas de color:

- Los ingresos van en verde y los gastos en rojo; las transferencias **siempre en neutro**, porque no son ni gasto ni ingreso.
- El saldo de una tarjeta de crédito o préstamo es una deuda y se muestra en `expense`, en negativo.
- La urgencia de un pendiente escala de `text-secondary` (lejano) a `warning` (próximo) y a `danger` (vencido).
- El botón flotante (+) y los botones de confirmar o guardar usan el mismo `primary`: una sola familia de acciones.
- Los montos principales (saldos) van en `text-primary`, no en color.

### En Figma

Los tokens son las variables `color/<token>` de la colección **"Finance App · Tokens"** (el nombre de la colección no cambió). El plan gratuito de Figma admite un solo modo, así que el valor es el del modo claro y el del oscuro está en la descripción de cada variable (`Claro #… · Oscuro #…`). En la app (Compose) se implementan ambos esquemas con los mismos nombres.

---

## 3. Bordes y elevación

- Todas las superficies (`surface`) llevan **borde de 1 px** con el token `border`.
- La tarjeta destacada usa `surface-highlight` con borde `border-highlight`.
- Los elementos con estado de aviso pueden usar borde de 1 px en `warning`.
- **Sin sombras.** La separación entre capas la dan el borde y el contraste de fondo.
- Los divisores dentro de una lista usan 1 px en `border`.

---

## 4. Formas (radios)

| Elemento | Radio |
| --- | --- |
| Tarjeta destacada | 16 px |
| Tarjetas, listas agrupadas, campos de texto, botones | 12 px |
| Chips y filtros | Totalmente redondeados (píldora) |
| Contenedor de ícono de categoría | Círculo |
| Botón flotante / acción principal | 14 px |
| Hojas inferiores (bottom sheets) y diálogos | 20 px en las esquinas superiores |

---

## 5. Tipografía

- Fuente sin serifa del sistema (Roboto o Inter).
- Dos pesos únicamente: **regular (400)** y **medium (500)**. Evitar negrita fuerte.
- Montos importantes (saldo principal) grandes, en peso 500.
- Etiquetas y metadatos en tamaño pequeño con `text-secondary`. Tamaño mínimo de texto: 11 sp.
- Usar mayúscula inicial solamente ("Nuevo gasto", no "Nuevo Gasto" ni "NUEVO GASTO"), tampoco con estilos de mayúsculas.

---

## 6. Iconografía

- Íconos de **línea (outline)**, trazo uniforme, sin rellenos. Estilo similar a Material Symbols Outlined o Tabler Icons.
- Los íconos de categoría van dentro de un círculo `icon-container` con el ícono en `icon-on-container`.
- Tamaño de ícono: 16–20 dp dentro de listas, 24 dp en navegación.
- Ícono de la app y logotipo: un **zorro cuyo cuerpo forma un grano de café**, en espresso y caramelo sobre `background`. Mascota: el mismo zorro en 8 estados según la salud financiera. Archivos, tamaños y usos en [icons/](icons/README.md).

---

## 7. Estados interactivos

| Estado | Tratamiento |
| --- | --- |
| Seleccionado (chip, filtro, pestaña) | Fondo `primary-container`, texto `on-primary-container`, sin borde |
| Activo en navegación | Ícono y etiqueta en `primary`, con indicador en `primary-container` |
| Inactivo en navegación | Ícono y etiqueta en `text-secondary` |
| Presionado | Ligera capa del color de texto al 6–8 % sobre la superficie |
| Deshabilitado | Texto `text-secondary` al 50 %; evitar cuando sea posible |
| Foco en campo | Borde de 1.5 px en `primary` |

---

## 8. Lo que no se debe hacer

- Gradientes, sombras, desenfoques o efectos de brillo.
- Colores decorativos adicionales a los de esta guía.
- Teñir fondos o superficies de beige, crema o café: el fondo es neutro (`background`) y las tarjetas blancas (`surface`).
- `primary` como fondo de áreas grandes, botones negros o colores de marca adicionales para botones.
- Montos de transferencia en rojo o verde.
