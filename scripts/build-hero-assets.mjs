// Genera una imagen WebP por cada modelo y color del hero.
//   fuentes : archive/hero-src/<modelo>.png   (recortes con fondo transparente)
//   spec    : src/data/hero-models.json
//   salida  : public/assets/aistudio/hero/<modelo>-<color>.webp
// Uso: npm run hero   (agrega --sheet para generar archive/work/hero-sheet.jpg de revisión)
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const SRC = path.join(root, 'archive', 'hero-src');
const OUT = path.join(root, 'public', 'assets', 'aistudio', 'hero');
const spec = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'hero-models.json'), 'utf8'));
const MAX_WIDTH = 1000;

/* ------------------------------ color helpers ------------------------------ */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const hex2rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  let h = 0, s = 0;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hsl2rgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(clamp(v) * 255));
}
const mix = (a, b, w) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * w));

/* ------------------------------ recolor modes ------------------------------ */
// "body": zapatos blancos/plata/crema. Se recolorea todo lo neutro (poco saturado)
// y se respetan los acentos saturados (azul marino, verde, morado...).
function recolorBody(px, [th, ts, tl], toneLow = 0.5) {
  const [, s, l] = rgb2hsl(...px);
  const w = 1 - smooth(0.2, 0.42, s);
  if (w < 0.01) return px;
  // u: posición del píxel dentro del rango tonal real del zapato (sombra 0 → brillo 1).
  // Estirar ese rango es lo que conserva el volumen al cambiar de color.
  // toneLow: lightness de las sombras del modelo (más bajo en fotos más oscuras).
  const u = clamp((l - toneLow) / (1 - toneLow), 0, 1);
  let nl, ns;
  if (tl < 0.3) { nl = tl * 0.6 + 0.3 * Math.pow(u, 1.5); ns = Math.min(ts, 0.25); }         // oscuros
  else if (tl > 0.88) { nl = 0.55 + 0.42 * Math.pow(l, 1.4); ns = 0.04; }                  // blanco
  else {                                                                                     // color
    // Los colores claros (pasteles) necesitan un piso de luminosidad más alto para no verse saturados.
    const floor = 0.4 + 0.4 * smooth(0.55, 0.8, tl);
    nl = tl * (floor + (1.1 - floor) * Math.pow(u, 1.2));
    nl += (1 - nl) * 0.3 * smooth(0.85, 1, u);                                               // brillo especular
    ns = ts * (1 - 0.35 * smooth(0.75, 1, nl));
  }
  return mix(px, hsl2rgb(th, ns, nl), w);
}

// "accent": el color del modelo está en las partes rojas (chimpún rojo y negro).
function recolorAccent(px, [th, ts, tl]) {
  const [h, s, l] = rgb2hsl(...px);
  const redDist = Math.min(h, 1 - h);
  const w = smooth(0.12, 0.38, s) * (1 - smooth(0.1, 0.17, redDist));
  if (w < 0.01) return px;
  let ns, nl;
  if (tl > 0.88) { ns = 0.05; nl = clamp(0.45 + l * 0.95, 0, 0.97); }
  else if (tl < 0.3) { ns = 0.06; nl = l * 0.28 + 0.02; }
  else { ns = clamp(s * (ts / 0.8), 0, 1); nl = clamp(l * (tl / 0.5), 0, 0.95); }
  return mix(px, hsl2rgb(th, ns, nl), w);
}

/* --------------------------------- pipeline -------------------------------- */
async function loadSource(file, cleanAlpha = false) {
  const { data, info } = await sharp(path.join(SRC, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (cleanAlpha) {
    // Apertura morfológica del alfa: borra hilos y restos finos (rayos de luz, pelusa) y suaviza el borde.
    const mask = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .extractChannel(3)
      .blur(3)
      .threshold(128)
      .blur(0.8)
      .raw()
      .toBuffer();
    for (let i = 0; i < mask.length; i++) data[i * 4 + 3] = Math.min(data[i * 4 + 3], mask[i]);
  }
  // caja que contiene el zapato (alpha visible) + 2 % de margen
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 24) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  x1 = Math.min(info.width - 1, x1 + pad); y1 = Math.min(info.height - 1, y1 + pad);
  return { data, info, box: { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 } };
}

async function render({ data, info, box }, recolor, target, outFile, toneLow, scale = 1) {
  const buf = Buffer.from(data); // copia
  if (recolor) {
    for (let i = 0; i < buf.length; i += 4) {
      if (buf[i + 3] === 0) continue;
      const [r, g, b] = recolor([buf[i], buf[i + 1], buf[i + 2]], target, toneLow);
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
    }
  }
  // `scale` > 1 amplía fuentes de poca resolución (con un enfoque leve para compensar).
  const width = Math.min(Math.round(box.width * scale), MAX_WIDTH);
  let img = sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract(box)
    .resize({ width, kernel: 'lanczos3' });
  if (scale > 1) img = img.sharpen({ sigma: 0.7 });
  await img
    .webp({ quality: 88, alphaQuality: 100, effort: 5 })
    .toFile(outFile);
}

mkdirSync(OUT, { recursive: true });
const made = [];
for (const [modelId, model] of Object.entries(spec)) {
  const src = await loadSource(model.source, model.cleanAlpha);
  const recolor = model.kind === 'accent' ? recolorAccent : recolorBody;
  for (const cw of model.colorways) {
    const [r, g, b] = hex2rgb(cw.hex);
    const file = path.join(OUT, `${modelId}-${cw.id}.webp`);
    await render(src, cw.original ? null : recolor, rgb2hsl(r, g, b), file, model.toneLow, model.scale);
    made.push({ modelId, cw, file });
  }
  console.log(`${modelId}: ${model.colorways.length} colores`);
}

if (process.argv.includes('--sheet')) {
  const T = 300, H = 230;
  const rows = Object.keys(spec);
  const maxCols = Math.max(...rows.map((m) => spec[m].colorways.length));
  const comps = [];
  for (const { modelId, cw, file } of made) {
    const row = rows.indexOf(modelId);
    const col = spec[modelId].colorways.indexOf(cw);
    const img = await sharp(file).resize(T - 20, H - 40, { fit: 'inside' }).toBuffer();
    const label = Buffer.from(`<svg width="${T}" height="22" xmlns="http://www.w3.org/2000/svg"><text x="8" y="15" font-size="12" fill="#0f6" font-family="Arial">${cw.name.replace(/&/g, '&amp;')}</text></svg>`);
    comps.push({ input: img, left: col * T + 10, top: row * H + 10 }, { input: label, left: col * T, top: row * H + H - 24 });
  }
  mkdirSync(path.join(root, 'archive', 'work'), { recursive: true });
  await sharp({ create: { width: maxCols * T, height: rows.length * H, channels: 3, background: '#0b1410' } })
    .composite(comps)
    .jpeg({ quality: 88 })
    .toFile(path.join(root, 'archive', 'work', 'hero-sheet.jpg'));
  console.log('hoja de revisión: archive/work/hero-sheet.jpg');
}
