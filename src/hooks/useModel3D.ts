import { useEffect, useState } from 'react';

/**
 * Modelos 3D (.glb) disponibles, registrados por `npm run model3d` en
 * public/assets/aistudio/models/manifest.json:  { "<modelo>": "<archivo>.glb" }
 * Si un modelo no tiene entrada, el hero usa las fotos (vistas/giro).
 */
type Manifest = Record<string, string>;

let manifestPromise: Promise<Manifest> | null = null;
function loadManifest(): Promise<Manifest> {
  manifestPromise ??= fetch('/assets/aistudio/models/manifest.json')
    .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : {}))
    .catch(() => ({}));
  return manifestPromise;
}

/** URL del .glb del modelo, o null si no tiene modelo 3D. */
export function useModel3D(modelId: string): string | null {
  const [manifest, setManifest] = useState<Manifest | null>(null);

  useEffect(() => {
    let alive = true;
    loadManifest().then((m) => alive && setManifest(m));
    return () => {
      alive = false;
    };
  }, []);

  const file = manifest?.[modelId];
  return file ? `/assets/aistudio/models/${file}` : null;
}
