import React from 'react';
import { ChavezLogo } from './ChavezLogo';
import { STORE_INFO } from '../data/storeData';
import {
  MapPin,
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  BookOpen,
  Award,
  ShieldCheck,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

interface FooterSectionProps {
  onOpenLibroReclamaciones: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onOpenLibroReclamaciones,
  onNavigateSection,
}) => {
  return (
    <footer className="relative bg-[#060a08] text-gray-300 pt-16 pb-12 border-t border-emerald-500/15 overflow-hidden">
      {/* Background soft ambient green lighting */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00ff66]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Grid (Matching Image 03) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand & National Award (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <ChavezLogo size="md" />

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Distribuidor Exclusivo de Calzado Deportivo de Alta Competencia y Línea Urbana.
            </p>

            <div className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
              RUC: {STORE_INFO.ruc}
            </div>

            {/* Gold National Award Seal (Recreating the emblem in Image 03) */}
            <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-full bg-black/80 flex flex-col items-center justify-center text-amber-300 text-center">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-[7px] font-black tracking-tighter">2026</span>
                </div>
              </div>

              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                  PREMIO NACIONAL
                </div>
                <div className="text-xs font-extrabold text-white">
                  INNOVACIÓN EMPRESARIAL 2026
                </div>
                <div className="text-[9px] font-medium text-amber-400/80 tracking-wide uppercase">
                  Service Quality Excellence
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: ENLACES RÁPIDOS (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button
                  onClick={() => onNavigateSection('modulo-hero')}
                  className="text-gray-400 hover:text-[#00ff66] transition-colors cursor-pointer text-left"
                >
                  Inicio (Showcase 360°)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('modulo-combos')}
                  className="text-gray-400 hover:text-[#00ff66] transition-colors cursor-pointer text-left"
                >
                  Combos & Ofertas B2C
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('modulo-catalogo')}
                  className="text-gray-400 hover:text-[#00ff66] transition-colors cursor-pointer text-left"
                >
                  Catálogo 2026
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('modulo-tienda')}
                  className="text-gray-400 hover:text-[#00ff66] transition-colors cursor-pointer text-left"
                >
                  Tienda Oficial (Av. San Martín 736)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: LEGAL Y SOPORTE + LIBRO DE RECLAMACIONES (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">
              Legal y Soporte
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a
                  href="#terminos"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Términos y Condiciones: Todas las ventas al por mayor y menor se rigen por la garantía de fábrica Punto Original con reemplazo inmediato en tienda.');
                  }}
                  className="text-gray-400 hover:text-[#00ff66] transition-colors cursor-pointer"
                >
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a
                  href="#privacidad"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Política de Privacidad: Sus datos de contacto son confidenciales y se utilizan únicamente para procesar y coordinar envíos con agencias de transporte.');
                  }}
                  className="text-gray-400 hover:text-[#00ff66] transition-colors cursor-pointer"
                >
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a
                  href="#garantias"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Envíos y Garantías: Despachos seguros con guía de remisión a todo el norte peruano. Garantía por defecto de fabricación.');
                  }}
                  className="text-gray-400 hover:text-[#00ff66] transition-colors cursor-pointer"
                >
                  Envíos y Garantías
                </a>
              </li>
            </ul>

            {/* Glowing Libro de Reclamaciones Virtual Button (From Image 03) */}
            <div className="pt-2">
              <button
                onClick={onOpenLibroReclamaciones}
                className="group relative inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#0a120e] hover:bg-[#101e17] border-2 border-[#00ff66] text-white shadow-[0_0_20px_rgba(0,255,102,0.35)] hover:shadow-[0_0_25px_rgba(0,255,102,0.6)] transition-all duration-300 transform active:scale-95 cursor-pointer"
                aria-label="Abrir Libro de Reclamaciones Virtual"
              >
                <BookOpen className="w-5 h-5 text-[#00ff66] group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-xs font-black tracking-wide text-white leading-tight">
                    Libro de
                  </div>
                  <div className="text-xs font-black tracking-wide text-white leading-tight">
                    Reclamaciones
                  </div>
                  <div className="text-[9px] font-bold text-[#00ff66] uppercase tracking-wider">
                    Virtual
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Column 4: CONTACTO (2.5 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">
              Contacto
            </h4>

            <div className="space-y-3 text-xs">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="text-gray-300 leading-tight">
                  <span className="font-semibold block text-white">{STORE_INFO.address}</span>
                  <span className="text-gray-400 text-[11px]">Sede central de distribución</span>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/51${STORE_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#00ff66] flex items-center justify-center text-black flex-shrink-0 shadow-[0_0_10px_#00ff66]"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                </a>
                <a
                  href={`https://wa.me/51${STORE_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-[#00ff66] transition-colors"
                >
                  {STORE_INFO.whatsappDisplay}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-300 flex-shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a
                  href={`mailto:${STORE_INFO.email}`}
                  className="text-gray-300 hover:text-white transition-colors truncate"
                >
                  {STORE_INFO.email}
                </a>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-300 flex-shrink-0">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
                <a
                  href={STORE_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {STORE_INFO.instagram}
                </a>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-300 flex-shrink-0">
                  <Facebook className="w-3.5 h-3.5" />
                </div>
                <a
                  href={STORE_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {STORE_INFO.facebook}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Payment Badges & Credits (Matching Image 03 Bottom) */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Peruvian Payment Methods */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Yape */}
            <div className="px-3 py-1.5 rounded-lg bg-[#6a1b9a]/80 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00ffc4]" />
              <span className="font-extrabold text-xs text-white tracking-wider">yape</span>
            </div>

            {/* Plin */}
            <div className="px-3 py-1.5 rounded-lg bg-[#00b0ff]/80 border border-blue-400/30 flex items-center gap-1.5 shadow-sm">
              <span className="font-extrabold text-xs text-white tracking-wider">plin</span>
            </div>

            {/* VISA */}
            <div className="px-3 py-1.5 rounded-lg bg-[#1a1f71]/80 border border-blue-600/30 flex items-center shadow-sm">
              <span className="font-black italic text-xs text-white tracking-wider">VISA</span>
            </div>

            {/* Mastercard */}
            <div className="px-3 py-1.5 rounded-lg bg-[#1f1f23]/90 border border-white/10 flex items-center gap-1 shadow-sm">
              <div className="flex -space-x-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#eb001b]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] opacity-90" />
              </div>
              <span className="text-[10px] font-bold text-gray-300 ml-1">mastercard</span>
            </div>
          </div>

          {/* Business Copyright & Registered Information */}
          <div className="text-center md:text-right text-xs text-gray-400 space-y-1">
            <div className="text-gray-300 font-medium">
              © 2026 {STORE_INFO.legalName}
            </div>
            <div className="text-[11px] text-gray-400">
              RUC {STORE_INFO.ruc} · Todos los derechos reservados
            </div>
            <div className="text-[11px] text-gray-400">
              Tienda Oficial de Calzado Deportivo y Urbano en Cajamarca, Perú
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};
