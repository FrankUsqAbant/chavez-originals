import React from 'react';
import { STORE_INFO } from '../data/storeData';
import { generateWhatsAppOrderLink } from '../utils/store';
import { useStoreStatus } from '../hooks/useStoreStatus';
import { MapPin, Store, Clock, Phone, MessageCircle, ExternalLink, Truck } from 'lucide-react';

const INFO_CARDS = [
  {
    icon: Store,
    title: 'Recojo en tienda',
    text: 'Separa tu modelo y talla por WhatsApp y recógelo en Av. San Martín 736 sin costo adicional.',
  },
  {
    icon: Truck,
    title: 'Delivery en Cajamarca',
    text: 'Entregas dentro de la ciudad, a tu casa o trabajo.',
  },
  {
    icon: MapPin,
    title: 'Envíos a todo el Perú',
    text: 'Por agencias autorizadas (Shalom, Marvisur y Olva Courier) con guía de remisión.',
  },
];

export const LogisticsSection: React.FC = () => {
  const status = useStoreStatus();

  const handleConsultStoreWhatsApp = () => {
    const link = generateWhatsAppOrderLink({
      phone: STORE_INFO.whatsapp,
      modelCode: 'TIENDA-CAJ',
      modelName: 'Consulta en Tienda Física',
      notes: '¡Hola Clavez Originals! Deseo consultar modelos y tallas disponibles para visitar su tienda en Av. San Martín 736.',
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="modulo-tienda" className="bg-[#070b09] py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Nuestra Tienda</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Visítanos en <strong className="text-white">Av. San Martín 736, Cajamarca</strong> y pruébate tus pares
            favoritos con atención personalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Fachada y ubicación */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0c1410] border border-white/10 p-6 sm:p-8 flex flex-col gap-6">
            <div className="relative flex-1 min-h-[22rem] rounded-2xl overflow-hidden bg-black/60">
              <img
                loading="lazy"
                decoding="async"
                src="/assets/aistudio/Chaves_Originals_61e42aa8.webp"
                alt="Fachada de la tienda Clavez Originals en Av. San Martín 736, Cajamarca"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 text-[#00ff66] shrink-0" aria-hidden="true" />
                <span className="text-sm font-semibold">Av. San Martín 736, Cajamarca</span>
              </div>
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 text-xs font-semibold text-white flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-[#00ff66] animate-pulse' : 'bg-gray-400'}`}
                />
                <span>
                  {status.badge} · {status.detail}
                </span>
              </div>
            </div>

            <a
              href={STORE_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-[#00ff66] hover:text-black text-white font-bold text-sm transition-colors duration-200 flex items-center justify-center gap-2 border border-white/15"
            >
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>Abrir en Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
            </a>
          </div>

          {/* Horario, entregas y contacto */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0c1410] border border-white/10 p-6 sm:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#00ff66]">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Horario de atención</span>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>
                    <strong className="text-white">Lunes a sábado:</strong> 8:30 AM a 9:00 PM
                  </div>
                  <div>
                    <strong className="text-white">Domingos:</strong> 9:00 AM a 2:00 PM
                  </div>
                </div>
              </div>

              {INFO_CARDS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#00ff66]">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{title}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-3">
              <button
                type="button"
                onClick={handleConsultStoreWhatsApp}
                className="w-full py-4 px-6 rounded-2xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-black text-sm sm:text-base transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>Consultar modelos y tallas</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-300">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00ff66]" aria-hidden="true" />
                  <strong className="text-white">{STORE_INFO.whatsappDisplay}</strong>
                </span>
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
