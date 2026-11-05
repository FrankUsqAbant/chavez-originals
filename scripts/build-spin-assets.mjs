// Genera el visor de ángulos / giro 360° de un modelo.
//
//   npm run spin -- <modelo> [--frames 24]
//
// Carpeta de origen: archive/spin-src/<modelo>/  (una de dos):
//   A) VISTAS: fotos sueltas + views.json  { "views": [ { "file": "01-perfil.jpg", "label": "Perfil", "flip": false }, … ] }
//      El orden del archivo es el orden del visor. La primera vista (Perfil) también se usa como foto
//      principal del modelo (archive/hero-src/<modelo>.png → npm run hero).
//   B) GIRO: 24–36 fotos (o un video, requiere ffmpeg) tomadas girando la zapatilla una vuelta completa.
//
// Salida: public/assets/aistudio/spin/<modelo>/<color>/NN.webp  +  manifest.json (todos los colores del modelo).
// Requiere @imgly/background-removal-node (quita el fondo en tu PC; nada se sube a internet).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { hex2rgb, recolorAccent, recolorBody, rgb2hsl } from './lib/recolor.mjs';

const root = path.resolve(import.meta.dirname, '..');
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
if (!existsSync(srcDir)) fail(`No existe ${path.relative(root, srcDir)}. Crea la carpeta con las fotos (y views.json si son vistas sueltas).`);

let removeBackground;
try {
  ({ removeBackground } = await import('@imgly/background-removal-node'));
} catch {
  fail('Falta el quitafondos local: npm install -D @imgly/background-removal-node\n(si npm bloquea sharp, agrega "overrides": { "sharp": "$sharp" } a package.json)');
}

/* ------------------------------- utilidades ------------------------------- */
async function removeBg(png) {
  const blob = await removeBackground(new Blob([png], { type: 'image/png' }), {
    model: 'medium',
    output: { format: 'image/png', quality: 1 },
  });
  return Buffer.from(await blob.arrayBuffer());
}

function alphaBox(data, W, H, thr = 24) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] > thr) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

const outRoot = path.join(root, 'public', 'assets', 'aistudio', 'spin');
const recolor = spec[model].kind === 'accent' ? recolorAccent : recolorBody;

/** Un conjunto de fotogramas WebP por cada color del modelo. `frames` = buffers RGBA crudos de W×H. */
async function writeColorSets(frames, W, H, { box = null, width = 1000 } = {}) {
  rmSync(path.join(outRoot, model), { recursive: true, force: true });
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
      let img = sharp(buf, { raw: { width: W, height: H, channels: 4 } });
      if (box) img = img.extract(box);
      await img
        .resize({ width, kernel: 'lanczos3' })
        .webp({ quality: 86, alphaQuality: 95, effort: 4 })
        .toFile(path.join(dir, `${String(i + 1).padStart(2, '0')}.webp`));
    }
    console.log(`  color ${cw.id}: ${frames.length} imágenes`);
  }
}

