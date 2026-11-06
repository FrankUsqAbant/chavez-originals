import React from 'react';
import { REVIEWS, STORE_INFO } from '../data/storeData';
import { Quote } from 'lucide-react';

/**
 * En producción solo se muestran opiniones reales. Las de demo (`ejemplo`) se ven en local o en un build de
 * presentación con VITE_DEMO_RESENAS=true.
 */
const showDemo = import.meta.env.DEV || import.meta.env.VITE_DEMO_RESENAS === 'true';
const reviews = REVIEWS.filter((r) => showDemo || !r.ejemplo);

export const ReviewsSection: React.FC = () => {
  if (reviews.length === 0) return null;
  const [featured, ...rest] = reviews;

  return (
    <section aria-labelledby="opiniones-titulo" className="bg-[#070b09] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start border-t border-white/10 pt-14">
          <div className="lg:col-span-7 space-y-6">
            <p id="opiniones-titulo" className="text-xs font-bold uppercase tracking-[0.18em] text-[#00ff66]">
              Lo que dicen nuestros clientes
            </p>
            <figure className="space-y-6">
              <Quote className="w-9 h-9 text-[#00ff66]/70" aria-hidden="true" />
              <blockquote className="text-2xl sm:text-3xl font-semibold leading-snug tracking-tight text-white">
                {featured.text}
              </blockquote>
              <figcaption className="text-sm text-gray-400">
                <span className="text-white font-semibold">{featured.name}</span> · {featured.place}
                {featured.product && <span className="text-gray-500"> · compró {featured.product}</span>}
              </figcaption>
            </figure>
          </div>

          {rest.length > 0 && (
            <ul className="lg:col-span-5 divide-y divide-white/10 border-y border-white/10">
              {rest.map((r, i) => (
                <li key={i} className="py-5">
                  <figure className="space-y-2">
                    <blockquote className="text-sm sm:text-base leading-relaxed text-gray-200">“{r.text}”</blockquote>
                    <figcaption className="text-xs text-gray-400">
                      <span className="text-white font-semibold">{r.name}</span> · {r.place}
                      {r.product && <span className="text-gray-500"> · {r.product}</span>}
                    </figcaption>
                  </figure>
                </li>
              ))}
              <li className="py-4">
                <a
                  href={STORE_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gray-300 hover:text-[#00ff66] transition-colors"
                >
                  Mira más clientes en Instagram {STORE_INFO.instagram} →
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
