import models from '../data/models-manifest.json';

/**
 * Modelos 3D (.glb) disponibles, registrados por `npm run model3d` en src/data/models-manifest.json:
 *   { "<modelo>": "<archivo>.glb" }
 * Si un modelo no tiene entrada, el hero usa las fotos (vistas/giro).
 */
const files = models as Record<string, string>;

/** URL del .glb del modelo, o null si no tiene modelo 3D. */
export const model3dUrl = (modelId: string): string | null =>
  files[modelId] ? `/assets/aistudio/models/${files[modelId]}` : null;
