import Lenis from 'lenis';

let lenis: Lenis | null = null;

/**
 * Scroll con inercia para la rueda del mouse (el scroll nativo de Windows va a saltos).
 * En táctil se mantiene el scroll nativo, y se desactiva con "reducir movimiento".
 */
export function initSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

/** Los modales bloquean el scroll de fondo: se pausa Lenis mientras estén abiertos. */
export const pauseSmoothScroll = () => lenis?.stop();
export const resumeSmoothScroll = () => lenis?.start();

/** Navegación entre secciones. La altura de la barra superior la compensa el `scroll-mt-20` de cada sección. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.2 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
