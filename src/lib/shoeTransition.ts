import { flushSync } from 'react-dom';

/**
 * Transición compartida "el zapato viaja": la foto de la tarjeta del catálogo crece hasta su lugar en la ficha
 * (y regresa al cerrar). Usa View Transitions del navegador; sin soporte o con "reducir movimiento" el cambio es
 * inmediato, como antes. La foto de la ficha lleva siempre `view-transition-name: zapato` (ProductDetailModal).
 */
const NAME = 'zapato';

const canAnimate = () =>
  typeof document !== 'undefined' &&
  'startViewTransition' in document &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Abre la ficha: la foto de la tarjeta (`from`) se convierte en la foto de la ficha. */
export function openWithShoe(from: HTMLElement | null, update: () => void) {
  if (!from || !canAnimate()) return update();
  from.style.viewTransitionName = NAME;
  const t = document.startViewTransition(() => {
    from.style.viewTransitionName = '';
    flushSync(update);
  });
  t.finished.finally(() => (from.style.viewTransitionName = ''));
}

/** Cierra la ficha: la foto vuelve a su tarjeta (`to`), si sigue en la página. */
export function closeWithShoe(to: HTMLElement | null, update: () => void) {
  if (!to || !to.isConnected || !canAnimate()) return update();
  const t = document.startViewTransition(() => {
    flushSync(update);
    to.style.viewTransitionName = NAME;
  });
  t.finished.finally(() => (to.style.viewTransitionName = ''));
}
