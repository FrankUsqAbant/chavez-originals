import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroSpec from '../data/hero-models.json';
import { SpinViewer } from './SpinViewer';
import { useSpinFrames } from '../hooks/useSpinFrames';
import { useModel3D } from '../hooks/useModel3D';
import { Shoe3D } from './Shoe3D';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onExploreStore: () => void;
}

interface SneakerColorway {
  id: string;
  name: string;
  hex: string;
  /** Color de la foto original (el modelo 3D no se tiñe). */
  original?: boolean;
}

interface HeroModel {
  id: string;
  name: string;
  modelTag: string;
  bgName: string;
  description: string;
}

/** Colores de cada modelo: viven en hero-models.json, que también usa scripts/build-hero-assets.mjs. */
const COLORWAYS = Object.fromEntries(
  Object.entries(heroSpec).map(([id, m]) => [id, m.colorways as SneakerColorway[]]),
) as Record<string, SneakerColorway[]>;

/** Vista de perfil de cada modelo y color (la primera vista generada con `npm run spin`). */
const heroImage = (modelId: string, colorId: string) =>
  `/assets/aistudio/spin/${modelId}/${colorId}/01.webp`;

const HERO_MODELS: HeroModel[] = [
  {
    id: 'futbol-pro',
    name: 'Punto Original Fútbol Pro 2026',
    modelTag: 'Fútbol Pro 2026',
    bgName: 'FÚTBOL PRO',
    description: 'Chimpún de alta competencia con tecnología de tracción dinámica para césped y losa, capellada microtexturizada y tobillera de ajuste anatómico.',
  },
  {
    id: 'air-glow-tech',
    name: 'Punto Original Air Glow Tech',
    modelTag: 'Air Glow Tech',
    bgName: 'AIR GLOW',
    description: 'Amortiguación reactiva con cámara de aire visible y refuerzos aerodinámicos. Absorción superior de impacto pensada para máxima energía.',
  },
  {
    id: 'chunky-lavender',
    name: 'Punto Original Chunky Lavender',
    modelTag: 'Chunky Lavender',
    bgName: 'CHUNKY',
    description: 'Diseño audaz con plataforma chunky ultraligera de polímero EVA. Estructura anatómica que ofrece altura, comodidad y presencia imponente.',
  },
];

/* ------------------------- Nombre del modelo al fondo ------------------------- */

const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum < 0.3;
};

const WATERMARK_WIDTH = 900;

/**
 * Nombre del modelo en letras grandes detrás de la zapatilla.
 * Se ajusta al ancho del escenario (nunca se corta) y toma el tono del color elegido:
 * relleno suave + contorno definido, para que se lea sin competir con el producto.
 */
const ModelWatermark: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const fontSize = Math.min(250, WATERMARK_WIDTH / (text.length * 0.7));
  const tint = isDark(color) ? '#ffffff' : color;

  return (
    <svg
      viewBox="0 0 1000 340"
      className="absolute left-1/2 top-[3%] w-[112%] -translate-x-1/2 pointer-events-none select-none z-0 animate-in"
      aria-hidden="true"
      focusable="false"
    >
      <text
        x="500"
        y={170 + fontSize * 0.35}
        textAnchor="middle"
        textLength={WATERMARK_WIDTH}
        lengthAdjust="spacingAndGlyphs"
        fontSize={fontSize}
        fontWeight={800}
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fill={tint}
        fillOpacity={0.1}
        stroke={tint}
        strokeOpacity={0.34}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ transition: 'fill 300ms ease, stroke 300ms ease' }}
      >
        {text}
      </text>
    </svg>
  );
};

/* ---------------------------------- Hero ---------------------------------- */

