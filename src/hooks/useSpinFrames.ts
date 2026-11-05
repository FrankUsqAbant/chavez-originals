import { useMemo } from 'react';
import manifest from '../data/spin-manifest.json';

/**
 * Vistas o giro disponibles por modelo. Las genera `npm run spin` y quedan registradas en
 * src/data/spin-manifest.json:  { "<modelo>": { "frames": 4, "colors": ["red", ...], "labels": ["Perfil", ...] } }
 * Con `labels` son vistas sueltas (miniaturas con nombre); sin `labels`, una secuencia de giro 360°.
 * Si un modelo no tiene entrada, el hero muestra la foto fija.
 */
type Manifest = Record<string, { frames: number; colors: string[]; labels?: string[] }>;
const entries = manifest as Manifest;

export interface SpinData {
  frames: string[];
  labels?: string[];
}

export const spinFrameUrl = (modelId: string, colorId: string, index: number) =>
  `/assets/aistudio/spin/${modelId}/${colorId}/${String(index + 1).padStart(2, '0')}.webp`;

/** Imágenes de un modelo y color, o null si no hay vistas disponibles. */
export function useSpinFrames(modelId: string, colorId: string): SpinData | null {
  // Memoizado: el visor precarga por identidad del arreglo, no debe cambiar en cada render.
  return useMemo(() => {
    const entry = entries[modelId];
    if (!entry || !entry.colors.includes(colorId) || entry.frames < 2) return null;
    return {
      frames: Array.from({ length: entry.frames }, (_, i) => spinFrameUrl(modelId, colorId, i)),
      labels: entry.labels,
    };
  }, [modelId, colorId]);
}
