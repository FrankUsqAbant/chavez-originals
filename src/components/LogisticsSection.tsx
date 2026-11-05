import React from 'react';
import { STORE_INFO } from '../data/storeData';
import { generateWhatsAppOrderLink } from '../utils/b2b-logic';
import { useStoreStatus } from '../hooks/useStoreStatus';
import {
  MapPin,
  Store,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Truck,
  CreditCard,
  ShieldCheck,
  Footprints,
} from 'lucide-react';

export const LogisticsSection: React.FC = () => {
  const status = useStoreStatus();
  const handleConsultStoreWhatsApp = () => {
    const link = generateWhatsAppOrderLink({
      phone: STORE_INFO.whatsapp,
      modelCode: 'TIENDA-CAJ',
      modelName: 'Consulta en Tienda Física',
      notes: '¡Hola Chavez Originals! Deseo consultar modelos y tallas disponibles para visitar su tienda en Av. San Martín 736.',
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="modulo-tienda"
      className="relative bg-[#070b09] py-20 border-t border-emerald-500/15 overflow-hidden scroll-mt-20"
    >
      {/* Anchor aliases for backward compatibility */}
      <span id="modulo-ubicacion" className="absolute -top-24" />
      <span id="modulo-logistica" className="absolute -top-24" />

      {/* Subtle ambient green glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5 text-[#00ff66]" />
            <span>Sede Oficial en Cajamarca</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Nuestra Tienda Física
          </h2>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Visítanos en nuestro local central en <strong className="text-white">Av. San Martín 736</strong> para probarte tus pares favoritos en vivo, con atención personalizada y stock de calzado deportivo y urbano.
          </p>
        </div>

        {/* 2-Column Clean Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* COLUMN 1: FACHADA & EXPERIENCIA EN TIENDA (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0c1410]/90 border border-emerald-500/25 p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
            <div className="space-y-6">
              
              {/* Storefront Image */}
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-black/60 group shadow-lg">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/assets/aistudio/Chaves_Originals_61e42aa8.webp"
                  alt="Fachada Tienda Chavez Originals Av. San Martín 736 Cajamarca"
                  className="w-full h-56 sm:h-64 object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Badge on photo */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 border border-emerald-500/30 text-[11px] font-bold text-[#00ff66] backdrop-blur-md flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-[#00ff66] animate-pulse' : 'bg-gray-400'}`}
                  />
                  <span>
                    {status.badge} · {status.detail}
                  </span>
                </div>

                {/* Bottom Address banner */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/85 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00ff66] shrink-0" />
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block">
                        Av. San Martín 736
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Cajamarca, Perú
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Local Central
                  </span>
                </div>
              </div>

              {/* Store Experience Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-[#00ff66] shrink-0 mt-0.5">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Prueba tu talla en vivo
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-snug mt-0.5">
                      Pruébate los chimpunes en losa o césped sintético y las zapatillas urbanas (tallas 38 a 44 según el modelo).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-[#00ff66] shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      100% Producto Original
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-snug mt-0.5">
                      Distribuidor autorizado Punto Original con garantía de cambio inmediato y boleta electrónica.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-[#00ff66] shrink-0 mt-0.5">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Todos los Medios de Pago
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-snug mt-0.5">
                      Aceptamos Yape, Plin, tarjetas Visa, Mastercard y efectivo en mostrador sin recargos.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Google Maps External Action */}
            <div className="pt-6">
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-[#00ff66] hover:text-black text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-white/15 cursor-pointer shadow-md"
              >
                <MapPin className="w-4 h-4 text-[#00ff66] group-hover:text-black" />
                <span>Abrir ubicación en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </div>

          {/* COLUMN 2: INFORMACIÓN DE ATENCIÓN, ENVIOS & CONTACTO (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0c1410]/90 border border-emerald-500/25 p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00ff66] uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Atención al Cliente & Servicios</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Horarios, Entregas & Contacto
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Todo lo que necesitas para tu visita o para pedir tu calzado favorito directamente.
                </p>
              </div>

              {/* Grid 2x2: Horario + Recojo + Delivery + Envíos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Horarios */}
                <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66]">
                    <Clock className="w-4 h-4" />
                    <span>Horario de Atención</span>
                  </div>
                  <div className="text-xs text-gray-200 space-y-1 pt-1">
                    <div>
                      <strong className="text-white">Lunes a Sábado:</strong><br />
                      <span className="text-gray-300">8:30 AM – 9:00 PM (Continuo)</span>
                    </div>
                    <div>
                      <strong className="text-white">Domingos:</strong><br />
                      <span className="text-gray-300">9:00 AM – 2:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Recojo en Tienda */}
                <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66]">
                    <Store className="w-4 h-4" />
                    <span>Recojo en Tienda</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pt-1">
                    Separa tu modelo y talla por WhatsApp y recógelo listo para ti en Av. San Martín 736 sin costo adicional.
                  </p>
                </div>

                {/* Delivery Local */}
                <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66]">
                    <Truck className="w-4 h-4" />
                    <span>Delivery en Cajamarca</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pt-1">
                    Entregas seguras y rápidas dentro de la ciudad de Cajamarca directamente a tu casa o trabajo.
                  </p>
                </div>

                {/* Envíos Nacionales */}
                <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66]">
                    <MapPin className="w-4 h-4" />
                    <span>Envíos a Todo el Perú</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pt-1">
                    Despachamos pedidos diarios por agencias autorizadas: <strong className="text-white">Shalom, Marvisur y Olva Courier</strong> con guía de remisión.
                  </p>
                </div>

              </div>

              {/* Payment Badges banner in store */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-gray-300 font-semibold">
                  Medios de pago en caja:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-[#6a1b9a]/80 text-[#00ffc4] font-black text-xs">
                    yape
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#00b0ff]/80 text-white font-black text-xs">
                    plin
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#1a1f71]/80 text-white font-bold text-xs italic">
                    VISA
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black text-gray-200 font-bold text-xs">
                    Mastercard
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs">
                    Efectivo
                  </span>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp & Phone Actions */}
            <div className="pt-6 space-y-3">
              <button
                onClick={handleConsultStoreWhatsApp}
                className="w-full py-4 px-6 rounded-2xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-black text-base tracking-wide uppercase transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Consultar Modelos y Tallas en Tienda</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 pt-1">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="w-4 h-4 text-[#00ff66]" />
                  <span>Teléfono / WhatsApp Tienda: <strong className="text-white">{STORE_INFO.whatsappDisplay}</strong></span>
                </div>
                <a
                  href={`tel:${STORE_INFO.whatsapp}`}
                  className="text-emerald-400 hover:text-white font-semibold underline underline-offset-2 transition-colors"
                >
                  Llamar directamente
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
