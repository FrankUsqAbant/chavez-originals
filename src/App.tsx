/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { scrollToSection } from './lib/smoothScroll';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { LogisticsSection } from './components/LogisticsSection';
import { FooterSection } from './components/FooterSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LibroReclamacionesModal } from './components/LibroReclamacionesModal';
import { Product, STORE_INFO } from './data/storeData';
import { MessageCircle } from 'lucide-react';

export default function App() {
  const [isLibroOpen, setIsLibroOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleNavigateSection = scrollToSection;

  return (
    <div className="min-h-screen bg-[#070b09] text-white flex flex-col font-sans selection:bg-[#00ff66] selection:text-black">
      {/* Top Navbar */}
      <Navbar onNavigateSection={handleNavigateSection} />

      <main className="flex-1">
        {/* MÓDULO 01: Hero & Showcase 360° */}
        <HeroSection
          onExploreCatalog={() => handleNavigateSection('modulo-catalogo')}
          onExploreStore={() => handleNavigateSection('modulo-tienda')}
        />

        {/* Catálogo Completo 2026 */}
        <CatalogSection
          onSelectProductModal={(product) => setSelectedProduct(product)}
        />

        {/* MÓDULO 03: Logística B2B & Ubicación */}
        <LogisticsSection />
      </main>

      {/* MÓDULO FINAL: Footer Oficial */}
      <FooterSection
        onOpenLibroReclamaciones={() => setIsLibroOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Floating Action WhatsApp Button */}
      <aside aria-label="Contacto flotante" className="fixed bottom-6 right-6 z-40">
        <a
          href={`https://wa.me/51${STORE_INFO.whatsapp}?text=${encodeURIComponent('Hola Chavez Originals, deseo cotizar calzado deportivo y urbano.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#00ff66] text-black hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Contactar por WhatsApp directamente"
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-[#070b09] animate-pulse" />
          <MessageCircle className="w-7 h-7 fill-current" />
          
          {/* Tooltip on hover */}
          <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-black/90 border border-emerald-500/30 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            ¡Escríbenos al {STORE_INFO.whatsapp}!
          </span>
        </a>
      </aside>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Libro de Reclamaciones Virtual Modal */}
      <LibroReclamacionesModal
        isOpen={isLibroOpen}
        onClose={() => setIsLibroOpen(false)}
      />
    </div>
  );
}
