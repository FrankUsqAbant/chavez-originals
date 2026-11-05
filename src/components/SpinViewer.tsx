import React, { useEffect, useRef, useState } from 'react';
import { Rotate3d } from 'lucide-react';

interface SpinViewerProps {
  /** Fotogramas de una vuelta completa, en orden. El primero es la vista de perfil. */
  frames: string[];
  alt: string;
  className?: string;
}

/** Píxeles de arrastre por fotograma (menor = gira más rápido). */
const PX_PER_FRAME = 10;

/**
 * Giro 360° con fotos reales: se arrastra con el mouse o el dedo, o se usan las flechas del teclado.
 * Mientras se descargan los fotogramas se muestra el primero; el gesto se activa al terminar.
 */
export const SpinViewer: React.FC<SpinViewerProps> = ({ frames, alt, className = '' }) => {
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);
  const drag = useRef<{ x: number; frame: number } | null>(null);
  const n = frames.length;

  // Precarga de todos los fotogramas
  useEffect(() => {
    setReady(false);
    setFrame(0);
    let cancelled = false;
    let pending = frames.length;
    const done = () => {
      pending -= 1;
      if (!cancelled && pending === 0) setReady(true);
    };
    frames.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = done;
      img.src = src;
    });
    return () => {
      cancelled = true;
    };
  }, [frames]);

  const wrap = (i: number) => ((i % n) + n) % n;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ready) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // sigue el gesto aunque el puntero salga del área
    } catch {
      /* puntero sintético o no capturable: el gesto funciona igual dentro del área */
    }
    drag.current = { x: e.clientX, frame };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setFrame(wrap(drag.current.frame + Math.round((e.clientX - drag.current.x) / PX_PER_FRAME)));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!ready) return;
    if (e.key === 'ArrowRight') setFrame((f) => wrap(f + 1));
    else if (e.key === 'ArrowLeft') setFrame((f) => wrap(f - 1));
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Girar la zapatilla 360 grados. Usa las flechas del teclado o arrastra."
      aria-valuemin={1}
      aria-valuemax={n}
      aria-valuenow={frame + 1}
      className={`relative w-full h-full flex items-center justify-center touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66]/60 rounded-2xl ${
        ready ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <img
        src={frames[frame]}
        alt={alt}
        decoding="async"
        draggable={false}
        className="max-w-[92%] max-h-[92%] object-contain pointer-events-none select-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
      />
      {ready && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-xs text-gray-300 pointer-events-none">
          <Rotate3d className="w-3.5 h-3.5 text-[#00ff66]" aria-hidden="true" />
          Arrastra para girar 360°
        </span>
      )}
    </div>
  );
};
