// Finance App - Cambios v1
// 1. Inicio: indicador mensual (componente con variantes Sube/Baja)
// 2. Inicio: "Últimos 5 días" agrupado por día
// 3. Nueva transacción: tarjeta de crédito en el selector de cuenta + pantalla con condiciones del crédito
// 4. Gestión de cuentas: ⋮ abre hoja "Opciones de la cuenta" → hoja "Eliminar cuenta" (3 estados)
// 5. Pantallas antiguas → página "Archivo (versiones anteriores)"
// 6. Ajuste al design.md: tokens claro/oscuro, bordes 1 px sin sombras, radios, pesos 400/500, mayúscula inicial

const log = (line) => figma.ui.postMessage({ line });
const get = (id) => figma.getNodeByIdAsync(id);

// ---------- Utilidades ----------
function rgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
}
function hexOf(c) {
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return "#" + h(c.r) + h(c.g) + h(c.b);
}
const solid = (hex, opacity) => (opacity === undefined ? { type: "SOLID", color: rgb(hex) } : { type: "SOLID", color: rgb(hex), opacity });

const C = {
  background: "#F6F7F5", surface: "#FFFFFF", border: "#E4E7E3", borderHi: "#D5DDD6",
  text: "#1F2622", text2: "#6E7670", primary: "#4F7D5E", onPrimary: "#FFFFFF",
  primaryContainer: "#E4EEE6", onPrimaryContainer: "#2E4A37", iconContainer: "#EEF2EE",
  income: "#2E8B57", expense: "#D14B42", warning: "#E08A4F",
};

// Frame con auto-layout que se ajusta al contenido
function autoLayout(direction, props) {
  const f = figma.createFrame();
  f.layoutMode = direction;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  f.clipsContent = false;
  if (props) Object.assign(f, props);
  return f;
}

function txt(chars, size, style, hex) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style };
  t.fontSize = size;
  t.characters = chars;
  t.fills = [solid(hex)];
  return t;
}

