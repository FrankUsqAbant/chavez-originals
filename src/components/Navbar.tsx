import React, { useState } from 'react';
import { ChavezLogo } from './ChavezLogo';
import { STORE_INFO } from '../data/storeData';
import { ADMIN_STORAGE_KEY } from '../lib/supabaseConfig';
import { Lock, MessageCircle, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('modulo-hero');

  React.useEffect(() => {
    const ids = ['modulo-hero', 'modulo-catalogo', 'modulo-tienda'];
    const LINE = 160; // sección activa = la que cruza esta línea desde el borde superior
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
        { rootMargin: `-${LINE}px 0px -${Math.max(0, window.innerHeight - LINE - 1)}px 0px` },
      );
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer!.observe(el);
      });
    };

    setup();
    // Solo se reconstruye si cambia el ancho o el alto cambia bastante (no por la barra de direcciones del móvil)
    let timer = 0;
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 120) return;
        lastW = window.innerWidth;
        lastH = window.innerHeight;
        setup();
      }, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      observer?.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  // Punto verde si hay una sesión de administrador abierta en este navegador (solo indicador visual)
  const [adminSession, setAdminSession] = useState(false);
  React.useEffect(() => {
    const check = () => {
      try {
        setAdminSession(window.localStorage.getItem(ADMIN_STORAGE_KEY) !== null);
      } catch {
        setAdminSession(false);
      }
    };
    check();
    window.addEventListener('storage', check);
    window.addEventListener('focus', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('focus', check);
    };
  }, []);

  const navItems = [
    { id: 'modulo-hero', label: 'Inicio' },
    { id: 'modulo-catalogo', label: 'Catálogo' },
    { id: 'modulo-tienda', label: 'Nuestra Tienda' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070b09] border-b border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-8">
        
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
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff66] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Direct WhatsApp Action */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="relative p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-gray-400 hover:text-[#00ff66] hover:border-[#00ff66]/40 transition-colors cursor-pointer"
            aria-label="Acceso de administrador (se abre en una pestaña nueva)"
            title="Administrador"
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            {adminSession && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff66] border-2 border-[#070b09]" aria-hidden="true" />}
          </a>
          <a
            href={`https://wa.me/51${STORE_INFO.whatsapp}?text=${encodeURIComponent('Hola Chavez Originals, deseo consultar sobre el calzado en exhibición.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-extrabold text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
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

          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-left px-4 py-2.5 mt-2 border-t border-white/10 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            <span>Administrador</span>
          </a>
        </div>
      )}
    </header>
  );
};
