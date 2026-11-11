import React, { useEffect, useRef, useState } from 'react';
import { COLORWAYS, HERO_COLORS, HERO_MODELS, type SneakerColorway } from '../data/heroModels';
import { useSpinFrames } from '../hooks/useSpinFrames';
import { whenIdle } from '../lib/idle';
import { model3dUrl } from '../lib/model3d';
import { Shoe3D } from './Shoe3D';
import { MoveHorizontal } from 'lucide-react';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onExploreStore: () => void;
}

const TRUST = ['Envíos a todo el Perú', 'Garantía de fábrica', 'Yape · Plin · Tarjetas'];

/** Curva lenta para todos los cambios del hero: arranca rápido y se posa con suavidad. */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Escenario "vitrina" (el lenguaje de los afiches de la marca): cono de luz de estudio, podio negro y aro
 * verde neón. Coordenadas en un lienzo de 720 × 600; el producto se apoya en el centro del podio (y = 498).
 */
const Showroom: React.FC = () => (
  <svg viewBox="0 0 720 600" className="absolute inset-0 w-full h-full" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="sr-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dcffeb" stopOpacity="0.13" />
        <stop offset="1" stopColor="#dcffeb" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="sr-top" cx="0.5" cy="0.35" r="0.6">
        <stop offset="0" stopColor="#2c332f" />
        <stop offset="0.6" stopColor="#141816" />
        <stop offset="1" stopColor="#0a0c0b" />
      </radialGradient>
      <linearGradient id="sr-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#101412" />
        <stop offset="1" stopColor="#050706" />
      </linearGradient>
      <radialGradient id="sr-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#00ff66" stopOpacity="0.3" />
        <stop offset="1" stopColor="#00ff66" stopOpacity="0" />
      </radialGradient>
      <filter id="sr-blur" x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
    {/* Cono de luz: se desplaza apenas con el mouse (variable --mx) */}
    <g style={{ transform: 'translateX(calc(var(--mx, 0) * 14px))', transition: 'transform 1.2s cubic-bezier(0.22,1,0.36,1)' }}>
      <polygon points="310,0 410,0 576,516 144,516" fill="url(#sr-cone)" />
    </g>
    <ellipse cx="360" cy="558" rx="260" ry="36" fill="url(#sr-glow)" />
    <path d="M 151 498 L 151 528 A 209 33 0 0 0 569 528 L 569 498 Z" fill="url(#sr-side)" />
    <ellipse cx="360" cy="498" rx="209" ry="33" fill="url(#sr-top)" />
    {/* Aro neón: el halo respira con la flotación de la zapatilla */}
    <ellipse cx="360" cy="501" rx="216" ry="35" fill="none" stroke="#00ff66" strokeWidth="10" filter="url(#sr-blur)" className="animate-ring-glow" />
    <ellipse cx="360" cy="501" rx="216" ry="35" fill="none" stroke="#00ff66" strokeWidth="2" />
    {/* Sombra de contacto: se achica cuando la zapatilla sube */}
    <ellipse cx="360" cy="489" rx="122" ry="11" fill="#000" fillOpacity="0.7" filter="url(#sr-blur)" className="animate-float-shadow origin-center [transform-box:fill-box]" />
  </svg>
);

