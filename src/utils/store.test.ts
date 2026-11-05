import { describe, expect, it } from 'vitest';
import {
  formatPeruvianCurrency,
  generateWhatsAppOrderLink,
  getStoreStatus,
} from './store';
import { buildClaimMessage, provisionalCode, type ClaimRecord } from './claims';

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
  it('provisionalCode no se parece a un número oficial', () => {
    const code = provisionalCode(new Date('2026-11-05T12:00:00Z'), () => 0.123456789);
    expect(code).toMatch(/^PROV-2026-[0-9A-Z]{1,6}$/);
    expect(code).not.toMatch(/^(REC|QUE)-/);
  });

  const baseClaim: ClaimRecord = {
    code: 'REC-2026-0001',
    type: 'RECLAMO',
    createdAt: '2026-11-05T15:00:00.000Z',
    saved: true,
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

  it('buildClaimMessage incluye los datos clave', () => {
    const msg = buildClaimMessage(baseClaim, 'CHAVEZ ORIGINALS E.I.R.L.', '20000000000');
    expect(msg).toContain('N° de hoja:* REC-2026-0001');
    expect(msg).toContain('Ana Quispe');
    expect(msg).toContain('Cambio de producto');
    expect(msg).not.toContain('Domicilio');
  });

  it('buildClaimMessage marca el número como provisional si no se guardó en línea', () => {
    const msg = buildClaimMessage({ ...baseClaim, code: 'PROV-2026-ABC123', saved: false }, 'X', '1');
    expect(msg).toContain('N° provisional');
    expect(msg).toContain('PROV-2026-ABC123');
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
