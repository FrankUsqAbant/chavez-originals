import React from 'react';
import { PRODUCTS, Product } from '../data/storeData';
import { formatPeruvianCurrency } from '../utils/b2b-logic';
import { ShoppingBag } from 'lucide-react';

interface CatalogSectionProps {
  onSelectProductModal: (product: Product) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({ onSelectProductModal }) => {
  return (
    <section id="modulo-catalogo" className="bg-[#070b09] py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Catálogo de Calzado
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Elige tu modelo, selecciona la talla y pide directo por WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {PRODUCTS.map((product) => (
            <article
              key={product.id}
              className="group w-full md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)] rounded-3xl bg-[#090f0c] border border-white/10 hover:border-emerald-500/40 p-6 flex flex-col transition-colors duration-300"
            >
              <button
                type="button"
                onClick={() => onSelectProductModal(product)}
                className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden cursor-pointer bg-[radial-gradient(ellipse_at_50%_58%,#2a3d34_0%,#101a15_55%,#0a100d_100%)]"
                aria-label={`Ver detalles de ${product.name}`}
              >
                <span
                  className="absolute bottom-7 left-1/2 -translate-x-1/2 w-3/5 h-5 bg-[radial-gradient(closest-side,rgba(0,0,0,0.6),transparent)]"
                  aria-hidden="true"
                />
                <img
                  loading="lazy"
                  decoding="async"
                  src={product.image}
                  alt={product.name}
                  className="relative w-full h-full object-contain p-3 pt-8 transition-transform duration-500 group-hover:scale-105"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-[#00ff66] text-xs font-semibold tracking-wide">
                    {product.badge}
                  </span>
                )}
              </button>

              <div className="pt-5 flex-1 space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{product.name}</h3>
                <div className="text-2xl font-black text-[#00ff66]">
                  {product.price !== undefined ? (
                    formatPeruvianCurrency(product.price)
                  ) : (
                    <span className="text-lg font-bold text-gray-300">Consultar precio</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectProductModal(product)}
                className="mt-5 w-full py-3 px-5 rounded-full bg-[#00ff66] hover:bg-[#1aff75] text-black font-bold text-sm tracking-wide transition-colors duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Elegir talla y pedir</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
