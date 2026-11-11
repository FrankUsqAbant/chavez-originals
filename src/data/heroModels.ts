import heroSpec from './hero-models.json';

export interface SneakerColorway {
  id: string;
  name: string;
  hex: string;
  /** Color de la foto original (el modelo 3D no se tiñe). */
  original?: boolean;
}

export interface HeroModel {
  id: string;
  name: string;
  modelTag: string;
  price: string;
}

/** Colores de cada modelo: viven en hero-models.json (los usan también el catálogo y `npm run spin`). */
export const COLORWAYS = Object.fromEntries(
  Object.entries(heroSpec).map(([id, m]) => [id, m.colorways as SneakerColorway[]]),
) as Record<string, SneakerColorway[]>;

/** Los 3 colores más llamativos de cada modelo (los mismos que muestra el catálogo). */
export const HERO_COLORS: Record<string, string[]> = {
  'futbol-pro': ['red', 'neon-green', 'white'],
  'air-glow-tech': ['air-white', 'air-emerald', 'air-crimson'],
  'chunky-lavender': ['chunky-lav', 'chunky-mint', 'chunky-smoke'],
};

/** Los modelos del hero (mismos precios que el catálogo de respaldo en storeData.ts). */
export const HERO_MODELS: HeroModel[] = [
  { id: 'futbol-pro', name: 'Punto Original Fútbol Pro 2026', modelTag: 'Fútbol Pro 2026', price: 'S/ 189' },
  { id: 'air-glow-tech', name: 'Punto Original Air Glow Tech', modelTag: 'Air Glow Tech', price: 'S/ 179' },
  { id: 'chunky-lavender', name: 'Punto Original Chunky Lavender', modelTag: 'Chunky Lavender', price: 'S/ 169' },
];
