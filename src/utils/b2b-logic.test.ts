import { describe, expect, it } from 'vitest';
import {
  formatClaimTicketCode,
  formatPeruvianCurrency,
  generateWhatsAppOrderLink,
  getStoreStatus,
} from './b2b-logic';
import { buildClaimMessage, nextClaimSequence, type StoredClaim } from './claims';

describe('formatPeruvianCurrency', () => {
  it('formatea en soles', () => {
    const f = formatPeruvianCurrency(189);
    expect(f.startsWith('S/.')).toBe(true);
    expect(f).toContain('189');
  });
});

describe('generateWhatsAppOrderLink', () => {
  it('genera una URL wa.me con los datos del pedido', () => {
    const url = generateWhatsAppOrderLink({
      phone: '918902447',
      modelCode: 'EM0099-M9',
      modelName: 'Chavez Futbol Pro',
      size: 40,
      color: 'Rojo Furia',
      comboIncluded: true,
    });
    expect(url.startsWith('https://wa.me/51918902447?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('EM0099-M9'));
    expect(url).toContain(encodeURIComponent('Talla:* 40'));
    expect(url).toContain(encodeURIComponent('Rojo Furia'));
    expect(url).toContain(encodeURIComponent('Combo Gratis'));
  });

  it('no duplica el prefijo 51 ni incluye líneas vacías', () => {
    const url = generateWhatsAppOrderLink({ phone: '51918902447', modelCode: 'X', modelName: 'Y' });
    expect(url.startsWith('https://wa.me/51918902447?text=')).toBe(true);
    expect(decodeURIComponent(url)).not.toContain('Talla');
  });

  it('omite el código cuando el producto no lo tiene', () => {
    const url = generateWhatsAppOrderLink({ phone: '918902447', modelName: 'Punto Original Urban Low', size: 41 });
    const text = decodeURIComponent(url);
    expect(text).toContain('Punto Original Urban Low');
    expect(text).not.toContain('Cód');
  });
});

describe('claims', () => {
  it('formatClaimTicketCode genera códigos estándar', () => {
    expect(formatClaimTicketCode('RECLAMO', 42)).toMatch(/^REC-\d{4}-0042$/);
    expect(formatClaimTicketCode('QUEJA', 7)).toMatch(/^QUE-\d{4}-0007$/);
  });

  it('nextClaimSequence es correlativo por tipo', () => {
    const base = { type: 'RECLAMO' as const, createdAt: '', data: {} as StoredClaim['data'] };
    const claims: StoredClaim[] = [
      { ...base, code: formatClaimTicketCode('RECLAMO', 1) },
      { ...base, code: formatClaimTicketCode('RECLAMO', 2) },
      { ...base, type: 'QUEJA', code: formatClaimTicketCode('QUEJA', 1) },
    ];
    expect(nextClaimSequence(claims, 'RECLAMO')).toBe(3);
    expect(nextClaimSequence(claims, 'QUEJA')).toBe(2);
    expect(nextClaimSequence([], 'RECLAMO')).toBe(1);
  });

  it('buildClaimMessage incluye los datos clave', () => {
    const claim: StoredClaim = {
      code: 'REC-2026-0001',
      type: 'RECLAMO',
      createdAt: '2026-11-05T15:00:00.000Z',
      data: {
        fullName: 'Ana Quispe',
        docType: 'DNI',
        docNumber: '12345678',
        phone: '987654321',
        email: 'ana@example.com',
        address: '',
        goodType: 'PRODUCTO',
        amount: '189.00',
        goodDescription: 'Chimpún talla 41',
        claimDetail: 'Llegó con la suela despegada',
        consumerRequest: 'Cambio de producto',
      },
    };
    const msg = buildClaimMessage(claim, 'CHAVEZ ORIGINALS E.I.R.L.', '20000000000');
    expect(msg).toContain('REC-2026-0001');
    expect(msg).toContain('Ana Quispe');
    expect(msg).toContain('Cambio de producto');
    expect(msg).not.toContain('Domicilio');
  });
});

describe('getStoreStatus (hora de Lima, UTC-5)', () => {
  // 2026-11-04 es miércoles.
  it('abierto un miércoles a las 10:00', () => {
    const s = getStoreStatus(new Date('2026-11-04T15:00:00Z'));
    expect(s.isOpen).toBe(true);
    expect(s.detail).toContain('9:00 PM');
  });

  it('cerrado un miércoles a las 22:00', () => {
    const s = getStoreStatus(new Date('2026-11-05T03:00:00Z'));
    expect(s.isOpen).toBe(false);
    expect(s.detail).toContain('8:30 AM');
  });

  it('cerrado antes de abrir', () => {
    const s = getStoreStatus(new Date('2026-11-04T12:00:00Z')); // 07:00 Lima
    expect(s.isOpen).toBe(false);
    expect(s.detail).toContain('hoy');
  });

  it('domingo cierra a las 2:00 PM', () => {
    expect(getStoreStatus(new Date('2026-11-08T17:00:00Z')).isOpen).toBe(true); // dom 12:00
    expect(getStoreStatus(new Date('2026-11-08T20:00:00Z')).isOpen).toBe(false); // dom 15:00
  });
});
