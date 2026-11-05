type Listenable = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;

const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const;

/**
 * Llama a `onIdle` cuando no hubo actividad del usuario durante `ms` milisegundos (por ejemplo, para cerrar
 * la sesión del administrador si dejó la pestaña abierta). Devuelve la función que lo detiene.
 */
export function watchIdle(target: Listenable, ms: number, onIdle: () => void): () => void {
  let timer = setTimeout(onIdle, ms);
  let lastReset = Date.now();

  const reset = () => {
    const now = Date.now();
    if (now - lastReset < 1000) return; // el movimiento del mouse no reinicia el reloj más de una vez por segundo
    lastReset = now;
    clearTimeout(timer);
    timer = setTimeout(onIdle, ms);
  };

  ACTIVITY_EVENTS.forEach((type) => target.addEventListener(type, reset, { passive: true }));
  return () => {
    clearTimeout(timer);
    ACTIVITY_EVENTS.forEach((type) => target.removeEventListener(type, reset));
  };
}
