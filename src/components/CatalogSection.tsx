import React, { useMemo, useState } from 'react';
import type { Product } from '../data/storeData';
import { useProducts } from '../lib/products';
import { formatPeruvianCurrency } from '../utils/store';
import { Gift, ShieldCheck, ShoppingBag } from 'lucide-react';

interface CatalogSectionProps {
  /**
   * Abre la ficha del producto; `color` es el color que el cliente eligió en la tarjeta y `colors` los colores
   * que se ofrecen de ese modelo (los mismos de la tarjeta).
   */
  onSelectProductModal: (product: Product, color?: string, colors?: string[]) => void;
}

/** Colores que se muestran por modelo: los más llamativos, para no saturar la tarjeta. */
const MAX_COLORS = 3;

const CARD_WIDTH = 'w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]';

type Category = 'futbol' | 'urbano';
const CATEGORY_LABEL: Record<Category | 'todos', string> = { todos: 'Todos', futbol: 'Fútbol', urbano: 'Urbano' };

interface ColorOption {
  name: string;
  hex: string;
  /** Imagen de la tarjeta en este color. */
  image: string;
  /** Producto que se abre al pedir este color (la variante, si existe; si no, el modelo base). */
  product: Product;
}

interface ModelGroup {
  key: string;
  name: string;
  badge?: string;
  price: number;
  /** Hay variantes con precios distintos: se muestra "Desde". */
  priceFrom: boolean;
  category: Category;
  colors: ColorOption[];
}

/** "Punto Original Fútbol Pro 2026 · Verde Chavez" → "Punto Original Fútbol Pro 2026" */
const baseName = (p: Product) => p.name.split(' · ')[0].trim();

/**
 * En la base de datos cada color puede estar cargado como un producto aparte (variante). En la tienda se
 * muestran agrupados: una tarjeta por modelo, con bolitas para cambiar de color.
 */
function groupByModel(products: Product[]): ModelGroup[] {
  const buckets = new Map<string, Product[]>();
  for (const p of products) {
    const key = baseName(p);
    buckets.set(key, [...(buckets.get(key) ?? []), p]);
  }
  return [...buckets.entries()].map(([key, items]) => {
    const rep = items.find((p) => p.name === key) ?? items[0];
    const colors: ColorOption[] = [];
    const add = (name: string, hex: string, image: string, product: Product) => {
      if (!colors.some((c) => c.name === name)) colors.push({ name, hex, image, product });
    };
    // Primero los colores que tienen su propia variante (con miniatura), luego el resto de colores del modelo
    for (const p of items) if (p.colors[0]) add(p.colors[0].name, p.colors[0].hex, p.image, p);
    for (const c of rep.colors) add(c.name, c.hex, c.previewImage ?? rep.image, rep);
    colors.splice(MAX_COLORS);
    if (colors.length === 0) colors.push({ name: '', hex: 'transparent', image: rep.image, product: rep });
    const prices = items.map((p) => p.price);
    return {
      key,
      name: key,
      badge: rep.badge,
      price: Math.min(...prices),
      priceFrom: new Set(prices).size > 1,
      category: /f[uú]tbol|chimp/i.test(rep.name) || rep.comboIncluded ? 'futbol' : 'urbano',
      colors,
    };
  });
}

/** Tarjeta de relleno mientras llega el catálogo (misma medida que una real, para que nada se mueva). */
const CardSkeleton: React.FC = () => (
  <div className={`${CARD_WIDTH} rounded-3xl bg-[#090f0c] border border-white/10 p-5 flex flex-col animate-pulse`} aria-hidden="true">
    <div className="w-full h-52 rounded-2xl bg-white/[0.04]" />
    <div className="pt-5 flex-1 space-y-3">
      <div className="h-5 w-4/5 rounded bg-white/[0.06]" />
      <div className="h-7 w-1/3 rounded bg-white/[0.06]" />
    </div>
    <div className="mt-5 h-11 rounded-full bg-white/[0.06]" />
  </div>
);

