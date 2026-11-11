import React from 'react';
import { DELIVERY_PROVINCES, STORE_INFO } from '../data/storeData';
import { generateWhatsAppOrderLink } from '../utils/store';
import { MapPin, MessageCircle, Package, Truck, ShieldCheck } from 'lucide-react';

const BENEFITS = [
  { icon: Truck, title: 'Hasta la puerta de tu negocio', text: 'Nuestros camiones llevan el pedido a tu tienda en cada provincia.' },
  { icon: Package, title: 'Precios por mayor', text: 'Surte tu tienda con los modelos y tallas que más se venden.' },
  { icon: ShieldCheck, title: 'Garantía de fábrica', text: 'Productos originales Punto Orito y Vena, con respaldo directo.' },
];

export const MayoristasSection: React.FC = () => {
  const handleWholesale = () => {
    const link = generateWhatsAppOrderLink({
      phone: STORE_INFO.whatsapp,
      modelName: 'Pedido por mayor para mi negocio',
      notes: '¡Hola Clavez Originals! Tengo un negocio y deseo información de precios por mayor y entregas en mi provincia.',
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="modulo-mayoristas" className="bg-[#070b09] py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#0f2219] via-[#0c1410] to-[#070b09] border border-emerald-500/20 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              ¡Tu tienda vende, <span className="text-[#00ff66]">nosotros te abastecemos!</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Llevamos tu marca favorita Punto Orito hasta la puerta de tu negocio. Haz tu pedido al{' '}
              <strong className="text-white">{STORE_INFO.whatsapp}</strong> y prepárate para vender más.
            </p>

            <ul className="space-y-4">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 w-9 h-9 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#00ff66]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="text-sm text-gray-400">{text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleWholesale}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-black text-sm transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              <span>Quiero vender en mi negocio</span>
            </button>
          </div>

          <div className="rounded-2xl bg-black/40 border border-white/10 p-6 sm:p-8 space-y-5 self-start">
            <div className="flex items-center gap-2 text-sm font-bold text-[#00ff66]">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <h3>Llegamos a estas provincias</h3>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {DELIVERY_PROVINCES.map((p) => (
                <li
                  key={p}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" aria-hidden="true" />
                  {p}
                </li>
              ))}
              <li className="px-4 py-3 rounded-xl border border-dashed border-[#00ff66]/40 text-sm font-semibold text-[#00ff66] flex items-center">
                y Cajamarca ciudad
              </li>
            </ul>
            <p className="text-xs text-gray-500">¿Tu provincia no está en la lista? Escríbenos y coordinamos el envío.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