/**
 * Hero "Showroom": texto a la izquierda; a la derecha la zapatilla sobre un podio con aro neón, bajo una luz de
 * estudio. Movimiento delicado: flota despacio, se inclina un poco con el mouse (solo con mouse y sin "reducir
 * movimiento") y los ángulos y modelos cambian con fundidos lentos. Nada depende del scroll.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreCatalog, onExploreStore }) => {
  const [modelIndex, setModelIndex] = useState(0);
  const [view, setView] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; base: number; id: number } | null>(null);
  const [failed3d, setFailed3d] = useState<Record<string, boolean>>({});
  const sectionRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  const model = HERO_MODELS[modelIndex];
  const palette = (HERO_COLORS[model.id] ?? [])
    .map((id) => COLORWAYS[model.id].find((c) => c.id === id))
    .filter((c): c is SneakerColorway => !!c);
  const colors = palette.length ? palette : COLORWAYS[model.id].slice(0, 1);
  const color = colors[Math.min(colorIndex, colors.length - 1)];
  const spin = useSpinFrames(model.id, color.id);
  const frames = spin?.frames ?? [`/assets/aistudio/spin/${model.id}/${color.id}/01.webp`];
  const labels = spin?.labels ?? ['Perfil'];
  const current = Math.min(view, frames.length - 1);
  const model3d = failed3d[model.id] ? null : model3dUrl(model.id);

  // Precarga los ángulos del modelo activo y las fotos de perfil de los otros modelos (en tiempo libre)
  useEffect(
    () =>
      whenIdle(() => {
        const urls = [
          ...frames,
          ...colors.map((c) => `/assets/aistudio/spin/${model.id}/${c.id}/01.webp`),
          ...HERO_MODELS.map((m) => `/assets/aistudio/spin/${m.id}/${COLORWAYS[m.id][0].id}/01.webp`),
        ];
        urls.forEach((src) => {
          const img = new Image();
          img.src = src;
        });
      }),
    [frames],
  );

  // Inclinación suave y luz que sigue al mouse (interpoladas, sin saltos). Solo con mouse y sin "reducir movimiento".
  useEffect(() => {
    const el = tiltRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.transform = `perspective(1200px) rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg) translate3d(${(x * 8).toFixed(1)}px, ${(y * 5).toFixed(1)}px, 0)`;
      section.style.setProperty('--mx', x.toFixed(3));
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const selectModel = (i: number) => {
    setModelIndex(i);
    setView(0);
    setColorIndex(0);
  };

  // Probador: arrastrar (o las flechas del teclado) cambia el ángulo; el zapato se inclina con el dedo y vuelve suave.
  const canTurn = frames.length > 1 && !model3d;
  const total = frames.length;
  const STEP_PX = 70;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tilt = (deg: number, animate: boolean) => {
    const el = dragRef.current;
    if (!el) return;
    el.style.transition = animate ? `transform 650ms ${EASE}` : 'none';
    el.style.transform = `rotateY(${deg.toFixed(1)}deg)`;
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTurn || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, base: current, id: e.pointerId };
    setInteracted(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const steps = Math.trunc(dx / STEP_PX);
    setView((((d.base + steps) % total) + total) % total);
    if (!reduced()) tilt(Math.max(-16, Math.min(16, (dx - steps * STEP_PX) * 0.22)), false);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    drag.current = null;
    tilt(0, !reduced());
  };
  const onStageKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!canTurn) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setInteracted(true);
      setView((v) => (v + (e.key === 'ArrowRight' ? 1 : -1) + total) % total);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="modulo-hero"
      className="relative -mt-[73px] pt-[73px] overflow-clip scroll-mt-20 bg-[#050806]"
    >
      {/* Fondo con profundidad: luz de estudio desde arriba, resplandor sobre el piso y piso apenas visible */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_40%_at_50%_42%,rgba(214,255,230,0.12),transparent_70%),radial-gradient(ellipse_80%_22%_at_50%_78%,rgba(0,255,102,0.09),transparent_70%),linear-gradient(180deg,#0b110e_0%,#070a08_55%,#040605_100%)] lg:bg-[radial-gradient(ellipse_38%_55%_at_70%_0%,rgba(214,255,230,0.15),transparent_70%),radial-gradient(ellipse_55%_38%_at_70%_80%,rgba(0,255,102,0.09),transparent_70%),linear-gradient(180deg,#0b110e_0%,#070a08_55%,#040605_100%)]"
      />
      <div
        aria-hidden="true"
        className="hidden lg:block absolute inset-x-0 bottom-0 h-[34%] pointer-events-none border-t border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)]"
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 min-h-[calc(100svh-73px)] flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 pt-8 pb-6 lg:py-10">
          {/* Texto */}
          <div className="lg:col-span-5 text-center lg:text-left">
            <p
              className="animate-rise inline-flex items-center gap-3 text-sm text-white/60"
              style={{ animationDelay: '80ms' }}
            >
              <span className="hidden lg:block w-6 h-px bg-[#00ff66]" aria-hidden="true" />
              Av. San Martín 7399, Cajamarca
            </p>

            <h1
              className="animate-rise mt-5 lg:mt-6 text-[2.6rem] sm:text-6xl lg:text-[4rem] leading-[1.04] tracking-[-0.035em] text-[#f4f6f5]"
              style={{ animationDelay: '180ms' }}
            >
              <span className="font-light text-[#f4f6f5]/70">El impulso</span>
              <br />
              <span className="font-bold">
                de tu <span className="text-[#00ff66]">pasión.</span>
              </span>
            </h1>

            <p
              className="animate-rise mt-5 lg:mt-6 text-[15px] sm:text-[17px] leading-relaxed text-white/58 max-w-md mx-auto lg:mx-0"
              style={{ animationDelay: '280ms' }}
            >
              Zapatillas y chimpunes Punto Orito. Elige tu talla y pídelo por WhatsApp.
            </p>

            <div className="animate-rise hidden md:flex justify-center lg:justify-start mt-7 lg:mt-9 gap-3" style={{ animationDelay: '380ms' }}>
              <button
                type="button"
                onClick={onExploreCatalog}
                className="px-7 py-3.5 rounded-full bg-[#00ff66] hover:bg-[#1aff75] text-[#04110a] font-semibold text-sm transition-colors duration-300 cursor-pointer"
              >
                Ver catálogo
              </button>
              <button
                type="button"
                onClick={onExploreStore}
                className="px-7 py-3.5 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/[0.03] text-white font-semibold text-sm transition-colors duration-300 cursor-pointer"
              >
                Visitar la tienda
              </button>
            </div>

            <ul
              className="animate-rise hidden lg:flex mt-11 gap-7 text-[12.5px] text-white/45"
              style={{ animationDelay: '480ms' }}
            >
              {TRUST.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66]/70" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Producto en su vitrina */}
          <div className="lg:col-span-7 animate-rise" style={{ animationDelay: '250ms' }}>
            <div className="flex justify-center gap-6 sm:gap-8" role="group" aria-label="Elegir modelo">
              {HERO_MODELS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectModel(i)}
                  aria-pressed={i === modelIndex}
                  className={`relative py-2 text-[13px] sm:text-sm transition-colors duration-300 cursor-pointer ${
                    i === modelIndex ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {m.modelTag}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-px bg-[#00ff66] transition-transform duration-500"
                    style={{ transform: `scaleX(${i === modelIndex ? 1 : 0})`, transitionTimingFunction: EASE }}
                  />
                </button>
              ))}
            </div>

            <div
              className={`relative w-full max-w-[720px] md:max-w-[min(720px,calc((100svh-420px)*1.2))] lg:max-w-[min(720px,calc((100svh-250px)*1.2))] mx-auto aspect-[6/5] select-none touch-pan-y rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66]/70 ${
                canTurn ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
              tabIndex={canTurn ? 0 : undefined}
              role={canTurn ? 'group' : undefined}
              aria-roledescription={canTurn ? 'probador' : undefined}
              aria-label={canTurn ? `${model.name}, vista ${labels[current].toLowerCase()}. Arrastra o usa las flechas para girarlo.` : undefined}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={onStageKey}
            >
              <Showroom />
              {model3d ? (
                <div className="absolute inset-x-[10%] top-[8%] bottom-[18%]">
                  <Shoe3D
                    key={model.id}
                    src={model3d}
                    poster={frames[0]}
                    alt={`${model.name}, modelo 3D`}
                    tint={null}
                    onError={() => setFailed3d((f) => ({ ...f, [model.id]: true }))}
                  />
                </div>
              ) : (
                <div ref={tiltRef} className="absolute inset-0 will-change-transform">
                  <div className="absolute inset-0 animate-float">
                    <div ref={dragRef} className="absolute inset-0" style={{ transformOrigin: '50% 80%' }}>
                    {/* La foto se apoya en el centro del podio (83 % de la altura del escenario) */}
                    <div key={`${model.id}-${color.id}`} className="absolute left-[13%] w-[74%] bottom-[10.5%] aspect-[4/3] animate-rise">
                      {frames.map((src, i) => (
                        <img
                          key={src}
                          src={src}
                          alt={i === current ? `${model.name}, vista ${labels[i].toLowerCase()}` : ''}
                          aria-hidden={i !== current}
                          decoding="async"
                          fetchPriority={i === 0 ? 'high' : 'low'}
                          draggable={false}
                          className="absolute inset-0 w-full h-full object-contain object-bottom -rotate-6 drop-shadow-[0_28px_28px_rgba(0,0,0,0.55)] select-none"
                          style={{
                            opacity: i === current ? 1 : 0,
                            transition: `opacity 900ms ${EASE}`,
                          }}
                        />
                      ))}
                    </div>
                    </div>
                  </div>
                </div>
              )}
              {canTurn && (
                <p
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[2%] inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white/75 whitespace-nowrap transition-opacity duration-700 ${
                    interacted ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <MoveHorizontal className="w-3.5 h-3.5 text-[#00ff66]" aria-hidden="true" />
                  Arrastra para girar
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:px-6">
              <div className="flex items-center gap-4">
                <p className="text-sm text-white/55">
                  <span className="text-white font-semibold">{model.modelTag}</span>
                  <span className="ml-3 text-[#00ff66] font-semibold">{model.price}</span>
                </p>
                {colors.length > 1 && (
                  <div className="flex items-center gap-0.5" role="group" aria-label={`Color: ${color.name}`}>
                    {colors.map((c, i) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColorIndex(i)}
                        aria-pressed={c.id === color.id}
                        aria-label={c.name}
                        title={c.name}
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66]/70"
                      >
                        <span
                          aria-hidden="true"
                          className={`w-[18px] h-[18px] rounded-full border transition-shadow duration-300 ${
                            c.id === color.id ? 'border-white shadow-[0_0_0_2px_#050806,0_0_0_3.5px_#00ff66]' : 'border-white/30'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!model3d && frames.length > 1 && (
                <div className="flex items-center gap-2" role="group" aria-label="Ver otros ángulos">
                  {frames.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setView(i)}
                      aria-pressed={i === current}
                      aria-label={`Vista ${labels[i].toLowerCase()}`}
                      title={labels[i]}
                      className={`w-14 h-11 rounded-xl border p-1 cursor-pointer transition-[color,background-color,border-color,opacity,transform] duration-500 ${
                        i === current
                          ? 'border-[#00ff66]/70 bg-white/[0.06]'
                          : 'border-white/10 bg-white/[0.03] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-contain" draggable={false} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones en celular (debajo del producto) */}
          <div className="md:hidden flex gap-3">
            <button
              type="button"
              onClick={onExploreCatalog}
              className="flex-1 py-3.5 rounded-full bg-[#00ff66] text-[#04110a] font-semibold text-sm cursor-pointer"
            >
              Ver catálogo
            </button>
            <button
              type="button"
              onClick={onExploreStore}
              className="flex-1 py-3.5 rounded-full border border-white/20 text-white font-semibold text-sm cursor-pointer"
            >
              Visitar la tienda
            </button>
          </div>
        </div>

        {/* Franja de marcas */}
        <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-5 pb-7 text-xs sm:text-[13px] text-white/40">
          <span className="hidden sm:inline">Distribuidor exclusivo</span>
          <b className="text-white/70 italic font-bold tracking-[0.08em] text-xs sm:text-sm">PUNTO ORITO</b>
          <span className="w-px h-3.5 bg-white/15" aria-hidden="true" />
          <span className="hidden sm:inline">Distribuidor oficial</span>
          <b className="text-white/70 italic font-bold tracking-[0.08em] text-xs sm:text-sm">VENA</b>
          <span className="hidden lg:flex ml-auto mr-20 items-center gap-2.5" aria-hidden="true">
            <span className="w-px h-6 bg-gradient-to-b from-[#00ff66] to-transparent" />
            Desliza
          </span>
        </div>
      </div>
    </section>
  );
};
