import heroSpec from './hero-models.json';

type ShoeSpec = Record<string, { colorways: { id: string; name: string; hex: string }[] }>;
const SHOES = heroSpec as ShoeSpec;

/** Imagen de un modelo en un color: `01` es la vista de perfil (la primera de `npm run spin`) y `thumb` su miniatura. */
export const shoeImage = (model: string, colorId: string, file: '01' | 'thumb' = '01') =>
  `/assets/aistudio/spin/${model}/${colorId}/${file}.webp`;

/** Colores de un producto, con la imagen correspondiente a cada uno. Si se pasan ids, respeta ese orden. */
const colorsFor = (model: string, ids?: string[]) => {
  const all = SHOES[model].colorways;
  const picked = ids ? ids.map((id) => all.find((c) => c.id === id)!) : all;
  return picked.map((c) => ({ name: c.name, hex: c.hex, previewImage: shoeImage(model, c.id) }));
};

export interface Product {
  id: string;
  name: string;
  code: string;
  /** Precio en soles. */
  price: number;
  /** Miniatura de la tarjeta del catálogo (la ficha usa `colors[].previewImage`). */
  image: string;
  badge?: string;
  description: string;
  sizes: number[];
  colors: { name: string; hex: string; previewImage?: string }[];
  features: string[];
  /** El pedido de WhatsApp menciona la promoción de mochila + canilleras + medias. */
  comboIncluded?: boolean;
}

// Los 3 modelos de la demo (precio, código, tallas y vistas confirmados en este archivo).
const BASE_PRODUCTS: Product[] = [
  {
    id: 'futbol-pro',
    name: 'Punto Original Fútbol Pro 2026',
    code: 'EM0099-M9',
    price: 189.0,
    image: shoeImage('futbol-pro', 'red', 'thumb'),
    badge: 'ALTA COMPETENCIA',
    description: 'Chimpún de alto rendimiento con tecnología de agarre dinámico y capellada microtexturizada para máxima precisión.',
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: colorsFor('futbol-pro'),
    features: [
      'Tracción que te impulsa en cualquier terreno',
      'Tobillera anatómica Dynamic Fit',
      'Capellada micro-nervada para golpeo preciso',
      'Incluye gratis: Mochila + Canilleras + Medias 3/4',
    ],
    comboIncluded: true,
  },
  {
    id: 'air-glow-tech',
    name: 'Punto Original Air Glow Tech',
    code: 'URB-AIR-026',
    price: 179.0,
    image: shoeImage('air-glow-tech', 'air-white', 'thumb'),
    badge: 'CÁPSULA AIR TECH',
    description: 'Cápsula de amortiguación translúcida verde esmeralda y suela esculpida para máximo confort durante el día.',
    sizes: [39, 40, 41, 42, 43, 44],
    colors: colorsFor('air-glow-tech'),
    features: [
      'Cámara de amortiguación visible con soporte elástico',
      'Material sintético transpirable anti-desgarro',
      'Plantilla ortopédica ergonómica memory foam',
      'Ideal para uso casual, universidad y entrenamiento ligero',
    ],
  },
  {
    id: 'chunky-lavender',
    name: 'Punto Original Chunky Lavender',
    code: 'URB-2026-CH',
    price: 169.0,
    image: shoeImage('chunky-lavender', 'chunky-lav', 'thumb'),
    badge: 'LÍNEA STREETWEAR',
    description: 'Zapatilla urbana de plataforma chunky ultraligera con amortiguación de cámara de aire y tonos tierra.',
    sizes: [38, 39, 40, 41, 42, 43],
    colors: colorsFor('chunky-lavender'),
    features: [
      'Tracción que te impulsa en pavimento urbano',
      'Resistencia ante uso diario intensivo',
      'Ligereza con suela de polímero EVA',
      'Silueta vanguardista con soporte anatómico',
    ],
  },
];

