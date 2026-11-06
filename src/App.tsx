/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { scrollToSection } from './lib/smoothScroll';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { NosotrosSection } from './components/NosotrosSection';
import { MayoristasSection } from './components/MayoristasSection';
import { LogisticsSection } from './components/LogisticsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { FooterSection } from './components/FooterSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LibroReclamacionesModal } from './components/LibroReclamacionesModal';
import { Product, STORE_INFO } from './data/storeData';
import { MessageCircle } from 'lucide-react';

export default function App() {
  const [isLibroOpen, setIsLibroOpen] = useState(false);
  const [selected, setSelected] = useState<{ product: Product; color?: string; colors?: string[] } | null>(null);

  // El botón flotante de WhatsApp es solo para celular (en pantallas grandes está en la barra superior) y
  // aparece cuando el hero queda atrás, para no tapar sus botones.
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          onSelectProductModal={(product, color, colors) => setSelected({ product, color, colors })}
        />

        {/* Opiniones de clientes (solo se publican las reales) */}
        <ReviewsSection />

        {/* Nosotros: marcas que distribuimos, premio y Copa Perú */}
        <NosotrosSection />

        {/* Mayoristas: abastecimiento a negocios en provincias */}
        <MayoristasSection />

        {/* MÓDULO 03: Logística B2B & Ubicación */}
        <LogisticsSection />
      </main>

      {/* MÓDULO FINAL: Footer Oficial */}
      <FooterSection onOpenLibroReclamaciones={() => setIsLibroOpen(true)} />

      {/* WhatsApp flotante (solo celular) */}
      <aside
        aria-label="Contacto flotante"
        className={`sm:hidden fixed bottom-5 right-5 z-40 transition-[opacity,translate] duration-300 ${
          pastHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <a
          href={`https://wa.me/51${STORE_INFO.whatsapp}?text=${encodeURIComponent('Hola Chavez Originals, deseo cotizar calzado deportivo y urbano.')}`}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={pastHero ? 0 : -1}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#00ff66] text-black shadow-[0_8px_24px_rgba(0,0,0,0.45)] active:scale-95 transition-transform"
          aria-label="Escribir por WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-current" aria-hidden="true" />
        </a>
      </aside>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selected?.product ?? null}
        initialColor={selected?.color}
        colorNames={selected?.colors}
        onClose={() => setSelected(null)}
      />

      {/* Libro de Reclamaciones Virtual Modal */}
      <LibroReclamacionesModal
        isOpen={isLibroOpen}
        onClose={() => setIsLibroOpen(false)}
      />
    </div>
  );
}
