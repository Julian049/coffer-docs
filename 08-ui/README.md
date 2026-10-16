# Interfaz de usuario — Coffer

| Campo | Valor |
| --- | --- |
| Prototipo | **[Figma · Finance App](https://www.figma.com/design/tiOOI1wfZyn2xaG9ENO9Wp/Finance-App)** (key `tiOOI1wfZyn2xaG9ENO9Wp`) |
| Versión de referencia | `v1.0-srs-prototype` (versión con nombre en el historial de Figma; manage-config CI-08) |
| Sistema de diseño | [`design-system.md`](design-system.md) |
| Requisitos | SRS §7.1, RNF-14, RNF-15, RNF-16 |

## 1. Cómo usar el prototipo

- **Ver:** abrir el enlace; las pantallas están ordenadas en **secciones por flujo** en *Page 1*.
- **Probar la navegación:** *Present* (▶) con el flujo **"Finance App"**, que empieza en *Iniciar Sesión*. Para que las hojas inferiores y los diálogos cubran bien la pantalla, en *Prototype → Device* se usa un teléfono de **390 × 844**.
- **Desarrollar:** cada historia del [plan de sprints](../07-management/sprint-plan.md) nombra los frames que implementa. Los colores, tipografía, radios y bordes salen de `design-system.md` (en Figma son variables de la colección *Finance App · Tokens*).
- **Modo oscuro:** los tokens oscuros están en la descripción de cada variable de Figma (el plan gratuito permite un solo modo); en la app se implementan los dos modos.

## 2. Inventario de pantallas

### 2.1 Secciones del prototipo

| Sección en Figma | Frames | Sprint |
| --- | --- | --- |
| 1 · Acceso | Iniciar Sesión · Registro · Descargando tus datos | S2, S3 |
| 2 · Navegación principal | Inicio (con Próximos Pagos) · Hoja · Detalle del saldo · Historial · Hoja · Filtros del historial · Reportes · Gestión de Cuentas · Ajustes · Diálogo · Cerrar sesión | S1–S6, S9, S11 |
| 3 · Registrar y consultar movimientos | Nueva Transacción · Nueva Transacción · Tarjeta de crédito · Nueva Transferencia · Categorías · Hoja · Nueva categoría · Detalle de transacción · Detalle de transacción · Pago de tarjeta · Diálogo · Eliminar transacción | S4, S5, S7 |
| 4 · Cuentas | Detalle de cuenta · Editar cuenta · Hoja · Opciones de la cuenta · Hoja · Eliminar cuenta (Desactivar, Mover, Eliminar definitivamente) · Hoja · Confirmar eliminación · Cuentas desactivadas · Nueva Cuenta | S4 |
| 5 · Tarjetas y préstamos | Nueva Tarjeta de Crédito · Detalle de tarjeta · Hoja · Pagar tarjeta · Nuevo préstamo (Detallado, Simple) · Detalle de préstamo · Hoja · Abono a capital | S7, S10 |
| 6 · Pagos recurrentes | Gastos Recurrentes · Hoja · Pendiente · Hoja · Pagar pendiente · Nuevo gasto recurrente | S6 |
| 7 · Etiquetas, reportes y datos | Etiquetas · Hoja · Nueva etiqueta · Detalle de etiqueta · Importar y exportar · Historial de cambios · Personalizar inicio | S8, S9, S11 |
| Componentes | Barra de navegación (variantes por pestaña) · Indicador mensual (Sube, Baja) | S1, S4 |

La página **"Archivo (versiones anteriores)"** guarda las pantallas reemplazadas; no se implementan.

### 2.2 Navegación

- **Barra inferior:** Inicio · Historial · Reportes · Cuentas.
- **Avatar del encabezado:** Ajustes.
- **Botón + y accesos rápidos de Inicio:** formulario de transacción (gasto, ingreso, transferencia).
- **Hojas inferiores** para decisiones rápidas y **diálogos** para confirmaciones.

## 3. Diferencias conocidas entre el prototipo y la implementación

| Tema | En el prototipo | En la app |
| --- | --- | --- |
| Iconos de pantallas generadas con Stitch | Algunos con relleno | Todos de línea (outline), según `design-system.md` §6 |
| Datos | Ejemplos fijos | Datos reales del usuario |
| Importación | Solo los botones de importar y exportar | Además: mapeo de columnas, vista previa y resumen (REQ-IMP-02 a 06), construidos con los componentes del sistema de diseño |
| Recuperar contraseña | Enlace sin destino | Fuera del alcance de la v1.0 (no está en el SRS) |

## 4. Herramientas de edición

[`figma-plugins/`](figma-plugins/) contiene los plugins de desarrollo con los que se construyó y ordenó el prototipo (se ejecutan desde la app de escritorio de Figma: *Plugins → Development → Import plugin from manifest*):

| Plugin | Uso |
| --- | --- |
| `inspector` | Exporta la estructura del archivo (frames, textos, colores, conexiones) a un `.txt` |
| `changes-v1` | Indicador mensual, agrupación por día, tarjeta de crédito, hojas de eliminar cuenta, tokens del `design.md` |
| `arrange-screens` | Agrupa los frames en secciones por flujo |
| `srs-prototype` | Crea las pantallas que faltaban según el SRS, la barra de 4 pestañas y todas las conexiones |

Se conservan como historial del diseño; ya se ejecutaron sobre el archivo y no deben volver a ejecutarse (los que modifican el archivo se detienen si detectan que ya se aplicaron).
