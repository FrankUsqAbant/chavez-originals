import { useEffect, useMemo, useState } from 'react';

/**
 * Vistas o giro disponibles por modelo. Las genera `npm run spin` y quedan registradas en
 * public/assets/aistudio/spin/manifest.json:
 *   { "<modelo>": { "frames": 4, "colors": ["red", ...], "labels": ["Perfil", "Frente", ...] } }
 * Con `labels` son vistas sueltas (miniaturas con nombre); sin `labels`, una secuencia de giro 360°.
 * Si un modelo no tiene entrada, el hero muestra la foto fija.
 */
type Manifest = Record<string, { frames: number; colors: string[]; labels?: string[] }>;

export interface SpinData {
  frames: string[];
  labels?: string[];
}

let manifestPromise: Promise<Manifest> | null = null;
function loadManifest(): Promise<Manifest> {
  manifestPromise ??= fetch('/assets/aistudio/spin/manifest.json')
    .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : {}))
    .catch(() => ({}));
  return manifestPromise;
}

export const spinFrameUrl = (modelId: string, colorId: string, index: number) =>
  `/assets/aistudio/spin/${modelId}/${colorId}/${String(index + 1).padStart(2, '0')}.webp`;

/** Imágenes de un modelo y color, o null si no hay vistas disponibles. */
export function useSpinFrames(modelId: string, colorId: string): SpinData | null {
  const [manifest, setManifest] = useState<Manifest | null>(null);

  useEffect(() => {
    let alive = true;
    loadManifest().then((m) => alive && setManifest(m));
    return () => {
      alive = false;
    };
  }, []);

  const entry = manifest?.[modelId];
  const available = Boolean(entry && entry.colors.includes(colorId) && entry.frames >= 2);

  // Memoizado: el visor precarga por identidad del arreglo, no debe cambiar en cada render.
  return useMemo(
    () =>
      available && entry
        ? {
            frames: Array.from({ length: entry.frames }, (_, i) => spinFrameUrl(modelId, colorId, i)),
            labels: entry.labels,
          }
        : null,
    [available, entry, modelId, colorId],
  );
}
