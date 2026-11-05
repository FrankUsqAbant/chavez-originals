// Optimiza un modelo 3D (.glb) y lo publica para el hero.
//
//   npm run model3d -- <modelo> <ruta/al/archivo.glb>
//
// Ejemplo: npm run model3d -- futbol-pro C:\descargas\zapatilla.glb
// Hace: elimina duplicados, une vértices, reduce polígonos (máx. ~80 000 triángulos) y comprime las
// texturas a WebP de 1024 px. Objetivo: menos de ~3 MB para que cargue rápido en el celular.
// Salida: public/assets/aistudio/models/<modelo>.glb  +  src/data/models-manifest.json
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

const root = path.resolve(import.meta.dirname, '..');
const [model, input] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'hero-models.json'), 'utf8'));
const fail = (msg) => {
  console.error('\n' + msg + '\n');
  process.exit(1);
};

if (!model || !spec[model]) fail(`Indica un modelo válido: ${Object.keys(spec).join(', ')}\nEjemplo: npm run model3d -- futbol-pro C:\\descargas\\zapatilla.glb`);
if (!input || !existsSync(input)) fail('Indica la ruta de un archivo .glb existente.');
if (!/\.glb$/i.test(input)) fail('El archivo debe ser .glb (si tienes .gltf, .obj o .fbx, expórtalo a .glb desde Blender o la web de origen).');

const MAX_TRIANGLES = 80_000;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);

const triangles = () =>
  doc.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((s, p) => s + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION')?.getCount() ?? 0) / 3, 0), 0);

const before = { tri: Math.round(triangles()), kb: Math.round(statSync(input).size / 1024) };
await MeshoptSimplifier.ready;

const steps = [dedup(), weld()];
if (before.tri > MAX_TRIANGLES) steps.push(simplify({ simplifier: MeshoptSimplifier, ratio: MAX_TRIANGLES / before.tri, error: 0.002 }));
steps.push(prune(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 }));
await doc.transform(...steps);

const outDir = path.join(root, 'public', 'assets', 'aistudio', 'models');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${model}.glb`);
await io.write(outFile, doc);

// Copia del original (no se versiona) para poder regenerar
const srcDir = path.join(root, 'archive', 'models-src');
mkdirSync(srcDir, { recursive: true });
copyFileSync(input, path.join(srcDir, `${model}.glb`));

const manifestPath = path.join(root, 'src', 'data', 'models-manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
manifest[model] = `${model}.glb`;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const after = { tri: Math.round(triangles()), kb: Math.round(statSync(outFile).size / 1024) };
console.log(`${model}: ${before.tri} -> ${after.tri} triángulos | ${before.kb} KB -> ${after.kb} KB`);
if (after.kb > 3500) console.warn('Aviso: pesa más de 3.5 MB. Prueba con un modelo de menos polígonos o texturas más simples.');
console.log(`Listo: public/assets/aistudio/models/${model}.glb`);
