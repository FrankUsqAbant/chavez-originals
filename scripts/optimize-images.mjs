// Convierte las imágenes originales de archive/originals a WebP en public/assets/aistudio.
// Uso: npm run images
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'archive', 'originals');
const OUT = path.join(root, 'public', 'assets', 'aistudio');

// Ancho máximo por tipo de imagen (px). El resto usa DEFAULT_WIDTH.
const WIDTHS = [
  { match: /^hero_model_|^punto_cleat/, width: 1000, quality: 84 }, // zapatillas aisladas (con alpha)
  { match: /^showroom_/, width: 1200, quality: 78 },
  { match: /^Chaves_Originals/, width: 1400, quality: 78 },
  { match: /^Logo/, width: 600, quality: 85 },
];
const DEFAULT = { width: 1200, quality: 80 };

await mkdir(OUT, { recursive: true });
// Las zapatillas del hero se generan aparte con `npm run hero` (una imagen por color).
// La fachada se procesa con `node scripts/build-facade.mjs`.
const HERO_SOURCES = /^(hero_model_|punto_cleat|Chaves_Originals)/;
const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|jfif)$/i.test(f) && !HERO_SOURCES.test(f));

let before = 0;
let after = 0;
for (const file of files) {
  const input = path.join(SRC, file);
  const output = path.join(OUT, `${path.parse(file).name}.webp`);
  const cfg = WIDTHS.find((w) => w.match.test(file)) ?? DEFAULT;

  try {
    await sharp(input)
      .rotate()
      .resize({ width: cfg.width, withoutEnlargement: true })
      .webp({ quality: cfg.quality, effort: 5 })
      .toFile(output);
    const [a, b] = [(await stat(input)).size, (await stat(output)).size];
    before += a;
    after += b;
    console.log(`${file.padEnd(40)} ${(a / 1024).toFixed(0).padStart(6)} KB -> ${(b / 1024).toFixed(0).padStart(5)} KB`);
  } catch (err) {
    console.error(`Error con ${file}:`, err.message);
    process.exitCode = 1;
  }
}
console.log(`\nTotal: ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB`);
