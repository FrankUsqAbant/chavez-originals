// Recoloreo de zapatillas (compartido por build-hero-assets.mjs y build-spin-assets.mjs).
// "body": zapatos blancos/plata/crema. "accent": el color está en las partes rojas (chimpún).

/* ------------------------------ color helpers ------------------------------ */
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const hex2rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  let h = 0, s = 0;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
export function hsl2rgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(clamp(v) * 255));
}
export const mix = (a, b, w) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * w));

/* ------------------------------ recolor modes ------------------------------ */
// "body": zapatos blancos/plata/crema. Se recolorea todo lo neutro (poco saturado)
// y se respetan los acentos saturados (azul marino, verde, morado...).
export function recolorBody(px, [th, ts, tl], toneLow = 0.5) {
  const [, s, l] = rgb2hsl(...px);
  const w = 1 - smooth(0.2, 0.42, s);
  if (w < 0.01) return px;
  // u: posición del píxel dentro del rango tonal real del zapato (sombra 0 → brillo 1).
  // Estirar ese rango es lo que conserva el volumen al cambiar de color.
  // toneLow: lightness de las sombras del modelo (más bajo en fotos más oscuras).
  const u = clamp((l - toneLow) / (1 - toneLow), 0, 1);
  let nl, ns;
  if (tl < 0.3) { nl = tl * 0.6 + 0.3 * Math.pow(u, 1.5); ns = Math.min(ts, 0.25); }         // oscuros
  else if (tl > 0.88) { nl = 0.55 + 0.42 * Math.pow(l, 1.4); ns = 0.04; }                  // blanco
  else {                                                                                     // color
    // Los colores claros (pasteles) necesitan un piso de luminosidad más alto para no verse saturados.
    const floor = 0.4 + 0.4 * smooth(0.55, 0.8, tl);
    nl = tl * (floor + (1.1 - floor) * Math.pow(u, 1.2));
    nl += (1 - nl) * 0.3 * smooth(0.85, 1, u);                                               // brillo especular
    ns = ts * (1 - 0.35 * smooth(0.75, 1, nl));
  }
  return mix(px, hsl2rgb(th, ns, nl), w);
}

// "accent": el color del modelo está en las partes rojas (chimpún rojo y negro).
export function recolorAccent(px, [th, ts, tl]) {
  const [h, s, l] = rgb2hsl(...px);
  const redDist = Math.min(h, 1 - h);
  const w = smooth(0.12, 0.38, s) * (1 - smooth(0.1, 0.17, redDist));
  if (w < 0.01) return px;
  let ns, nl;
  if (tl > 0.88) { ns = 0.05; nl = clamp(0.45 + l * 0.95, 0, 0.97); }
  else if (tl < 0.3) { ns = 0.06; nl = l * 0.28 + 0.02; }
  else { ns = clamp(s * (ts / 0.8), 0, 1); nl = clamp(l * (tl / 0.5), 0, 0.95); }
  return mix(px, hsl2rgb(th, ns, nl), w);
}
