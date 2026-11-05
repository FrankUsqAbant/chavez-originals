import { useEffect, useRef } from 'react';
import { pauseSmoothScroll, resumeSmoothScroll } from '../lib/smoothScroll';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento estándar de un modal accesible:
 * cierre con Esc, bloqueo del scroll de fondo, foco inicial,
 * foco atrapado dentro del diálogo y restauración del foco al cerrar.
 * Devuelve un ref para asignar al contenedor del diálogo.
 */
export function useModal<T extends HTMLElement = HTMLDivElement>(isOpen: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    pauseSmoothScroll();

    const node = ref.current;
    const getFocusable = () =>
      node ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];

    if (node) {
      if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
      (getFocusable()[0] ?? node).focus({ preventScroll: true });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      resumeSmoothScroll();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  return ref;
}
