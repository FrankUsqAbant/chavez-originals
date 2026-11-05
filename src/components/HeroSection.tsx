import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onExploreStore: () => void;
}

interface SneakerColorway {
  id: string;
  name: string;
  colorHex: string;
  shoeStyle: string;
}

interface HeroModel {
  id: string;
  name: string;
  modelTag: string;
  bgName: string;
  kicker: string;
  description: string;
  image: string;
  colorways: SneakerColorway[];
}

const HERO_MODELS: HeroModel[] = [
  {
    id: 'futbol-pro',
    name: 'Punto Original Fútbol Pro 2026',
    modelTag: 'Fútbol Pro 2026',
    bgName: 'FÚTBOL PRO',
    kicker: 'ALTA COMPETENCIA · MODELO OFICIAL 2026',
    description: 'Chimpún de alta competencia con tecnología de tracción dinámica para césped y losa, capellada microtexturizada y tobillera de ajuste anatómico.',
    image: '/assets/aistudio/punto_cleat_isolated.png',
    colorways: [
      { id: 'red', name: 'Rojo Furia', colorHex: '#e51e2b', shoeStyle: 'filter-none' },
      { id: 'neon-green', name: 'Verde Chavez', colorHex: '#00ff66', shoeStyle: 'hue-rotate-[95deg] saturate-[1.65]' },
      { id: 'mint', name: 'Menta Glow', colorHex: '#6ee7b7', shoeStyle: 'hue-rotate-[135deg] saturate-[1.3] brightness-110' },
      { id: 'white', name: 'Blanco Lunar', colorHex: '#f8fafc', shoeStyle: 'grayscale brightness-[1.6] contrast-[1.1]' },
      { id: 'black', name: 'Negro Stealth', colorHex: '#18181b', shoeStyle: 'grayscale brightness-[0.45] contrast-[1.3]' },
    ],
  },
  {
    id: 'urban-low',
    name: 'Punto Original Urban Low',
    modelTag: 'Urban Low',
    bgName: 'URBAN LOW',
    kicker: 'LÍNEA STREETWEAR · MINIMALISTA',
    description: 'Silueta urbana de perfil bajo y líneas limpias. Cuero sintético reforzado de alta durabilidad con suela cosida antideslizante para el día a día.',
    image: '/assets/aistudio/hero_model_urban_low.png',
    colorways: [
      { id: 'urban-white', name: 'Blanco Original', colorHex: '#f8fafc', shoeStyle: 'filter-none' },
      { id: 'urban-emerald', name: 'Verde Glow', colorHex: '#00ff66', shoeStyle: 'hue-rotate-[90deg] saturate-[1.5]' },
      { id: 'urban-silver', name: 'Plata Urbano', colorHex: '#94a3b8', shoeStyle: 'grayscale contrast-125' },
      { id: 'urban-dark', name: 'Negro Obsidiana', colorHex: '#18181b', shoeStyle: 'brightness-50 contrast-125' },
    ],
  },
  {
    id: 'air-glow-tech',
    name: 'Punto Original Air Glow Tech',
    modelTag: 'Air Glow Tech',
    bgName: 'AIR GLOW',
    kicker: 'CÁPSULA AIR TECH · AMORTIGUACIÓN',
    description: 'Amortiguación reactiva con cámara de aire visible y refuerzos aerodinámicos. Absorción superior de impacto pensada para máxima energía.',
    image: '/assets/aistudio/hero_model_air_glow_tech.png',
    colorways: [
      { id: 'air-white', name: 'Blanco & Plata', colorHex: '#e2e8f0', shoeStyle: 'filter-none' },
      { id: 'air-emerald', name: 'Esmeralda Chavez', colorHex: '#00ff66', shoeStyle: 'hue-rotate-[85deg] saturate-[1.5]' },
      { id: 'air-crimson', name: 'Carmesí Dynamic', colorHex: '#ef4444', shoeStyle: 'hue-rotate-[240deg] saturate-[1.4]' },
      { id: 'air-stealth', name: 'Negro Monocromo', colorHex: '#18181b', shoeStyle: 'grayscale brightness-60 contrast-130' },
    ],
  },
  {
    id: 'chunky-lavender',
    name: 'Punto Original Chunky Lavender',
    modelTag: 'Chunky Lavender',
    bgName: 'CHUNKY',
    kicker: 'LÍNEA STREETWEAR · PLATAFORMA EVA',
    description: 'Diseño audaz con plataforma chunky ultraligera de polímero EVA. Estructura anatómica que ofrece altura, comodidad y presencia imponente.',
    image: '/assets/aistudio/hero_model_chunky_lavender.png',
    colorways: [
      { id: 'chunky-lav', name: 'Lavanda & Crema', colorHex: '#d8b4e2', shoeStyle: 'filter-none' },
      { id: 'chunky-mint', name: 'Menta Fresco', colorHex: '#a7f3d0', shoeStyle: 'hue-rotate-[110deg] saturate-[1.3]' },
      { id: 'chunky-pure', name: 'Blanco Total', colorHex: '#f8fafc', shoeStyle: 'brightness-110 contrast-105' },
      { id: 'chunky-smoke', name: 'Gris Grafito', colorHex: '#475569', shoeStyle: 'grayscale brightness-75 contrast-120' },
    ],
  },
  {
    id: 'velocity-silver',
    name: 'Punto Original Velocity Silver',
    modelTag: 'Velocity Silver',
    bgName: 'VELOCITY',
    kicker: 'LÍNEA SPORT ACTIVE · VELOCIDAD',
    description: 'Zapatilla multideportiva ultraligera con malla transpirable antidesgarro y suela de tracción multidireccional para respuesta inmediata.',
    image: '/assets/aistudio/hero_model_velocity_silver.png',
    colorways: [
      { id: 'velocity-silver', name: 'Plata Metálico', colorHex: '#cbd5e1', shoeStyle: 'filter-none' },
      { id: 'velocity-green', name: 'Verde Neón', colorHex: '#00ff66', shoeStyle: 'hue-rotate-[90deg] saturate-[1.6]' },
      { id: 'velocity-blue', name: 'Azul Polar', colorHex: '#38bdf8', shoeStyle: 'hue-rotate-[180deg] saturate-[1.3]' },
      { id: 'velocity-black', name: 'Negro Titanio', colorHex: '#0f172a', shoeStyle: 'grayscale brightness-50 contrast-130' },
    ],
  },
];

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
  const currentColor = currentModel.colorways[colorIndex] || currentModel.colorways[0];

  // Navigate to Next model (manual user trigger only)
  const handleNext = () => {
    setModelIndex((prev) => (prev + 1) % HERO_MODELS.length);
    setColorIndex(0);
    setRotationAngle(0);
  };

  // Navigate to Previous model (manual user trigger only)
  const handlePrev = () => {
    setModelIndex((prev) => (prev - 1 + HERO_MODELS.length) % HERO_MODELS.length);
    setColorIndex(0);
    setRotationAngle(0);
  };

  // Select a specific model tab
  const handleSelectModel = (index: number) => {
    setModelIndex(index);
    setColorIndex(0);
    setRotationAngle(0);
  };

  // Select a specific colorway
  const handleSelectColor = (index: number) => {
    setColorIndex(index);
  };

  // Drag interaction for 360° interactive rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startAngleRef.current = rotationAngle;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const newAngle = (startAngleRef.current + deltaX * 0.8) % 360;
    setRotationAngle(newAngle);
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
    const newAngle = (startAngleRef.current + deltaX * 0.8) % 360;
    setRotationAngle(newAngle);
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
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#00ff66] hover:bg-[#1aff75] text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:shadow-[0_0_30px_rgba(0,255,102,0.5)] transition-all duration-200 active:scale-95 cursor-pointer"
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

          {/* Right Column: 5 Models Exhibition Showcase with Background Model Name Watermark */}
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
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-500/20 border border-[#00ff66] text-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {m.modelTag}
                  </button>
                );
              })}
            </div>

            {/* Main Stage with Left and Right Navigation Arrows and Background Name Watermark */}
            <div className="relative w-full max-w-[520px] flex items-center justify-center">
              
              {/* Refined Prev Arrow Button */}
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
                
                {/* 1. MODEL NAME WATERMARK BEHIND THE SNEAKER (Parte de atrás del modelo sin quitar protagonismo) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <span
                    key={currentModel.bgName}
                    className="text-[64px] sm:text-[90px] lg:text-[104px] font-black uppercase tracking-tight text-white/[0.045] leading-none text-center select-none whitespace-nowrap transition-all duration-500 ease-out"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      letterSpacing: '-0.04em',
                      textShadow: '0 0 80px rgba(0, 255, 102, 0.05)',
                    }}
                  >
                    {currentModel.bgName}
                  </span>
                </div>

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
                  style={{
                    perspective: '1000px',
                  }}
                >
                  <div
                    key={`${currentModel.id}-${currentColor.id}`}
                    className="relative w-full h-full flex items-center justify-center p-6 transition-transform duration-100 ease-out animate-in fade-in zoom-in-95 duration-300"
                    style={{
                      transform: `rotateY(${rotationAngle}deg) rotateZ(-3deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <img
                      src={currentModel.image}
                      alt={currentModel.name}
                      className={`max-w-[92%] max-h-[92%] object-contain pointer-events-none select-none ${currentColor.shoeStyle} transition-all duration-300 drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]`}
                      draggable={false}
                    />
                  </div>
                </div>

                {/* 5. Floor contact shadow */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-52 h-3.5 rounded-[100%] bg-black/70 blur-md pointer-events-none z-0" />
              </div>

              {/* Refined Next Arrow Button */}
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
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                {currentModel.colorways.map((c, idx) => {
                  const isActive = colorIndex === idx;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectColor(idx)}
                      className={`w-5 h-5 rounded-full transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-[#00ff66] ring-offset-2 ring-offset-[#070b09] scale-110 shadow-[0_0_10px_rgba(0,255,102,0.6)]'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                      aria-label={`Color ${c.name}`}
                      title={c.name}
                    />
                  );
                })}
              </div>

              {/* Active Color Name Badge */}
              <span className="text-xs font-semibold text-gray-300 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                {currentColor.name}
              </span>
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


