// Limpia y mejora la foto de la fachada (captura de Street View de baja resolución):
//  - recorta la marca de agua de Google, retira el pin y el parche gris del letrero
//  - amplía x2 con enfoque y un leve ajuste de color
// Fuente: archive/originals/Chaves_Originals_61e42aa8.jpg  →  public/assets/aistudio/Chaves_Originals_61e42aa8.webp
// Una foto real de la tienda tomada con celular siempre se verá mejor que esto.
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const SRC = path.join(root, 'archive', 'originals', 'Chaves_Originals_61e42aa8.jpg');
const OUT = path.join(root, 'public', 'assets', 'aistudio', 'Chaves_Originals_61e42aa8.webp');

// 1) sin la franja inferior (marca de agua "© Google")
let base = await sharp(SRC).extract({ left: 0, top: 0, width: 447, height: 398 }).png().toBuffer();

// 2) parches: copian una zona vecina y la funden con bordes suaves
async function patch(buf, from, to, { feather = 5, shape = 'rect' } = {}) {
  const { width: w, height: h } = from;
  const src = await sharp(buf).extract(from).blur(1.2).removeAlpha().raw().toBuffer();
  const shapeSvg =
    shape === 'ellipse'
      ? `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - feather}" ry="${h / 2 - feather}" fill="#fff"/>`
      : `<rect x="${feather}" y="${feather}" width="${w - feather * 2}" height="${h - feather * 2}" fill="#fff"/>`;
  const mask = await sharp(
    Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#000"/>${shapeSvg}</svg>`,
    ),
  )
    .blur(feather)
    .extractChannel(0)
    .raw()
    .toBuffer();
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = src[i * 3];
    rgba[i * 4 + 1] = src[i * 3 + 1];
    rgba[i * 4 + 2] = src[i * 3 + 2];
    rgba[i * 4 + 3] = mask[i];
  }
  const piece = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  return sharp(buf).composite([{ input: piece, left: to.left, top: to.top }]).png().toBuffer();
}

// pin de Google sobre la puerta (se copia la zona oscura de la izquierda, más grande que el pin)
base = await patch(base, { left: 168, top: 181, width: 84, height: 92 }, { left: 237, top: 181 }, { shape: 'ellipse', feather: 6 });
// parche gris sobre el letrero negro (se copia el letrero de la izquierda)
base = await patch(base, { left: 100, top: 76, width: 50, height: 34 }, { left: 160, top: 76 }, { feather: 1.5 });
// "© 20…" de la marca de agua sobre el letrero
base = await patch(base, { left: 28, top: 98, width: 48, height: 24 }, { left: 34, top: 126 }, { feather: 4 });

// 3) ampliación, nitidez y color
await sharp(base)
  .resize({ width: 894, kernel: 'lanczos3' })
  .sharpen({ sigma: 0.9, m1: 1.2 })
  .modulate({ saturation: 1.12, brightness: 1.03 })
  .linear(1.06, -3)
  .webp({ quality: 86, effort: 5 })
  .toFile(OUT);

console.log('fachada lista:', path.relative(root, OUT));