const ModelCard: React.FC<{ group: ModelGroup; onOpen: CatalogSectionProps['onSelectProductModal'] }> = ({
  group,
  onOpen,
}) => {
  const [index, setIndex] = useState(0);
  const color = group.colors[index];
  const open = () =>
    onOpen(color.product, color.name || undefined, group.colors.map((c) => c.name).filter(Boolean));

  return (
    <article
      className={`group ${CARD_WIDTH} rounded-3xl bg-[#090f0c] border border-white/10 hover:border-emerald-500/40 p-5 flex flex-col transition-colors duration-300`}
    >
      <button
        type="button"
        onClick={open}
        className="relative w-full h-52 rounded-2xl overflow-hidden cursor-pointer bg-[radial-gradient(ellipse_at_50%_58%,#2a3d34_0%,#101a15_55%,#0a100d_100%)]"
        aria-label={`Ver detalles de ${group.name}${color.name ? `, color ${color.name}` : ''}`}
      >
        <span
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/5 h-5 bg-[radial-gradient(closest-side,rgba(0,0,0,0.6),transparent)]"
          aria-hidden="true"
        />
        <img
          key={color.image}
          loading="lazy"
          decoding="async"
          src={color.image}
          alt={`${group.name}${color.name ? ` en color ${color.name}` : ''}`}
          className="relative w-full h-full object-contain p-3 pt-8 animate-in transition-transform duration-500 group-hover:scale-105"
        />
        {group.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-[#00ff66] text-[11px] font-semibold tracking-wide">
            {group.badge}
          </span>
        )}
      </button>

      <div className="pt-4 flex-1 space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">{group.name}</h3>
        <p className="inline-flex items-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00ff66]" aria-hidden="true" />
          Original garantizado
        </p>
        <div className="flex items-end justify-between gap-3 pt-1">
          <div className="text-2xl font-black text-[#00ff66] leading-none">
            {group.priceFrom && <span className="text-xs font-semibold text-gray-400 mr-1.5">Desde</span>}
            {formatPeruvianCurrency(group.price)}
          </div>
          {group.colors.length > 1 && (
            <div className="flex items-center gap-1" role="group" aria-label={`Colores de ${group.name}`}>
              {group.colors.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={i === index}
                  aria-label={c.name}
                  title={c.name}
                  className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <span
                    className={`w-[18px] h-[18px] rounded-full border transition-shadow duration-200 ${
                      i === index ? 'border-white shadow-[0_0_0_2px_#090f0c,0_0_0_3.5px_#00ff66]' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        {color.name && <p className="text-xs text-gray-500">Color: <span className="text-gray-300">{color.name}</span></p>}
      </div>

      <button
        type="button"
        onClick={open}
        className="mt-4 w-full py-3 px-5 rounded-full bg-[#00ff66] hover:bg-[#1aff75] text-black font-bold text-sm tracking-wide transition-colors duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
      >
        <ShoppingBag className="w-4 h-4" aria-hidden="true" />
        <span>Elegir talla y pedir</span>
      </button>
    </article>
  );
};

export const CatalogSection: React.FC<CatalogSectionProps> = ({ onSelectProductModal }) => {
  const { products, status } = useProducts();
  const groups = useMemo(() => groupByModel(products), [products]);
  const [filter, setFilter] = useState<Category | 'todos'>('todos');

  const counts = { futbol: 0, urbano: 0 };
  groups.forEach((g) => counts[g.category]++);
  const showFilters = counts.futbol > 0 && counts.urbano > 0;
  const visible = filter === 'todos' ? groups : groups.filter((g) => g.category === filter);

  return (
    <section id="modulo-catalogo" className="bg-[#070b09] py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Catálogo de Calzado</h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Elige tu modelo y color, selecciona la talla y pide directo por WhatsApp.
            </p>
          </div>
          {showFilters && (
            <div className="flex gap-2" role="group" aria-label="Filtrar por tipo de calzado">
              {(['todos', 'futbol', 'urbano'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  aria-pressed={filter === id}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
                    filter === id
                      ? 'bg-white text-black border-white'
                      : 'border-white/15 text-gray-300 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {CATEGORY_LABEL[id]}
                  <span className={`ml-1.5 text-xs ${filter === id ? 'text-black/50' : 'text-gray-500'}`}>
                    {id === 'todos' ? groups.length : counts[id]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-[#00ff66]/30 bg-[#00ff66]/[0.06] px-5 py-4">
          <Gift className="w-6 h-6 text-[#00ff66] shrink-0" aria-hidden="true" />
          <p className="text-sm text-gray-200">
            <strong className="text-white">¡Gratis con tu chimpún de fútbol!</strong> Mochila deportiva + canilleras +
            medias 3/4.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {status === 'loading' && Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
          {status !== 'loading' && groups.length === 0 && (
            <p className="py-16 text-gray-400 text-center">
              Pronto tendremos nuevos modelos. Escríbenos por WhatsApp para consultar disponibilidad.
            </p>
          )}
          {visible.map((group) => (
            <ModelCard key={group.key} group={group} onOpen={onSelectProductModal} />
          ))}
        </div>
      </div>
    </section>
  );
};
