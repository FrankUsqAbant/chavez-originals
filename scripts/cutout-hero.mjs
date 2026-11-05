// Recorte de fondo de las fotos del hero (modelo local, nada se sube a internet).
// Uso puntual, fuera del proyecto:
//   1. mkdir %TEMP%\bgr; cd %TEMP%\bgr; npm init -y
//   2. agregar a package.json: "overrides": { "sharp": "^0.35.5" }
//   3. npm install @imgly/background-removal-node
//   4. copiar este archivo ahí, ajustar las rutas y ejecutar: node cutout-hero.mjs
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const P = 'C:/dev/Lunes/01/Pagina 01/';
const SRC = P + 'archive/hero-src/';
mkdirSync(SRC, { recursive: true });

const jobs = [
  {
    name: 'chunky-lavender',
    src: P + 'archive/originals/showroom_chunky_16x9.jpg',
    crop: { left: 120, top: 133, width: 1138, height: 484 },
  },
  {
    name: 'velocity-silver',
    src: P + 'archive/unused/shoes_band.png',
    crop: { left: 1450, top: 70, width: 700, height: 520 },
    // el zapato vecino (3.Âº de la foto) asoma por la izquierda: se pinta de blanco antes de segmentar
    whiteout: { left: 0, top: 0, width: 175, height: 295 },
  },
];

for (const j of jobs) {
  let img = sharp(j.src).extract(j.crop);
  if (j.whiteout) {
    const patch = await sharp({
      create: { width: j.whiteout.width, height: j.whiteout.height, channels: 3, background: '#ffffff' },
    }).png().toBuffer();
    img = sharp(await img.png().toBuffer()).composite([{ input: patch, left: j.whiteout.left, top: j.whiteout.top }]);
  }
  const png = await img.png().toBuffer();
  const blob = await removeBackground(new Blob([png], { type: 'image/png' }), {
    model: 'medium',
    output: { format: 'image/png', quality: 1 },
  });
  const out = Buffer.from(await blob.arrayBuffer());
  writeFileSync(SRC + `${j.name}.png`, out);

  const meta = await sharp(out).metadata();
  const dark = await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: '#0b1410' } })
    .composite([{ input: out }]).jpeg({ quality: 88 }).toBuffer();
  writeFileSync(P + `archive/work/${j.name}_preview.jpg`, dark);
  console.log(j.name, meta.width + 'x' + meta.height);
}

// Fuentes que ya estaban bien: se copian tal cual para que el pipeline sea Ãºnico.
copyFileSync(P + 'archive/originals/punto_cleat_isolated.png', SRC + 'futbol-pro.png');
copyFileSync(P + 'archive/originals/hero_model_urban_low.png', SRC + 'urban-low.png');
copyFileSync(P + 'archive/originals/hero_model_air_glow_tech.png', SRC + 'air-glow-tech.png');
console.log('fuentes listas');

