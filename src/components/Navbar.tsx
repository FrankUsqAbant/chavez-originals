import React, { useState } from 'react';
import { ChavezLogo } from './ChavezLogo';
import { STORE_INFO } from '../data/storeData';
import { MessageCircle, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenLibroReclamaciones: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('modulo-hero');

  React.useEffect(() => {
    const sections = [
      { id: 'modulo-hero', offset: 0 },
      { id: 'modulo-combos', offset: 0 },
      { id: 'modulo-catalogo', offset: 0 },
      { id: 'modulo-tienda', offset: 0 },
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          if (scrollPos >= top) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  const navItems = [
    { id: 'modulo-hero', label: 'Inicio' },
    { id: 'modulo-combos', label: 'Exhibición' },
    { id: 'modulo-catalogo', label: 'Catálogo' },
    { id: 'modulo-tienda', label: 'Nuestra Tienda' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#070b09]/95 border-b border-emerald-500/15 shadow-lg transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Logo */}
        <button
          onClick={() => handleNavClick('modulo-hero')}
          className="flex items-center text-left focus:outline-none group cursor-pointer shrink-0"
          aria-label="Ir al inicio"
        >
          <ChavezLogo size="md" />
        </button>

        {/* Zone 2: Clean Typography Navigation (No capsule boxes or status dots) */}
        <nav
          className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium"
          aria-label="Navegación principal"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#00ff66] font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff66] rounded-full shadow-[0_0_8px_#00ff66]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Direct WhatsApp Action */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <a
            href={`https://wa.me/51${STORE_INFO.whatsapp}?text=${encodeURIComponent('Hola Chavez Originals, deseo consultar sobre el calzado en exhibición.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-extrabold text-sm tracking-wide shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_25px_rgba(0,255,102,0.5)] transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href={`https://wa.me/51${STORE_INFO.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-[#00ff66] text-black"
            aria-label="WhatsApp directo"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 focus:outline-none cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090e0b] border-b border-emerald-500/20 px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-3 duration-200">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 text-base font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-emerald-500/15 text-[#00ff66]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" />}
              </button>
            );
          })}

          <div className="pt-2">
            <a
              href={`https://wa.me/51${STORE_INFO.whatsapp}?text=${encodeURIComponent('Hola Chavez Originals, deseo información.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00ff66] text-black font-extrabold text-sm shadow-[0_0_15px_rgba(0,255,102,0.3)]"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
