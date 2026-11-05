import React, { useState } from 'react';
import { Award, ShieldCheck, ShoppingBag, Store, MapPin, X } from 'lucide-react';
import { STORE_INFO } from '../data/storeData';
import { generateWhatsAppOrderLink } from '../utils/b2b-logic';
import { ChavezLogo } from './ChavezLogo';
import { useModal } from '../hooks/useModal';
import { useStoreStatus } from '../hooks/useStoreStatus';

interface ShowcaseItem {
  id: string;
  name: string;
  code: string;
  image: string;
  alt: string;
  availableSizes: number[];
}

const SHOWCASE_MODELS: ShowcaseItem[] = [
  {
    id: 'stealth-runner',
    name: 'Punto Original Stealth Runner',
    code: 'STH-2026-BLK',
    image: '/assets/aistudio/showroom_stealth_sideprofile.webp',
    alt: 'Punto Original Stealth Runner',
    availableSizes: [38, 39, 40, 41, 42, 43, 44],
  },
  {
    id: 'urban-chunky',
    name: 'Punto Original Urban Chunky',
    code: 'URB-2026-CH',
    image: '/assets/aistudio/showroom_chunky_16x9.webp',
    alt: 'Punto Original Urban Chunky',
    availableSizes: [38, 39, 40, 41, 42, 43, 44],
  },
  {
    id: 'air-glow',
    name: 'Punto Original Air Glow',
    code: 'URB-AIR-026',
    image: '/assets/aistudio/showroom_airglow_16x9.webp',
    alt: 'Punto Original Air Glow',
    availableSizes: [38, 39, 40, 41, 42, 43, 44],
  },
];