function updateManifest(entry) {
  const manifestPath = path.join(outRoot, 'manifest.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
  manifest[model] = { ...entry, colors: spec[model].colorways.map((c) => c.id) };
  mkdirSync(outRoot, { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/* ------------------------------ modo A: vistas ----------------------------- */
const viewsFile = path.join(srcDir, 'views.json');
if (existsSync(viewsFile)) {
  const { views } = JSON.parse(readFileSync(viewsFile, 'utf8'));
  const cutDir = path.join(root, 'archive', 'views-cut', model); // caché de recortes (no se versiona)
  mkdirSync(cutDir, { recursive: true });
  const CW = 1000, CH = 660;

  // Plano de 1 canal (alfa) -> desenfoque + umbral. Devuelve siempre 1 byte por píxel.
  async function plane(buf, W, H, blur, thr) {
    const { data, info } = await sharp(buf, { raw: { width: W, height: H, channels: 1 } })
      .blur(blur)
      .threshold(thr)
      .toColourspace('b-w')
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (info.channels === 1) return data;
    const out = Buffer.alloc(W * H);
    for (let i = 0; i < W * H; i++) out[i] = data[i * info.channels];
    return out;
  }

  // El quitafondos confunde el cuero blanco con el fondo blanco y deja huecos transparentes dentro del zapato.
  // Se cierra la silueta, se detecta qué parte del "fondo" está encerrada (no toca el borde) y se rellena
  // con los píxeles reales de la foto.
  async function repairCutout(cutBuf, cropBuf) {
    const cut = await sharp(cutBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H } = cut.info;
    const rgb = await sharp(cropBuf).removeAlpha().resize(W, H, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
    const a = Buffer.alloc(W * H);
    for (let i = 0; i < W * H; i++) a[i] = cut.data[i * 4 + 3];

    const R = Math.max(4, Math.round(Math.max(W, H) * 0.006));
    const dilated = await plane(a, W, H, R, 30); // expande
    const closed = await plane(dilated, W, H, R, 225); // contrae: cierra grietas finas

    // fondo alcanzable desde el borde de la imagen
    const outside = new Uint8Array(W * H);
    const stack = new Int32Array(W * H);
    let sp = 0;
    const push = (i) => {
      if (!outside[i] && closed[i] === 0) { outside[i] = 1; stack[sp++] = i; }
    };
    for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
    for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
    while (sp) {
      const i = stack[--sp], x = i % W, y = (i / W) | 0;
      if (x > 0) push(i - 1);
      if (x < W - 1) push(i + 1);
      if (y > 0) push(i - W);
      if (y < H - 1) push(i + W);
    }
    // Distancia (en píxeles) al fondo exterior, hasta D. Solo se rellenan huecos a >= D del exterior:
    // así no se endurece el borde suave del contorno.
    const D = 14;
    const dist = new Uint8Array(W * H).fill(255);
    let head = 0, tail = 0;
    for (let i = 0; i < W * H; i++) if (outside[i]) { dist[i] = 0; stack[tail++] = i; }
    while (head < tail) {
      const i = stack[head++], d = dist[i];
      if (d >= D) continue;
      const x = i % W, y = (i / W) | 0;
      const visit = (j) => { if (dist[j] === 255) { dist[j] = d + 1; stack[tail++] = j; } };
      if (x > 0) visit(i - 1);
      if (x < W - 1) visit(i + 1);
      if (y > 0) visit(i - W);
      if (y < H - 1) visit(i + W);
    }

    const rc = rgb.info.channels;
    const out = Buffer.from(cut.data);
    for (let i = 0; i < W * H; i++) {
      if (!outside[i] && dist[i] >= D && cut.data[i * 4 + 3] < 255) {
        out[i * 4] = rgb.data[i * rc];
        out[i * 4 + 1] = rgb.data[i * rc + 1];
        out[i * 4 + 2] = rgb.data[i * rc + 2];
        out[i * 4 + 3] = 255;
      }
    }
    return sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  }

  // Recorte en dos pasadas: la primera ubica la zapatilla; la segunda trabaja solo sobre ella, con más resolución.
  async function cutout(file) {
    const src = path.join(srcDir, file);
    const cache = path.join(cutDir, path.parse(file).name + '.v4.png');
    if (existsSync(cache) && statSync(cache).mtimeMs > statSync(src).mtimeMs) return cache;
    const meta = await sharp(src).metadata();
    const small = await sharp(src).resize({ width: 1400, withoutEnlargement: true }).png().toBuffer();
    const c1 = await sharp(await removeBg(small)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = alphaBox(c1.data, c1.info.width, c1.info.height);
    if (!b) fail(`No se detectó la zapatilla en ${file}`);
    const k = meta.width / c1.info.width;
    const m = Math.round(Math.max(b.w, b.h) * 0.06);
    const left = Math.max(0, Math.round((b.x0 - m) * k));
    const top = Math.max(0, Math.round((b.y0 - m) * k));
    const width = Math.min(meta.width - left, Math.round((b.w + 2 * m) * k));
    const height = Math.min(meta.height - top, Math.round((b.h + 2 * m) * k));
    const crop = await sharp(src).extract({ left, top, width, height }).resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
    await sharp(await repairCutout(await removeBg(crop), crop)).toFile(cache);
    return cache;
  }

  const frames = [];
  for (const [i, v] of views.entries()) {
    process.stdout.write(`  recortando ${i + 1}/${views.length}: ${v.label}\n`);
    const cache = await cutout(v.file);
    let img = sharp(cache).ensureAlpha();
    if (v.flip) img = img.flop();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const bb = alphaBox(data, info.width, info.height);
    const trimmed = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .extract({ left: bb.x0, top: bb.y0, width: bb.w, height: bb.h })
      .png()
      .toBuffer();

    // La primera vista (Perfil) es también la foto principal del modelo (hero, catálogo y ficha).
    if (i === 0) {
      mkdirSync(path.join(root, 'archive', 'hero-src'), { recursive: true });
      await sharp(trimmed).toFile(path.join(root, 'archive', 'hero-src', spec[model].source));
    }

    // Todas las vistas en el mismo lienzo para que el visor no "salte" de tamaño
    const scale = Math.min((CW * 0.92) / bb.w, (CH * 0.92) / bb.h);
    const tw = Math.round(bb.w * scale), th = Math.round(bb.h * scale);
    const piece = await sharp(trimmed).resize(tw, th, { kernel: 'lanczos3' }).png().toBuffer();
    frames.push(
      await sharp({ create: { width: CW, height: CH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: piece, left: Math.round((CW - tw) / 2), top: Math.round((CH - th) / 2) }])
        .raw()
        .toBuffer(),
    );
  }

  await writeColorSets(frames, CW, CH, { width: CW });
  updateManifest({ frames: frames.length, labels: views.map((v) => v.label) });
  console.log(`Listo: ${frames.length} vistas de ${model} (${views.map((v) => v.label).join(', ')})`);
  process.exit(0);
}

/* ------------------------------ modo B: giro 360° --------------------------- */
const MIN_FRAMES = 8;
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

const spinFrames = [];
let dims = null;
for (const [i, file] of picked.entries()) {
  let img = sharp(file).rotate().resize({ width: 1400, withoutEnlargement: true });
  if (dims) img = img.resize(dims.w, dims.h, { fit: 'cover' });
  const cut = await removeBg(await img.png().toBuffer());
  const { data, info } = await sharp(cut).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  dims ??= { w: info.width, h: info.height };
  spinFrames.push(data);
  process.stdout.write(`  fondo quitado ${i + 1}/${n}\r`);
}
console.log('');

// Un solo encuadre para todos los fotogramas (si no, la zapatilla "saltaría" al girar)
const { w: W, h: H } = dims;
let ux0 = W, uy0 = H, ux1 = 0, uy1 = 0;
for (const data of spinFrames) {
  const bb = alphaBox(data, W, H);
  if (!bb) continue;
  ux0 = Math.min(ux0, bb.x0); uy0 = Math.min(uy0, bb.y0); ux1 = Math.max(ux1, bb.x1); uy1 = Math.max(uy1, bb.y1);
}
const pad = Math.round(Math.max(ux1 - ux0, uy1 - uy0) * 0.03);
const box = {
  left: Math.max(0, ux0 - pad),
  top: Math.max(0, uy0 - pad),
  width: Math.min(W, ux1 + pad) - Math.max(0, ux0 - pad),
  height: Math.min(H, uy1 + pad) - Math.max(0, uy0 - pad),
};
await writeColorSets(spinFrames, W, H, { box, width: 760 });
updateManifest({ frames: n });
if (tmp) rmSync(tmp, { recursive: true, force: true });
console.log(`Listo: giro 360° de ${model} publicado en public/assets/aistudio/spin/${model}`);
