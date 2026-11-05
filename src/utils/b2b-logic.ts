/**
 * B2B & E-Commerce Logic for Chavez Originals
 * Pure calculation and formatting utilities.
 */

export interface WholesaleQuote {
  tierName: string;
  pairs: number;
  unitRetailPrice: number;
  discountPercentage: number;
  unitWholesalePrice: number;
  totalInvestment: number;
  suggestedTotalRevenue: number;
  estimatedProfit: number;
  marginPercentage: number;
}

export const WHOLESALE_TIERS = [
  { minPairs: 6, maxPairs: 11, discount: 0.20, name: 'Emprendedor Inicial' },
  { minPairs: 12, maxPairs: 23, discount: 0.30, name: 'Media Docena por Modelo' },
  { minPairs: 24, maxPairs: 47, discount: 0.35, name: 'Caja Completa Mayorista' },
  { minPairs: 48, maxPairs: 9999, discount: 0.42, name: 'Distribuidor Regional' },
];

export function calculateWholesaleQuote(pairs: number, unitRetailPrice = 189.00): WholesaleQuote {
  const safePairs = Math.max(1, Math.floor(pairs));
  const tier = WHOLESALE_TIERS.slice().reverse().find(t => safePairs >= t.minPairs) || {
    minPairs: 1,
    maxPairs: 5,
    discount: 0.10,
    name: 'Pedido Menor (Descuento Base)',
  };

  const discountPercentage = Math.round(tier.discount * 100);
  const unitWholesalePrice = Number((unitRetailPrice * (1 - tier.discount)).toFixed(2));
  const totalInvestment = Number((unitWholesalePrice * safePairs).toFixed(2));
  const suggestedTotalRevenue = Number((unitRetailPrice * safePairs).toFixed(2));
  const estimatedProfit = Number((suggestedTotalRevenue - totalInvestment).toFixed(2));
  const marginPercentage = Number(((estimatedProfit / suggestedTotalRevenue) * 100).toFixed(1));

  return {
    tierName: tier.name,
    pairs: safePairs,
    unitRetailPrice,
    discountPercentage,
    unitWholesalePrice,
    totalInvestment,
    suggestedTotalRevenue,
    estimatedProfit,
    marginPercentage,
  };
}

export function formatPeruvianCurrency(amount: number): string {
  return `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface WhatsAppOrderParams {
  phone: string; // e.g., '918902447'
  clientName?: string;
  city?: string;
  modelCode: string;
  modelName: string;
  size?: number | string;
  color?: string;
  quantity?: number;
  isB2B?: boolean;
  comboIncluded?: boolean;
  notes?: string;
}

export function generateWhatsAppOrderLink(params: WhatsAppOrderParams): string {
  const cleanPhone = params.phone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

  const greeting = params.isB2B
    ? `🤝 *SOLICITUD DE PEDIDO MAYORISTA B2B - CHAVEZ ORIGINALS*`
    : `⚡ *NUEVO PEDIDO B2C - CHAVEZ ORIGINALS*`;

  const lines = [
    greeting,
    `--------------------------------------`,
    `👟 *Producto:* ${params.modelName} (Cód: ${params.modelCode})`,
    params.color ? `🎨 *Color:* ${params.color}` : '',
    params.size ? `📏 *Talla:* ${params.size}` : '',
    params.quantity ? `📦 *Cantidad:* ${params.quantity} pares` : '',
    params.comboIncluded ? `🎁 *Promoción:* Combo Gratis (Mochila + Canilleras + Medias 3/4)` : '',
    params.clientName ? `👤 *Cliente:* ${params.clientName}` : '',
    params.city ? `📍 *Destino / Ciudad:* ${params.city}` : `📍 *Tienda:* Av. San Martín 736, Cajamarca`,
    params.notes ? `📝 *Observaciones:* ${params.notes}` : '',
    `--------------------------------------`,
    `¡Hola! Vi su catálogo web y deseo coordinar la compra y disponibilidad.`,
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${internationalPhone}?text=${message}`;
}