/**
 * Variante de color de un modelo: el mismo zapato en otro color, con el precio, las tallas y las
 * características del modelo base. El color elegido sale primero en la ficha.
 * DEMO: los códigos de variante (sufijo) son de ejemplo.
 */
const colorVariant = (baseId: string, model: string, colorId: string, codeSuffix: string): Product => {
  const base = BASE_PRODUCTS.find((p) => p.id === baseId)!;
  const all = SHOES[model].colorways;
  const color = all.find((c) => c.id === colorId)!;
  return {
    ...base,
    id: `${base.id}-${colorId}`,
    name: `${base.name} · ${color.name}`,
    code: `${base.code}-${codeSuffix}`,
    image: shoeImage(model, colorId, 'thumb'),
    badge: 'NUEVO COLOR',
    colors: colorsFor(model, [colorId, ...all.map((c) => c.id).filter((id) => id !== colorId)]),
  };
};

// Catálogo incluido en el sitio: 3 modelos + 7 variantes de color (10 productos), intercalados.
// Es el RESPALDO: el catálogo real se administra en Supabase (tabla `productos`, ver lib/products.ts) y esto solo
// se muestra si la base de datos no responde. Los datos iniciales de la tabla salieron de esta lista.
export const PRODUCTS: Product[] = [
  BASE_PRODUCTS[0], // Fútbol Pro 2026
  BASE_PRODUCTS[1], // Air Glow Tech
  BASE_PRODUCTS[2], // Chunky Lavender
  colorVariant('futbol-pro', 'futbol-pro', 'neon-green', 'VE'),
  colorVariant('air-glow-tech', 'air-glow-tech', 'air-emerald', 'ES'),
  colorVariant('chunky-lavender', 'chunky-lavender', 'chunky-mint', 'ME'),
  colorVariant('futbol-pro', 'futbol-pro', 'white', 'BL'),
  colorVariant('air-glow-tech', 'air-glow-tech', 'air-crimson', 'CA'),
  colorVariant('chunky-lavender', 'chunky-lavender', 'chunky-smoke', 'GR'),
  colorVariant('futbol-pro', 'futbol-pro', 'black', 'NE'),
];

export const STORE_INFO = {
  name: 'Chavez Originals',
  legalName: 'CHAVEZ ORIGINALS E.I.R.L.',
  // TODO: valor provisional. Confirmar el RUC real antes de publicar.
  ruc: '20601234567',
  address: 'Av. San Martín 736, Cajamarca, Perú',
  googleMapsUrl: 'https://maps.google.com/?q=Av.+San+Mart%C3%ADn+736,+Cajamarca,+Peru',
  whatsapp: '918902447',
  whatsappDisplay: '+51 918902447',
  // TODO: confirmar que el correo es real.
  email: 'contacto@chavezoriginals.pe',
  instagram: '@chavezoriginals_',
  instagramUrl: 'https://instagram.com/chavezoriginals_',
  slogan: 'Estilo que te impulsa, actitud que te define.',
};

/**
 * Redes sociales que aparecen en el afiche del negocio. Una red sin `url` no se muestra:
 * basta con pegar el enlace de la página para que aparezca en el pie de página.
 */
export const SOCIAL_LINKS: { id: 'instagram' | 'facebook' | 'tiktok' | 'youtube'; label: string; url: string }[] = [
  { id: 'instagram', label: 'Instagram', url: STORE_INFO.instagramUrl },
  { id: 'facebook', label: 'Facebook', url: '' },
  { id: 'tiktok', label: 'TikTok', url: '' },
  { id: 'youtube', label: 'YouTube', url: '' },
];

/** Provincias de la región Cajamarca (y La Libertad) adonde llegan los camiones de reparto ("Cerca de ti"). */
export const DELIVERY_PROVINCES = [
  'Cutervo',
  'Chota',
  'Santa Cruz',
  'Celendín',
  'San Pablo',
  'Cajabamba',
  'Huamachuco',
];
