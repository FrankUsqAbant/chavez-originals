// Genera una imagen WebP por cada modelo y color del hero.
//   fuentes : archive/hero-src/<modelo>.png   (recortes con fondo transparente)
//   spec    : src/data/hero-models.json
//   salida  : public/assets/aistudio/hero/<modelo>-<color>.webp
// Uso: npm run hero   (agrega --sheet para generar archive/work/hero-sheet.jpg de revisión)
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { hex2rgb, rgb2hsl, recolorAccent, recolorBody } from './lib/recolor.mjs';

const root = path.resolve(import.meta.dirname, '..');
const SRC = path.join(root, 'archive', 'hero-src');
const OUT = path.join(root, 'public', 'assets', 'aistudio', 'hero');
const spec = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'hero-models.json'), 'utf8'));
const HD = path.join(root, 'archive', 'hero-src-hd'); // versiones x4 con IA (si existen, se usan en vez de la fuente)
const MAX_WIDTH = 1100; // ancho máximo de salida (cubre pantallas de alta densidad)
const PRE_WIDTH = 1400; // las fuentes HD se reducen a este ancho antes de procesar

/* --------------------------------- pipeline -------------------------------- */
async function loadSource(file, cleanAlpha = false, { flip = false, rotate = 0 } = {}) {
  // flip: espejo horizontal (para que todas las zapatillas miren al mismo lado).
  // rotate: grados (horario +) para nivelar la suela; el fondo queda transparente.
  const hdFile = path.join(HD, `${path.parse(file).name}.webp`);
  const hd = existsSync(hdFile);
  const input = hd ? hdFile : path.join(SRC, file);
  let img = sharp(input).ensureAlpha();
  if (hd && (await sharp(input).metadata()).width > PRE_WIDTH) img = img.resize({ width: PRE_WIDTH, kernel: 'lanczos3' });
  if (flip) img = img.flop();
  if (rotate) img = img.rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
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
  return { data, info, hd, box: { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 } };
}

async function render({ data, info, box, hd }, recolor, target, outFile, toneLow, scale = 1) {
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
  if (scale > 1 && !hd) img = img.sharpen({ sigma: 0.7 }); // las fuentes HD ya traen detalle real
  await img
    .webp({ quality: 88, alphaQuality: 100, effort: 5 })
    .toFile(outFile);
}

mkdirSync(OUT, { recursive: true });
const made = [];
for (const [modelId, model] of Object.entries(spec)) {
  const src = await loadSource(model.source, model.cleanAlpha, { flip: model.flip, rotate: model.rotate });
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
