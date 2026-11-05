import Lenis from 'lenis';

let lenis: Lenis | null = null;
let frame = 0; // id del requestAnimationFrame en curso (0 = el bucle está dormido)
let quietFrames = 0;
const SLEEP_AFTER = 40; // fotogramas seguidos sin movimiento (~0,7 s) antes de dormir el bucle

/** El bucle solo corre mientras hay movimiento: en reposo no gasta CPU ni batería. */
function tick(time: number) {
  if (!lenis) return;
  lenis.raf(time);
  quietFrames = lenis.isScrolling ? 0 : quietFrames + 1;
  frame = quietFrames < SLEEP_AFTER ? requestAnimationFrame(tick) : 0;
}

function wake() {
  quietFrames = 0;
  if (!frame) frame = requestAnimationFrame(tick);
}

/**
 * Scroll con inercia para la rueda del mouse (el scroll nativo de Windows va a saltos).
 * En táctil se mantiene el scroll nativo, y se desactiva con "reducir movimiento".
 */
export function initSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  // Cualquier entrada del usuario despierta el bucle (antes de que Lenis procese el gesto)
  (['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll', 'resize'] as const).forEach((type) =>
    window.addEventListener(type, wake, { passive: true }),
  );
  wake();
}

/** Los modales bloquean el scroll de fondo: se pausa Lenis mientras están abiertos. */
export const pauseSmoothScroll = () => lenis?.stop();
export const resumeSmoothScroll = () => {
  lenis?.start();
  wake();
};

/** Navegación entre secciones. La altura de la barra superior la compensa el `scroll-mt-20` de cada sección. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.2 });
    wake();
  } else el.scrollIntoView({ behavior: 'smooth' });
}
