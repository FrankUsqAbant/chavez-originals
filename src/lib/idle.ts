/**
 * Ejecuta `fn` un poco después de cargar la página, cuando el navegador está libre.
 * Sirve para precargar imágenes que todavía nadie pidió sin competir con lo que se ve primero.
 * Devuelve la función que lo cancela.
 */
export function whenIdle(fn: () => void, delay = 1200): () => void {
  let cancelIdle = () => {};
  const timer = window.setTimeout(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(fn, { timeout: 2000 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      fn();
    }
  }, delay);
  return () => {
    window.clearTimeout(timer);
    cancelIdle();
  };
}