const ARROW_CLASS =
  'absolute z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-emerald-500/20 border border-white/15 hover:border-[#00ff66]/50 text-gray-300 hover:text-[#00ff66] flex items-center justify-center transition-colors duration-200 active:scale-95 cursor-pointer';

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreCatalog, onExploreStore }) => {
  const [modelIndex, setModelIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [viewIndex, setViewIndex] = useState(0); // ángulo elegido; se conserva al cambiar de color
  const [mode, setMode] = useState<'3d' | 'fotos'>('3d');
  const [failed3d, setFailed3d] = useState<Record<string, boolean>>({});

  const currentModel = HERO_MODELS[modelIndex];
  const colorways = COLORWAYS[currentModel.id];
  const currentColor = colorways[colorIndex] ?? colorways[0];
  // Vistas (perfil, frente, atrás…) o giro 360° con fotos reales, si el modelo las tiene (ver `npm run spin`).
  const spin = useSpinFrames(currentModel.id, currentColor.id);
  // Modelo 3D (.glb) con giro libre, si el modelo lo tiene (ver `npm run model3d`).
  const model3d = useModel3D(currentModel.id);
  const has3d = Boolean(model3d) && !failed3d[currentModel.id];
  const show3d = has3d && mode === '3d';

  // Precarga: primero los colores del modelo activo; el resto, poco después de cargar la página.
  useEffect(() => {
    const load = (modelId: string) =>
      COLORWAYS[modelId].forEach((c) => {
        const img = new Image();
        img.src = heroImage(modelId, c.id);
      });
    load(currentModel.id);
    const t = window.setTimeout(() => HERO_MODELS.forEach((m) => load(m.id)), 1500);
    return () => window.clearTimeout(t);
  }, [currentModel.id]);

  const goToModel = (index: number) => {
    setModelIndex((index + HERO_MODELS.length) % HERO_MODELS.length);
    setColorIndex(0);
    setViewIndex(0);
  };

  return (
    <section
      id="modulo-hero"
      className="relative min-h-[85vh] flex items-center bg-[#070b09] overflow-hidden py-12 lg:py-20 scroll-mt-20"
    >
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.12),transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Texto */}
          <div className="lg:col-span-5 space-y-6 z-10 text-left">

            <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-extrabold tracking-tight text-white leading-[1.12]">
              El impulso para tu negocio y tu <span className="text-[#00ff66]">pasión</span>.
            </h1>

            <p className="text-base sm:text-lg text-gray-400 font-normal leading-relaxed">
              {currentModel.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#00ff66] hover:bg-[#1aff75] text-black font-bold text-sm tracking-wide transition-colors duration-200 active:scale-95 cursor-pointer"
              >
                Ver Colección
              </button>
              <button
                type="button"
                onClick={onExploreStore}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium text-sm tracking-wide transition-colors duration-200 active:scale-95 cursor-pointer"
              >
                Visitar Tienda
              </button>
            </div>
          </div>

          {/* Modelos */}
          <div className="lg:col-span-7 relative flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
              {HERO_MODELS.map((m, idx) => {
                const isSelected = modelIndex === idx;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => goToModel(idx)}
                    aria-pressed={isSelected}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-500/20 border border-[#00ff66] text-[#00ff66]'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {m.modelTag}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full max-w-[520px] flex items-center justify-center">
              <button
                type="button"
                onClick={() => goToModel(modelIndex - 1)}
                className={`${ARROW_CLASS} left-0`}
                aria-label="Modelo anterior"
                title="Modelo anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative w-full aspect-square max-w-[440px] flex items-center justify-center">
                {/* Escenario: disco de luz y sombra de piso para separar el producto del fondo */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[88%] aspect-square rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_28%,rgba(110,231,183,0.22),rgba(16,185,129,0.08)_55%,rgba(16,185,129,0.02)_72%)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[68%] h-7 bg-[radial-gradient(closest-side,rgba(0,0,0,0.8),transparent)]"
                />

                <ModelWatermark key={currentModel.id} text={currentModel.bgName} color={currentColor.hex} />

                <div className="relative z-10 w-full h-full flex items-center justify-center px-6 pt-20 pb-4">
                  {show3d && model3d ? (
                    <Shoe3D
                      key={currentModel.id}
                      src={model3d}
                      poster={heroImage(currentModel.id, currentColor.id)}
                      alt={`${currentModel.name}, modelo 3D`}
                      tint={currentColor.original ? null : currentColor.hex}
                      onError={() => setFailed3d((f) => ({ ...f, [currentModel.id]: true }))}
                    />
                  ) : spin ? (
                    <SpinViewer
                      frames={spin.frames}
                      labels={spin.labels}
                      index={viewIndex}
                      onIndexChange={setViewIndex}
                      alt={`${currentModel.name}, color ${currentColor.name}`}
                    />
                  ) : (
                    <img
                      key={`${currentModel.id}-${currentColor.id}`}
                      src={heroImage(currentModel.id, currentColor.id)}
                      alt={`${currentModel.name}, color ${currentColor.name}`}
                      fetchPriority="high"
                      decoding="async"
                      className="max-w-[92%] max-h-[92%] object-contain -rotate-3 select-none animate-in drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
                      draggable={false}
                    />
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => goToModel(modelIndex + 1)}
                className={`${ARROW_CLASS} right-0`}
                aria-label="Siguiente modelo"
                title="Siguiente modelo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {has3d && (
              <div
                className="mt-3 inline-flex rounded-full bg-white/[0.04] border border-white/10 p-1 text-xs z-10"
                role="group"
                aria-label="Tipo de vista"
              >
                {([['3d', '3D 360°'], ['fotos', 'Fotos']] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={mode === id}
                    onClick={() => setMode(id)}
                    className={`px-3.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                      mode === id ? 'bg-[#00ff66] text-black' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 z-10">
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10"
                role="group"
                aria-label="Color de la zapatilla"
              >
                {colorways.map((c, idx) => {
                  const isActive = colorIndex === idx;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorIndex(idx)}
                      aria-pressed={isActive}
                      className={`w-5 h-5 rounded-full border border-white/20 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-[#00ff66] ring-offset-2 ring-offset-[#070b09] scale-110'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={`Color ${c.name}`}
                      title={c.name}
                    />
                  );
                })}
              </div>

              <span className="text-xs font-semibold text-gray-300 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                {currentColor.name}
              </span>
              <span className="text-xs text-gray-500">Color referencial · consulta disponibilidad</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
