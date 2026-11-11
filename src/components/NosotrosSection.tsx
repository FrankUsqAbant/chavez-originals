import React from 'react';
import { STORE_INFO } from '../data/storeData';
import { Award, BadgeCheck, Trophy, Quote } from 'lucide-react';

const BRANDS = [
  {
    name: 'Punto Orito',
    role: 'Distribuidor exclusivo',
    text: 'Llevamos la marca Punto Orito a toda la región, con la garantía de fábrica en cada par.',
  },
  {
    name: 'Vena',
    role: 'Distribuidor oficial en todo Cajamarca',
    text: 'Vena llega a cada provincia de Cajamarca, con el respaldo y la garantía de Punto Orito.',
  },
];

const MILESTONES = [
  {
    icon: Award,
    image: '/assets/nosotros/premio-andino.webp',
    alt: 'Ilustración del fundador de Clavez Originals con medalla de oro junto al trofeo del Premio Andino al Comercio Digital 2026',
    title: 'Premio Andino al Comercio Digital 2026',
    text: 'Elegidos Mejor tienda deportiva online en Cajamarca (octubre de 2026) por nuestro catálogo web y la atención por WhatsApp.',
    position: 'object-[50%_50%]',
  },
  {
    icon: Trophy,
    image: '/assets/nosotros/copa-clavez-junior.webp',
    alt: 'Ilustración del fundador de Clavez Originals en la cancha junto al trofeo de la Copa Clavez Junior 2026',
    title: 'Auspiciador de la Copa Clavez Junior 2026',
    text: 'Impulsamos el fútbol de menores: 16 equipos sub-15 de los barrios de Cajamarca. El campeón recibe trofeo, medallas y chimpunes.',
    position: 'object-[50%_45%]',
  },
];

export const NosotrosSection: React.FC = () => (
  <section id="modulo-nosotros" className="bg-[#060a08] py-20 scroll-mt-20 border-y border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-3 max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {STORE_INFO.slogan.split(',')[0]},{' '}
          <span className="text-[#00ff66]">{STORE_INFO.slogan.split(',')[1].trim()}</span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Somos una empresa cajamarquina de calzado deportivo y urbano. Desde Av. San Martín 7399 atendemos al público y
          abastecemos a negocios de toda la región.
        </p>
      </div>

      {/* Marcas que distribuimos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BRANDS.map((b) => (
          <article key={b.name} className="rounded-3xl bg-[#0c1410] border border-white/10 p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66]">
              <BadgeCheck className="w-4 h-4" aria-hidden="true" />
              <span>{b.role}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black italic text-white tracking-tight">{b.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{b.text}</p>
          </article>
        ))}
      </div>

      {/* Reconocimientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MILESTONES.map(({ icon: Icon, image, alt, title, text, position }) => (
          <article key={title} className="rounded-3xl overflow-hidden bg-[#0c1410] border border-white/10 flex flex-col">
            <div className="relative h-64 sm:h-80 bg-black/50">
              <img
                loading="lazy"
                decoding="async"
                src={image}
                alt={alt}
                className={`absolute inset-0 w-full h-full object-cover ${position}`}
              />
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#00ff66]">
                <Icon className="w-4 h-4" aria-hidden="true" />
                <h3>{title}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{text}</p>
            </div>
          </article>
        ))}
      </div>

      <blockquote className="flex items-start gap-3 max-w-2xl mx-auto text-center justify-center">
        <Quote className="w-6 h-6 text-[#00ff66] shrink-0 rotate-180" aria-hidden="true" />
        <p className="text-xl sm:text-2xl font-extrabold text-white">
          No es solo un camino, <span className="text-[#00ff66] italic">es tu historia.</span>
        </p>
      </blockquote>
    </div>
  </section>
);