function svgIcon(paths, hex, size) {
  const n = figma.createNodeFromSvg(
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="${hex}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  );
  n.name = "Icon";
  return n;
}
const ICON = {
  trendUp: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  trendDown: '<path d="M3 7l6 6 4-4 8 8"/><path d="M21 10v7h-7"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h.01M11 15h2"/>',
  car: '<circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2M9 17h6M3 11h15M12 11V6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>',
};

// Reemplaza el primer VECTOR dentro de `root` por un ícono SVG de línea
function replaceIcon(root, paths, hex, size) {
  const v = root.findOne((n) => n.type === "VECTOR");
  if (!v) return;
  const box = v.parent;
  const icon = svgIcon(paths, hex, size);
  box.appendChild(icon);
  v.remove();
  try { box.resize(size, size); } catch (e) {}
}

// Cambia un texto y deja que su contenedor se ajuste al contenido
function setText(t, chars) {
  t.characters = chars;
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  let p = t.parent;
  for (let i = 0; i < 3 && p; i++, p = p.parent) {
    if ("layoutMode" in p && p.layoutMode !== "NONE" && p.parent && "layoutMode" in p.parent && p.parent.layoutMode !== "NONE") {
      try { p.layoutSizingHorizontal = "HUG"; } catch (e) {}
    }
  }
}

// Ajusta anchos fijos heredados de Stitch para que un bloque se adapte a su contenedor
function fitWidths(root, minW) {
  for (const n of root.findAll(() => true)) {
    if (n.type !== "FRAME") continue;
    const p = n.parent;
    if (p && "layoutMode" in p && p.layoutMode !== "NONE" && n.width >= minW) {
      try { n.layoutSizingHorizontal = "FILL"; } catch (e) {}
    }
    if (n.layoutMode === "HORIZONTAL" && n.itemSpacing > 30) n.primaryAxisAlignItems = "SPACE_BETWEEN";
  }
}

function go(destId, transition) {
  return { type: "NODE", destinationId: destId, navigation: "NAVIGATE", transition: transition || null, resetScrollPosition: true };
}
const EASE = { type: "EASE_OUT" };
const SMART = { type: "SMART_ANIMATE", easing: EASE, duration: 0.3 };
const FADE = { type: "DISSOLVE", easing: EASE, duration: 0.2 };
async function onClick(node, action) {
  await node.setReactionsAsync([{ trigger: { type: "ON_CLICK" }, actions: [action] }]);
}

// Botón de ancho completo
function button(label, fillHex, textHex, strokeHex) {
  const b = autoLayout("HORIZONTAL", { name: "Button" });
  b.primaryAxisAlignItems = "CENTER";
  b.counterAxisAlignItems = "CENTER";
  b.paddingTop = b.paddingBottom = 14;
  b.cornerRadius = 12;
  b.fills = [solid(fillHex)];
  if (strokeHex) { b.strokes = [solid(strokeHex)]; b.strokeWeight = 1; b.strokeAlign = "INSIDE"; }
  b.appendChild(txt(label, 14, "Medium", textHex));
  return b;
}

// ---------- Paso 1: indicador mensual ----------
async function step1() {
  const comps = [];
  for (const up of [true, false]) {
    const c = figma.createComponent();
    c.name = "Tendencia=" + (up ? "Sube" : "Baja");
    c.layoutMode = "HORIZONTAL";
    c.primaryAxisSizingMode = "AUTO";
    c.counterAxisSizingMode = "AUTO";
    c.counterAxisAlignItems = "CENTER";
    c.itemSpacing = 4;
    c.fills = [];
    const color = up ? C.income : C.expense;
    c.appendChild(svgIcon(up ? ICON.trendUp : ICON.trendDown, color, 14));
    c.appendChild(txt(up ? "8,4 % más que en septiembre" : "5,2 % menos que en septiembre", 12, "Medium", color));
    comps.push(c);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Indicador mensual";
  set.layoutMode = "VERTICAL";
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
  set.itemSpacing = 12;
  set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 16;
  set.x = 6752; set.y = 0;
  set.description = "Variación del saldo frente al mes anterior. Sube = verde (income), Baja = rojo (expense).";

  const card = await get("1:1012");
  const old = await get("9:3");
  const inst = comps[0].createInstance();
  inst.name = "Indicador mensual";
  card.insertChild(card.children.indexOf(old), inst);
  old.remove();
  card.paddingBottom = 24;
  const amount = await get("1:1020");
  amount.paddingBottom = 4;
  log("✓ Inicio: indicador mensual (componente con variantes Sube/Baja)");
}

// ---------- Paso 2: últimos 5 días agrupados por día ----------
async function step2() {
  const list = await get("1:1185");
  list.clipsContent = true;

  const dayHeader = (label, total) => {
    const h = autoLayout("HORIZONTAL", { name: "Día: " + label });
    h.primaryAxisAlignItems = "SPACE_BETWEEN";
    h.counterAxisAlignItems = "CENTER";
    h.paddingTop = h.paddingBottom = 8;
    h.paddingLeft = h.paddingRight = 14;
    h.fills = [solid(C.background)];
    h.appendChild(txt(label, 12, "Medium", C.text2));
    h.appendChild(txt(total, 12, "Regular", C.text2));
    return h;
  };

  const rowHoy = await get("1:1186"), rowAyer = await get("1:1200"), row5 = await get("1:1214"), row4 = await get("1:1228");
  const div = await get("1:1198");

  // Segundo movimiento de hoy para que el grupo tenga sentido
  const taxi = rowHoy.clone();
  taxi.name = "Transacción: Taxi";
  const tt = taxi.findAll((n) => n.type === "TEXT");
  setText(tt[0], "Taxi");
  setText(tt[1], "Transporte · Bancolombia");
  setText(tt[2], "-$14.000");
  replaceIcon(taxi, ICON.car, C.expense, 16);

  setText(await get("1:1195"), "Comida · Billetera");
  setText(await get("1:1209"), "Ingreso · Nu Ahorros");
  setText(await get("1:1223"), "Bancolombia → Efectivo");
  setText(await get("1:1237"), "Mercado · Bancolombia");
  setText(await get("1:1184"), "3 – 7 oct");

  (await get("1:1212")).remove();
  (await get("1:1226")).remove();

  const order = [
    dayHeader("Hoy", "-$38.500"), rowHoy, div, taxi,
    dayHeader("Ayer", "+$450.000"), rowAyer,
    dayHeader("Lunes 5 de oct", "$100.000"), row5,
    dayHeader("Domingo 4 de oct", "-$182.400"), row4,
  ];
  order.forEach((n, i) => list.insertChild(i, n));
  for (const n of order) {
    try { n.layoutSizingHorizontal = "FILL"; } catch (e) {}
    if (n.type === "FRAME" && n.layoutMode === "HORIZONTAL") n.primaryAxisAlignItems = "SPACE_BETWEEN";
  }
  log("✓ Inicio: últimos 5 días agrupados por día");
}

// ---------- Paso 3: tarjeta de crédito en Nueva transacción ----------
let creditFrameId = null;
async function step3() {
  const nt = await get("1:844");
  const banc = await get("1:907"), efec = await get("1:920"), nu = await get("1:931");
  const row = await get("1:906"), viewport = await get("1:905");
  banc.name = "Cuenta - Bancolombia"; efec.name = "Cuenta - Efectivo"; nu.name = "Cuenta - Nu";

  // Plantillas de radio (seleccionado / no seleccionado)
  const radioOn = (await get("1:916")).clone();
  const radioOff = (await get("1:929")).clone();
  radioOn.visible = radioOff.visible = false;
  nt.appendChild(radioOn); nt.appendChild(radioOff);
  radioOn.layoutPositioning = radioOff.layoutPositioning = "ABSOLUTE";

  const visa = efec.clone();
  visa.name = "Cuenta - Tarjeta Visa";
  row.appendChild(visa);
  const vt = visa.findAll((n) => n.type === "TEXT");
  setText(vt[0], "Tarjeta Visa");
  setText(vt[1], "Cupo $ 4.200.000");
  replaceIcon(visa.children[0], ICON.card, C.text2, 16);

  const place = () => {
    const cards = ["Cuenta - Bancolombia", "Cuenta - Tarjeta Visa", "Cuenta - Efectivo", "Cuenta - Nu"];
    return (frameRow) => {
      let x = 2;
      for (const name of cards) {
        const c = frameRow.children.find((n) => n.name === name);
        c.x = x; c.y = 0; x += c.width + 10;
      }
      frameRow.resize(x, frameRow.height);
    };
  };
  place()(row);
  viewport.clipsContent = true;
  viewport.overflowDirection = "HORIZONTAL";

  const setSel = (label, on) => {
    label.fills = [solid(on ? C.primaryContainer : C.surface)];
    label.strokes = [solid(on ? C.primary : C.border)];
    label.strokeWeight = 1;
    const r = label.children.find((n) => n.name === "Input:margin");
    const idx = label.children.indexOf(r);
    const nr = (on ? radioOn : radioOff).clone();
    nr.visible = true;
    label.insertChild(idx, nr);
    nr.layoutPositioning = "AUTO";
    r.remove();
  };
  setSel(banc, true); setSel(visa, false); setSel(efec, false); setSel(nu, false);

  // Pantalla con tarjeta seleccionada = misma interfaz + condiciones del crédito
  const cf = nt.clone();
  cf.name = "Nueva Transacción · Tarjeta de crédito";
  cf.x = 1266; cf.y = 0;
  creditFrameId = cf.id;
  const find = (root, name) => root.findOne((n) => n.name === name);
  setSel(find(cf, "Cuenta - Bancolombia"), false);
  setSel(find(cf, "Cuenta - Tarjeta Visa"), true);

  const origin = find(cf, "Cuenta de Origen (Carrusel Horizontal Compacto)");
  const parent = origin.parent;
  const cond = (await get("9:451")).clone();
  cond.name = "Condiciones del crédito";
  parent.insertChild(parent.children.indexOf(origin) + 1, cond);
  cond.layoutSizingHorizontal = "FILL";
  fitWidths(cond, 355);

  // Prototipo: elegir tarjeta despliega las condiciones; elegir otra cuenta las oculta
  await onClick(visa, go(cf.id, SMART));
  for (const name of ["Cuenta - Bancolombia", "Cuenta - Efectivo", "Cuenta - Nu"]) {
    await onClick(find(cf, name), go("1:844", SMART));
  }
  radioOn.remove(); radioOff.remove();
  for (const n of cf.findAll((n) => !n.visible && n.name === "Input:margin")) n.remove();
  log("✓ Nueva transacción: Tarjeta Visa en el selector y pantalla con condiciones del crédito (Smart Animate)");
}

// ---------- Paso 4: hojas de opciones y eliminación de cuenta ----------
function overlayRoot(name, x) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(390, 844);
  f.fills = [];
  f.clipsContent = true;
  f.x = x; f.y = 0;
  const dim = figma.createRectangle();
  dim.name = "Fondo (toca para cerrar)";
  dim.resize(390, 844);
  dim.fills = [solid("#000000", 0.4)];
  f.appendChild(dim);
  return { f, dim };
}
function sheet(name) {
  const s = autoLayout("VERTICAL", { name });
  s.resize(390, 100);
  s.primaryAxisSizingMode = "AUTO";
  s.counterAxisAlignItems = "CENTER";
  s.itemSpacing = 16;
  s.paddingTop = 8; s.paddingBottom = 24; s.paddingLeft = s.paddingRight = 16;
  s.fills = [solid(C.surface)];
  s.topLeftRadius = s.topRightRadius = 20;
  s.strokes = [solid(C.border)]; s.strokeWeight = 1; s.strokeAlign = "INSIDE";
  const handle = figma.createRectangle();
  handle.name = "Handle";
  handle.resize(32, 4);
  handle.cornerRadius = 9999;
  handle.fills = [solid(C.borderHi)];
  s.appendChild(handle);
  return s;
}
function addFill(parent, node) { parent.appendChild(node); try { node.layoutSizingHorizontal = "FILL"; } catch (e) {} return node; }
function finishOverlay(f, s) { f.appendChild(s); s.x = 0; s.y = 844 - s.height; }

async function step4() {
  const CLOSE = { type: "CLOSE" };

  // Hoja 1: opciones de la cuenta
  const o = overlayRoot("Hoja · Opciones de la cuenta", 5064);
  const s1 = sheet("Sheet");
  const t1 = addFill(s1, txt("Opciones de la cuenta", 16, "Medium", C.text));
  t1.textAutoResize = "HEIGHT";
  const item = autoLayout("HORIZONTAL", { name: "Opción - Eliminar cuenta" });
  item.counterAxisAlignItems = "CENTER";
  item.itemSpacing = 12;
  item.paddingTop = item.paddingBottom = 12; item.paddingLeft = item.paddingRight = 14;
  item.cornerRadius = 12;
  item.fills = [solid(C.surface)];
  item.strokes = [solid(C.border)]; item.strokeWeight = 1; item.strokeAlign = "INSIDE";
  const ic = autoLayout("HORIZONTAL", { name: "Icon container" });
  ic.primaryAxisAlignItems = ic.counterAxisAlignItems = "CENTER";
  ic.resize(36, 36);
  ic.cornerRadius = 9999;
  ic.fills = [solid(C.background)];
  ic.appendChild(svgIcon(ICON.trash, C.expense, 18));
  item.appendChild(ic);
  const col = autoLayout("VERTICAL", { name: "Textos", itemSpacing: 2 });
  col.appendChild(txt("Eliminar cuenta", 14, "Medium", C.expense));
  col.appendChild(txt("Desactivarla, mover sus movimientos o borrarla", 12, "Regular", C.text2));
  item.appendChild(col);
  addFill(s1, item);
  const cancel1 = addFill(s1, button("Cancelar", C.background, C.text, C.border));
  finishOverlay(o.f, s1);

  // Hojas 2-4: eliminar cuenta, una por opción seleccionada
  const optsSrc = await get("1:2236");
  const warnSrc = await get("1:2198");
  const radioOnSrc = await get("1:2240");
  const radioOffSrc = await get("1:2253");
  const labels = ["Desactivar cuenta", "Mover transacciones", "Eliminar definitivamente"];
  const states = [];
  for (let i = 0; i < 3; i++) {
    const r = overlayRoot("Hoja · Eliminar cuenta · " + labels[i], 5486 + i * 422);
    const s = sheet("Sheet");
    if (i === 2) {
      const w = addFill(s, warnSrc.clone());
      w.name = "Aviso - Atención con esta cuenta";
      w.fills = [solid(C.surface)];
      w.strokes = [solid(C.expense)]; w.strokeWeight = 1; w.strokeAlign = "INSIDE";
      w.effects = [];
      const wt = w.findAll((n) => n.type === "TEXT");
      wt[0].fills = [solid(C.expense)];
      wt[1].fills = [solid(C.text2)];
      setText(wt[1], "Se borrarán la cuenta y todas sus transacciones de tus reportes. Esta acción no se puede deshacer.");
      for (let p = wt[1].parent; p && p !== w; p = p.parent) { try { p.layoutSizingHorizontal = "FILL"; } catch (e) {} }
      try { wt[1].layoutSizingHorizontal = "FILL"; } catch (e) {}
      wt[1].textAutoResize = "HEIGHT";
      w.children[0].fills = [solid(C.background)];
    }
    const head = autoLayout("VERTICAL", { name: "Título", itemSpacing: 4 });
    head.appendChild(txt("Eliminar cuenta", 18, "Medium", C.text));
    head.appendChild(txt("Bancolombia Débito · Saldo $850.000 · 38 movimientos", 12, "Regular", C.text2));
    addFill(s, head);

    const opts = addFill(s, optsSrc.clone());
    opts.name = "Opciones";
    const optFrames = opts.children.slice(0, 3);
    optFrames.forEach((opt, j) => {
      const on = i === j;
      const danger = j === 2;
      opt.fills = [solid(on && !danger ? C.primaryContainer : C.surface)];
      opt.strokes = [solid(on ? (danger ? C.expense : C.primary) : C.border)];
      opt.strokeWeight = 1; opt.strokeAlign = "INSIDE";
      const old = opt.findOne((n) => n.name === "Input:margin");
      const parent = old.parent;
      const nr = (on ? radioOnSrc : radioOffSrc).clone();
      parent.insertChild(parent.children.indexOf(old), nr);
      old.remove();
      if (on && danger) for (const v of nr.findAll(() => true)) {
        if ("fills" in v && v.fills.length && v.name === "Input:checked") v.fills = [solid(C.expense)];
        if ("strokes" in v && v.strokes.length) v.strokes = [solid(C.expense)];
      }
      const ts = opt.findAll((n) => n.type === "TEXT");
      if (j === 0) {
        const badge = ts.find((t) => t.characters === "RECOMENDADO");
        if (badge) badge.characters = "Recomendada";
        if (!on) {
          ts[0].fills = [solid(C.text)];
          for (const t of ts) if (t !== ts[0] && t !== badge) t.fills = [solid(C.text2)];
        }
      }
      opt.name = "Opción - " + labels[j];
    });

    const actions = autoLayout("VERTICAL", { name: "Acciones", itemSpacing: 8 });
    const main = button(labels[i], i === 2 ? C.expense : C.primary, C.onPrimary);
    const cancel = button("Cancelar", C.background, C.text, C.border);
    addFill(actions, main); addFill(actions, cancel);
    addFill(s, actions);
    finishOverlay(r.f, s);
    states.push({ root: r, opts: optFrames, main, cancel });
  }

  // Prototipo
  await onClick(o.dim, CLOSE);
  await onClick(cancel1, CLOSE);
  await onClick(item, { type: "NODE", destinationId: states[0].root.f.id, navigation: "SWAP", transition: null, resetScrollPosition: false });
  for (let i = 0; i < 3; i++) {
    const st = states[i];
    await onClick(st.root.dim, CLOSE);
    await onClick(st.main, CLOSE);
    await onClick(st.cancel, CLOSE);
    for (let j = 0; j < 3; j++) if (j !== i) {
      await onClick(st.opts[j], { type: "NODE", destinationId: states[j].root.f.id, navigation: "SWAP", transition: null, resetScrollPosition: false });
    }
  }
  for (const id of ["1:2036", "1:2068", "1:2100", "1:2142"]) {
    await onClick(await get(id), { type: "NODE", destinationId: o.f.id, navigation: "OVERLAY", transition: FADE, resetScrollPosition: false });
  }
  log("✓ Gestión de cuentas: ⋮ → hoja de opciones → hoja Eliminar cuenta (aviso solo en Eliminar definitivamente)");
}

// ---------- Paso 5: archivar pantallas antiguas ----------
async function step5() {
  let arch = figma.root.children.find((p) => p.name === "Archivo (versiones anteriores)");
  if (!arch) { arch = figma.createPage(); arch.name = "Archivo (versiones anteriores)"; }
  for (const id of ["1:1497", "9:307", "1:2194"]) {
    const n = await get(id);
    if (n) arch.appendChild(n);
  }
  log("✓ Pantallas antiguas movidas a la página «Archivo (versiones anteriores)»");
}

// ---------- Paso 6: ajuste al design.md ----------
const TOKENS = {
  "background": ["#F6F7F5", "#111517", ["FRAME_FILL", "SHAPE_FILL"]],
  "surface": ["#FFFFFF", "#1B2124", ["FRAME_FILL", "SHAPE_FILL"]],
  "surface-highlight": ["#FFFFFF", "#252C2F", ["FRAME_FILL", "SHAPE_FILL"]],
  "border": ["#E4E7E3", "#283034", ["STROKE_COLOR", "FRAME_FILL", "SHAPE_FILL"]],
  "border-highlight": ["#D5DDD6", "#3A4347", ["STROKE_COLOR", "FRAME_FILL", "SHAPE_FILL"]],
  "text-primary": ["#1F2622", "#EEF0EF", ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"]],
  "text-secondary": ["#6E7670", "#9AA3A6", ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"]],
  "primary": ["#4F7D5E", "#9CC8A9", ["ALL_FILLS", "STROKE_COLOR"]],
  "on-primary": ["#FFFFFF", "#102016", ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"]],
  "primary-container": ["#E4EEE6", "#253029", ["FRAME_FILL", "SHAPE_FILL"]],
  "on-primary-container": ["#2E4A37", "#CFE5D6", ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"]],
  "icon-container": ["#EEF2EE", "#252C2F", ["FRAME_FILL", "SHAPE_FILL"]],
  "icon-on-container": ["#4F7D5E", "#9CC8A9", ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"]],
  "income": ["#2E8B57", "#6FCF97", ["ALL_FILLS", "STROKE_COLOR"]],
  "expense": ["#D14B42", "#F28B82", ["ALL_FILLS", "STROKE_COLOR"]],
  "warning": ["#E08A4F", "#EDA06B", ["ALL_FILLS", "STROKE_COLOR"]],
};
const BG_TOKENS = new Set(["background", "surface", "surface-highlight", "primary-container", "icon-container"]);

async function ensureVariables() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  let col = cols.find((c) => c.name === "Finance App · Tokens");
  if (!col) col = figma.variables.createVariableCollection("Finance App · Tokens");
  const light = col.modes[0].modeId;
  col.renameMode(light, "Claro");
  // El plan Starter solo permite 1 modo: el valor oscuro queda en la descripción de cada token
  let dark = col.modes[1] ? col.modes[1].modeId : null;
  if (!dark) {
    try { dark = col.addMode("Oscuro"); } catch (e) { log("ℹ Plan Starter: solo 1 modo de variables. El valor oscuro queda en la descripción de cada token."); }
  }
  const existing = {};
  for (const id of col.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); existing[v.name] = v; }
  const vars = {};
  for (const [name, [l, d, scopes]] of Object.entries(TOKENS)) {
    const full = "color/" + name;
    const v = existing[full] || figma.variables.createVariable(full, col, "COLOR");
    v.setValueForMode(light, Object.assign(rgb(l), { a: 1 }));
    if (dark) v.setValueForMode(dark, Object.assign(rgb(d), { a: 1 }));
    v.description = `Claro ${l} · Oscuro ${d}`;
    v.scopes = scopes;
    vars[name] = v;
  }
  return vars;
}

function tokenFor(hex, node, isStroke) {
  const textLike = node.type === "TEXT" || node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION" || node.type === "STAR" || node.type === "POLYGON";
  const small = node.width <= 48 && node.height <= 48;
  switch (hex) {
    case "#f9faf5": case "#f3f4ef": case "#f6f7f5": return "background";
    case "#ffffff": return textLike ? "on-primary" : "surface";
    case "#e4eee6": case "#edffee": return "primary-container";
    case "#2e4a37": return "on-primary-container";
    case "#376447": case "#4f7d5e": case "#2563eb": return "primary";
    case "#1a1c1a": case "#1f2622": case "#2e312e": return "text-primary";
    case "#000000": return node.type === "TEXT" ? "text-primary" : null;
    case "#58605b": case "#414942": case "#6e7670": case "#717971": case "#767676": case "#6b7280": return "text-secondary";
    case "#c1c9c0": case "#e4e7e3": return "border";
    case "#dde5dd": case "#d5ddd6": case "#fde68a": case "#fbbf24": return "border-highlight";
    case "#eef2ee": return "icon-container";
    case "#edeeea": case "#e7e9e4": case "#e2e3de":
      if (isStroke || node.height <= 2 || /divider/i.test(node.name)) return "border";
      return small ? "icon-container" : "background";
    case "#ffdad6": return "background";
    case "#2e8b57": return "income";
    case "#d14b42": case "#ba1a1a": case "#93000a": case "#834a52": return "expense";
    case "#e08a4f": case "#d97706": return "warning";
  }
  return null;
}

function bindPaints(node, prop, vars, isStroke) {
  const list = node[prop];
  if (!Array.isArray(list) || !list.length) return null;
  let first = null;
  const out = list.map((p) => {
    if (p.type !== "SOLID") return p;
    const tok = tokenFor(hexOf(p.color), node, isStroke);
    if (!tok) return p;
    if (!first) first = tok;
    let opacity = p.opacity === undefined ? 1 : p.opacity;
    if (opacity > 0.01) opacity = 1; // sin transparencias (design.md)
    const base = { type: "SOLID", color: rgb(TOKENS[tok][0]), opacity, visible: p.visible !== false };
    return figma.variables.setBoundVariableForPaint(base, "color", vars[tok]);
  });
  node[prop] = out;
  return first;
}

const PROPER = new Set(["Visa", "Platinum", "Bancolombia", "Nu", "Nequi", "Davivienda", "Google", "ATH", "Netflix", "Spotify", "Carulla", "Julian", "Camilo", "Salvia", "Finance"]);
const PROPER_LOWER = new Map([...PROPER].map((w) => [w.toLowerCase(), w]));
const LETTERS = /[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g;

function sentenceCase(s) {
  let seen = false;
  return s.split(/(\s+)/).map((tok) => {
    if (/^\s*$/.test(tok)) return tok;
    const letters = tok.replace(LETTERS, "");
    if (!letters) return tok;
    if (!seen) { seen = true; return tok; }
    if (PROPER.has(letters)) return tok;
    if (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñü]+$/.test(letters)) return tok.replace(/[A-ZÁÉÍÓÚÑ]/, (c) => c.toLowerCase());
    return tok;
  }).join("");
}
function fromAllCaps(s) {
  const lower = s.toLowerCase().split(/(\s+)/).map((tok) => {
    const key = tok.replace(LETTERS, "");
    return PROPER_LOWER.has(key) ? tok.replace(key, PROPER_LOWER.get(key)) : tok;
  }).join("");
  return lower.replace(/[a-záéíóúñü]/, (c) => c.toUpperCase());
}
const EXACT = {
  "Tus Cuentas": "Tus cuentas",
  "Próximos Pagos\n(Proyectados)": "Próximos pagos",
  "Fecha y Hora": "Fecha y hora",
  "Café y Almuerzo": "Café y almuerzo",
  "Honorarios Asesoría": "Honorarios asesoría",
  "Retiro Cajero ATH": "Retiro cajero ATH",
  "Gestionar recurrentes\n→": "Gestionar recurrentes →",
  "Condiciones del Crédito": "Condiciones del crédito",
};

function isButtonLabel(t) {
  let p = t.parent;
  for (let i = 0; i < 4 && p && p.type !== "PAGE"; i++, p = p.parent) {
    if (/button|botón|bot[oó]n/i.test(p.name) && p.height >= 36) return true;
  }
  return false;
}

async function step6() {
  const vars = await ensureVariables();
  const page = figma.currentPage;
  let fills = 0, borders = 0, fx = 0, radii = 0, fonts = 0, cases = 0;

  for (const n of page.findAll(() => true)) {
    // Sombras y desenfoques fuera
    if ("effects" in n && n.effects.length && n.type !== "COMPONENT_SET") { n.effects = []; fx++; }

    // Colores → tokens
    let fillTok = null;
    if ("fills" in n && n.fills !== figma.mixed) { fillTok = bindPaints(n, "fills", vars, false); if (fillTok) fills++; }
    if ("strokes" in n) bindPaints(n, "strokes", vars, true);

    if (n.type === "FRAME") {
      // Encabezado y barra inferior: fondo sólido + borde de 1 px
      if (n.parent && n.parent.parent && n.parent.parent.type === "PAGE" && (n.name === "Header" || n.name === "Nav")) {
        n.fills = [figma.variables.setBoundVariableForPaint(solid(C.background), "color", vars["background"])];
        n.strokes = [figma.variables.setBoundVariableForPaint(solid(C.border), "color", vars["border"])];
        n.strokeAlign = "INSIDE";
        n.strokeTopWeight = n.name === "Nav" ? 1 : 0;
        n.strokeBottomWeight = n.name === "Header" ? 1 : 0;
        n.strokeLeftWeight = n.strokeRightWeight = 0;
        continue;
      }
      // Radios
      const r = n.cornerRadius;
      if (typeof r === "number") {
        if (r === 8 && n.height >= 32 && n.name !== "Tab") { n.cornerRadius = 12; radii++; }
        else if (r === 4) { n.cornerRadius = 9999; radii++; }
        else if (r === 16 && n.name === "Button" && Math.round(n.width) === 56) { n.cornerRadius = 14; radii++; }
      }
      // Superficies con borde de 1 px
      const hasStroke = Array.isArray(n.strokes) && n.strokes.some((s) => s.visible !== false);
      if (fillTok === "surface" && typeof n.cornerRadius === "number" && n.cornerRadius >= 8 && n.width >= 80 && !hasStroke) {
        n.strokes = [figma.variables.setBoundVariableForPaint(solid(C.border), "color", vars["border"])];
        n.strokeWeight = 1; n.strokeAlign = "INSIDE"; borders++;
      }
    }

    // Tipografía: solo 400 / 500, mayúscula inicial, signo menos tipográfico
    if (n.type === "TEXT") {
      if (n.fontName === figma.mixed) {
        for (const seg of n.getStyledTextSegments(["fontName"])) {
          if (seg.fontName.style === "Semi Bold" || seg.fontName.style === "Bold") {
            n.setRangeFontName(seg.start, seg.end, { family: seg.fontName.family, style: "Medium" }); fonts++;
          }
        }
        continue;
      }
      if (n.fontName.style === "Semi Bold" || n.fontName.style === "Bold") { n.fontName = { family: n.fontName.family, style: "Medium" }; fonts++; }
      let s = n.characters, ns = s;
      if (EXACT[s]) ns = EXACT[s];
      else if (/[A-ZÁÉÍÓÚÑ]{4,}/.test(s) && !/[a-záéíóúñ]/.test(s)) ns = fromAllCaps(s);
      else if ((n.parent && /^Heading/.test(n.parent.name)) || isButtonLabel(n)) ns = sentenceCase(s);
      ns = ns.replace(/-\$/g, "−$");
      if (ns !== s) { n.characters = ns; cases++; }
    }
  }

  // Tarjetas destacadas (saldo principal)
  for (const id of ["1:1012", "1:1994"]) {
    const h = await get(id);
    if (!h) continue;
    h.fills = [figma.variables.setBoundVariableForPaint(solid(C.surface), "color", vars["surface-highlight"])];
    h.strokes = [figma.variables.setBoundVariableForPaint(solid(C.borderHi), "color", vars["border-highlight"])];
    h.strokeWeight = 1; h.strokeAlign = "INSIDE";
    h.cornerRadius = 16;
  }

  // Elementos fijos al hacer scroll
  for (const f of page.children) {
    if (f.type !== "FRAME" || f.layoutMode !== "VERTICAL") continue;
    let k = 0;
    for (let i = f.children.length - 1; i >= 0 && f.children[i].layoutPositioning === "ABSOLUTE"; i--) k++;
    f.numberOfFixedChildren = k;
  }
  log(`✓ design.md: ${fills} colores enlazados a tokens (modo Claro/Oscuro), ${borders} bordes de 1 px, ${fx} sombras/desenfoques quitados, ${radii} radios, ${fonts} textos a peso 500, ${cases} textos corregidos`);
}

// ---------- Ejecución ----------
async function main() {
  figma.showUI(__html__, { width: 480, height: 380 });
  await figma.currentPage.loadAsync();
  if (!(await get("1:844")) || !(await get("1:997"))) {
    log("✗ No encuentro las pantallas de Finance App en esta página. Abre la página «Page 1» y vuelve a ejecutar.");
    return figma.ui.postMessage({ done: "No se aplicó ningún cambio." });
  }
  for (const style of ["Regular", "Medium", "Semi Bold", "Bold"]) await figma.loadFontAsync({ family: "Inter", style });

  let steps = [["Indicador mensual", step1], ["Agrupar por día", step2], ["Tarjeta de crédito", step3], ["Eliminar cuenta", step4], ["Archivar", step5], ["design.md", step6]];
  if (figma.root.children.some((p) => p.name === "Archivo (versiones anteriores)")) {
    // Los pasos 1-5 ya se aplicaron: solo se (re)aplica el ajuste al design.md, que no duplica nada
    log("ℹ Los pasos 1-5 ya estaban aplicados; ejecuto solo el ajuste al design.md.");
    steps = [["design.md", step6]];
  }
  let errors = 0;
  for (const [name, fn] of steps) {
    try { await fn(); } catch (e) { errors++; log(`✗ ${name}: ${e.message}`); }
  }
  figma.ui.postMessage({ done: errors ? `Terminado con ${errors} error(es). Copia el registro y pásamelo.` : "Listo. Todos los cambios aplicados." });
}

figma.ui.onmessage = (msg) => { if (msg === "close") figma.closePlugin(); };
main();
