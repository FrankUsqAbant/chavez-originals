import { useEffect, useState } from 'react';

/**
 * Secuencias de giro 360° disponibles. Las genera `npm run spin` y quedan registradas en
 * public/assets/aistudio/spin/manifest.json:  { "<modelo>": { "frames": 24, "colors": ["red", ...] } }
 * Si un modelo no tiene secuencia, el hero muestra la foto fija.
 */
type Manifest = Record<string, { frames: number; colors: string[] }>;

let manifestPromise: Promise<Manifest> | null = null;
function loadManifest(): Promise<Manifest> {
  manifestPromise ??= fetch('/assets/aistudio/spin/manifest.json')
    .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : {}))
    .catch(() => ({}));
  return manifestPromise;
}

export const spinFrameUrl = (modelId: string, colorId: string, index: number) =>
  `/assets/aistudio/spin/${modelId}/${colorId}/${String(index + 1).padStart(2, '0')}.webp`;

/** URLs de los fotogramas de un modelo y color, o null si no hay giro disponible. */
export function useSpinFrames(modelId: string, colorId: string): string[] | null {
  const [manifest, setManifest] = useState<Manifest | null>(null);

  useEffect(() => {
    let alive = true;
    loadManifest().then((m) => alive && setManifest(m));
    return () => {
      alive = false;
    };
  }, []);

  const entry = manifest?.[modelId];
  if (!entry || !entry.colors.includes(colorId) || entry.frames < 2) return null;
  return Array.from({ length: entry.frames }, (_, i) => spinFrameUrl(modelId, colorId, i));
}
