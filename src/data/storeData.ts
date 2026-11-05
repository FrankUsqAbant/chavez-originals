import heroSpec from './hero-models.json';

type ShoeSpec = Record<string, { colorways: { id: string; name: string; hex: string }[] }>;
const SHOES = heroSpec as ShoeSpec;

/** Imagen sin fondo de un modelo en un color (generada con `npm run hero`). */
const shoeImage = (model: string, colorId: string) => `/assets/aistudio/hero/${model}-${colorId}.webp`;

/** Colores de un producto, con la imagen correspondiente a cada uno. Si se pasan ids, respeta ese orden. */
const colorsFor = (model: string, ids?: string[]) => {
  const all = SHOES[model].colorways;
  const picked = ids ? ids.map((id) => all.find((c) => c.id === id)!) : all;
  return picked.map((c) => ({ name: c.name, hex: c.hex, previewImage: shoeImage(model, c.id) }));
};

export interface Product {
  id: string;
  name: string;
  /** Código interno. Opcional: si falta, el pedido de WhatsApp no lo incluye. */
  code?: string;
  /** Precio en soles. Si falta, la tienda muestra "Consultar precio". */
  price?: number;
  image: string;
  badge?: string;
  description: string;
  sizes: number[];
  colors: { name: string; hex: string; previewImage?: string }[];
  features: string[];
  /** El pedido de WhatsApp menciona la promoción de mochila + canilleras + medias. */
  comboIncluded?: boolean;
}

// Un producto por modelo, en el mismo orden y con los mismos nombres que el hero.
// TODO: confirmar precios, tallas y características de Urban Low y Velocity Silver (sin precio todavía).
export const PRODUCTS: Product[] = [
  {
    id: 'futbol-pro',
    name: 'Punto Original Fútbol Pro 2026',
    code: 'EM0099-M9',
    price: 189.0,
    image: shoeImage('futbol-pro', 'red'),
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
    id: 'urban-low',
    name: 'Punto Original Urban Low',
    image: shoeImage('urban-low', 'urban-white'),
    badge: 'LÍNEA STREETWEAR',
    description: 'Silueta urbana de perfil bajo y líneas limpias. Cuero sintético reforzado de alta durabilidad con suela cosida antideslizante para el día a día.',
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: colorsFor('urban-low'),
    features: [
      'Perfil bajo y líneas limpias',
      'Cuero sintético reforzado de alta durabilidad',
      'Suela cosida antideslizante',
      'Ideal para el día a día',
    ],
  },
  {
    id: 'air-glow-tech',
    name: 'Punto Original Air Glow Tech',
    code: 'URB-AIR-026',
    price: 179.0,
    image: shoeImage('air-glow-tech', 'air-white'),
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
    image: shoeImage('chunky-lavender', 'chunky-lav'),
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
  {
    id: 'velocity-silver',
    name: 'Punto Original Velocity Silver',
    image: shoeImage('velocity-silver', 'velocity-silver'),
    badge: 'SPORT ACTIVE',
    description: 'Zapatilla multideportiva ultraligera con malla transpirable antidesgarro y suela de tracción multidireccional para respuesta inmediata.',
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: colorsFor('velocity-silver'),
    features: [
      'Malla transpirable antidesgarro',
      'Suela de tracción multidireccional',
      'Ultraligera y multideportiva',
      'Respuesta inmediata en cada paso',
    ],
  },
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
};
