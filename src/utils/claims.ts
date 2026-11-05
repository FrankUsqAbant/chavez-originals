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

export interface ClaimRecord {
  code: string;
  type: ClaimType;
  createdAt: string;
  data: ClaimFormData;
  /** true si la hoja ya quedó guardada en el servidor (con número oficial). */
  saved: boolean;
}

/** Número provisional cuando no se pudo guardar en línea. No se parece al oficial (REC-/QUE-). */
export function provisionalCode(now = new Date(), random: () => number = Math.random): string {
  return `PROV-${now.getFullYear()}-${random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function buildClaimMessage(claim: ClaimRecord, legalName: string, ruc: string): string {
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
    claim.saved
      ? `*N° de hoja:* ${claim.code}`
      : `*N° provisional:* ${claim.code} (pendiente de registro en la tienda)`,
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
