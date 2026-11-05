import React, { useEffect, useRef, useState } from 'react';
import { Rotate3d } from 'lucide-react';

interface SpinViewerProps {
  /** Imágenes en orden. El primero es la vista de perfil. */
  frames: string[];
  /** Con nombres: son vistas sueltas (miniaturas con su nombre). Sin nombres: giro 360° continuo. */
  labels?: string[];
  /** Vista actual (controlada desde afuera para conservarla al cambiar de color). */
  index: number;
  onIndexChange: (index: number) => void;
  alt: string;
}

/**
 * Visor de ángulos: se cambia de vista con las miniaturas, arrastrando o deslizando el dedo, o con las flechas
 * del teclado. Sin nombres funciona como giro 360° (muchos fotogramas, arrastre fino).
 */
export const SpinViewer: React.FC<SpinViewerProps> = ({ frames, labels, index, onIndexChange, alt }) => {
  const [ready, setReady] = useState(false);
  const drag = useRef<{ x: number; index: number } | null>(null);
  const n = frames.length;
  const discrete = Boolean(labels?.length);
  const pxPerStep = discrete ? 70 : 10; // vistas sueltas: un paso grande; giro continuo: un paso fino
  const current = Math.min(index, n - 1);

  // Precarga de todas las imágenes
  useEffect(() => {
    setReady(false);
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
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // sigue el gesto aunque el puntero salga del área
    } catch {
      /* puntero sintético o no capturable: el gesto funciona igual dentro del área */
    }
    drag.current = { x: e.clientX, index: current };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const next = wrap(drag.current.index - Math.round((e.clientX - drag.current.x) / pxPerStep));
    if (next !== current) onIndexChange(next);
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') onIndexChange(wrap(current + 1));
    else if (e.key === 'ArrowLeft') onIndexChange(wrap(current - 1));
    else return;
    e.preventDefault();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div
        role="slider"
        tabIndex={0}
        aria-label={discrete ? 'Cambiar de ángulo de la zapatilla' : 'Girar la zapatilla 360 grados'}
        aria-valuemin={1}
        aria-valuemax={n}
        aria-valuenow={current + 1}
        aria-valuetext={labels?.[current]}
        className="w-full flex-1 min-h-0 flex items-center justify-center touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66]/60 rounded-2xl cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <img
          key={discrete ? current : undefined}
          src={frames[current]}
          alt={labels ? `${alt}, vista ${labels[current].toLowerCase()}` : alt}
          decoding="async"
          draggable={false}
          className={`max-w-[100%] max-h-full object-contain pointer-events-none select-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] ${
            discrete ? 'animate-in' : ''
          }`}
        />
      </div>

      {discrete ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2" role="group" aria-label="Ángulos">
          {labels!.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-pressed={i === current}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                i === current
                  ? 'bg-[#00ff66] text-black'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        ready && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-xs text-gray-300 pointer-events-none">
            <Rotate3d className="w-3.5 h-3.5 text-[#00ff66]" aria-hidden="true" />
            Arrastra para girar 360°
          </span>
        )
      )}
    </div>
  );
};
