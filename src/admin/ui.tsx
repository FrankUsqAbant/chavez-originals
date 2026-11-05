import React, { useEffect } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { ChavezLogo } from '../components/ChavezLogo';

/* ----------------------------- estilos compartidos ---------------------------- */
export const inputClass =
  'w-full rounded-lg bg-[#080d0a] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-[#00ff66]/70 focus:ring-2 focus:ring-[#00ff66]/15 disabled:opacity-50';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00ff66] hover:bg-[#1aff75] text-black text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-sm font-semibold text-gray-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
export const btnIcon =
  'inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed';
export const cardClass = 'rounded-xl border border-white/10 bg-[#0b110e]';

/* --------------------------------- componentes -------------------------------- */
export const Field: React.FC<{ id: string; label: string; hint?: string; children: React.ReactNode }> = ({ id, label, hint, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-gray-300">{label}</label>
    {children}
    {hint && <p className="text-[11px] leading-snug text-gray-500">{hint}</p>}
  </div>
);

/** Interruptor (sí/no) accesible. */
export const Switch: React.FC<{ checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait ${checked ? 'bg-[#00ff66]' : 'bg-white/15'}`}
  >
    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
  </button>
);

export type ToastData = { ok: boolean; text: string } | null;

/** Aviso flotante que se cierra solo. */
export const Toast: React.FC<{ toast: ToastData; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);

  return (
    <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md pointer-events-none">
      {toast && (
        <div className={`animate-in pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl ${toast.ok ? 'border-[#00ff66]/40 bg-[#0c1f15] text-[#00ff66]' : 'border-red-400/40 bg-[#1f0e0e] text-red-200'}`}>
          {toast.ok ? <Check className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <X className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
          <span className="flex-1">{toast.text}</span>
          <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="opacity-70 hover:opacity-100 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
};

/** Pantalla completa centrada para iniciar sesión o cambiar la contraseña temporal. */
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-white bg-[radial-gradient(ellipse_at_50%_0%,#0f2a1c_0%,#070b09_55%)]">
    <div className="mb-8"><ChavezLogo size="lg" /></div>
    <div className="w-full max-w-md animate-in">{children}</div>
    <a href="/" className="mt-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00ff66] transition-colors">
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />Volver a la tienda
    </a>
  </div>
);
