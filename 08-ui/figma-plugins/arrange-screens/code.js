// Finance App - Ordenar pantallas
// Agrupa los frames en secciones por flujo (una fila por sección) para que las
// conexiones del prototipo se lean de izquierda a derecha. No cambia ninguna conexión.

const log = (line) => figma.ui.postMessage({ line });

const ROWS = [
  ["1 · Acceso y navegación principal", ["Iniciar Sesión", "Inicio (con Próximos Pagos)", "Historial", "Gestión de Cuentas"]],
  ["2 · Registrar movimientos", ["Nueva Transacción", "Nueva Transacción · Tarjeta de crédito", "Nueva Transferencia", "Categorías"]],
  ["3 · Gestión de cuentas", ["Hoja · Opciones de la cuenta", "Hoja · Eliminar cuenta · Desactivar cuenta", "Hoja · Eliminar cuenta · Mover transacciones", "Hoja · Eliminar cuenta · Eliminar definitivamente", "Nueva Cuenta", "Nueva Tarjeta de Crédito"]],
  ["4 · Pagos recurrentes", ["Gastos Recurrentes"]],
  ["Componentes", ["Indicador mensual"]],
];

const GAP_X = 120;      // espacio entre pantallas
const PAD = 80;         // margen interior de cada sección (deja sitio al título)
const GAP_Y = 160;      // espacio entre secciones

async function main() {
  figma.showUI(__html__, { width: 480, height: 380 });
  const page = figma.currentPage;
  await page.loadAsync();

  // Busca cada pantalla por nombre, esté suelta o ya dentro de una sección
  const byName = new Map();
  for (const n of page.findAll((n) => n.type === "FRAME" || n.type === "COMPONENT_SET")) {
    if (n.parent && (n.parent.type === "PAGE" || n.parent.type === "SECTION") && !byName.has(n.name)) byName.set(n.name, n);
  }

  // Lo que no esté en la lista va a una fila "Otros" para no perderlo
  const listed = new Set(ROWS.flatMap((r) => r[1]));
  const others = [...byName.keys()].filter((k) => !listed.has(k));
  const rows = others.length ? [...ROWS, ["Otros", others]] : ROWS;

  let y = 0;
  for (const [title, names] of rows) {
    const nodes = names.map((n) => byName.get(n)).filter(Boolean);
    const missing = names.filter((n) => !byName.has(n));
    if (missing.length) log("ℹ No encontré: " + missing.join(", "));
    if (!nodes.length) continue;

    let section = page.children.find((n) => n.type === "SECTION" && n.name === title);
    if (!section) { section = figma.createSection(); section.name = title; }
    section.x = 0; section.y = y;

    let x = PAD, maxH = 0;
    for (const n of nodes) {
      section.appendChild(n);
      n.x = x; n.y = PAD;
      x += n.width + GAP_X;
      maxH = Math.max(maxH, n.height);
    }
    const w = x - GAP_X + PAD, h = maxH + PAD * 2;
    section.resizeWithoutConstraints(w, h);
    y += h + GAP_Y;
    log(`✓ ${title}: ${nodes.length} elemento(s)`);
  }

  // Secciones vacías de ejecuciones anteriores
  for (const s of page.children.filter((n) => n.type === "SECTION" && n.children.length === 0)) s.remove();

  figma.viewport.scrollAndZoomIntoView(page.children);
  figma.ui.postMessage({ done: "Listo. Pantallas ordenadas por flujo; las conexiones no cambiaron." });
}

figma.ui.onmessage = (msg) => { if (msg === "close") figma.closePlugin(); };
main().catch((e) => { log("✗ " + e.message); figma.ui.postMessage({ done: "Error. Copia el registro y pásamelo." }); });
