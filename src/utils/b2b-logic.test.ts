import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWholesaleQuote,
  formatPeruvianCurrency,
  generateWhatsAppOrderLink,
  formatClaimTicketCode,
  getRouteLogistics,
} from './b2b-logic';

test('calculateWholesaleQuote applies correct discount tiers', () => {
  // Test tier 12 pairs: 30% discount
  const quote12 = calculateWholesaleQuote(12, 189.00);
  assert.equal(quote12.discountPercentage, 30);
  assert.equal(quote12.unitWholesalePrice, 132.30);
  assert.equal(quote12.totalInvestment, 1587.60);
  assert.equal(quote12.suggestedTotalRevenue, 2268.00);
  assert.equal(quote12.estimatedProfit, 680.40);
  assert.equal(quote12.marginPercentage, 30);

  // Test tier 48+ pairs: 42% discount
  const quote50 = calculateWholesaleQuote(50, 200.00);
  assert.equal(quote50.discountPercentage, 42);
  assert.equal(quote50.unitWholesalePrice, 116.00);
  assert.equal(quote50.totalInvestment, 5800.00);
});

test('formatPeruvianCurrency formats PEN amounts properly', () => {
  const formatted = formatPeruvianCurrency(189.00);
  assert.ok(formatted.includes('189'));
  assert.ok(formatted.startsWith('S/.'));
});

test('generateWhatsAppOrderLink creates valid wa.me URL with all parameters', () => {
  const url = generateWhatsAppOrderLink({
    phone: '918902447',
    clientName: 'Tienda Deportes Cajamarca',
    modelCode: 'EM0099-M9',
    modelName: 'Chavez Futbol Pro',
    size: 40,
    quantity: 12,
    comboIncluded: true,
    isB2B: true,
  });

  assert.ok(url.startsWith('https://wa.me/51918902447?text='));
  assert.ok(url.includes(encodeURIComponent('EM0099-M9')));
  assert.ok(url.includes(encodeURIComponent('12 pares')));
  assert.ok(url.includes(encodeURIComponent('Tienda Deportes Cajamarca')));
});

test('formatClaimTicketCode generates standard Peruvian claim codes', () => {
  const code = formatClaimTicketCode('RECLAMO', 42);
  assert.match(code, /^REC-\d{4}-0042$/);

  const quejaCode = formatClaimTicketCode('QUEJA', 7);
  assert.match(quejaCode, /^QUE-\d{4}-0007$/);
});

test('getRouteLogistics resolves Cajamarca cities', () => {
  const chota = getRouteLogistics('Chota');
  assert.equal(chota.status, 'Activa');
  assert.ok(chota.averageTime.includes('horas'));

  const cutervo = getRouteLogistics('Cutervo');
  assert.equal(cutervo.status, 'Activa');
});
