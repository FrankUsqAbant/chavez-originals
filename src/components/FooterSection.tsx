import React, { useEffect, useState } from 'react';
import { ChavezLogo } from './ChavezLogo';
import { LegalModal, type LegalDocId } from './LegalModal';
import { SOCIAL_LINKS, STORE_INFO } from '../data/storeData';
import { ADMIN_STORAGE_KEY } from '../lib/supabaseConfig';
import { MapPin, MessageCircle, Mail, Instagram, Facebook, Youtube, Music2, BookOpen, Lock } from 'lucide-react';

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, tiktok: Music2, youtube: Youtube };

interface FooterSectionProps {
  onOpenLibroReclamaciones: () => void;
}

const LEGAL_LINKS: { id: LegalDocId; label: string }[] = [
  { id: 'terminos', label: 'Términos y Condiciones' },
  { id: 'privacidad', label: 'Política de Privacidad' },
  { id: 'garantias', label: 'Envíos y Garantías' },
];

const PAYMENTS = ['Yape', 'Plin', 'Visa', 'Mastercard', 'Efectivo'];

const linkClass = 'text-gray-400 hover:text-[#00ff66] transition-colors';

export const FooterSection: React.FC<FooterSectionProps> = ({ onOpenLibroReclamaciones }) => {
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);

  // Punto verde si hay una sesión de administrador abierta en este navegador (solo indicador visual)
  const [adminSession, setAdminSession] = useState(false);
  useEffect(() => {
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

  return (
    <>
      <footer className="bg-[#060a08] text-gray-300 pt-14 pb-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Marca */}
            <div className="space-y-4">
              <ChavezLogo size="md" />
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Calzado deportivo y urbano en Cajamarca. Distribuidor exclusivo de Punto Original y distribuidor
                oficial de VELCAN.
              </p>
              <p className="text-sm font-semibold text-[#00ff66]">{STORE_INFO.slogan}</p>
            </div>

            {/* Contacto */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">Contacto</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-[#00ff66] shrink-0" aria-hidden="true" />
                  <a href={STORE_INFO.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {STORE_INFO.address}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-[#00ff66] shrink-0" aria-hidden="true" />
                  <a
                    href={`https://wa.me/51${STORE_INFO.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {STORE_INFO.whatsappDisplay}
                  </a>
                </li>
                {/* TODO: confirmar que este correo es real. */}
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#00ff66] shrink-0" aria-hidden="true" />
                  <a href={`mailto:${STORE_INFO.email}`} className={`${linkClass} truncate`}>
                    {STORE_INFO.email}
                  </a>
                </li>
              </ul>
              <ul className="flex items-center gap-2" aria-label="Redes sociales">
                {SOCIAL_LINKS.filter((s) => s.url).map(({ id, label, url }) => {
                  const Icon = SOCIAL_ICONS[id];
                  return (
                    <li key={id}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${label} de Chavez Originals`}
                        title={label}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#00ff66] hover:text-[#00ff66] text-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">Legal</h4>
              <ul className="space-y-3 text-sm">
                {LEGAL_LINKS.map(({ id, label }) => (
                  <li key={id}>
                    <button type="button" onClick={() => setLegalDoc(id)} className={`${linkClass} text-left cursor-pointer`}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onOpenLibroReclamaciones}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ff66]/60 hover:border-[#00ff66] hover:bg-[#00ff66]/10 text-sm font-semibold text-white transition-colors cursor-pointer"
                aria-label="Abrir Libro de Reclamaciones Virtual"
              >
                <BookOpen className="w-4 h-4 text-[#00ff66]" aria-hidden="true" />
                Libro de Reclamaciones
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p>
                © 2026 {STORE_INFO.legalName} · RUC {STORE_INFO.ruc}
              </p>
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-300 transition-colors"
                aria-label="Acceso de administrador (se abre en una pestaña nueva)"
              >
                <Lock className="w-3 h-3" aria-hidden="true" />
                Administrador
                {adminSession && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" aria-hidden="true" />}
              </a>
            </div>
            <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Medios de pago">
              {PAYMENTS.map((p) => (
                <li key={p} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </>
  );
};
