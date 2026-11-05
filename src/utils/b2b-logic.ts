/**
 * Utilidades de pedido y horario de Chavez Originals.
 * Funciones puras de formato y cálculo, sin dependencias de UI.
 */

export function formatPeruvianCurrency(amount: number): string {
  return `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface WhatsAppOrderParams {
  phone: string; // e.g., '918902447'
  modelCode?: string;
  modelName: string;
  size?: number | string;
  color?: string;
  comboIncluded?: boolean;
  notes?: string;
}

export function generateWhatsAppOrderLink(params: WhatsAppOrderParams): string {
  const cleanPhone = params.phone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

  const lines = [
    `⚡ *NUEVO PEDIDO - CHAVEZ ORIGINALS*`,
    `--------------------------------------`,
    `👟 *Producto:* ${params.modelName}${params.modelCode ? ` (Cód: ${params.modelCode})` : ''}`,
    params.color ? `🎨 *Color:* ${params.color}` : '',
    params.size ? `📏 *Talla:* ${params.size}` : '',
    params.comboIncluded ? `🎁 *Promoción:* Combo Gratis (Mochila + Canilleras + Medias 3/4)` : '',
    `📍 *Tienda:* Av. San Martín 736, Cajamarca`,
    params.notes ? `📝 *Observaciones:* ${params.notes}` : '',
    `--------------------------------------`,
    `¡Hola! Vi su catálogo web y deseo coordinar la compra y disponibilidad.`,
  ].filter(Boolean);

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
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
