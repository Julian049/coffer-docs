// Finance App - Prototipo SRS
// Crea las pantallas que pide el SRS v1.0 y aún no existen, ajusta las existentes,
// conecta todo el prototipo y ordena el lienzo en secciones por flujo.
// Todo se construye con los tokens de la colección "Finance App · Tokens" (design.md).

const log = (line) => figma.ui.postMessage({ line });
const get = (id) => figma.getNodeByIdAsync(id);

// ============================================================ Tokens
const TOK = {
  "background": "#F6F7F5", "surface": "#FFFFFF", "surface-highlight": "#FFFFFF", "border": "#E4E7E3",
  "border-highlight": "#D5DDD6", "text-primary": "#1F2622", "text-secondary": "#6E7670", "primary": "#4F7D5E",
  "on-primary": "#FFFFFF", "primary-container": "#E4EEE6", "on-primary-container": "#2E4A37",
  "icon-container": "#EEF2EE", "icon-on-container": "#4F7D5E", "income": "#2E8B57", "expense": "#D14B42", "warning": "#E08A4F",
};
const VARS = {};
function rgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
}
function P(token, opacity) {
  const base = { type: "SOLID", color: rgb(TOK[token]) };
  if (opacity !== undefined) base.opacity = opacity;
  return VARS[token] ? figma.variables.setBoundVariableForPaint(base, "color", VARS[token]) : base;
}
async function loadVars() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = cols.find((c) => c.name === "Finance App · Tokens");
  if (!col) { log("ℹ No encontré la colección de tokens; uso colores fijos."); return; }
  for (const id of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v) VARS[v.name.replace("color/", "")] = v;
  }
}

