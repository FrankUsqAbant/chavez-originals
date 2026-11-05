import React from 'react';
import { ExternalLink, KeyRound, LogOut, Package } from 'lucide-react';
import { ChavezLogo } from '../components/ChavezLogo';

export type Page = 'productos' | 'clave';

interface ShellProps {
  email: string;
  active: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV: { page: Page; label: string; Icon: typeof Package }[] = [
  { page: 'productos', label: 'Productos', Icon: Package },
  { page: 'clave', label: 'Contraseña', Icon: KeyRound },
];

/** Marco del panel: barra lateral en pantallas grandes; barra superior con pestañas en celular. */
export const Shell: React.FC<ShellProps> = ({ email, active, onNavigate, onLogout, children }) => {
  const navButton = (page: Page, label: string, Icon: typeof Package, compact = false) => {
    const on = active === page;
    return (
      <button
        key={page}
        type="button"
        onClick={() => onNavigate(page)}
        aria-current={on ? 'page' : undefined}
        className={`flex items-center gap-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${compact ? 'px-3.5 py-2' : 'w-full px-3 py-2.5'} ${on ? 'bg-[#00ff66]/10 text-[#00ff66]' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />{label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-white lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      {/* Barra lateral (escritorio) */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen border-r border-white/10 bg-[#0a100d] p-5">
        <div className="px-1 pb-6 border-b border-white/10"><ChavezLogo size="md" /></div>
        <p className="mt-6 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Gestión</p>
        <nav aria-label="Secciones del panel" className="space-y-1">{NAV.map((n) => navButton(n.page, n.label, n.Icon))}</nav>
        <p className="mt-6 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Enlaces</p>
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors">
          <ExternalLink className="w-4 h-4" aria-hidden="true" />Ver tienda
        </a>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500">Sesión iniciada</p>
            <p className="truncate text-sm font-semibold" title={email}>{email}</p>
          </div>
          <button type="button" onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-sm font-semibold text-gray-200 hover:bg-white/[0.07] transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" aria-hidden="true" />Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior (celular y tablet) */}
        <header className="lg:hidden sticky top-0 z-30 border-b border-white/10 bg-[#0a100d]">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <ChavezLogo size="sm" />
            <div className="flex items-center gap-1">
              <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Ver tienda" title="Ver tienda" className="grid place-items-center w-9 h-9 rounded-lg text-gray-300 hover:bg-white/10"><ExternalLink className="w-4 h-4" /></a>
              <button type="button" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión" className="grid place-items-center w-9 h-9 rounded-lg text-gray-300 hover:bg-white/10 cursor-pointer"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
          <nav aria-label="Secciones del panel" className="flex gap-1 px-3 pb-2">{NAV.map((n) => navButton(n.page, n.label, n.Icon, true))}</nav>
        </header>

        <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-9 max-w-6xl">{children}</main>
      </div>
    </div>
  );
};
