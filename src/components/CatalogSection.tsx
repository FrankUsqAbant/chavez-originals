import React, { useState } from 'react';
import { PRODUCTS, Product, STORE_INFO } from '../data/storeData';
import { formatPeruvianCurrency, generateWhatsAppOrderLink } from '../utils/b2b-logic';
import { ShoppingBag, Search, Sparkles, Eye } from 'lucide-react';

interface CatalogSectionProps {
  onSelectProductModal: (product: Product) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  onSelectProductModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'futbol' | 'urbano' | 'combo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track selected size for each card
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PRODUCTS.forEach((p) => {
      initial[p.id] = p.sizes.includes(40) ? 40 : p.sizes[0];
    });
    return initial;
  });

  const handleSelectSize = (productId: string, size: number) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOrderWhatsApp = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0];
    const link = generateWhatsAppOrderLink({
      phone: STORE_INFO.whatsapp,
      modelCode: product.code,
      modelName: product.name,
      size,
      comboIncluded: product.category === 'combo',
      notes: `Hola Chavez Originals, deseo pedir el modelo ${product.name} en talla ${size}.`,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="modulo-catalogo" className="relative bg-[#070b09] py-20 border-t border-emerald-500/15 overflow-hidden scroll-mt-20">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header: Clean Editorial Typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#00ff66] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Colección Oficial 2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Catálogo de Calzado
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl">
              Calzado deportivo de alta competencia y línea urbana. Selecciona tu modelo y talla para pedir directo por WhatsApp.
            </p>
          </div>

          {/* Minimalist Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo o tipo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#00ff66] transition-colors"
            />
          </div>
        </div>

        {/* Clean Filter Tabs (No bulky emoji pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-[#00ff66] text-black font-bold'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Todos ({PRODUCTS.length})
          </button>
          <button
            onClick={() => setActiveCategory('futbol')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'futbol'
                ? 'bg-[#00ff66] text-black font-bold'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Fútbol & Chimpunes
          </button>
          <button
            onClick={() => setActiveCategory('urbano')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'urbano'
                ? 'bg-[#00ff66] text-black font-bold'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Línea Urbana
          </button>
          <button
            onClick={() => setActiveCategory('combo')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'combo'
                ? 'bg-[#00ff66] text-black font-bold'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Combos Promocionales
          </button>
        </div>

        {/* Clean, Intuitive Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const currentSize = selectedSizes[product.id] || product.sizes[0];

            return (
              <div
                key={product.id}
                className="rounded-3xl bg-[#090f0c] border border-white/10 hover:border-emerald-500/40 p-6 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 transition-all duration-300 group"
              >
                {/* 1. Header: Subtle Category Kicker (No noisy codes or duplicated pills) */}
                <div className="flex items-center justify-between pb-3">
                  <span className="text-[11px] font-semibold tracking-widest text-[#00ff66] uppercase">
                    {product.badge || 'Punto Original'}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Stock en tienda
                  </span>
                </div>

                {/* 2. Pure Product Image on Studio Pedestal */}
                <div
                  onClick={() => onSelectProductModal(product)}
                  className="relative w-full h-56 sm:h-64 rounded-2xl bg-black/50 overflow-hidden cursor-pointer flex items-center justify-center border border-white/5 group/img"
                  title="Clic para ver ficha técnica detallada"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transform group-hover/img:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/35 pointer-events-none" />

                  {/* Clean detail hint overlay */}
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-gray-400 group-hover/img:text-white group-hover/img:bg-emerald-500/30 transition-all backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 3. Product Title & Pricing */}
                <div className="pt-5 space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-[#00ff66] transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-baseline justify-between pt-1">
                    <div className="text-2xl font-black text-[#00ff66]">
                      {formatPeruvianCurrency(product.price)}
                    </div>
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Disponible en tienda</span>
                    </div>
                  </div>
                </div>

                {/* 4. Interactive Size Selector (Easy and intuitive for the customer) */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Selecciona tu talla:</span>
                    <span className="text-[#00ff66] font-semibold">Talla {currentSize}</span>
                  </div>

                  <div className="flex items-center justify-start gap-1.5 flex-wrap">
                    {product.sizes.map((sz) => {
                      const isSelected = currentSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSelectSize(product.id, sz)}
                          className={`w-8 h-8 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#00ff66] text-black font-extrabold scale-105'
                              : 'text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                          }`}
                          aria-label={`Talla ${sz}`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Clear, Single Action CTA Button */}
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => handleOrderWhatsApp(product)}
                    className="w-full py-3 px-5 rounded-full bg-[#00ff66] hover:bg-[#1aff75] text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pedir Talla {currentSize} por WhatsApp</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

