import { formatClaimTicketCode } from './b2b-logic';

export type ClaimType = 'RECLAMO' | 'QUEJA';

export interface ClaimFormData {
  fullName: string;
  docType: string;
  docNumber: string;
  phone: string;
  email: string;
  address: string;
  goodType: string;
  amount: string;
  goodDescription: string;
  claimDetail: string;
  consumerRequest: string;
}

export interface StoredClaim {
  code: string;
  type: ClaimType;
  createdAt: string;
  data: ClaimFormData;
}

const STORAGE_KEY = 'chavez:claims:v1';
const MAX_STORED = 200;

export function loadClaims(): StoredClaim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Correlativo anual simple, local a este navegador (no es un registro oficial). */
export function nextClaimSequence(claims: StoredClaim[], type: ClaimType): number {
  const prefix = formatClaimTicketCode(type, 0).slice(0, 8); // p. ej. "REC-2026-"
  return claims.filter((c) => c.code.startsWith(prefix)).length + 1;
}

export function registerClaim(type: ClaimType, data: ClaimFormData, now = new Date()): StoredClaim {
  const claims = loadClaims();
  const code = formatClaimTicketCode(type, nextClaimSequence(claims, type));
  const claim: StoredClaim = { code, type, createdAt: now.toISOString(), data };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...claims, claim].slice(-MAX_STORED)));
  } catch {
    // Sin almacenamiento disponible: el envío por WhatsApp sigue funcionando.
  }
  return claim;
}

export function buildClaimMessage(claim: StoredClaim, legalName: string, ruc: string): string {
  const d = claim.data;
  const date = new Date(claim.createdAt).toLocaleString('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  });
  return [
    `📖 *HOJA DE RECLAMACIÓN VIRTUAL*`,
    `${legalName} (RUC ${ruc})`,
    `--------------------------------------`,
    `*N° de hoja:* ${claim.code}`,
    `*Fecha:* ${date}`,
    `*Tipo:* ${claim.type}`,
    ``,
    `*1. Consumidor*`,
    `Nombre: ${d.fullName}`,
    `${d.docType}: ${d.docNumber}`,
    `Teléfono: ${d.phone}`,
    `Correo: ${d.email}`,
    d.address ? `Domicilio: ${d.address}` : '',
    ``,
    `*2. Bien contratado*`,
    `Tipo: ${d.goodType}`,
    d.goodDescription ? `Descripción: ${d.goodDescription}` : '',
    d.amount ? `Monto reclamado: ${d.amount}` : '',
    ``,
    `*3. Detalle*`,
    d.claimDetail,
    ``,
    `*Pedido del consumidor:* ${d.consumerRequest}`,
  ]
    .filter((line, i, arr) => line !== '' || (arr[i - 1] !== '' && i !== 0))
    .join('\n');
}
