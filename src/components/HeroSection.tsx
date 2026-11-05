import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import heroSpec from '../data/hero-models.json';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onExploreStore: () => void;
}

interface SneakerColorway {
  id: string;
  name: string;
  hex: string;
}

interface HeroModel {
  id: string;
  name: string;
  modelTag: string;
  bgName: string;
  kicker: string;
  description: string;
}

/** Colores de cada modelo: viven en hero-models.json, que también usa scripts/build-hero-assets.mjs. */
const COLORWAYS = Object.fromEntries(
  Object.entries(heroSpec).map(([id, m]) => [id, m.colorways as SneakerColorway[]]),
) as Record<string, SneakerColorway[]>;

/** Una imagen real por modelo y color (generadas con `npm run hero`). */
const heroImage = (modelId: string, colorId: string) =>
  `/assets/aistudio/hero/${modelId}-${colorId}.webp`;

const HERO_MODELS: HeroModel[] = [
  {
    id: 'futbol-pro',
    name: 'Punto Original Fútbol Pro 2026',
    modelTag: 'Fútbol Pro 2026',
    bgName: 'FÚTBOL PRO',
    kicker: 'ALTA COMPETENCIA · MODELO OFICIAL 2026',
    description: 'Chimpún de alta competencia con tecnología de tracción dinámica para césped y losa, capellada microtexturizada y tobillera de ajuste anatómico.',
  },
  {
    id: 'urban-low',
    name: 'Punto Original Urban Low',
    modelTag: 'Urban Low',
    bgName: 'URBAN LOW',
    kicker: 'LÍNEA STREETWEAR · MINIMALISTA',
    description: 'Silueta urbana de perfil bajo y líneas limpias. Cuero sintético reforzado de alta durabilidad con suela cosida antideslizante para el día a día.',
  },
  {
    id: 'air-glow-tech',
    name: 'Punto Original Air Glow Tech',
    modelTag: 'Air Glow Tech',
    bgName: 'AIR GLOW',
    kicker: 'CÁPSULA AIR TECH · AMORTIGUACIÓN',
    description: 'Amortiguación reactiva con cámara de aire visible y refuerzos aerodinámicos. Absorción superior de impacto pensada para máxima energía.',
  },
  {
    id: 'chunky-lavender',
    name: 'Punto Original Chunky Lavender',
    modelTag: 'Chunky Lavender',
    bgName: 'CHUNKY',
    kicker: 'LÍNEA STREETWEAR · PLATAFORMA EVA',
    description: 'Diseño audaz con plataforma chunky ultraligera de polímero EVA. Estructura anatómica que ofrece altura, comodidad y presencia imponente.',
  },
  {
    id: 'velocity-silver',
    name: 'Punto Original Velocity Silver',
    modelTag: 'Velocity Silver',
    bgName: 'VELOCITY',
    kicker: 'LÍNEA SPORT ACTIVE · VELOCIDAD',
    description: 'Zapatilla multideportiva ultraligera con malla transpirable antidesgarro y suela de tracción multidireccional para respuesta inmediata.',
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

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCatalog,
  onExploreStore,
}) => {
  const [modelIndex, setModelIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  const currentModel = HERO_MODELS[modelIndex];
  const colorways = COLORWAYS[currentModel.id];
  const currentColor = colorways[colorIndex] ?? colorways[0];

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
    setRotationAngle(0);
  };

  const handleNext = () => goToModel(modelIndex + 1);
  const handlePrev = () => goToModel(modelIndex - 1);
  const handleSelectModel = (index: number) => goToModel(index);
  const handleSelectColor = (index: number) => setColorIndex(index);

  // Drag interaction for 360° interactive rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startAngleRef.current = rotationAngle;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setRotationAngle((startAngleRef.current + deltaX * 0.8) % 360);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startAngleRef.current = rotationAngle;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    setRotationAngle((startAngleRef.current + deltaX * 0.8) % 360);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section
      id="modulo-hero"
      className="relative min-h-[85vh] flex items-center bg-[#070b09] overflow-hidden py-12 lg:py-20 scroll-mt-20"
      onMouseUp={handleMouseUp}
    >
      {/* Soft, calm ambient radial glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/[0.08] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Clean, confident typography with dynamic model awareness */}
          <div className="lg:col-span-5 space-y-6 z-10 text-left">

            {/* Dynamic model kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00ff66] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              <span>{currentModel.kicker}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-extrabold tracking-tight text-white leading-[1.12]">
              El impulso para tu negocio y tu <span className="text-[#00ff66]">pasión</span>.
            </h1>

            <p className="text-base sm:text-lg text-gray-400 font-normal leading-relaxed">
              {currentModel.description}
            </p>

            {/* Clean action buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#00ff66] hover:bg-[#1aff75] text-black font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Ver Colección</span>
              </button>

              <button
                type="button"
                onClick={onExploreStore}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Visitar Tienda</span>
              </button>
            </div>

            {/* Quiet trust line */}
            <div className="pt-2 text-xs text-gray-500 font-medium tracking-wide">
              Tienda Oficial en Av. San Martín 736, Cajamarca · Stock y prueba en vivo
            </div>
          </div>

          {/* Right Column: modelos con nombre al fondo y color seleccionable */}
          <div className="lg:col-span-7 relative flex flex-col items-center justify-center">

            {/* Top 5 Model Switcher Tabs (Manual) */}
            <div className="w-full flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
              {HERO_MODELS.map((m, idx) => {
                const isSelected = modelIndex === idx;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectModel(idx)}
                    aria-pressed={isSelected}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap ${
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

            {/* Main Stage with Left and Right Navigation Arrows */}
            <div className="relative w-full max-w-[520px] flex items-center justify-center">

              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-0 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-emerald-500/20 border border-white/15 hover:border-[#00ff66]/50 text-gray-300 hover:text-[#00ff66] flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-xl active:scale-95 cursor-pointer"
                aria-label="Modelo anterior"
                title="Modelo anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Showcase Stage & Rotatable Sneaker */}
              <div className="relative w-full aspect-square max-w-[440px] flex items-center justify-center">

                {/* 1. Nombre del modelo detrás de la zapatilla */}
                <ModelWatermark key={currentModel.id} text={currentModel.bgName} color={currentColor.hex} />

                {/* 2. Soft studio lighting behind shoe */}
                <div className="absolute inset-8 rounded-full bg-radial from-emerald-500/10 via-transparent to-transparent blur-2xl pointer-events-none z-0" />

                {/* 3. Subtle exhibition pedestal ring */}
                <div className="absolute bottom-12 w-64 h-12 rounded-full border border-emerald-500/10 bg-emerald-500/[0.02] pointer-events-none z-0 transform rotate-[-2deg]" />

                {/* 4. Rotatable sneaker on clean stage (z-10 over watermark) */}
                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="relative z-10 cursor-grab active:cursor-grabbing select-none w-full h-full flex items-center justify-center"
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className="relative w-full h-full flex items-center justify-center px-6 pt-20 pb-4 transition-transform duration-100 ease-out"
                    style={{
                      transform: `rotateY(${rotationAngle}deg) rotateZ(-3deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <img
                      key={`${currentModel.id}-${currentColor.id}`}
                      src={heroImage(currentModel.id, currentColor.id)}
                      alt={`${currentModel.name}, color ${currentColor.name}`}
                      fetchPriority="high"
                      decoding="async"
                      className="max-w-[92%] max-h-[92%] object-contain pointer-events-none select-none animate-in drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* 5. Floor contact shadow */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-52 h-3.5 rounded-[100%] bg-black/70 blur-md pointer-events-none z-0" />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-0 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-emerald-500/20 border border-white/15 hover:border-[#00ff66]/50 text-gray-300 hover:text-[#00ff66] flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-xl active:scale-95 cursor-pointer"
                aria-label="Siguiente modelo"
                title="Siguiente modelo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Clean Colorway Picker with Active Color Name */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 z-10">
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm"
                role="group"
                aria-label="Color de la zapatilla"
              >
                {colorways.map((c, idx) => {
                  const isActive = colorIndex === idx;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectColor(idx)}
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
              <span className="text-[11px] text-gray-500">Color referencial · consulta disponibilidad</span>
            </div>

            {/* Pure manual showcase controls cue */}
            <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400 font-mono tracking-wide z-10">
              <span>Modelo {modelIndex + 1} de {HERO_MODELS.length}</span>
              <span className="text-gray-600">·</span>
              <span>Arrastra para rotar 360°</span>
              {rotationAngle !== 0 && (
                <>
                  <span className="text-gray-600">·</span>
                  <button
                    type="button"
                    onClick={() => setRotationAngle(0)}
                    className="inline-flex items-center gap-1 hover:text-[#00ff66] transition-colors cursor-pointer text-emerald-400"
                    title="Restablecer ángulo"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Centrar</span>
                  </button>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
