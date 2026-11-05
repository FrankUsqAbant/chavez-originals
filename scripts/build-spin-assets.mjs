// Genera el giro 360° de un modelo a partir de fotos (o un video) tomadas girando la zapatilla.
//
//   npm run spin -- <modelo> [--frames 24]
//
// Entrada : archive/spin-src/<modelo>/  con fotos en orden (01.jpg, 02.jpg…) o un video .mp4/.mov (requiere ffmpeg).
//           Empieza con la zapatilla de perfil mirando a la DERECHA y gira una vuelta completa.
// Salida  : public/assets/aistudio/spin/<modelo>/<color>/NN.webp  +  manifest.json (todos los colores del modelo).
// Requiere: npm install -D @imgly/background-removal-node  (quita el fondo en tu PC; nada se sube a internet).
//           Si npm bloquea sharp, agrega a package.json:  "overrides": { "sharp": "$sharp" }
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { hex2rgb, recolorAccent, recolorBody, rgb2hsl } from './lib/recolor.mjs';

const root = path.resolve(import.meta.dirname, '..');
const OUT_WIDTH = 760;
const MIN_FRAMES = 8;

const model = process.argv[2];
const fi = process.argv.indexOf('--frames');
const wanted = fi > 0 ? Number(process.argv[fi + 1]) : 24;
const spec = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'hero-models.json'), 'utf8'));
const fail = (msg) => {
  console.error('\n' + msg + '\n');
  process.exit(1);
};

if (!model || !spec[model]) fail(`Indica un modelo válido: ${Object.keys(spec).join(', ')}\nEjemplo: npm run spin -- urban-low`);
const srcDir = path.join(root, 'archive', 'spin-src', model);
if (!existsSync(srcDir)) fail(`No existe ${path.relative(root, srcDir)}. Crea la carpeta y pon ahí las fotos o el video.`);

const IMG = /\.(jpe?g|png|webp)$/i;
const VID = /\.(mp4|mov|m4v|webm)$/i;
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true });

let files = readdirSync(srcDir).filter((f) => IMG.test(f)).sort(natural).map((f) => path.join(srcDir, f));
let tmp = null;
if (!files.length) {
  const video = readdirSync(srcDir).find((f) => VID.test(f));
  if (!video) fail(`${path.relative(root, srcDir)} no tiene fotos (.jpg/.png) ni video (.mp4/.mov).`);
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  } catch {
    fail('Para usar un video hace falta ffmpeg (winget install Gyan.FFmpeg). También puedes poner fotos sueltas en la carpeta.');
  }
  tmp = mkdtempSync(path.join(os.tmpdir(), 'spin-'));
  execFileSync('ffmpeg', ['-y', '-i', path.join(srcDir, video), '-vf', 'fps=10', path.join(tmp, 'f_%04d.png')], { stdio: 'ignore' });
  files = readdirSync(tmp).sort(natural).map((f) => path.join(tmp, f));
}
if (files.length < MIN_FRAMES) fail(`Se necesitan al menos ${MIN_FRAMES} fotos (recomendado 24 a 36); hay ${files.length}.`);

const n = Math.min(wanted, files.length);
const picked = Array.from({ length: n }, (_, i) => files[Math.floor((i * files.length) / n)]);
console.log(`${model}: ${files.length} imágenes de origen -> ${n} fotogramas`);

let removeBackground;
try {
  ({ removeBackground } = await import('@imgly/background-removal-node'));
} catch {
  fail('Falta el quitafondos local: npm install -D @imgly/background-removal-node\n(si npm bloquea sharp, agrega "overrides": { "sharp": "$sharp" } a package.json)');
}

// 1) Quitar el fondo de cada fotograma
const frames = [];
let dims = null;
for (const [i, file] of picked.entries()) {
  let img = sharp(file).rotate().resize({ width: 1400, withoutEnlargement: true });
  if (dims) img = img.resize(dims.w, dims.h, { fit: 'cover' });
  const input = await img.png().toBuffer();
  const blob = await removeBackground(new Blob([input], { type: 'image/png' }), { model: 'medium', output: { format: 'image/png', quality: 1 } });
  const { data, info } = await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  dims ??= { w: info.width, h: info.height };
  frames.push(data);
  process.stdout.write(`  fondo quitado ${i + 1}/${n}\r`);
}
console.log('');

// 2) Un solo encuadre para todos los fotogramas (si no, la zapatilla "saltaría" al girar)
const { w: W, h: H } = dims;
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (const data of frames) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] > 24) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}
const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.03);
const box = {
  left: Math.max(0, x0 - pad),
  top: Math.max(0, y0 - pad),
  width: Math.min(W, x1 + pad) - Math.max(0, x0 - pad),
  height: Math.min(H, y1 + pad) - Math.max(0, y0 - pad),
};

// 3) Un conjunto de fotogramas por color
const outRoot = path.join(root, 'public', 'assets', 'aistudio', 'spin');
rmSync(path.join(outRoot, model), { recursive: true, force: true });
const recolor = spec[model].kind === 'accent' ? recolorAccent : recolorBody;

for (const cw of spec[model].colorways) {
  const dir = path.join(outRoot, model, cw.id);
  mkdirSync(dir, { recursive: true });
  const [r, g, b] = hex2rgb(cw.hex);
  const target = rgb2hsl(r, g, b);
  for (const [i, original] of frames.entries()) {
    const buf = Buffer.from(original);
    if (!cw.original) {
      for (let p = 0; p < buf.length; p += 4) {
        if (buf[p + 3] === 0) continue;
        const [nr, ng, nb] = recolor([buf[p], buf[p + 1], buf[p + 2]], target, spec[model].toneLow);
        buf[p] = nr; buf[p + 1] = ng; buf[p + 2] = nb;
      }
    }
    await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
      .extract(box)
      .resize({ width: OUT_WIDTH, kernel: 'lanczos3' })
      .webp({ quality: 82, alphaQuality: 92, effort: 4 })
      .toFile(path.join(dir, `${String(i + 1).padStart(2, '0')}.webp`));
  }
  console.log(`  color ${cw.id}: ${n} fotogramas`);
}

// 4) Registro de modelos con giro
const manifestPath = path.join(outRoot, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
manifest[model] = { frames: n, colors: spec[model].colorways.map((c) => c.id) };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
if (tmp) rmSync(tmp, { recursive: true, force: true });
console.log(`Listo: giro 360° de ${model} publicado en public/assets/aistudio/spin/${model}`);