export function formatClaimTicketCode(type: 'RECLAMO' | 'QUEJA', sequence: number): string {
  const prefix = type === 'RECLAMO' ? 'REC' : 'QUE';
  const padded = String(sequence).padStart(4, '0');
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${padded}`;
}

export interface RouteLogisticsInfo {
  destination: string;
  frequency: string;
  averageTime: string;
  status: 'Activa' | 'En tránsito' | 'Programada';
  activeHub: string;
}

export const NORTH_PERU_ROUTES: Record<string, RouteLogisticsInfo> = {
  'CAJAMARCA': {
    destination: 'Cajamarca Centro & Distritos',
    frequency: 'Diaria continua (Despacho exprés)',
    averageTime: '17 - 25 min',
    status: 'Activa',
    activeHub: 'Av. San Martín 736 (Hub Principal)',
  },
  'CHOTA': {
    destination: 'Chota y alrededores',
    frequency: 'Salidas diarias 06:00 AM y 02:00 PM',
    averageTime: '3.5 - 4 horas',
    status: 'Activa',
    activeHub: 'Corredor Norte Chota',
  },
  'CUTERVO': {
    destination: 'Cutervo',
    frequency: 'Lunes a Sábado',
    averageTime: '4.5 - 5 horas',
    status: 'Activa',
    activeHub: 'Agencia Cutervo Express',
  },
  'CELENDIN': {
    destination: 'Celendín',
    frequency: 'Diario 3 frecuencias',
    averageTime: '2.5 - 3 horas',
    status: 'Activa',
    activeHub: 'Ruta Cordillera Oriental',
  },
  'CAJABAMBA': {
    destination: 'Cajabamba & San Marcos',
    frequency: 'Diario continuo',
    averageTime: '2.5 - 3 horas',
    status: 'Activa',
    activeHub: 'Eje Sur Cajamarca',
  },
  'JAEN': {
    destination: 'Jaén / San Ignacio',
    frequency: 'Diario interprovincial',
    averageTime: '6 - 7 horas',
    status: 'En tránsito',
    activeHub: 'Nororiente Selva',
  },
};

export function getRouteLogistics(destination: string): RouteLogisticsInfo {
  const key = destination.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return NORTH_PERU_ROUTES[key] || {
    destination,
    frequency: 'Coordinación con agencia interprovincial',
    averageTime: '24 horas',
    status: 'Programada',
    activeHub: 'Hub Central Cajamarca',
  };
}

/* -------------------------------------------------------------------------- */
/* Horario de atención (zona horaria de Lima)                                  */
/* -------------------------------------------------------------------------- */

/** 0 = domingo … 6 = sábado. Horas en minutos desde las 00:00. */
export const STORE_SCHEDULE: Record<number, { open: number; close: number }> = {
  0: { open: 9 * 60, close: 14 * 60 },
  1: { open: 8 * 60 + 30, close: 21 * 60 },
  2: { open: 8 * 60 + 30, close: 21 * 60 },
  3: { open: 8 * 60 + 30, close: 21 * 60 },
  4: { open: 8 * 60 + 30, close: 21 * 60 },
  5: { open: 8 * 60 + 30, close: 21 * 60 },
  6: { open: 8 * 60 + 30, close: 21 * 60 },
};

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export interface StoreStatus {
  isOpen: boolean;
  /** Texto corto para badges: "Abierto ahora" / "Cerrado ahora". */
  badge: string;
  /** Texto con detalle: "Cierra a las 9:00 PM" / "Abre mañana a las 8:30 AM". */
  detail: string;
}

export function formatMinutes(total: number): string {
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function limaClock(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}

export function getStoreStatus(now: Date = new Date()): StoreStatus {
  const { day, minutes } = limaClock(now);
  const today = STORE_SCHEDULE[day];

  if (minutes >= today.open && minutes < today.close) {
    return {
      isOpen: true,
      badge: 'Abierto ahora',
      detail: `Cierra a las ${formatMinutes(today.close)}`,
    };
  }

  if (minutes < today.open) {
    return { isOpen: false, badge: 'Cerrado ahora', detail: `Abre hoy a las ${formatMinutes(today.open)}` };
  }

  const nextDay = (day + 1) % 7;
  return {
    isOpen: false,
    badge: 'Cerrado ahora',
    detail: `Abre mañana (${DAY_NAMES[nextDay]}) a las ${formatMinutes(STORE_SCHEDULE[nextDay].open)}`,
  };
}