// ============================================================ Íconos (línea, estilo Tabler)
const ICONS = {
  arrowLeft: "M5 12h14M5 12l6 6M5 12l6-6",
  chevronRight: "M9 6l6 6-6 6",
  chevronLeft: "M15 6l-6 6 6 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  filter: "M4 4h16v2.2a2 2 0 0 1-.6 1.4L15 12v7l-6 2v-8.5L4.5 7.5A2 2 0 0 1 4 6.2z",
  home: "M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6",
  list: "M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01",
  chart: "M3 13h6v7H3zM9 4h6v16H9zM15 9h6v11h-6zM3 20h18",
  wallet: "M17 8V5a1 1 0 0 0-1-1H6a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6M20 12v4h-4a2 2 0 0 1 0-4h4",
  user: '<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h.01M11 15h2"/>',
  bank: "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3",
  cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.4 10a6 6 0 1 1-5.4 8.4"/>',
  tag: '<circle cx="8.5" cy="8.5" r="1"/><path d="M4 7v3.9c0 .5.2 1 .6 1.4l7.8 7.8a2 2 0 0 0 2.8 0l4.9-4.9a2 2 0 0 0 0-2.8L12.3 4.6A2 2 0 0 0 10.9 4H7a3 3 0 0 0-3 3z"/>',
  pin: "M15 4.5l-4 4L7 10l-1.5 1.5 7 7L14 17l1.5-4 4-4M9 15l-4.5 4.5M14.5 4L20 9.5",
  trash: "M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
  edit: "M4 20h4L18.5 9.5a2.8 2.8 0 0 0-4-4L4 16v4M13.5 6.5l4 4",
  restore: "M3.1 13a9 9 0 1 0 .5-4M3 4v5h5M12 8v4l2 2",
  upload: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12",
  download: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12",
  file: "M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z",
  cloud: "M7 18a4.6 4.4 0 0 1-.1-8.8A5 4.5 0 0 1 17 9h1a3.5 3.5 0 0 1 0 7h-1M9 15l3 3 3-3M12 10v8",
  cloudCheck: "M11 18H7a4.6 4.4 0 0 1-.1-8.8A5 4.5 0 0 1 17 9h1a3.5 3.5 0 0 1 1.5 6.7M15 19l2 2 4-4",
  check: "M5 12l5 5L20 7",
  x: "M18 6L6 18M6 6l12 12",
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>',
  logout: "M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M9 12h12l-3-3M18 15l3-3",
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="16" r="1"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.3"/>',
  alert: "M12 9v4M10.4 3.9L2.6 17.2A1.9 1.9 0 0 0 4.2 20h15.6a1.9 1.9 0 0 0 1.6-2.8L13.6 3.9a1.9 1.9 0 0 0-3.2 0zM12 16h.01",
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
  repeat: "M4 12V9a3 3 0 0 1 3-3h13l-3-3M20 12v3a3 3 0 0 1-3 3H4l3 3",
  exchange: "M7 10h14l-4-4M17 14H3l4 4",
  arrowDown: "M12 5v14M18 13l-6 6-6-6",
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  skip: "M5 12h12M13 6l6 6-6 6",
  coffee: "M3 14c0 3 2 6 6 6h2c4 0 6-3 6-6V9H3zM17 11h1a3 3 0 0 1 0 6h-1M8 3v3M12 3v3",
  cart: '<circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><path d="M17 17H6V3H4M6 5l14 1-1 7H6"/>',
  plane: "M16 10h4a2 2 0 0 1 0 4h-4l-4 7H9l2-7H7l-2 2H2l2-4-2-4h3l2 2h4L9 3h3z",
  bed: "M2 8v10M2 14h20v4M22 14v-2a3 3 0 0 0-3-3h-7v5M7 11a2 2 0 1 0 0-.01",
  car: '<circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2M9 17h6M3 11h15M12 11V6"/>',
  heart: "M19.5 12.6L12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6",
  film: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16M16 4v16M4 8h4M4 16h4M4 12h16M16 8h4M16 16h4"/>',
  paw: '<circle cx="7" cy="9" r="1.5"/><circle cx="12" cy="6.5" r="1.5"/><circle cx="17" cy="9" r="1.5"/><path d="M8 15c0-2 2-3.5 4-3.5s4 1.5 4 3.5-1.5 4-4 4-4-2-4-4z"/>',
  book: "M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6v13M12 6v13M21 6v13",
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
};
function svgIcon(name, token, size) {
  const body = ICONS[name] || ICONS.info;
  const inner = body.startsWith("<") ? body : `<path d="${body}"/>`;
  const n = figma.createNodeFromSvg(`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="${TOK[token]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
  n.name = "Icon/" + name;
  for (const c of n.findAll(() => true)) if ("strokes" in c && c.strokes.length) c.strokes = [P(token)];
  return n;
}

// ============================================================ Kit de UI (siempre: anexar al padre y luego FILL)
function frame(name, dir, o = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  f.clipsContent = false;
  if (o.gap !== undefined) f.itemSpacing = o.gap;
  if (o.pad !== undefined) {
    const p = Array.isArray(o.pad) ? o.pad : [o.pad, o.pad, o.pad, o.pad];
    f.paddingTop = p[0]; f.paddingRight = p[1]; f.paddingBottom = p[2]; f.paddingLeft = p[3];
  }
  if (o.fill) f.fills = [P(o.fill)];
  if (o.stroke) { f.strokes = [P(o.stroke)]; f.strokeWeight = o.strokeW || 1; f.strokeAlign = "INSIDE"; }
  if (o.r !== undefined) f.cornerRadius = o.r;
  if (o.align) f.counterAxisAlignItems = o.align;
  if (o.justify) f.primaryAxisAlignItems = o.justify;
  return f;
}
function box(parent, name, dir, o = {}, fill = true) {
  const f = frame(name, dir, o);
  parent.appendChild(f);
  if (fill) { try { f.layoutSizingHorizontal = "FILL"; } catch (e) {} }
  return f;
}
function text(parent, str, size, weight, token, wrap, align) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: weight };
  t.fontSize = size;
  t.characters = str;
  t.fills = [P(token)];
  if (align) t.textAlignHorizontal = align;
  parent.appendChild(t);
  if (wrap) { try { t.layoutSizingHorizontal = "FILL"; } catch (e) {} t.textAutoResize = "HEIGHT"; }
  return t;
}
function icon(parent, name, token, size) {
  const n = svgIcon(name, token, size || 20);
  parent.appendChild(n);
  return n;
}
function iconCircle(parent, name, token, bg, size) {
  size = size || 40;
  const c = frame("Ícono", "HORIZONTAL", { r: 9999, align: "CENTER", justify: "CENTER", fill: bg || "icon-container" });
  c.resize(size, size);
  parent.appendChild(c);
  icon(c, name, token || "icon-on-container", Math.round(size * 0.5));
  return c;
}
function iconButton(parent, name, token) {
  const b = frame("Botón - " + name, "HORIZONTAL", { r: 9999, align: "CENTER", justify: "CENTER" });
  b.resize(44, 44);
  parent.appendChild(b);
  icon(b, name, token || "text-secondary", 22);
  return b;
}
function avatar(parent, size) {
  size = size || 32;
  const a = frame("Avatar", "HORIZONTAL", { r: 9999, align: "CENTER", justify: "CENTER", fill: "primary" });
  a.resize(size, size);
  parent.appendChild(a);
  text(a, "J", Math.round(size * 0.44), "Medium", "on-primary");
  return a;
}
function card(parent, o = {}) {
  return box(parent, o.name || "Tarjeta", "VERTICAL", { gap: o.gap !== undefined ? o.gap : 12, pad: o.pad !== undefined ? o.pad : 16, fill: "surface", stroke: o.stroke || "border", r: 12 });
}
function hero(parent, name) {
  return box(parent, name || "Tarjeta destacada", "VERTICAL", { gap: 4, pad: 20, fill: "surface-highlight", stroke: "border-highlight", r: 16 });
}
function divider(parent) {
  const r = figma.createRectangle();
  r.name = "Divisor";
  r.resize(100, 1);
  r.fills = [P("border")];
  parent.appendChild(r);
  try { r.layoutSizingHorizontal = "FILL"; } catch (e) {}
  return r;
}
function sectionHead(parent, title, right, rightToken) {
  const r = box(parent, "Encabezado - " + title, "HORIZONTAL", { justify: "SPACE_BETWEEN", align: "CENTER" });
  text(r, title, 14, "Medium", "text-primary");
  let link = null;
  if (right) { link = box(r, "Link - " + right, "HORIZONTAL", { pad: [4, 0, 4, 8] }, false); text(link, right, 12, "Medium", rightToken || "primary"); }
  return { row: r, link };
}
function kv(parent, k, v, vToken, strong) {
  const r = box(parent, "Dato - " + k, "HORIZONTAL", { justify: "SPACE_BETWEEN", align: "CENTER", gap: 12 });
  const kt = text(r, k, 13, "Regular", "text-secondary");
  const vt = text(r, v, strong ? 14 : 13, "Medium", vToken || "text-primary");
  return { row: r, k: kt, v: vt };
}
function listRow(parent, o) {
  const r = box(parent, o.name || "Fila - " + o.title, "HORIZONTAL", { gap: 12, pad: o.pad || [12, 0, 12, 0], align: "CENTER" });
  if (o.icon) iconCircle(r, o.icon, o.iconToken, o.iconBg, o.iconSize || 40);
  const c = box(r, "Textos", "VERTICAL", { gap: 2 });
  text(c, o.title, 14, "Medium", o.titleToken || "text-primary", true);
  if (o.sub) text(c, o.sub, 12, "Regular", "text-secondary", true);
  if (o.right || o.rightSub) {
    const rc = box(r, "Valor", "VERTICAL", { gap: 2, align: "MAX" }, false);
    if (o.right) text(rc, o.right, 14, "Medium", o.rightToken || "text-primary");
    if (o.rightSub) text(rc, o.rightSub, 11, "Regular", o.rightSubToken || "text-secondary");
  }
  if (o.chevron) icon(r, "chevronRight", "text-secondary", 18);
  return r;
}
function dayHeader(parent, label, total) {
  const h = box(parent, "Día - " + label, "HORIZONTAL", { justify: "SPACE_BETWEEN", align: "CENTER", pad: [8, 0, 4, 0] });
  text(h, label, 12, "Medium", "text-secondary");
  if (total) text(h, total, 12, "Regular", "text-secondary");
  return h;
}
function field(parent, label, value, o = {}) {
  const col = box(parent, "Campo - " + label, "VERTICAL", { gap: 6 });
  text(col, label, 12, "Medium", "text-secondary", true);
  const b = box(col, "Input", "HORIZONTAL", { gap: 8, pad: [0, 14, 0, 14], align: "CENTER", fill: "surface", stroke: o.focus ? "primary" : "border", strokeW: o.focus ? 1.5 : 1, r: 12 });
  b.resize(b.width, 48);
  b.layoutSizingHorizontal = "FILL";
  b.layoutSizingVertical = "FIXED";
  if (o.icon) icon(b, o.icon, "text-secondary", 18);
  const t = text(b, value, o.size || 14, "Regular", o.placeholder ? "text-secondary" : "text-primary");
  try { t.layoutSizingHorizontal = "FILL"; } catch (e) {}
  if (o.suffix) text(b, o.suffix, 13, "Medium", "text-secondary");
  if (o.trailing) icon(b, o.trailing, "text-secondary", 18);
  if (o.help) text(col, o.help, 12, "Regular", "text-secondary", true);
  return { col, input: b };
}
function label(parent, str) { return text(parent, str, 12, "Medium", "text-secondary", true); }
function chips(parent, items, sel, name) {
  sel = sel || [];
  const row = box(parent, name || "Chips", "HORIZONTAL", { gap: 8 });
  row.layoutWrap = "WRAP";
  row.counterAxisSpacing = 8;
  const out = items.map((it, i) => {
    const on = sel.includes(i);
    const c = box(row, "Chip - " + it, "HORIZONTAL", { pad: [6, 14, 6, 14], r: 9999, align: "CENTER", fill: on ? "primary-container" : "surface", stroke: on ? null : "border" }, false);
    text(c, it, 12, "Medium", on ? "on-primary-container" : "text-secondary");
    return c;
  });
  return { row, items: out };
}
function segmented(parent, items, sel) {
  const s = box(parent, "Selector", "HORIZONTAL", { gap: 4, pad: 4, fill: "background", stroke: "border", r: 12 });
  const out = items.map((it, i) => {
    const on = i === sel;
    const b = box(s, "Opción - " + it, "HORIZONTAL", { pad: [8, 8, 8, 8], r: 8, align: "CENTER", justify: "CENTER", fill: on ? "primary-container" : null });
    text(b, it, 13, "Medium", on ? "on-primary-container" : "text-secondary");
    return b;
  });
  return { node: s, items: out };
}
function toggle(parent, on) {
  const t = frame("Switch", "HORIZONTAL", { pad: 3, r: 9999, align: "CENTER", justify: on ? "MAX" : "MIN", fill: on ? "primary" : "border" });
  t.resize(44, 24);
  parent.appendChild(t);
  const k = figma.createEllipse();
  k.name = "Knob";
  k.resize(18, 18);
  k.fills = [P("on-primary")];
  t.appendChild(k);
  return t;
}
function toggleRow(parent, title, sub, on) {
  const r = box(parent, "Ajuste - " + title, "HORIZONTAL", { gap: 12, pad: [10, 0, 10, 0], align: "CENTER" });
  const c = box(r, "Textos", "VERTICAL", { gap: 2 });
  text(c, title, 14, "Medium", "text-primary", true);
  if (sub) text(c, sub, 12, "Regular", "text-secondary", true);
  toggle(r, on);
  return r;
}
function checkRow(parent, title, sub, on) {
  const r = box(parent, "Casilla - " + title, "HORIZONTAL", { gap: 12, pad: [10, 0, 10, 0], align: "MIN" });
  const b = frame("Checkbox", "HORIZONTAL", { r: 6, align: "CENTER", justify: "CENTER", fill: on ? "primary" : "surface", stroke: on ? null : "text-secondary", strokeW: 1.5 });
  b.resize(20, 20);
  r.appendChild(b);
  if (on) icon(b, "check", "on-primary", 14);
  const c = box(r, "Textos", "VERTICAL", { gap: 2 });
  text(c, title, 14, "Medium", "text-primary", true);
  if (sub) text(c, sub, 12, "Regular", "text-secondary", true);
  return r;
}
function radioCard(parent, title, sub, right, on, danger) {
  const accent = danger ? "expense" : "primary";
  const r = box(parent, "Opción - " + title, "HORIZONTAL", { gap: 12, pad: 14, r: 12, align: "CENTER", fill: on && !danger ? "primary-container" : "surface", stroke: on ? accent : "border" });
  const radio = frame("Radio", "HORIZONTAL", { r: 9999, align: "CENTER", justify: "CENTER", stroke: on ? accent : "text-secondary", strokeW: on ? 2 : 1.5 });
  radio.resize(20, 20);
  r.appendChild(radio);
  if (on) { const d = figma.createEllipse(); d.resize(10, 10); d.fills = [P(accent)]; radio.appendChild(d); }
  const c = box(r, "Textos", "VERTICAL", { gap: 2 });
  text(c, title, 14, "Medium", danger ? "expense" : (on ? "on-primary-container" : "text-primary"), true);
  if (sub) text(c, sub, 12, "Regular", "text-secondary", true);
  if (right) text(r, right, 14, "Medium", "text-primary");
  return r;
}
function btn(parent, labelStr, kind, o = {}) {
  kind = kind || "primary";
  const fill = { primary: "primary", danger: "expense", secondary: "surface" }[kind] || null;
  const fg = { primary: "on-primary", danger: "on-primary", secondary: "text-primary", ghost: "primary", dangerGhost: "expense", dangerOutline: "expense" }[kind];
  const stroke = kind === "secondary" ? "border" : (kind === "dangerOutline" ? "border" : null);
  const b = box(parent, "Botón - " + labelStr, "HORIZONTAL", { gap: 8, pad: o.small ? [8, 14, 8, 14] : [14, 16, 14, 16], r: o.small ? 9999 : 12, align: "CENTER", justify: "CENTER", fill: kind === "dangerOutline" ? "surface" : fill, stroke }, o.fill !== false);
  if (o.icon) icon(b, o.icon, fg, 18);
  text(b, labelStr, o.small ? 12 : 14, "Medium", fg);
  return b;
}
function btnRow(parent) { return box(parent, "Acciones", "HORIZONTAL", { gap: 8 }); }
function progressBar(parent, pct, w, token) {
  const f = figma.createFrame();
  f.name = "Progreso";
  f.resize(w || 326, 8);
  f.cornerRadius = 9999;
  f.fills = [P("border")];
  f.clipsContent = true;
  parent.appendChild(f);
  const r = figma.createRectangle();
  r.resize(Math.max(4, (w || 326) * pct), 8);
  r.cornerRadius = 9999;
  r.fills = [P(token || "primary")];
  f.appendChild(r);
  return f;
}
function note(parent, str, iconName, token) {
  const n = box(parent, "Nota", "HORIZONTAL", { gap: 8, pad: [10, 12, 10, 12], r: 12, fill: "background", stroke: "border", align: "MIN" });
  icon(n, iconName || "info", token || "text-secondary", 16);
  text(n, str, 12, "Regular", "text-secondary", true);
  return n;
}
function actionItem(parent, iconName, iconToken, title, titleToken, sub) {
  const it = box(parent, "Opción - " + title, "HORIZONTAL", { gap: 12, pad: [12, 14, 12, 14], r: 12, align: "CENTER", fill: "surface", stroke: "border" });
  iconCircle(it, iconName, iconToken, "background", 36);
  const c = box(it, "Textos", "VERTICAL", { gap: 2 });
  text(c, title, 14, "Medium", titleToken || "text-primary", true);
  if (sub) text(c, sub, 12, "Regular", "text-secondary", true);
  return it;
}

// ============================================================ Pantallas, hojas y diálogos
const S = {};            // nombre → frame creado
const EX = {             // pantallas existentes
  login: "1:1911", inicio: "1:997", historial: "1:1274", gestion: "1:1990", nuevaTx: "1:844",
  transferencia: "1:1807", nuevaCuenta: "1:2293", nuevaTarjeta: "1:1652", categorias: "1:2428", recurrentes: "1:2674",
};
let NAV = {};            // componente de barra por pestaña activa

function header(f, title, o = {}) {
  const h = frame("Header", "HORIZONTAL", { pad: [0, 8, 0, o.back === false ? 16 : 4], align: "CENTER", justify: "SPACE_BETWEEN", fill: "background" });
  h.resize(390, 64);
  h.strokes = [P("border")];
  h.strokeAlign = "INSIDE";
  h.strokeTopWeight = 0; h.strokeLeftWeight = 0; h.strokeRightWeight = 0; h.strokeBottomWeight = 1;
  f.appendChild(h);
  h.layoutPositioning = "ABSOLUTE";
  h.x = 0; h.y = 0;
  h.constraints = { horizontal: "STRETCH", vertical: "MIN" };
  const left = box(h, "Left", "HORIZONTAL", { gap: 4, align: "CENTER" }, false);
  let back = null;
  if (o.back !== false) { back = iconButton(left, "arrowLeft", "text-primary"); back.name = "Button - Volver"; }
  text(left, title, 18, "Medium", "text-primary");
  const right = box(h, "Right", "HORIZONTAL", { gap: 4, align: "CENTER" }, false);
  const actions = {};
  for (const a of o.actions || []) actions[a] = a === "avatar" ? avatar(right, 32) : iconButton(right, a, "text-secondary");
  return { node: h, back, actions };
}
let tmpX = 9000;
function screen(name, title, o = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = "VERTICAL";
  f.resize(390, 844);
  f.counterAxisSizingMode = "FIXED";
  f.primaryAxisSizingMode = "AUTO";
  try { f.minHeight = 844; } catch (e) {}
  f.fills = [P("background")];
  f.clipsContent = true;
  f.x = tmpX; f.y = 0; tmpX += 440;
  const main = box(f, "Main", "VERTICAL", { gap: o.gap !== undefined ? o.gap : 16, pad: [o.noHeader ? 72 : 80, 16, o.nav ? 104 : 40, 16] });
  const head = o.noHeader ? null : header(f, title, o);
  S[name] = f;
  return { f, main, head, nav: o.nav };
}
function finish(sc) {
  if (sc.nav && NAV[sc.nav]) {
    const inst = NAV[sc.nav].createInstance();
    sc.f.appendChild(inst);
    inst.layoutPositioning = "ABSOLUTE";
    inst.x = 0; inst.y = sc.f.height - inst.height;
    inst.constraints = { horizontal: "STRETCH", vertical: "MAX" };
  }
}
function overlayRoot(name) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(390, 844);
  f.fills = [];
  f.clipsContent = true;
  f.x = tmpX; f.y = 0; tmpX += 440;
  const dim = figma.createRectangle();
  dim.name = "Fondo (toca para cerrar)";
  dim.resize(390, 844);
  dim.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.4 }];
  f.appendChild(dim);
  S[name] = f;
  return { f, dim };
}
function sheet(name, title, sub) {
  const o = overlayRoot(name);
  const s = frame("Sheet", "VERTICAL", { gap: 16, pad: [8, 16, 24, 16], fill: "surface", stroke: "border", align: "CENTER" });
  s.resize(390, 100);
  s.primaryAxisSizingMode = "AUTO";
  s.topLeftRadius = 20; s.topRightRadius = 20;
  o.f.appendChild(s);
  const handle = figma.createRectangle();
  handle.name = "Handle";
  handle.resize(32, 4);
  handle.cornerRadius = 9999;
  handle.fills = [P("border-highlight")];
  s.appendChild(handle);
  if (title) {
    const h = box(s, "Título", "VERTICAL", { gap: 4 });
    text(h, title, 18, "Medium", "text-primary", true);
    if (sub) text(h, sub, 12, "Regular", "text-secondary", true);
  }
  o.s = s;
  o.done = () => { s.x = 0; s.y = 844 - s.height; };
  return o;
}
function dialog(name, title, body) {
  const o = overlayRoot(name);
  const c = frame("Diálogo", "VERTICAL", { gap: 16, pad: 24, fill: "surface", stroke: "border", r: 20 });
  c.resize(342, 100);
  c.primaryAxisSizingMode = "AUTO";
  o.f.appendChild(c);
  text(c, title, 18, "Medium", "text-primary", true);
  text(c, body, 14, "Regular", "text-secondary", true);
  o.c = c;
  o.actions = box(c, "Acciones", "HORIZONTAL", { gap: 8, justify: "MAX" });
  o.done = () => { c.x = 24; c.y = Math.round((844 - c.height) / 2); };
  return o;
}

// ------------------------------------------------------------ Prototipo (se aplica al final)
const EASE = { type: "EASE_OUT" };
const PUSH = { type: "SLIDE_IN", direction: "LEFT", matchLayers: false, easing: EASE, duration: 0.3 };
const FADE = { type: "DISSOLVE", easing: EASE, duration: 0.2 };
const UP = { type: "MOVE_IN", direction: "TOP", matchLayers: false, easing: EASE, duration: 0.3 };
const REACT = new Map();
function dest(x) { return S[x] ? S[x].id : (EX[x] || x); }
const go = (x, t) => ({ type: "NODE", destinationId: dest(x), navigation: "NAVIGATE", transition: t === undefined ? PUSH : t, resetScrollPosition: true });
const over = (x) => ({ type: "NODE", destinationId: dest(x), navigation: "OVERLAY", transition: FADE, resetScrollPosition: false });
const swap = (x) => ({ type: "NODE", destinationId: dest(x), navigation: "SWAP", transition: null, resetScrollPosition: false });
const BACK = { type: "BACK" };
const CLOSE = { type: "CLOSE" };
function on(node, actionOrFn, trigger) {
  if (!node) return;
  const list = REACT.get(node) || [];
  list.push({ trigger: trigger || { type: "ON_CLICK" }, act: actionOrFn });
  REACT.set(node, list);
}
async function applyReactions() {
  let ok = 0, bad = 0;
  for (const [node, list] of REACT) {
    try {
      const reactions = list.map((r) => ({ trigger: r.trigger, actions: [typeof r.act === "function" ? r.act() : r.act] }));
      await node.setReactionsAsync(reactions);
      ok++;
    } catch (e) { bad++; if (bad <= 8) log(`ℹ Conexión omitida en «${node.name}»: ${String(e.message).slice(0, 90)}`); }
  }
  log(`✓ Prototipo: ${ok} elementos conectados${bad ? `, ${bad} omitidos` : ""}`);
}
function backOf(sc) { if (sc.head && sc.head.back) on(sc.head.back, BACK); }

// ------------------------------------------------------------ Barra de navegación (componente)
function buildNav() {
  const tabs = [["Inicio", "home", "inicio"], ["Historial", "list", "historial"], ["Reportes", "chart", "Reportes"], ["Cuentas", "wallet", "gestion"]];
  const comps = [];
  for (const [active] of tabs) {
    const c = figma.createComponent();
    c.name = "Activo=" + active;
    c.layoutMode = "HORIZONTAL";
    c.resize(390, 64);
    c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
    c.paddingLeft = c.paddingRight = 8; c.paddingTop = 6; c.paddingBottom = 6;
    c.counterAxisAlignItems = "CENTER";
    c.fills = [P("background")];
    c.strokes = [P("border")]; c.strokeAlign = "INSIDE";
    c.strokeTopWeight = 1; c.strokeBottomWeight = 0; c.strokeLeftWeight = 0; c.strokeRightWeight = 0;
    for (const [name, ic, target] of tabs) {
      const isOn = name === active;
      const item = box(c, "Tab - " + name, "VERTICAL", { gap: 4, align: "CENTER" });
      const pill = frame("Indicador", "HORIZONTAL", { r: 9999, align: "CENTER", justify: "CENTER", fill: isOn ? "primary-container" : null });
      pill.resize(56, 28);
      item.appendChild(pill);
      icon(pill, ic, isOn ? "primary" : "text-secondary", 22);
      text(item, name, 12, "Medium", isOn ? "primary" : "text-secondary");
      if (!isOn) on(item, () => go(target, null));
    }
    comps.push(c);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Barra de navegación";
  set.layoutMode = "VERTICAL";
  set.primaryAxisSizingMode = "AUTO"; set.counterAxisSizingMode = "AUTO";
  set.itemSpacing = 16;
  set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 16;
  set.description = "Barra inferior: Inicio, Historial, Reportes y Cuentas. Cambia la variante «Activo» según la pantalla.";
  set.x = tmpX; tmpX += 480;
  tabs.forEach(([name], i) => (NAV[name] = comps[i]));
  S["Barra de navegación"] = set;
}

// ------------------------------------------------------------ Acceso
function scrRegistro() {
  const sc = screen("Registro", "Crear cuenta");
  const m = sc.main;
  text(m, "Crea tu cuenta para respaldar tus finanzas en la nube y recuperarlas si cambias de teléfono.", 14, "Regular", "text-secondary", true);
  field(m, "Nombre", "Julian Bocanegra", { icon: "user" });
  field(m, "Correo electrónico", "julian@correo.com", { icon: "mail" });
  field(m, "Nombre de usuario", "julianb", { icon: "at" });
  field(m, "Contraseña", "••••••••••", { icon: "lock", focus: true, help: "Mínimo 8 caracteres." });
  const crear = btn(m, "Crear cuenta", "primary");
  const sep = box(m, "Separador", "HORIZONTAL", { gap: 12, align: "CENTER" });
  divider(sep); text(sep, "o", 12, "Regular", "text-secondary"); divider(sep);
  const google = btn(m, "Continuar con Google", "secondary");
  const foot = box(m, "Ya tengo cuenta", "HORIZONTAL", { gap: 4, justify: "CENTER" });
  text(foot, "¿Ya tienes una cuenta?", 13, "Regular", "text-secondary");
  const login = text(foot, "Inicia sesión", 13, "Medium", "primary");
  finish(sc); backOf(sc);
  on(crear, () => go("Descargando tus datos", FADE));
  on(google, () => go("Descargando tus datos", FADE));
  on(foot, BACK);
}
function scrDescarga() {
  const sc = screen("Descargando tus datos", "", { noHeader: true, gap: 20 });
  const m = sc.main;
  m.paddingTop = 140;
  m.counterAxisAlignItems = "CENTER";
  iconCircle(m, "cloud", "primary", "primary-container", 72);
  text(m, "Descargando tus datos", 22, "Medium", "text-primary", true, "CENTER");
  text(m, "Solo pasa una vez por instalación. Al terminar, la app funciona sin conexión.", 14, "Regular", "text-secondary", true, "CENTER");
  const c = card(m);
  const top = box(c, "Avance", "HORIZONTAL", { justify: "SPACE_BETWEEN" });
  text(top, "Progreso", 13, "Medium", "text-primary");
  text(top, "64 %", 13, "Medium", "primary");
  progressBar(c, 0.64, 326);
  kv(c, "Cuentas", "5 de 5", "income");
  kv(c, "Categorías", "48 de 48", "income");
  kv(c, "Transacciones", "3.120 de 4.870");
  kv(c, "Recurrentes y etiquetas", "En espera", "text-secondary");
  text(m, "Prototipo: toca la pantalla o espera para continuar.", 12, "Regular", "text-secondary", true, "CENTER");
  finish(sc);
  on(sc.main, () => go("inicio", FADE));
}

// ------------------------------------------------------------ Inicio: hojas
function shDetalleSaldo() {
  const o = sheet("Hoja · Detalle del saldo", "Detalle del saldo", "Elige qué vista ves en inicio; la otra queda aquí.");
  const a = card(o.s);
  const ah = box(a, "Encabezado", "HORIZONTAL", { justify: "SPACE_BETWEEN", align: "CENTER" });
  text(ah, "Saldo disponible", 13, "Medium", "text-secondary");
  const badge = box(ah, "Insignia", "HORIZONTAL", { pad: [2, 8, 2, 8], r: 9999, fill: "primary-container" }, false);
  text(badge, "En inicio", 11, "Medium", "on-primary-container");
  text(a, "$2.750.000", 26, "Medium", "text-primary");
  text(a, "Efectivo, débito y ahorros incluidos en el saldo total. Sin tarjetas ni préstamos.", 12, "Regular", "text-secondary", true);
  const n = card(o.s);
  text(n, "Saldo neto", 13, "Medium", "text-secondary");
  text(n, "$2.218.042", 26, "Medium", "text-primary");
  kv(n, "Cuentas incluidas", "$2.750.000");
  kv(n, "Tarjeta Visa · vence 5 nov", "−$250.000", "expense");
  kv(n, "Préstamo · cuota 4 de 24", "−$281.958", "expense");
  label(o.s, "Mostrar en inicio");
  segmented(o.s, ["Disponible", "Neto"], 0);
  const listo = btn(o.s, "Listo", "primary");
  o.done();
  on(o.dim, CLOSE); on(listo, CLOSE);
}
function shPendiente() {
  const o = sheet("Hoja · Pendiente", "Arriendo", "Vence en 2 días · 9 oct · mensual");
  const h = card(o.s, { gap: 4 });
  text(h, "Monto del último pago", 12, "Regular", "text-secondary");
  text(h, "$900.000", 24, "Medium", "text-primary");
  note(o.s, "Este pendiente no afecta ningún saldo hasta que lo pagues.");
  const pagar = actionItem(o.s, "check", "primary", "Pagar", "text-primary", "Registra el gasto real y programa el siguiente");
  const omitir = actionItem(o.s, "skip", "text-secondary", "Omitir esta vez", "text-primary", "Salta a la siguiente ocurrencia: 9 nov");
  const fin = actionItem(o.s, "x", "expense", "Finalizar recurrencia", "expense", "No se generarán más pendientes");
  const cancel = btn(o.s, "Cancelar", "secondary");
  o.done();
  on(o.dim, CLOSE); on(cancel, CLOSE); on(omitir, CLOSE); on(fin, CLOSE);
  on(pagar, () => swap("Hoja · Pagar pendiente"));
}
function shPagarPendiente() {
  const o = sheet("Hoja · Pagar pendiente", "Pagar arriendo", "Se registrará como gasto real en Hogar > Arriendo.");
  field(o.s, "Monto", "$ 900.000", { focus: true, help: "Prellenado con el último pago; puedes cambiarlo." });
  field(o.s, "Fecha", "Hoy, 7 oct 2026 · 1:10 p. m.", { icon: "calendar" });
  label(o.s, "Cuenta");
  chips(o.s, ["Bancolombia Débito", "Cuenta Ahorros Nu", "Efectivo Billetera"], [0]);
  const conf = btn(o.s, "Confirmar pago", "primary");
  const cancel = btn(o.s, "Cancelar", "secondary");
  o.done();
  on(o.dim, CLOSE); on(conf, CLOSE); on(cancel, CLOSE);
}
function shPagarTarjeta() {
  const o = sheet("Hoja · Pagar tarjeta", "Pagar tarjeta Visa", "Corte 20 oct · vence 5 nov");
  radioCard(o.s, "Pago mínimo", "Lo que vence en el periodo", "$250.000", true);
  radioCard(o.s, "Pago total", "Liquida las cuotas restantes sin intereses futuros", "$800.000", false);
  label(o.s, "Cuenta de origen");
  chips(o.s, ["Bancolombia Débito", "Cuenta Ahorros Nu", "Efectivo Billetera"], [0]);
  field(o.s, "Monto a pagar", "$ 250.000", { focus: true });
  const d = card(o.s, { gap: 8 });
  text(d, "Desglose", 13, "Medium", "text-primary");
  kv(d, "Capital", "$200.000");
  kv(d, "Intereses", "$42.000");
  kv(d, "Otros cargos", "$8.000");
  const reg = btn(o.s, "Registrar pago", "primary");
  o.done();
  on(o.dim, CLOSE); on(reg, CLOSE);
}

// ------------------------------------------------------------ Historial
function shFiltros() {
  const o = sheet("Hoja · Filtros del historial", "Filtros", "Se combinan entre sí y con la búsqueda.");
  label(o.s, "Tipo");
  chips(o.s, ["Gastos", "Ingresos", "Transferencias"], [0]);
  label(o.s, "Categoría y subcategoría");
  chips(o.s, ["Comida", "Transporte", "Hogar", "Entretenimiento", "Salud", "Restaurantes", "Mercado"], [0, 5]);
  label(o.s, "Cuenta");
  chips(o.s, ["Efectivo", "Bancolombia", "Nu", "Tarjeta Visa"], [1]);
  label(o.s, "Etiqueta");
  chips(o.s, ["#Salidas", "#Trabajo", "#Viaje Cartagena"], []);
  const r = box(o.s, "Rango de fechas", "HORIZONTAL", { gap: 8 });
  field(r, "Desde", "1 oct 2026", { icon: "calendar" });
  field(r, "Hasta", "31 oct 2026", { icon: "calendar" });
  const a = btnRow(o.s);
  const limpiar = btn(a, "Limpiar", "secondary");
  const aplicar = btn(a, "Aplicar filtros", "primary");
  o.done();
  on(o.dim, CLOSE); on(limpiar, CLOSE); on(aplicar, CLOSE);
}
function scrDetalleTx() {
  const sc = screen("Detalle de transacción", "Detalle");
  const m = sc.main;
  const h = hero(m);
  h.counterAxisAlignItems = "CENTER";
  h.itemSpacing = 8;
  iconCircle(h, "coffee", "expense", "background", 48);
  text(h, "Café y almuerzo", 16, "Medium", "text-primary");
  text(h, "−$24.500", 32, "Medium", "expense");
  const chip = box(h, "Tipo", "HORIZONTAL", { pad: [4, 10, 4, 10], r: 9999, fill: "background", stroke: "border" }, false);
  text(chip, "Gasto", 12, "Medium", "text-secondary");
  const c = card(m);
  kv(c, "Categoría", "Comida > Cafetería");
  kv(c, "Cuenta", "Efectivo Billetera");
  kv(c, "Fecha y hora", "Hoy, 7 oct 2026 · 8:15 a. m.");
  kv(c, "Etiqueta", "#Salidas");
  kv(c, "Nota", "Desayuno con el equipo");
  text(m, "Sincronizada · creada el 7 oct 2026", 12, "Regular", "text-secondary", true, "CENTER");
  const a = btnRow(m);
  const edit = btn(a, "Editar", "secondary", { icon: "edit" });
  const del = btn(a, "Eliminar", "dangerOutline", { icon: "trash" });
  finish(sc); backOf(sc);
  on(edit, () => go("nuevaTx"));
  on(del, () => over("Diálogo · Eliminar transacción"));
}
function scrDetallePagoTarjeta() {
  const sc = screen("Detalle de transacción · Pago de tarjeta", "Detalle");
  const m = sc.main;
  const h = hero(m);
  h.counterAxisAlignItems = "CENTER";
  h.itemSpacing = 8;
  iconCircle(h, "exchange", "text-secondary", "background", 48);
  text(h, "Pago Tarjeta Visa", 16, "Medium", "text-primary");
  text(h, "$250.000", 32, "Medium", "text-primary");
  const chip = box(h, "Tipo", "HORIZONTAL", { pad: [4, 10, 4, 10], r: 9999, fill: "background", stroke: "border" }, false);
  text(chip, "Transferencia · no cuenta como gasto", 12, "Medium", "text-secondary");
  const c = card(m);
  kv(c, "Desde", "Bancolombia Débito");
  kv(c, "Hacia", "Tarjeta Visa Platinum");
  kv(c, "Fecha y hora", "5 oct 2026 · 9:02 a. m.");
  kv(c, "Tipo de pago", "Pago mínimo");
  const d = card(m, { gap: 8 });
  text(d, "Desglose del pago", 14, "Medium", "text-primary");
  kv(d, "Capital", "$200.000");
  kv(d, "Intereses", "$42.000", "expense");
  kv(d, "Otros cargos", "$8.000", "expense");
  divider(d);
  kv(d, "Total", "$250.000", "text-primary", true);
  note(m, "Intereses y cargos suman en la categoría «Intereses y cargos financieros» en la fecha de pago.");
  const a = btnRow(m);
  const edit = btn(a, "Editar", "secondary", { icon: "edit" });
  const del = btn(a, "Eliminar", "dangerOutline", { icon: "trash" });
  finish(sc); backOf(sc);
  on(edit, () => over("Hoja · Pagar tarjeta"));
  on(del, () => over("Diálogo · Eliminar transacción"));
}
function dlgEliminarTx() {
  const o = dialog("Diálogo · Eliminar transacción", "¿Eliminar esta transacción?", "Café y almuerzo · −$24.500. Podrás restaurarla desde el historial de cambios durante 90 días.");
  const cancel = btn(o.actions, "Cancelar", "ghost", { fill: false });
  const del = btn(o.actions, "Eliminar", "danger", { fill: false });
  o.done();
  on(o.dim, CLOSE); on(cancel, CLOSE);
  on(del, () => go("historial", FADE));
}

// ------------------------------------------------------------ Reportes
function scrReportes() {
  const sc = screen("Reportes", "Reportes", { back: false, actions: ["avatar"], nav: "Reportes" });
  const m = sc.main;
  segmented(m, ["Semana", "Mes", "Rango"], 1);
  const per = box(m, "Periodo", "HORIZONTAL", { justify: "SPACE_BETWEEN", align: "CENTER" });
  iconButton(per, "chevronLeft", "text-secondary");
  text(per, "Octubre 2026", 16, "Medium", "text-primary");
  iconButton(per, "chevronRight", "text-secondary");

  const sum = box(m, "Resumen", "HORIZONTAL", { fill: "surface", stroke: "border", r: 12 });
  for (const [k, v, t] of [["Ingresos", "+$2.850.000", "income"], ["Gastos", "−$1.640.500", "expense"], ["Balance", "+$1.209.500", "text-primary"]]) {
    const c = box(sum, k, "VERTICAL", { gap: 4, pad: [14, 12, 14, 12] });
    text(c, k, 12, "Regular", "text-secondary");
    text(c, v, 14, "Medium", t);
  }

  const ev = card(m);
  const eh = box(ev, "Encabezado", "HORIZONTAL", { justify: "SPACE_BETWEEN", align: "CENTER" });
  text(eh, "Evolución", 14, "Medium", "text-primary");
  const legend = box(eh, "Leyenda", "HORIZONTAL", { gap: 12, align: "CENTER" }, false);
  for (const [n, t] of [["Gastos", "expense"], ["Ingresos", "income"]]) {
    const li = box(legend, n, "HORIZONTAL", { gap: 4, align: "CENTER" }, false);
    const d = figma.createEllipse(); d.resize(8, 8); d.fills = [P(t)]; li.appendChild(d);
    text(li, n, 11, "Regular", "text-secondary");
  }
  const chart = figma.createFrame();
  chart.name = "Gráfico";
  chart.resize(326, 150);
  chart.fills = [];
  ev.appendChild(chart);
  const data = [["May", 1.52, 2.6], ["Jun", 1.71, 2.6], ["Jul", 1.48, 2.75], ["Ago", 1.83, 2.6], ["Sep", 1.59, 2.9], ["Oct", 1.64, 2.85]];
  const max = 3, H = 120, slot = 326 / data.length;
  data.forEach(([mes, g, i], k) => {
    const x0 = k * slot + slot / 2 - 13;
    for (const [val, t, dx] of [[g, "expense", 0], [i, "income", 14]]) {
      const b = figma.createRectangle();
      const h = Math.round((val / max) * H);
      b.resize(12, h); b.x = x0 + dx; b.y = H - h;
      b.topLeftRadius = b.topRightRadius = 4;
      b.fills = [P(t, mes === "Oct" ? 1 : 0.55)];
      chart.appendChild(b);
    }
    const l = figma.createText();
    l.fontName = { family: "Inter", style: "Regular" }; l.fontSize = 11; l.characters = mes;
    l.fills = [P("text-secondary")];
    chart.appendChild(l);
    l.x = k * slot + slot / 2 - l.width / 2; l.y = H + 8;
  });
  text(ev, "Gastaste 3 % más que en septiembre.", 12, "Regular", "text-secondary", true);

  const cat = card(m);
  text(cat, "Gastos por categoría", 14, "Medium", "text-primary");
  for (const [n, v, p, ic] of [["Hogar", "$620.000", 0.38, "home"], ["Comida", "$412.400", 0.25, "coffee"], ["Transporte", "$215.000", 0.13, "car"], ["Entretenimiento", "$186.000", 0.11, "film"], ["Salud", "$121.100", 0.07, "heart"], ["Intereses y cargos financieros", "$86.000", 0.05, "coins"]]) {
    const row = box(cat, "Categoría - " + n, "VERTICAL", { gap: 6 });
    const top = box(row, "Fila", "HORIZONTAL", { gap: 10, align: "CENTER" });
    iconCircle(top, ic, "icon-on-container", "icon-container", 28);
    const nt = text(top, n, 13, "Medium", "text-primary");
    try { nt.layoutSizingHorizontal = "FILL"; } catch (e) {}
    text(top, Math.round(p * 100) + " %", 12, "Regular", "text-secondary");
    text(top, v, 13, "Medium", "text-primary");
    progressBar(row, p / 0.38, 326, "primary");
  }

  const int = card(m);
  text(int, "Intereses y cargos financieros", 14, "Medium", "text-primary");
  text(int, "$86.000", 24, "Medium", "expense");
  kv(int, "Tarjeta Visa Platinum", "$42.000");
  kv(int, "Préstamo libre inversión", "$44.000");

  const act = card(m, { gap: 8 });
  text(act, "Actividad", 14, "Medium", "text-primary");
  kv(act, "Transacciones registradas", "142");
  kv(act, "Promedio por día", "4,6");

  const link = listRow(m, { title: "Ver reportes por etiqueta", sub: "Viajes, salidas y otros motivos", icon: "tag", chevron: true, pad: [14, 16, 14, 16] });
  link.fills = [P("surface")]; link.strokes = [P("border")]; link.strokeWeight = 1; link.strokeAlign = "INSIDE"; link.cornerRadius = 12;
  finish(sc);
  on(sc.head.actions.avatar, () => go("Ajustes"));
  on(link, () => go("Etiquetas"));
}

// ------------------------------------------------------------ Cuentas
function scrDetalleCuenta() {
  const sc = screen("Detalle de cuenta", "Bancolombia Débito", { actions: ["edit"] });
  const m = sc.main;
  const h = hero(m);
  text(h, "Saldo", 12, "Medium", "text-secondary");
  text(h, "$850.000", 32, "Medium", "text-primary");
  text(h, "Débito • *4821 · incluida en el saldo total", 12, "Regular", "text-secondary", true);
  const c = card(m, { gap: 8 });
  text(c, "Cómo se calcula", 14, "Medium", "text-primary");
  kv(c, "Saldo inicial", "$500.000");
  kv(c, "Ingresos", "+$2.400.000", "income");
  kv(c, "Gastos", "−$1.264.000", "expense");
  kv(c, "Transferencias", "−$786.000");
  const { link } = sectionHead(m, "Movimientos", "Ver en historial");
  const l = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  dayHeader(l, "Hoy", "−$86.000");
  const r1 = listRow(l, { icon: "cart", iconToken: "expense", title: "Supermercado", sub: "Comida > Mercado", right: "−$186.000", rightToken: "expense" });
  divider(l);
  const r2 = listRow(l, { icon: "exchange", iconToken: "text-secondary", title: "Retiro cajero", sub: "Transferencia a Efectivo Billetera", right: "$100.000", rightToken: "text-secondary" });
  dayHeader(l, "Lunes 5 de oct", "+$2.400.000");
  const r3 = listRow(l, { icon: "arrowUp", iconToken: "income", title: "Pago de nómina", sub: "Sueldo", right: "+$2.400.000", rightToken: "income" });
  finish(sc); backOf(sc);
  on(sc.head.actions.edit, () => go("Editar cuenta"));
  on(link, () => go("historial", null));
  for (const r of [r1, r2, r3]) on(r, () => go("Detalle de transacción"));
}
function scrEditarCuenta() {
  const sc = screen("Editar cuenta", "Editar cuenta");
  const m = sc.main;
  field(m, "Nombre", "Bancolombia Débito", { focus: true });
  field(m, "Saldo inicial", "$ 500.000", { help: "Cambiarlo recalcula el saldo: saldo inicial + ingresos − gastos ± transferencias." });
  field(m, "Tipo de cuenta", "Cuenta corriente / Débito", { help: "El tipo no se puede cambiar después de crear la cuenta." });
  const c = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  toggleRow(c, "Incluir en el saldo total", "Suma esta cuenta al saldo de inicio", true);
  const save = btn(m, "Guardar cambios", "primary");
  finish(sc); backOf(sc);
  on(save, BACK);
}
function shConfirmarEliminacion() {
  const o = sheet("Hoja · Confirmar eliminación", "Eliminar cuenta y transacciones", "Esta acción no se puede deshacer.");
  const c = card(o.s, { stroke: "expense", gap: 8 });
  text(c, "Impacto", 14, "Medium", "expense");
  kv(c, "Transacciones que se borran", "38");
  kv(c, "Tu saldo total baja", "−$850.000", "expense");
  kv(c, "Reportes afectados", "jun – oct 2026");
  field(o.s, "Escribe «Bancolombia Débito» para confirmar", "Bancolombia Débito", { focus: true });
  const del = btn(o.s, "Eliminar cuenta y transacciones", "danger");
  const cancel = btn(o.s, "Cancelar", "secondary");
  o.done();
  on(o.dim, CLOSE); on(cancel, CLOSE); on(del, CLOSE);
}
function scrCuentasDesactivadas() {
  const sc = screen("Cuentas desactivadas", "Cuentas desactivadas");
  const m = sc.main;
  note(m, "No aparecen en inicio, selectores ni saldo total, pero sus transacciones siguen en los reportes.");
  const c = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  const rows = [["Davivienda Ahorros", "Desactivada el 3 sep 2026 · 112 movimientos"], ["Nequi", "Desactivada el 14 jun 2026 · 27 movimientos"]];
  rows.forEach(([t, s], i) => {
    if (i) divider(c);
    const r = listRow(c, { icon: "bank", iconToken: "text-secondary", iconBg: "background", title: t, sub: s });
    const b = btn(r, "Reactivar", "secondary", { small: true, fill: false });
    on(b, () => go("gestion", FADE));
  });
  finish(sc); backOf(sc);
}

// ------------------------------------------------------------ Tarjetas y préstamos
function scrDetalleTarjeta() {
  const sc = screen("Detalle de tarjeta", "Tarjeta Visa Platinum", { actions: ["edit"] });
  const m = sc.main;
  const h = hero(m);
  text(h, "Deuda total", 12, "Medium", "text-secondary");
  text(h, "−$800.000", 32, "Medium", "expense");
  h.itemSpacing = 8;
  progressBar(h, 0.16, 318, "expense");
  kv(h, "Cupo disponible", "$4.200.000 de $5.000.000");
  const p = card(m);
  const ph = box(p, "Encabezado", "HORIZONTAL", { justify: "SPACE_BETWEEN", align: "CENTER" });
  text(ph, "Vence este periodo", 14, "Medium", "text-primary");
  text(ph, "5 nov", 12, "Medium", "warning");
  text(p, "$250.000", 24, "Medium", "text-primary");
  text(p, "Compras a 1 cuota $38.000 · cuotas $180.000 · intereses $32.000", 12, "Regular", "text-secondary", true);
  const pay = btn(p, "Pagar tarjeta", "primary");
  const c = card(m, { gap: 8 });
  text(c, "Condiciones", 14, "Medium", "text-primary");
  kv(c, "Día de corte", "20");
  kv(c, "Día de pago", "5");
  kv(c, "Tasa", "2,0 % M.V. · 26,8 % E.A.");
  kv(c, "Primera cuota sin intereses", "Sí");
  sectionHead(m, "Compras diferidas", "2 activas", "text-secondary");
  const d = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  listRow(d, { icon: "file", title: "Computador portátil", sub: "$1.200.000 · 12 cuotas · 2,0 % M.V. · cuota 3 de 12", right: "$100.000", rightSub: "+ $20.000 int." });
  divider(d);
  listRow(d, { icon: "plane", title: "Tiquetes Cartagena", sub: "$480.000 · 6 cuotas · tasa 0 % por convenio · cuota 2 de 6", right: "$80.000", rightSub: "sin intereses" });
  sectionHead(m, "Pagos recientes");
  const r = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  const pr = listRow(r, { icon: "exchange", iconToken: "text-secondary", title: "Pago Tarjeta Visa", sub: "5 oct · desde Bancolombia Débito · mínimo", right: "$250.000", chevron: true });
  finish(sc); backOf(sc);
  on(sc.head.actions.edit, () => go("nuevaTarjeta"));
  on(pay, () => over("Hoja · Pagar tarjeta"));
  on(pr, () => go("Detalle de transacción · Pago de tarjeta"));
}
function scrNuevoPrestamo(simple) {
  const name = simple ? "Nuevo préstamo · Simple" : "Nuevo préstamo · Detallado";
  const sc = screen(name, "Nuevo préstamo");
  const m = sc.main;
  const seg = segmented(m, ["Detallado", "Simple"], simple ? 1 : 0);
  if (simple) {
    text(m, "Usa este modo si solo sabes cuánto pagas al mes. Cada pago reduce el saldo por su valor completo; podrás pasarlo a detallado cuando conozcas las condiciones.", 13, "Regular", "text-secondary", true);
    field(m, "Nombre", "Crédito de vehículo");
    field(m, "Saldo adeudado actual", "$ 4.375.000", { focus: true });
    field(m, "Cuota mensual", "$ 282.000");
    field(m, "Día de pago", "5", { icon: "calendar" });
  } else {
    const n = note(m, "¿No conoces el saldo? Regístralo como gasto recurrente.", "info", "primary");
    field(m, "Nombre", "Préstamo libre inversión");
    field(m, "Monto recibido", "$ 5.000.000", { focus: true });
    label(m, "Cuenta de destino");
    chips(m, ["Bancolombia Débito", "Cuenta Ahorros Nu", "Efectivo Billetera"], [0]);
    const r = box(m, "Cuotas y día", "HORIZONTAL", { gap: 8 });
    field(r, "Número de cuotas", "24");
    field(r, "Día de pago", "5");
    field(m, "Tasa de interés", "1,5", { suffix: "%" });
    chips(m, ["M.V.", "E.A."], [0], "Tipo de tasa");
    field(m, "Fecha de la primera cuota", "5 nov 2026", { icon: "calendar" });
    const extras = card(m, { gap: 0, pad: [4, 16, 4, 16] });
    checkRow(extras, "Seguro de vida", "$8.000 al mes · se cobrará en cada cuota", true);
    divider(extras);
    checkRow(extras, "Costos adicionales", "Cuota de manejo u otros cobros mensuales", false);
    const est = card(m, { gap: 4 });
    text(est, "Primera cuota estimada", 12, "Medium", "text-secondary");
    text(est, "$291.333", 22, "Medium", "text-primary");
    text(est, "Capital $208.333 + intereses $75.000 + seguro $8.000", 12, "Regular", "text-secondary", true);
    text(m, "Recibir el dinero se registra como transferencia del préstamo a la cuenta de destino; no cuenta como ingreso.", 12, "Regular", "text-secondary", true);
    on(n, () => go("Nuevo gasto recurrente"));
  }
  const crear = btn(m, "Crear préstamo", "primary");
  finish(sc); backOf(sc);
  on(seg.items[simple ? 0 : 1], () => go(simple ? "Nuevo préstamo · Detallado" : "Nuevo préstamo · Simple", null));
  on(crear, () => go("Detalle de préstamo"));
}
function scrDetallePrestamo() {
  const sc = screen("Detalle de préstamo", "Préstamo libre inversión");
  const m = sc.main;
  const h = hero(m);
  h.itemSpacing = 8;
  text(h, "Deuda pendiente", 12, "Medium", "text-secondary");
  text(h, "−$4.375.000", 32, "Medium", "expense");
  progressBar(h, 3 / 24, 318, "primary");
  text(h, "3 de 24 cuotas pagadas · termina en oct 2028", 12, "Regular", "text-secondary", true);
  const a = btnRow(m);
  const pagar = btn(a, "Pagar cuota", "primary");
  const abonar = btn(a, "Abonar a capital", "secondary");
  const c = card(m, { gap: 8 });
  text(c, "Condiciones", 14, "Medium", "text-primary");
  kv(c, "Monto inicial", "$5.000.000");
  kv(c, "Tasa", "1,5 % M.V. · 19,6 % E.A.");
  kv(c, "Seguro de vida", "$8.000 / mes");
  kv(c, "Costos adicionales", "No");
  kv(c, "Día de pago", "5");
  sectionHead(m, "Plan de pagos", "24 cuotas", "text-secondary");
  const l = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  listRow(l, { title: "Cuota 4 · 5 nov 2026", sub: "Capital $208.333 · intereses $65.625 · seguro $8.000", right: "$281.958", rightSub: "Pendiente", rightSubToken: "warning" });
  divider(l);
  listRow(l, { title: "Cuota 5 · 5 dic 2026", sub: "Capital $208.333 · intereses $62.500 · seguro $8.000", right: "$278.833", rightSub: "Programada" });
  divider(l);
  listRow(l, { title: "Cuota 3 · 5 oct 2026", sub: "Capital $208.333 · intereses $68.750 · seguro $8.000", right: "$285.083", rightSub: "Pagada", rightSubToken: "income" });
  note(m, "En el saldo neto solo se descuenta la cuota del periodo actual.");
  finish(sc); backOf(sc);
  on(pagar, () => over("Hoja · Pagar pendiente"));
  on(abonar, () => over("Hoja · Abono a capital"));
}
function shAbono() {
  const o = sheet("Hoja · Abono a capital", "Abonar a capital", "Préstamo libre inversión · deuda −$4.375.000");
  field(o.s, "Monto del abono", "$ 1.000.000", { focus: true });
  label(o.s, "¿Qué quieres reducir?");
  radioCard(o.s, "El plazo", "Terminas antes: quedan 16 cuotas en lugar de 21", null, true);
  radioCard(o.s, "El valor de la cuota", "Sigues con 21 cuotas y la cuota baja a ≈ $230.000", null, false);
  label(o.s, "Cuenta de origen");
  chips(o.s, ["Bancolombia Débito", "Cuenta Ahorros Nu"], [1]);
  const reg = btn(o.s, "Registrar abono", "primary");
  o.done();
  on(o.dim, CLOSE); on(reg, CLOSE);
}

// ------------------------------------------------------------ Recurrentes y categorías
function scrNuevoRecurrente() {
  const sc = screen("Nuevo gasto recurrente", "Nuevo gasto recurrente");
  const m = sc.main;
  field(m, "Nombre", "Plan celular", { focus: true });
  field(m, "Monto estimado", "$ 65.000");
  label(m, "Cuenta");
  chips(m, ["Bancolombia Débito", "Cuenta Ahorros Nu", "Tarjeta Visa", "Efectivo"], [0]);
  field(m, "Categoría", "Hogar > Servicios públicos", { trailing: "chevronRight" });
  field(m, "Fecha de inicio", "17 oct 2026", { icon: "calendar" });
  label(m, "Frecuencia");
  chips(m, ["Semanal", "Quincenal", "Mensual", "Trimestral", "Anual", "Personalizada"], [2]);
  const pers = card(m, { gap: 8 });
  text(pers, "Personalizada", 13, "Medium", "text-primary");
  const pr = box(pers, "Cada", "HORIZONTAL", { gap: 8, align: "CENTER" });
  text(pr, "Cada", 13, "Regular", "text-secondary");
  const n = box(pr, "N", "HORIZONTAL", { pad: [6, 14, 6, 14], r: 12, fill: "surface", stroke: "border" }, false);
  text(n, "2", 14, "Medium", "text-primary");
  chips(pr, ["días", "semanas", "meses"], [2]);
  note(m, "Aparecerá como pendiente 5 días antes de cada fecha. Puedes cambiar la anticipación en Ajustes.");
  const save = btn(m, "Guardar recurrente", "primary");
  finish(sc); backOf(sc);
  on(save, () => go("recurrentes", FADE));
}
function shNuevaCategoria() {
  const o = sheet("Hoja · Nueva categoría", "Nueva categoría");
  segmented(o.s, ["Gasto", "Ingreso"], 0);
  field(o.s, "Nombre", "Mascotas", { focus: true });
  label(o.s, "Ubicación");
  chips(o.s, ["Categoría principal", "Subcategoría de Hogar", "Subcategoría de Salud"], [0]);
  label(o.s, "Ícono");
  const ic = box(o.s, "Íconos", "HORIZONTAL", { gap: 10 });
  ["paw", "heart", "home", "cart", "book", "gift"].forEach((n, i) => {
    const c = iconCircle(ic, n, i === 0 ? "primary" : "text-secondary", i === 0 ? "primary-container" : "background", 44);
    if (i === 0) { c.strokes = [P("primary")]; c.strokeWeight = 1.5; c.strokeAlign = "INSIDE"; }
  });
  const crear = btn(o.s, "Crear categoría", "primary");
  o.done();
  on(o.dim, CLOSE); on(crear, CLOSE);
}

// ------------------------------------------------------------ Etiquetas
function scrEtiquetas() {
  const sc = screen("Etiquetas", "Etiquetas", { actions: ["plus"] });
  const m = sc.main;
  text(m, "Agrupan movimientos de distintas categorías bajo un mismo motivo. Cada transacción tiene como máximo una etiqueta.", 13, "Regular", "text-secondary", true);
  const c = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  const data = [["Viaje Cartagena", "12 movimientos este mes", "−$1.240.000", true, "plane"], ["Salidas", "8 movimientos este mes", "−$182.000", true, "film"], ["Trabajo", "3 movimientos este mes", "−$54.000", false, "file"]];
  const rows = [];
  data.forEach(([t, s, v, pinned, ic], i) => {
    if (i) divider(c);
    const r = listRow(c, { icon: ic, title: t, sub: s, right: v, rightToken: "expense" });
    const pin = iconButton(r, "pin", pinned ? "primary" : "text-secondary");
    pin.name = pinned ? "Fijada en inicio" : "Fijar en inicio";
    rows.push(r);
  });
  text(m, "Las etiquetas con el alfiler en verde se muestran en inicio con su total del mes.", 12, "Regular", "text-secondary", true);
  const nueva = btn(m, "Nueva etiqueta", "secondary", { icon: "plus" });
  finish(sc); backOf(sc);
  on(sc.head.actions.plus, () => over("Hoja · Nueva etiqueta"));
  on(nueva, () => over("Hoja · Nueva etiqueta"));
  for (const r of rows) on(r, () => go("Detalle de etiqueta"));
}
function shNuevaEtiqueta() {
  const o = sheet("Hoja · Nueva etiqueta", "Nueva etiqueta");
  field(o.s, "Nombre", "Cumpleaños mamá", { focus: true });
  const c = card(o.s, { gap: 0, pad: [4, 16, 4, 16] });
  toggleRow(c, "Fijar en inicio", "Muestra su total del mes en la pantalla de inicio", false);
  const crear = btn(o.s, "Crear etiqueta", "primary");
  o.done();
  on(o.dim, CLOSE); on(crear, CLOSE);
}
function scrDetalleEtiqueta() {
  const sc = screen("Detalle de etiqueta", "Viaje Cartagena", { actions: ["edit"] });
  const m = sc.main;
  segmented(m, ["Mes actual", "Mes anterior", "Rango"], 0);
  const h = hero(m);
  text(h, "Total en octubre", 12, "Medium", "text-secondary");
  text(h, "−$1.240.000", 32, "Medium", "expense");
  text(h, "12 movimientos en 3 categorías", 12, "Regular", "text-secondary");
  const c = card(m);
  text(c, "Por categoría", 14, "Medium", "text-primary");
  for (const [n, v, p] of [["Alojamiento", "$680.000", 0.55], ["Transporte", "$340.000", 0.27], ["Comida", "$220.000", 0.18]]) {
    const row = box(c, n, "VERTICAL", { gap: 6 });
    kv(row, n, v);
    progressBar(row, p, 326, "primary");
  }
  const t = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  toggleRow(t, "Fijar en inicio", "Ver su total del mes en la pantalla de inicio", true);
  sectionHead(m, "Movimientos");
  const l = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  const r1 = listRow(l, { icon: "bed", iconToken: "expense", title: "Hotel Caribe", sub: "Alojamiento · 4 oct · Tarjeta Visa", right: "−$680.000", rightToken: "expense" });
  divider(l);
  const r2 = listRow(l, { icon: "plane", iconToken: "expense", title: "Vuelo Bogotá – Cartagena", sub: "Transporte · 2 oct · Tarjeta Visa", right: "−$300.000", rightToken: "expense" });
  divider(l);
  const r3 = listRow(l, { icon: "coffee", iconToken: "expense", title: "Restaurante La Cevichería", sub: "Comida · 5 oct · Efectivo", right: "−$96.000", rightToken: "expense" });
  finish(sc); backOf(sc);
  for (const r of [r1, r2, r3]) on(r, () => go("Detalle de transacción"));
}

// ------------------------------------------------------------ Datos y ajustes
function scrImportarExportar() {
  const sc = screen("Importar y exportar", "Importar y exportar");
  const m = sc.main;
  const im = card(m);
  iconCircle(im, "upload", "primary", "primary-container", 40);
  text(im, "Importar movimientos", 16, "Medium", "text-primary");
  text(im, "Desde un archivo CSV o Excel (.xlsx), por ejemplo, la exportación de Cashew. Podrás asociar columnas, ver una vista previa y decidir qué hacer con los duplicados.", 13, "Regular", "text-secondary", true);
  btn(im, "Seleccionar archivo", "primary", { icon: "file" });
  btn(im, "Descargar plantilla", "ghost", { icon: "download" });
  const ex = card(m);
  iconCircle(ex, "download", "primary", "primary-container", 40);
  text(ex, "Exportar a CSV", 16, "Medium", "text-primary");
  text(ex, "Descarga tus transacciones en un archivo CSV.", 13, "Regular", "text-secondary", true);
  label(ex, "Rango de fechas (opcional)");
  chips(ex, ["Todo", "Este mes", "Mes anterior", "Personalizado"], [0]);
  btn(ex, "Exportar CSV", "secondary", { icon: "download" });
  const last = card(m, { gap: 8 });
  text(last, "Última importación", 14, "Medium", "text-primary");
  text(last, "28 sep 2026 · cashew_export.csv", 12, "Regular", "text-secondary", true);
  kv(last, "Importadas", "4.870", "income");
  kv(last, "Omitidas por duplicadas", "12");
  kv(last, "Con error", "3", "expense");
  finish(sc); backOf(sc);
}
function scrHistorialCambios() {
  const sc = screen("Historial de cambios", "Historial de cambios");
  const m = sc.main;
  note(m, "Se guardan los cambios de tus transacciones durante 90 días.");
  const groups = [
    ["Hoy", [["trash", "expense", "Eliminaste «Almuerzo»", "−$28.000 · Efectivo · 10:42 a. m.", "Restaurar"], ["edit", "text-secondary", "Editaste «Taxi»", "Monto: $12.000 → $14.000 · 9:15 a. m.", "Revertir"]]],
    ["Ayer", [["plus", "income", "Creaste «Honorarios asesoría»", "+$450.000 · Nu Ahorros · 6:30 p. m.", null]]],
    ["Viernes 2 de oct", [["trash", "expense", "Eliminaste «Uber»", "−$18.500 · Bancolombia · 11:05 p. m.", "Restaurar"]]],
  ];
  for (const [day, items] of groups) {
    dayHeader(m, day);
    const c = card(m, { gap: 0, pad: [4, 16, 4, 16] });
    items.forEach(([ic, t, title, sub, action], i) => {
      if (i) divider(c);
      const r = listRow(c, { icon: ic, iconToken: t, iconBg: "background", title, sub });
      if (action) btn(r, action, "secondary", { small: true, fill: false, icon: "restore" });
    });
  }
  finish(sc); backOf(sc);
}
function settingsGroup(m, title) {
  text(m, title, 12, "Medium", "text-secondary", true);
  return card(m, { gap: 0, pad: [4, 16, 4, 16] });
}
function scrAjustes() {
  const sc = screen("Ajustes", "Ajustes");
  const m = sc.main;
  const p = box(m, "Perfil", "HORIZONTAL", { gap: 12, pad: 16, fill: "surface", stroke: "border", r: 12, align: "CENTER" });
  avatar(p, 48);
  const pc = box(p, "Perfil", "VERTICAL", { gap: 2 });
  text(pc, "Julian Bocanegra", 16, "Medium", "text-primary", true);
  text(pc, "@julianb · julian@correo.com", 12, "Regular", "text-secondary", true);
  const sync = box(m, "Sincronización", "HORIZONTAL", { gap: 12, pad: 16, fill: "surface", stroke: "border", r: 12, align: "CENTER" });
  iconCircle(sync, "cloudCheck", "income", "background", 40);
  const sy = box(sync, "Estado", "VERTICAL", { gap: 2 });
  text(sy, "Sincronizado", 14, "Medium", "text-primary", true);
  text(sy, "Última sincronización hace 2 min · 0 cambios pendientes", 12, "Regular", "text-secondary", true);

  const g1 = settingsGroup(m, "Inicio");
  const vista = listRow(g1, { title: "Vista del saldo", sub: "Disponible (la otra se ve al tocar el saldo)", chevron: true });
  divider(g1);
  const pers = listRow(g1, { title: "Personalizar inicio", sub: "Mostrar, ocultar y reordenar tarjetas", chevron: true });

  const g2 = settingsGroup(m, "Avisos");
  toggleRow(g2, "Notificaciones de pagos pendientes", "Solo al abrir la ventana de aviso y el día de vencimiento", true);
  divider(g2);
  const ant = box(g2, "Anticipación de avisos", "HORIZONTAL", { gap: 12, pad: [10, 0, 10, 0], align: "CENTER" });
  const ac = box(ant, "Textos", "VERTICAL", { gap: 2 });
  text(ac, "Anticipación de avisos", 14, "Medium", "text-primary", true);
  text(ac, "Días antes del vencimiento", 12, "Regular", "text-secondary", true);
  const step = box(ant, "Stepper", "HORIZONTAL", { gap: 4, align: "CENTER", pad: 2, r: 9999, stroke: "border" }, false);
  iconButton(step, "minus", "text-primary").resize(32, 32);
  text(step, "5 días", 13, "Medium", "text-primary");
  iconButton(step, "plus", "text-primary").resize(32, 32);

  const g3 = settingsGroup(m, "Montos");
  const dec = box(g3, "Decimales", "HORIZONTAL", { gap: 12, pad: [10, 0, 10, 0], align: "CENTER" });
  const dt = box(dec, "Textos", "VERTICAL", { gap: 2 });
  text(dt, "Decimales", 14, "Medium", "text-primary", true);
  text(dt, "Cómo se muestran los montos", 12, "Regular", "text-secondary", true);
  const ds = segmented(dec, ["0", "2"], 0);
  ds.node.layoutSizingHorizontal = "HUG";
  for (const it of ds.items) { it.layoutSizingHorizontal = "FIXED"; it.resize(48, it.height); }
  divider(g3);
  kv(g3, "Moneda", "COP · peso colombiano").row.paddingTop = 12;

  const g4 = settingsGroup(m, "Datos");
  const links = [["Categorías", "tag", "categorias"], ["Etiquetas", "tag", "Etiquetas"], ["Gastos recurrentes", "repeat", "recurrentes"], ["Importar y exportar", "upload", "Importar y exportar"], ["Historial de cambios", "restore", "Historial de cambios"], ["Cuentas desactivadas", "bank", "Cuentas desactivadas"]];
  links.forEach(([t, ic, target], i) => {
    if (i) divider(g4);
    const r = listRow(g4, { icon: ic, title: t, chevron: true, iconSize: 36 });
    on(r, () => go(target));
  });
  const logout = btn(m, "Cerrar sesión", "dangerOutline", { icon: "logout" });
  text(m, "Versión 1.0.0", 12, "Regular", "text-secondary", true, "CENTER");
  finish(sc); backOf(sc);
  on(vista, () => over("Hoja · Detalle del saldo"));
  on(pers, () => go("Personalizar inicio"));
  on(logout, () => over("Diálogo · Cerrar sesión"));
}
function dlgCerrarSesion() {
  const o = dialog("Diálogo · Cerrar sesión", "¿Cerrar sesión?", "Tus datos se quedan en este teléfono, pero dejarán de sincronizarse. Los cambios que hagas después no tendrán respaldo en la nube.");
  const cancel = btn(o.actions, "Cancelar", "ghost", { fill: false });
  const ok = btn(o.actions, "Cerrar sesión", "danger", { fill: false });
  o.done();
  on(o.dim, CLOSE); on(cancel, CLOSE);
  on(ok, () => go("login", FADE));
}
function scrPersonalizar() {
  const sc = screen("Personalizar inicio", "Personalizar inicio");
  const m = sc.main;
  text(m, "Muestra u oculta las tarjetas de inicio. Mantén pulsado el asa para cambiar el orden.", 13, "Regular", "text-secondary", true);
  const c = card(m, { gap: 0, pad: [4, 16, 4, 16] });
  const items = [["Saldo total", "Disponible o neto", true], ["Accesos rápidos", "Gasto, ingreso y transferencia", true], ["Cuentas", "Carrusel con el saldo de cada cuenta", true], ["Próximos pagos", "Recurrentes, tarjetas y préstamos", true], ["Etiquetas fijadas", "Total del mes de cada etiqueta", true], ["Movimientos recientes", "Últimos 5 días agrupados por día", true], ["Indicador mensual", "Variación frente al mes anterior", false]];
  items.forEach(([t, s, onv], i) => {
    if (i) divider(c);
    const r = box(c, "Tarjeta - " + t, "HORIZONTAL", { gap: 12, pad: [10, 0, 10, 0], align: "CENTER" });
    icon(r, "grip", "text-secondary", 20);
    const col = box(r, "Textos", "VERTICAL", { gap: 2 });
    text(col, t, 14, "Medium", "text-primary", true);
    text(col, s, 12, "Regular", "text-secondary", true);
    toggle(r, onv);
  });
  const save = btn(m, "Guardar", "primary");
  finish(sc); backOf(sc);
  on(save, BACK);
}

// ============================================================ Cambios en pantallas existentes
function replaceIconIn(root, name, token, size) {
  const v = root.findOne((n) => n.type === "VECTOR" || (n.type === "FRAME" && n.name.startsWith("Icon")));
  if (!v) return;
  const parentBox = v.parent;
  const ic = svgIcon(name, token, size);
  parentBox.insertChild(parentBox.children.indexOf(v), ic);
  v.remove();
}
async function modsExistentes() {
  const n = async (id) => { const x = await get(id); if (!x) log("ℹ No encontré el nodo " + id); return x; };
  const inicioRoot = await get("1:997");
  const inicioFrameFind = (name) => (inicioRoot ? inicioRoot.findOne((x) => x.name === name) : null);

  // --- Barra de navegación nueva en las pantallas principales
  for (const [frameId, navId, tab] of [["1:997", "1:1262", "Inicio"], ["1:1274", "1:1470", "Historial"], ["1:1990", "7:16", "Cuentas"]]) {
    const f = await n(frameId);
    const old = await get(navId);
    if (!f) continue;
    if (old) old.remove();
    const inst = NAV[tab].createInstance();
    f.appendChild(inst);
    inst.layoutPositioning = "ABSOLUTE";
    inst.x = 0; inst.y = f.height - inst.height;
    inst.constraints = { horizontal: "STRETCH", vertical: "MAX" };
  }

  // --- Iniciar sesión
  const huella = await n("1:1981"); if (huella) huella.visible = false; // F18 es Won't (v1)
  on(await n("1:1960"), () => go("Descargando tus datos", FADE));
  on(await n("1:1971"), () => go("Descargando tus datos", FADE));
  on(await n("1:1987"), () => go("Registro"));

  // --- Inicio
  const cont = await n("1:999");
  const saldo = await n("1:1012");
  const prox = await n("1:1102");
  if (cont && saldo) {
    const qa = frame("Accesos rápidos", "HORIZONTAL", { gap: 8 });
    cont.insertChild(cont.children.indexOf(saldo) + 1, qa);
    qa.layoutSizingHorizontal = "FILL";
    const mk = (labelStr, ic, token) => {
      const b = box(qa, "Acceso - " + labelStr, "VERTICAL", { gap: 6, pad: [12, 8, 12, 8], r: 12, align: "CENTER", fill: "surface", stroke: "border" });
      iconCircle(b, ic, token, "background", 32);
      text(b, labelStr, 12, "Medium", "text-primary");
      return b;
    };
    on(mk("Gasto", "arrowDown", "expense"), () => go("nuevaTx", UP));
    on(mk("Ingreso", "arrowUp", "income"), () => go("nuevaTx", UP));
    on(mk("Transferencia", "exchange", "text-secondary"), () => go("transferencia", UP));
    on(saldo, () => over("Hoja · Detalle del saldo"));
  }
  if (cont && prox) {
    const sec = frame("Etiquetas fijadas", "VERTICAL", { gap: 8 });
    cont.insertChild(cont.children.indexOf(prox) + 1, sec);
    sec.layoutSizingHorizontal = "FILL";
    const { link } = sectionHead(sec, "Etiquetas fijadas", "Ver todas");
    const c = card(sec, { gap: 0, pad: [4, 16, 4, 16] });
    const t1 = listRow(c, { icon: "plane", title: "Viaje Cartagena", sub: "12 movimientos este mes", right: "−$1.240.000", rightToken: "expense" });
    divider(c);
    const t2 = listRow(c, { icon: "film", title: "Salidas", sub: "8 movimientos este mes", right: "−$182.000", rightToken: "expense" });
    on(link, () => go("Etiquetas"));
    on(t1, () => go("Detalle de etiqueta"));
    on(t2, () => go("Detalle de etiqueta"));
  }
  if (cont) {
    const pers = frame("Personalizar inicio", "HORIZONTAL", { gap: 6, justify: "CENTER", align: "CENTER", pad: [8, 0, 8, 0] });
    cont.appendChild(pers);
    pers.layoutSizingHorizontal = "FILL";
    icon(pers, "edit", "primary", 16);
    text(pers, "Personalizar inicio", 13, "Medium", "primary");
    on(pers, () => go("Personalizar inicio"));
  }
  // REQ-TRX-11: encabezados "Hoy", "Ayer", "Antier" y luego la fecha
  const antier = inicioFrameFind("Día: Lunes 5 de oct");
  if (antier) {
    const t = antier.findOne((x) => x.type === "TEXT");
    if (t) t.characters = "Antier";
    antier.name = "Día: Antier";
  }
  on(await n("1:1259"), () => go("Ajustes"));
  on(await n("1:1117"), () => over("Hoja · Pendiente"));
  on(await n("1:1161"), () => over("Hoja · Pendiente"));
  on(await n("1:1139"), () => over("Hoja · Pagar tarjeta"));
  const inicioFrame = await get("1:997");
  const taxi = inicioFrame ? inicioFrame.findOne((x) => x.name === "Transacción: Taxi") : null;
  for (const id of ["1:1186", "1:1200", "1:1214", "1:1228"]) on(await get(id), () => go("Detalle de transacción"));
  on(taxi, () => go("Detalle de transacción"));

  // --- Historial: filtros y detalle
  const search = await n("1:1491");
  if (search) {
    const fb = search.clone();
    search.parent.insertChild(search.parent.children.indexOf(search), fb);
    fb.name = "Button - Filtros";
    replaceIconIn(fb, "filter", "text-secondary", 20);
    on(fb, () => over("Hoja · Filtros del historial"));
  }
  for (const id of ["1:1348", "1:1365", "1:1387", "1:1404", "1:1426", "1:1443"]) on(await get(id), () => go("Detalle de transacción"));

  // --- Gestión de cuentas
  on(await n("1:2191"), () => go("Ajustes"));
  for (const id of ["1:2023", "1:2055", "1:2087"]) on(await get(id), () => go("Detalle de cuenta"));
  on(await n("1:2128"), () => go("Detalle de tarjeta"));
  const sec2 = await n("1:2119");
  if (sec2) {
    const c = card(sec2, { name: "Article - Préstamo libre inversión", gap: 10 });
    const top = listRow(c, { icon: "coins", iconToken: "expense", iconBg: "background", title: "Préstamo libre inversión", sub: "Bancolombia · cuota 4 de 24", pad: [0, 0, 0, 0], chevron: true });
    const d = box(c, "Deuda", "HORIZONTAL", { justify: "SPACE_BETWEEN", align: "CENTER" });
    text(d, "Deuda pendiente", 12, "Medium", "text-secondary");
    text(d, "−$4.375.000", 20, "Medium", "expense");
    progressBar(c, 3 / 24, 326, "primary");
    text(c, "Próxima cuota: 5 nov · $281.958", 12, "Regular", "text-secondary", true);
    on(c, () => go("Detalle de préstamo"));
    const count = await get("1:2127");
    if (count) count.characters = "1 tarjeta · 1 préstamo";
  }
  // Hoja de opciones: añadir "Editar cuenta"
  const opciones = figma.currentPage.findOne((x) => x.type === "FRAME" && x.name === "Hoja · Opciones de la cuenta");
  if (opciones) {
    const sh = opciones.findOne((x) => x.name === "Sheet");
    const del = sh && sh.findOne((x) => x.name === "Opción - Eliminar cuenta");
    if (sh && del) {
      const tmp = frame("tmp", "VERTICAL"); tmp.resize(358, 10); tmp.primaryAxisSizingMode = "AUTO";
      const edit = actionItem(tmp, "edit", "text-primary", "Editar cuenta", "text-primary", "Nombre, saldo inicial e inclusión en el saldo total");
      sh.insertChild(sh.children.indexOf(del), edit);
      edit.layoutSizingHorizontal = "FILL";
      tmp.remove();
      sh.y = 844 - sh.height;
      on(edit, () => go("Editar cuenta"));
    }
  }
  // Hoja "Mover transacciones": elegir la cuenta destino
  const mover = figma.currentPage.findOne((x) => x.type === "FRAME" && x.name === "Hoja · Eliminar cuenta · Mover transacciones");
  if (mover) {
    const sh = mover.findOne((x) => x.name === "Sheet");
    const acts = sh && sh.findOne((x) => x.name === "Acciones");
    if (sh && acts) {
      const tmp = frame("tmp", "VERTICAL"); tmp.resize(358, 10); tmp.primaryAxisSizingMode = "AUTO";
      const dst = box(tmp, "Cuenta destino", "VERTICAL", { gap: 8 });
      label(dst, "Mover los 38 movimientos a");
      chips(dst, ["Cuenta Ahorros Nu", "Efectivo Billetera", "Tarjeta Visa"], [0]);
      sh.insertChild(sh.children.indexOf(acts), dst);
      dst.layoutSizingHorizontal = "FILL";
      tmp.remove();
      sh.y = 844 - sh.height;
    }
  }
  // Hoja "Eliminar definitivamente": confirmación reforzada (REQ-CTA-05)
  const elim = figma.currentPage.findOne((x) => x.type === "FRAME" && x.name === "Hoja · Eliminar cuenta · Eliminar definitivamente");
  if (elim) {
    const acts = elim.findOne((x) => x.name === "Acciones");
    if (acts && acts.children[0]) on(acts.children[0], () => swap("Hoja · Confirmar eliminación"));
  }

  // --- Nueva cuenta: tipos según el SRS (efectivo, débito, ahorros, tarjeta de crédito, préstamo)
  const inv = await n("1:2335");
  if (inv) {
    const t = inv.findOne((x) => x.type === "TEXT");
    if (t) { await figma.loadFontAsync(t.fontName); t.characters = "Tarjeta de crédito"; }
    on(inv, () => go("nuevaTarjeta"));
  }
  on(await n("1:2339"), () => go("Nuevo préstamo · Detallado"));

  // --- Gastos recurrentes y categorías
  on(await n("1:2710"), () => go("Nuevo gasto recurrente"));
  for (const id of ["1:2752", "1:2781", "1:2808", "1:2835"]) on(await get(id), () => go("Nuevo gasto recurrente"));
  for (const id of ["1:2754", "1:2783", "1:2810", "1:2837"]) on(await get(id), () => over("Hoja · Pagar pendiente"));
  for (const id of ["1:2750", "1:2779", "1:2806", "1:2833"]) on(await get(id), () => over("Hoja · Pendiente"));
  on(await n("1:2450"), () => over("Hoja · Nueva categoría"));
  log("✓ Pantallas existentes ajustadas (barra de 4 pestañas, accesos rápidos, etiquetas fijadas, préstamo, filtros…)");
}

// ============================================================ Orden del lienzo
const ROWS = [
  ["1 · Acceso", ["Iniciar Sesión", "Registro", "Descargando tus datos"]],
  ["2 · Navegación principal", ["Inicio (con Próximos Pagos)", "Hoja · Detalle del saldo", "Historial", "Hoja · Filtros del historial", "Reportes", "Gestión de Cuentas", "Ajustes", "Diálogo · Cerrar sesión"]],
  ["3 · Registrar y consultar movimientos", ["Nueva Transacción", "Nueva Transacción · Tarjeta de crédito", "Nueva Transferencia", "Categorías", "Hoja · Nueva categoría", "Detalle de transacción", "Detalle de transacción · Pago de tarjeta", "Diálogo · Eliminar transacción"]],
  ["4 · Cuentas", ["Detalle de cuenta", "Editar cuenta", "Hoja · Opciones de la cuenta", "Hoja · Eliminar cuenta · Desactivar cuenta", "Hoja · Eliminar cuenta · Mover transacciones", "Hoja · Eliminar cuenta · Eliminar definitivamente", "Hoja · Confirmar eliminación", "Cuentas desactivadas", "Nueva Cuenta"]],
  ["5 · Tarjetas y préstamos", ["Nueva Tarjeta de Crédito", "Detalle de tarjeta", "Hoja · Pagar tarjeta", "Nuevo préstamo · Detallado", "Nuevo préstamo · Simple", "Detalle de préstamo", "Hoja · Abono a capital"]],
  ["6 · Pagos recurrentes", ["Gastos Recurrentes", "Hoja · Pendiente", "Hoja · Pagar pendiente", "Nuevo gasto recurrente"]],
  ["7 · Etiquetas, reportes y datos", ["Etiquetas", "Hoja · Nueva etiqueta", "Detalle de etiqueta", "Importar y exportar", "Historial de cambios", "Personalizar inicio"]],
  ["Componentes", ["Barra de navegación", "Indicador mensual"]],
];
function ordenar() {
  const page = figma.currentPage;
  const byName = new Map();
  for (const x of page.findAll((x) => x.type === "FRAME" || x.type === "COMPONENT_SET")) {
    if (x.parent && (x.parent.type === "PAGE" || x.parent.type === "SECTION") && !byName.has(x.name)) byName.set(x.name, x);
  }
  const listed = new Set(ROWS.flatMap((r) => r[1]));
  const others = [...byName.keys()].filter((k) => !listed.has(k));
  const rows = others.length ? [...ROWS, ["Otros", others]] : ROWS;
  let y = 0;
  for (const [title, names] of rows) {
    const nodes = names.map((x) => byName.get(x)).filter(Boolean);
    if (!nodes.length) continue;
    let sec = page.children.find((x) => x.type === "SECTION" && x.name === title);
    if (!sec) { sec = figma.createSection(); sec.name = title; }
    sec.x = 0; sec.y = y;
    let x = 80, maxH = 0;
    for (const nd of nodes) { sec.appendChild(nd); nd.x = x; nd.y = 80; x += nd.width + 120; maxH = Math.max(maxH, nd.height); }
    sec.resizeWithoutConstraints(x - 120 + 80, maxH + 160);
    y += maxH + 160 + 160;
  }
  for (const s of page.children.filter((x) => x.type === "SECTION" && x.children.length === 0)) s.remove();
  log("✓ Lienzo ordenado en secciones por flujo");
}

// ============================================================ Ejecución
async function main() {
  figma.showUI(__html__, { width: 480, height: 380 });
  await figma.currentPage.loadAsync();
  if (!(await get("1:997"))) {
    log("✗ No encuentro Inicio en esta página. Abre «Page 1» y vuelve a ejecutar.");
    return figma.ui.postMessage({ done: "No se aplicó ningún cambio." });
  }
  if (figma.currentPage.findOne((x) => x.type === "FRAME" && x.name === "Reportes")) {
    log("ℹ El prototipo SRS ya estaba creado; solo reordeno el lienzo.");
    ordenar();
    return figma.ui.postMessage({ done: "Listo." });
  }
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await loadVars();

  let errors = 0;
  const run = (name, fn) => { try { fn(); } catch (e) { errors++; log(`✗ ${name}: ${e.message}`); } };
  run("Barra de navegación", buildNav);
  if (!NAV["Inicio"]) { figma.ui.postMessage({ done: "Error al crear la barra; no continúo." }); return; }

  const builders = [
    ["Registro", scrRegistro], ["Descarga inicial", scrDescarga],
    ["Detalle del saldo", shDetalleSaldo], ["Pendiente", shPendiente], ["Pagar pendiente", shPagarPendiente], ["Pagar tarjeta", shPagarTarjeta],
    ["Filtros", shFiltros], ["Detalle de transacción", scrDetalleTx], ["Detalle pago tarjeta", scrDetallePagoTarjeta], ["Eliminar transacción", dlgEliminarTx],
    ["Reportes", scrReportes],
    ["Detalle de cuenta", scrDetalleCuenta], ["Editar cuenta", scrEditarCuenta], ["Confirmar eliminación", shConfirmarEliminacion], ["Cuentas desactivadas", scrCuentasDesactivadas],
    ["Detalle de tarjeta", scrDetalleTarjeta], ["Nuevo préstamo detallado", () => scrNuevoPrestamo(false)], ["Nuevo préstamo simple", () => scrNuevoPrestamo(true)], ["Detalle de préstamo", scrDetallePrestamo], ["Abono a capital", shAbono],
    ["Nuevo gasto recurrente", scrNuevoRecurrente], ["Nueva categoría", shNuevaCategoria],
    ["Etiquetas", scrEtiquetas], ["Nueva etiqueta", shNuevaEtiqueta], ["Detalle de etiqueta", scrDetalleEtiqueta],
    ["Importar y exportar", scrImportarExportar], ["Historial de cambios", scrHistorialCambios], ["Ajustes", scrAjustes], ["Cerrar sesión", dlgCerrarSesion], ["Personalizar inicio", scrPersonalizar],
  ];
  for (const [name, fn] of builders) run(name, fn);
  log(`✓ ${Object.keys(S).length - 1} pantallas, hojas y diálogos nuevos`);

  try { await modsExistentes(); } catch (e) { errors++; log("✗ Pantallas existentes: " + e.message); }
  await applyReactions();

  // Elementos fijos al hacer scroll (encabezado y barra)
  for (const f of figma.currentPage.findAll((x) => x.type === "FRAME" && x.layoutMode === "VERTICAL" && x.parent && (x.parent.type === "PAGE" || x.parent.type === "SECTION"))) {
    let k = 0;
    for (let i = f.children.length - 1; i >= 0 && f.children[i].layoutPositioning === "ABSOLUTE"; i--) k++;
    try { f.numberOfFixedChildren = k; } catch (e) {}
  }
  try { ordenar(); } catch (e) { errors++; log("✗ Ordenar: " + e.message); }
  figma.ui.postMessage({ done: errors ? `Terminado con ${errors} error(es). Copia el registro y pásamelo.` : "Listo. Prototipo completo según el SRS." });
}

figma.ui.onmessage = (msg) => { if (msg === "close") figma.closePlugin(); };
main().catch((e) => { log("✗ " + e.message); figma.ui.postMessage({ done: "Error. Copia el registro y pásamelo." }); });
