export interface Product {
  id: string;
  name: string;
  code: string;
  category: 'futbol' | 'urbano' | 'combo';
  price: number;
  image: string;
  badge?: string;
  description: string;
  sizes: number[];
  colors: { name: string; hex: string; previewImage?: string }[];
  features: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'chavez-futbol-em0099',
    name: 'Punto Original Fútbol Pro 2026',
    code: 'EM0099-M9',
    category: 'futbol',
    price: 189.00,
    image: '/assets/aistudio/showroom_cleat.webp',
    badge: 'ALTA COMPETENCIA',
    description: 'Chimpún de alto rendimiento con tecnología de agarre dinámico y capellada microtexturizada para máxima precisión.',
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Rojo Furia', hex: '#e51e2b' },
      { name: 'Verde Neón Chavez', hex: '#00ff66' },
      { name: 'Menta Glow', hex: '#6ee7b7' },
      { name: 'Blanco Lunar', hex: '#f8fafc' },
      { name: 'Negro Stealth', hex: '#18181b' },
    ],
    features: [
      'Tracción que te impulsa en cualquier terreno',
      'Tobillera anatómica Dynamic Fit',
      'Capellada micro-nervada para golpeo preciso',
      'Incluye gratis: Mochila + Canilleras + Medias 3/4',
    ],
  },
  {
    id: 'combo-campo-pro',
    name: 'Combo Campo: Chimpún + Accesorios',
    code: 'CMB-CAMPO-01',
    category: 'combo',
    price: 189.00,
    image: '/assets/aistudio/showroom_cleat.webp',
    badge: 'COMBO COMPLETO',
    description: 'Chimpún oficial Punto Original acompañado de mochila deportiva, canilleras protectoras y medias de compresión 3/4.',
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Rojo Fuego', hex: '#e51e2b' },
      { name: 'Verde Eléctrico', hex: '#00ff66' },
    ],
    features: [
      '1x Chimpunes de alta competencia',
      '1x Mochila deportiva Punto Original reforzada',
      '1x Par de Canilleras ergonómicas de alto impacto',
      '1x Par de Medias 3/4 de alto rendimiento',
    ],
  },
  {
    id: 'urbana-chavez-street',
    name: 'Punto Original Urban Chunky',
    code: 'URB-2026-CH',
    category: 'urbano',
    price: 169.00,
    image: '/assets/aistudio/showroom_chunky_16x9.webp',
    badge: 'LÍNEA STREETWEAR',
    description: 'Zapatilla urbana de plataforma chunky ultraligera con amortiguación de cámara de aire y tonos tierra.',
    sizes: [38, 39, 40, 41, 42, 43],
    colors: [
      { name: 'Lavanda & Crema', hex: '#d8b4e2' },
      { name: 'Blanco Total', hex: '#ffffff' },
      { name: 'Negro Street', hex: '#1e293b' },
    ],
    features: [
      'Tracción que te impulsa en pavimento urbano',
      'Resistencia ante uso diario intensivo',
      'Ligereza con suela de polímero EVA',
      'Silueta vanguardista con soporte anatómico',
    ],
  },
  {
    id: 'urbana-chavez-air-glow',
    name: 'Punto Original Air Glow',
    code: 'URB-AIR-026',
    category: 'urbano',
    price: 179.00,
    image: '/assets/aistudio/showroom_airglow_16x9.webp',
    badge: 'CÁPSULA AIR TECH',
    description: 'Cápsula de amortiguación translúcida verde esmeralda y suela esculpida para máximo confort durante el día.',
    sizes: [39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Plata & Esmeralda', hex: '#00ff66' },
      { name: 'Carmesí Fuego', hex: '#ef4444' },
      { name: 'Stealth Black', hex: '#18181b' },
    ],
    features: [
      'Cámara de amortiguación visible con soporte elástico',
      'Material sintético transpirable anti-desgarre',
      'Plantilla ortopédica ergonómica memory foam',
      'Ideal para uso casual, universidad y entrenamiento ligero',
    ],
  },
  {
    id: 'urbana-stealth-runner',
    name: 'Punto Original Stealth Runner',
    code: 'STH-2026-BLK',
    category: 'urbano',
    price: 159.00,
    image: '/assets/aistudio/showroom_stealth_sideprofile.webp',
    badge: 'HIGH PERFORMANCE',
    description: 'Silueta aerodinámica monocromo con suela esculpida de polímero EVA y capellada transpirable.',
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Negro Stealth', hex: '#18181b' },
      { name: 'Plata Lunar', hex: '#cbd5e1' },
    ],
    features: [
      'Malla técnica transpirable de alta resistencia',
      'Suela amortiguada con agarre antideslizante',
      'Diseño ultra ligero para máximo rendimiento',
      'Plantilla acolchada anti-fatiga',
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