export const ComboSection: React.FC = () => {
  const status = useStoreStatus();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({
    'stealth-runner': 40,
    'urban-chunky': 40,
    'air-glow': 40,
  });

  // 3D Campaign Showcase state (pure product, no text)
  const [active3DProduct, setActive3DProduct] = useState<ShowcaseItem | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const viewerRef = useModal<HTMLDivElement>(active3DProduct !== null, () => setActive3DProduct(null));

  const handleSelectSize = (itemId: string, size: number) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [itemId]: size,
    }));
  };

  const handleOrderShoe = (item: ShowcaseItem) => {
    const size = selectedSizes[item.id] || 40;
    const link = generateWhatsAppOrderLink({
      phone: STORE_INFO.whatsapp,
      modelCode: item.code,
      modelName: item.name,
      size,
      notes: `Hola Chavez Originals, deseo pedir el modelo ${item.name} en talla ${size}.`,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // 3D showcase drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setRotationAngle((prev) => prev + delta * 0.35);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    setRotationAngle((prev) => prev + (x - startX) * 0.5);
    setStartX(x);
  };

  return (
    <section id="modulo-combos" className="relative bg-[#070b09] py-20 border-t border-emerald-500/15 overflow-hidden scroll-mt-20">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Top Credentials & Institutional Trust Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d1612]/90 via-[#101b16]/90 to-[#0d1612]/90 border border-emerald-500/20 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ChavezLogo size="sm" showSubtitle={true} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {/* Premio Nacional */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
                  Premio Nacional
                </div>
                <div className="text-xs font-medium text-gray-300">
                  Innovación Empresarial 2026
                </div>
              </div>
            </div>

            {/* Patrocinador Oficial */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-[#00ff66]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs uppercase font-extrabold tracking-wider text-[#00ff66]">
                  Patrocinador Oficial
                </div>
                <div className="text-xs font-medium text-gray-300">
                  Copa Perú 2026
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono hidden lg:block">
            RUC: {STORE_INFO.ruc}
          </div>
        </div>

        {/* Section Header: Natural Gallery Theme */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-xs font-bold tracking-widest text-[#00ff66] uppercase">
            Galería de Exhibición
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Modelos en Exhibición
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Presentación de vitrina oficial. Haz clic sobre cualquier modelo para apreciarlo en exhibición 3D publicitaria.
          </p>
        </div>

        {/* 3 Exhibition Cards: Uniform Position, Minimalist Luxury Aesthetic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {SHOWCASE_MODELS.map((item) => {
            const currentSize = selectedSizes[item.id] || 40;
            const modelDisplayName = item.name.replace('Punto Original ', '');

            return (
              <div
                key={item.id}
                className="group rounded-3xl bg-[#090f0c] border border-white/10 hover:border-emerald-500/35 p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 transition-all duration-300"
              >
                {/* 1. Sneaker Exhibition Visual: Pure Product on Pedestal (Click triggers 3D Campaign) */}
                <div
                  onClick={() => {
                    setActive3DProduct(item);
                    setRotationAngle(0);
                  }}
                  className="relative w-full h-56 sm:h-64 rounded-2xl bg-black/50 overflow-hidden cursor-pointer flex items-center justify-center group/img border border-white/5"
                  title="Clic para ver en campaña 3D"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover object-center transform group-hover/img:scale-105 transition-transform duration-500"
                  />

                  {/* Soft ambient vignette */}
                  <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />
                </div>

                {/* 2. Refined Model Name (Quiet brand kicker + clean title) */}
                <div className="mt-5 text-center space-y-1">
                  <span className="text-[11px] font-semibold tracking-widest text-emerald-400/90 uppercase block">
                    Punto Original
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {modelDisplayName}
                  </h3>
                </div>

                {/* 3. Natural Minimalist Size Selector (Clean circular touches, zero clutter) */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 sm:gap-2">
                  {item.availableSizes.map((size) => {
                    const isSelected = currentSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSelectSize(item.id, size)}
                        className={`w-9 h-9 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#00ff66] text-black font-extrabold scale-105'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        aria-label={`Talla ${size}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* 4. Action CTA (Sleek, well-proportioned button) */}
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => handleOrderShoe(item)}
                    className="w-full py-3 px-5 rounded-full bg-[#00ff66] hover:bg-[#1aff75] text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pedir por WhatsApp</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Physical Storefront & Exhibition Showroom Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#101b15] via-[#0b130e] to-[#070b09] border border-emerald-500/20 p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
          <div className="lg:w-1/2 relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl group w-full">
            <img
              loading="lazy"
              decoding="async"
              src="/assets/aistudio/Chaves_Originals_61e42aa8.webp"
              alt="Fachada Tienda Física Chavez Originals Av. San Martín 736 Cajamarca"
              className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00ff66]" />
                <span className="font-bold text-sm">Av. San Martín 736, Cajamarca</span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  status.isOpen ? 'bg-[#00ff66] text-black' : 'bg-white/90 text-black'
                }`}
              >
                {status.badge}
              </span>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[#00ff66] text-xs font-semibold">
              <Store className="w-3.5 h-3.5" />
              <span>SHOWROOM & TIENDA FÍSICA</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Visita nuestra sede en el corazón de Cajamarca
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed">
              Encuentra la exhibición completa de calzado deportivo Punto Original, pruébate tus modelos favoritos y recibe asesoría personalizada para elegir tu talla ideal.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-gray-300">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-gray-400">Horario de Atención:</div>
                <div className="font-bold text-white mt-1">Lun - Sáb: 8:30 AM - 9:00 PM</div>
                <div className="text-gray-400">Dom: 9:00 AM - 2:00 PM</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-gray-400">Garantía de Tienda:</div>
                <div className="font-bold text-[#00ff66] mt-1">100% Original</div>
                <div className="text-gray-400">Prueba de talla y boleta oficial</div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
              >
                <MapPin className="w-4 h-4 text-[#00ff66]" />
                <span>Cómo Llegar en Google Maps</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* 3D Advertising Campaign Showcase Modal: Pure Product, Zero Text */}
      {active3DProduct && (
        <div
          ref={viewerRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Vista 360° de ${active3DProduct.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in select-none outline-none"
          onClick={() => setActive3DProduct(null)}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle close button */}
          <button
            type="button"
            onClick={() => setActive3DProduct(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50 border border-white/10"
            aria-label="Cerrar exhibición"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 3D Commercial Campaign Stage */}
          <div
            className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {/* Cinematic light beams & spotlights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-radial from-emerald-400/20 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Rotating 3D Exhibition Stage */}
            <div
              className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center transition-transform duration-75 cursor-grab active:cursor-grabbing"
              style={{
                perspective: '1200px',
              }}
            >
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transform: `rotateY(${rotationAngle}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Pure Product Showcase on Marble Pedestal */}
                <img
                  loading="lazy"
                  decoding="async"
                  src={active3DProduct.image}
                  alt={active3DProduct.alt}
                  draggable={false}
                  className="max-w-full max-h-[65vh] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] filter brightness-105 contrast-105 pointer-events-none"
                />
              </div>
            </div>

            {/* Subtle floor reflection effect */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 h-3 rounded-[100%] bg-emerald-400/25 blur-md pointer-events-none" />

            {/* Interactive hint on hover */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-gray-400 text-xs font-mono tracking-wider pointer-events-none">
              Arrastra para rotar 360°
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
