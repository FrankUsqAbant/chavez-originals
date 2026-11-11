import React, { useState } from 'react';
import { Product, STORE_INFO } from '../data/storeData';
import { formatPeruvianCurrency, generateWhatsAppOrderLink } from '../utils/store';
import { useModal } from '../hooks/useModal';
import { X, Check, ShoppingBag, Ruler, ShieldCheck } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  /** Color elegido en la tarjeta del catálogo. */
  initialColor?: string;
  /** Colores que se ofrecen (los de la tarjeta del catálogo). Sin lista, se muestran todos. */
  colorNames?: string[];
  onClose: () => void;
}

/**
 * Largo del pie (cm) por talla peruana/europea. Tabla estándar REFERENCIAL: si la marca entrega su tabla
 * oficial, se reemplaza aquí.
 */
const FOOT_CM: Record<number, number> = {
  35: 22.0, 36: 22.7, 37: 23.3, 38: 24.0, 39: 24.7, 40: 25.3, 41: 26.0, 42: 26.7, 43: 27.3, 44: 28.0, 45: 28.7, 46: 29.3,
};

/** Contenedor: monta el contenido solo con producto, así el estado se reinicia en cada apertura. */
export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, initialColor, colorNames, onClose }) => {
  if (!product) return null;
  const offered = colorNames?.length ? product.colors.filter((c) => colorNames.includes(c.name)) : [];
  if (offered.length) {
    // Mismo orden que las bolitas de la tarjeta
    offered.sort((a, b) => colorNames!.indexOf(a.name) - colorNames!.indexOf(b.name));
    product = { ...product, colors: offered };
  }
  return (
    <ProductDetailContent
      key={`${product.id}-${initialColor ?? ''}`}
      product={product}
      initialColor={initialColor}
      onClose={onClose}
    />
  );
};

const ProductDetailContent: React.FC<{ product: Product; initialColor?: string; onClose: () => void }> = ({
  product,
  initialColor,
  onClose,
}) => {
  const dialogRef = useModal<HTMLDivElement>(true, onClose);
  const [selectedSize, setSelectedSize] = useState<number>(
    product.sizes.includes(40) ? 40 : product.sizes[0],
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors.find((c) => c.name === initialColor)?.name ?? product.colors[0]?.name ?? '',
  );
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const guideSizes = product.sizes.filter((sz) => FOOT_CM[sz]);
  const activeImage = product.colors.find((c) => c.name === selectedColor)?.previewImage ?? product.image;

  const handleOrderWhatsApp = () => {
    const link = generateWhatsAppOrderLink({
      phone: STORE_INFO.whatsapp,
      modelCode: product.code,
      modelName: product.name,
      size: selectedSize,
      color: selectedColor || undefined,
      comboIncluded: product.comboIncluded,
      notes: 'Solicito confirmación de disponibilidad para compra directa o envío a provincia.',
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative w-full max-w-3xl rounded-3xl bg-[#0c1410] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] text-white outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute z-20 top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar ventana de producto"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-2xl border border-white/10 p-6 flex items-center justify-center min-h-[300px] bg-[radial-gradient(ellipse_at_50%_58%,#2a3d34_0%,#101a15_55%,#0a100d_100%)]">
            <img
              key={activeImage}
              src={activeImage}
              alt={`${product.name}, color ${selectedColor}`}
              className="relative z-10 w-full max-h-72 object-contain animate-in drop-shadow-[0_18px_22px_rgba(0,0,0,0.6)]"
              style={{ viewTransitionName: 'zapato' }}
            />
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#00ff66] text-black font-extrabold text-xs ">
                {product.badge}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="text-[#00ff66] ">Código: {product.code}</span>
                <span className="inline-flex items-center gap-1 text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff66]" aria-hidden="true" />
                  Original garantizado
                </span>
              </div>
              <h3
                id="product-modal-title"
                className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1"
              >
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.colors.length > 0 && (
              <fieldset>
                <legend className="text-xs font-bold text-gray-400 mb-1.5">
                  Color: <span className="text-white">{selectedColor}</span>
                </legend>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      aria-pressed={selectedColor === c.name}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-[color,background-color,border-color,opacity,transform] cursor-pointer inline-flex items-center gap-2 ${
                        selectedColor === c.name
                          ? 'border-[#00ff66] bg-[#00ff66]/15 text-[#00ff66]'
                          : 'border-white/15 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden="true"
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="w-full mb-1.5 flex items-center justify-between gap-3 text-xs font-bold text-gray-400">
                <span>
                  Talla (PE/EUR): <span className="text-[#00ff66] font-bold">{selectedSize}</span>
                  {FOOT_CM[selectedSize] && (
                    <span className="ml-1.5 font-normal text-gray-500">· pie de {FOOT_CM[selectedSize].toFixed(1)} cm aprox.</span>
                  )}
                </span>
                {guideSizes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen((o) => !o)}
                    aria-expanded={sizeGuideOpen}
                    aria-controls="guia-tallas"
                    className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 font-semibold text-gray-300 hover:text-[#00ff66] underline underline-offset-4 decoration-white/20 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" aria-hidden="true" />
                    Guía de tallas
                  </button>
                )}
              </legend>
              <div className="grid grid-cols-7 gap-1.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    aria-pressed={selectedSize === sz}
                    className={`py-2 rounded-lg font-bold text-xs transition-[color,background-color,border-color,opacity,transform] cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-[#00ff66] text-black font-black'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              {sizeGuideOpen && (
                <div id="guia-tallas" className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2 animate-in">
                  <table className="w-full text-xs text-center">
                    <caption className="sr-only">Largo del pie en centímetros por talla</caption>
                    <tbody>
                      <tr>
                        <th scope="row" className="text-left font-semibold text-gray-400 py-1 pr-2">Talla</th>
                        {guideSizes.map((sz) => (
                          <td key={sz} className={`py-1 font-bold ${sz === selectedSize ? 'text-[#00ff66]' : 'text-white'}`}>
                            {sz}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row" className="text-left font-semibold text-gray-400 py-1 pr-2">Pie (cm)</th>
                        {guideSizes.map((sz) => (
                          <td key={sz} className={`py-1 ${sz === selectedSize ? 'text-[#00ff66]' : 'text-gray-300'}`}>
                            {FOOT_CM[sz].toFixed(1)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[11px] leading-relaxed text-gray-400">
                    <strong className="text-gray-200">Cómo medir:</strong> apoya el talón en la pared sobre una hoja, marca la
                    punta del dedo más largo y mide en cm. Si estás entre dos tallas, elige la mayor. Medidas referenciales:
                    ante la duda, escríbenos por WhatsApp.
                  </p>
                </div>
              )}
            </fieldset>

            <ul className="space-y-1.5 text-xs text-gray-300 pt-1">
              {product.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ff66] flex-shrink-0" aria-hidden="true" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400 block">Precio</span>
                <span className="text-2xl sm:text-3xl font-black text-[#00ff66]">
                  {formatPeruvianCurrency(product.price)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleOrderWhatsApp}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-black text-sm transition-[color,background-color,border-color,opacity,transform] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Pedir por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
