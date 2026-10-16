# Design — App de finanzas personales

Guía visual base: colores, bordes, formas y estilo de los elementos. **No define distribución ni composición de pantallas**; la organización de cada vista queda a criterio del diseñador.

Plataforma: Android, Material Design 3 como base. Idioma de la interfaz: español. Moneda: pesos colombianos sin decimales, con punto como separador de miles (ejemplo: `$1.250.000`).

---

## 1. Concepto

- **Sobrio y limpio.** Base neutra, casi blanca en modo claro y grafito en modo oscuro.
- **Un solo color de marca: salvia.** Se usa como acento, nunca como fondo grande.
- **Bordes finos** en todas las superficies elevadas, en lugar de sombras. Inspiración ligera en el estilo "glass" de Apple: contornos de 1 px muy sutiles, sin desenfoques ni transparencias exageradas.
- **Sin colores pastel cálidos.** No usar amarillos, durazno ni rosados como colores decorativos. El naranja se reserva solo para avisos.
- La app debe tener **modo claro y modo oscuro** con los mismos tokens.

---

## 2. Paleta

### Modo claro

| Token | Hex | Uso |
| --- | --- | --- |
| `background` | `#F6F7F5` | Fondo general de la pantalla |
| `surface` | `#FFFFFF` | Tarjetas, listas, campos, hojas |
| `surface-highlight` | `#FFFFFF` | Tarjeta destacada (por ejemplo, saldo principal) |
| `border` | `#E4E7E3` | Borde de tarjetas, divisores, campos |
| `border-highlight` | `#D5DDD6` | Borde de la tarjeta destacada |
| `text-primary` | `#1F2622` | Texto principal y montos neutros |
| `text-secondary` | `#6E7670` | Etiquetas, subtítulos, metadatos, placeholders |
| `primary` | `#4F7D5E` | Botón principal, elemento activo, enlaces, acentos |
| `on-primary` | `#FFFFFF` | Texto e íconos sobre `primary` |
| `primary-container` | `#E4EEE6` | Fondo de chip o filtro seleccionado |
| `on-primary-container` | `#2E4A37` | Texto sobre `primary-container` |
| `icon-container` | `#EEF2EE` | Fondo circular de íconos de categoría |
| `icon-on-container` | `#4F7D5E` | Ícono dentro de `icon-container` |

### Modo oscuro

| Token | Hex | Uso |
| --- | --- | --- |
| `background` | `#111517` | Fondo general de la pantalla |
| `surface` | `#1B2124` | Tarjetas, listas, campos, hojas |
| `surface-highlight` | `#252C2F` | Tarjeta destacada (por ejemplo, saldo principal) |
| `border` | `#283034` | Borde de tarjetas, divisores, campos |
| `border-highlight` | `#3A4347` | Borde de la tarjeta destacada |
| `text-primary` | `#EEF0EF` | Texto principal y montos neutros |
| `text-secondary` | `#9AA3A6` | Etiquetas, subtítulos, metadatos, placeholders |
| `primary` | `#9CC8A9` | Botón principal, elemento activo, enlaces, acentos |
| `on-primary` | `#102016` | Texto e íconos sobre `primary` |
| `primary-container` | `#253029` | Fondo de chip o filtro seleccionado |
| `on-primary-container` | `#CFE5D6` | Texto sobre `primary-container` |
| `icon-container` | `#252C2F` | Fondo circular de íconos de categoría |
| `icon-on-container` | `#9CC8A9` | Ícono dentro de `icon-container` |

### Colores semánticos (finanzas)

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `income` | `#2E8B57` | `#6FCF97` | Montos de ingreso (con signo `+`) |
| `expense` | `#D14B42` | `#F28B82` | Montos de gasto (con signo `−`) y deudas en negativo |
| `transfer` | = `text-secondary` | = `text-secondary` | Montos de transferencias entre cuentas (sin signo) |
| `warning` | `#E08A4F` | `#EDA06B` | Pagos pendientes próximos a vencer |
| `danger` | = `expense` | = `expense` | Pendientes vencidos, acciones destructivas |

Reglas de color:

- Los ingresos van en verde y los gastos en rojo; las transferencias **siempre en neutro**, porque no son ni gasto ni ingreso.
- El saldo de una tarjeta de crédito o préstamo es una deuda y se muestra en `expense`, en negativo.
- La urgencia de un pendiente escala de `text-secondary` (lejano) a `warning` (próximo) y a `danger` (vencido).
- `primary` es un acento: botones, selección, enlaces, íconos. No usarlo como fondo de tarjetas grandes.
- Los montos principales (saldos) van en `text-primary`, no en color.

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
- Usar mayúscula inicial solamente ("Nuevo gasto", no "Nuevo Gasto" ni "NUEVO GASTO").

---

## 6. Iconografía

- Íconos de **línea (outline)**, trazo uniforme, sin rellenos. Estilo similar a Material Symbols Outlined o Tabler Icons.
- Los íconos de categoría van dentro de un círculo `icon-container` con el ícono en `icon-on-container`.
- Tamaño de ícono: 16–20 dp dentro de listas, 24 dp en navegación.

---

## 7. Estados interactivos

| Estado | Tratamiento |
| --- | --- |
| Seleccionado (chip, filtro, pestaña) | Fondo `primary-container`, texto `on-primary-container`, sin borde |
| Activo en navegación | Ícono y etiqueta en `primary` |
| Inactivo en navegación | Ícono y etiqueta en `text-secondary` |
| Presionado | Ligera capa del color de texto al 6–8 % sobre la superficie |
| Deshabilitado | Texto `text-secondary` al 50 %; evitar cuando sea posible |
| Foco en campo | Borde de 1.5 px en `primary` |

---

## 8. Lo que no se debe hacer

- Gradientes, sombras, desenfoques o efectos de brillo.
- Colores decorativos adicionales a los de esta guía.
- Amarillo, durazno, rosado o pasteles cálidos como fondos.
- `primary` como fondo de áreas grandes.
- Montos de transferencia en rojo o verde.
