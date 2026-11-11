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
    name: 'Punto Orito Fútbol Pro 2026',
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
    name: 'Punto Orito Air Glow Tech',
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
    name: 'Punto Orito Chunky Lavender',
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
  name: 'Clavez Originals',
  legalName: 'CLAVEZ ORIGINALS S.A.C.',
  // DEMO: RUC de demostración (dígito verificador inválido a propósito: no pertenece a ninguna empresa).
  ruc: '20612345670',
  address: 'Av. San Martín 7399, Cajamarca, Perú',
  googleMapsUrl: 'https://maps.google.com/?q=Av.+San+Mart%C3%ADn+7399,+Cajamarca,+Peru',
  whatsapp: '975713580',
  whatsappDisplay: '+51 975713580',
  email: 'usquizafranquer@gmail.com',
  instagram: '@abantofrank12',
  instagramUrl: 'https://instagram.com/abantofrank12',
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

/**
 * Opiniones de clientes.
 * DEMO (portafolio): opiniones INVENTADAS para mostrar el diseño (`ejemplo: true`). Se ven en local y en el build
 * publicado con VITE_DEMO_RESENAS=true; en un build normal no se publican.
 */
export const REVIEWS: { name: string; place: string; text: string; product?: string; ejemplo?: boolean }[] = [
  {
    name: 'Diego P.',
    place: 'Cajamarca',
    text: 'Giré el chimpún en la web, lo vi en verde y lo pedí por WhatsApp. Al día siguiente lo recogí en la tienda, igualito a la foto. Ya lo estrené en el campeonato del barrio.',
    product: 'Fútbol Pro 2026',
    ejemplo: true,
  },
  {
    name: 'Andrea V.',
    place: 'Celendín',
    text: 'La guía de tallas en centímetros me salvó: medí mi pie y me quedaron perfectas. Llegaron por agencia en dos días.',
    product: 'Air Glow Tech',
    ejemplo: true,
  },
  {
    name: 'Jorge L.',
    place: 'Chota · tienda mayorista',
    text: 'Cada mes surto mi tienda con ellos. El pedido es claro por WhatsApp y el camión llega cuando dicen.',
    ejemplo: true,
  },
  {
    name: 'Kiara M.',
    place: 'Cajamarca',
    text: 'Las Chunky en menta son lo más: livianas y combinan con todo. Me atendieron súper bien en la tienda.',
    product: 'Chunky Lavender',
    ejemplo: true,
  },
];
