// Exporta la estructura de las pantallas (o de la selección) como texto,
// para que Claude pueda trabajar sobre el estado real del archivo.

function hex(c) {
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return "#" + h(c.r) + h(c.g) + h(c.b);
}

function paints(list) {
  if (!Array.isArray(list) || !list.length) return "";
  return list
    .filter((p) => p.visible !== false)
    .map((p) => (p.type === "SOLID" ? hex(p.color) + (p.opacity !== undefined && p.opacity < 1 ? "@" + p.opacity.toFixed(2) : "") : p.type))
    .join("+");
}

function describe(n) {
  const parts = [n.id, n.type, n.name.slice(0, 60), Math.round(n.x) + "," + Math.round(n.y), Math.round(n.width) + "x" + Math.round(n.height)];
  if (n.visible === false) parts.push("HIDDEN");
  if ("layoutMode" in n && n.layoutMode !== "NONE") {
    parts.push("AL=" + n.layoutMode[0] + " gap=" + n.itemSpacing + " pad=" + [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].join(","));
  }
  if ("layoutPositioning" in n && n.layoutPositioning === "ABSOLUTE") parts.push("ABS");
  if ("fills" in n && n.type !== "TEXT") { const f = paints(n.fills); if (f) parts.push("fill=" + f); }
  if ("strokes" in n) { const s = paints(n.strokes); if (s) parts.push("stroke=" + s + "/" + (n.strokeWeight === figma.mixed ? "mixed" : n.strokeWeight)); }
  if ("cornerRadius" in n && n.cornerRadius !== 0) parts.push("r=" + (n.cornerRadius === figma.mixed ? "mixed" : n.cornerRadius));
  if ("effects" in n && n.effects.length) parts.push("fx=" + n.effects.map((e) => e.type).join("+"));
  if ("opacity" in n && n.opacity < 1) parts.push("op=" + n.opacity.toFixed(2));
  if (n.type === "TEXT") {
    const fn = n.fontName === figma.mixed ? "mixed" : n.fontName.family + " " + n.fontName.style;
    const fs = n.fontSize === figma.mixed ? "mixed" : n.fontSize;
    parts.push("font=" + fn + "/" + fs + " color=" + paints(n.fills));
    parts.push('"' + n.characters.replace(/\n/g, "\\n").slice(0, 80) + '"');
  }
  if ("reactions" in n && n.reactions.length) {
    parts.push("→" + n.reactions.map((r) => (r.actions || []).map((a) => a.type === "NODE" ? a.navigation + ":" + a.destinationId : a.type).join(",")).join(";"));
  }
  return parts.join("|");
}

function dump(n, depth, out) {
  out.push("  ".repeat(depth) + describe(n));
  if ("children" in n && n.type !== "INSTANCE" && n.type !== "BOOLEAN_OPERATION") {
    for (const c of n.children) {
      if (c.type === "VECTOR") { out.push("  ".repeat(depth + 1) + describe(c)); continue; }
      dump(c, depth + 1, out);
    }
  }
}

async function run() {
  const page = figma.currentPage;
  await page.loadAsync();
  const roots = page.selection.length ? page.selection : page.children;
  const out = [];
  out.push("# Página: " + page.name + " | fecha: " + new Date().toISOString());
  out.push("# Raíces: " + (page.selection.length ? "selección" : "todos los frames de la página"));
  out.push("# Flujos: " + JSON.stringify(page.flowStartingPoints));

  // Resumen de estilos de todo el archivo (para alinear con design.md)
  const colors = {}, radii = {}, fonts = {}, effects = {};
  for (const n of page.findAll(() => true)) {
    if ("fills" in n && Array.isArray(n.fills)) for (const p of n.fills) if (p.type === "SOLID" && p.visible !== false) { const k = hex(p.color); colors[k] = (colors[k] || 0) + 1; }
    if ("cornerRadius" in n && typeof n.cornerRadius === "number" && n.cornerRadius) radii[n.cornerRadius] = (radii[n.cornerRadius] || 0) + 1;
    if (n.type === "TEXT" && n.fontName !== figma.mixed) { const k = n.fontName.family + " " + n.fontName.style; fonts[k] = (fonts[k] || 0) + 1; }
    if ("effects" in n) for (const e of n.effects) effects[e.type] = (effects[e.type] || 0) + 1;
  }
  out.push("# Colores: " + JSON.stringify(colors));
  out.push("# Radios: " + JSON.stringify(radii));
  out.push("# Fuentes: " + JSON.stringify(fonts));
  out.push("# Efectos: " + JSON.stringify(effects));
  out.push("");

  for (const r of roots) dump(r, 0, out);
  figma.ui.postMessage({ text: out.join("\n"), lines: out.length });
}

figma.showUI(__html__, { width: 520, height: 420 });
run().catch((e) => figma.ui.postMessage({ text: "ERROR: " + e.message, lines: 0 }));
figma.ui.onmessage = (msg) => { if (msg === "close") figma.closePlugin(); };
