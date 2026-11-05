import React, { useState } from 'react';
import { Product, STORE_INFO } from '../data/storeData';
import { formatPeruvianCurrency, generateWhatsAppOrderLink } from '../utils/b2b-logic';
import { useModal } from '../hooks/useModal';
import { X, Check, ShoppingBag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

/** Contenedor: monta el contenido solo con producto, así el estado se reinicia en cada apertura. */
export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;
  return <ProductDetailContent key={product.id} product={product} onClose={onClose} />;
};

const ProductDetailContent: React.FC<{ product: Product; onClose: () => void }> = ({
  product,
  onClose,
}) => {
  const dialogRef = useModal<HTMLDivElement>(true, onClose);
  const [selectedSize, setSelectedSize] = useState<number>(
    product.sizes.includes(40) ? 40 : product.sizes[0],
  );
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? '');

  const handleOrderWhatsApp = () => {
    const link = generateWhatsAppOrderLink({
      phone: STORE_INFO.whatsapp,
      modelCode: product.code,
      modelName: product.name,
      size: selectedSize,
      color: selectedColor || undefined,
      comboIncluded: product.category === 'combo',
      notes: 'Solicito confirmación de disponibilidad para compra directa o envío a provincia.',
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in"
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
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar ventana de producto"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-2xl bg-black/50 border border-white/10 p-6 flex items-center justify-center min-h-[300px]">
            <img
              src={product.image}
              alt={product.name}
              className="relative z-10 w-full max-h-72 object-contain rounded-xl"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#00ff66] text-black font-extrabold text-xs tracking-wider uppercase">
                {product.badge}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-[#00ff66] uppercase tracking-wider">
                CÓDIGO: {product.code}
              </div>
              <h3
                id="product-modal-title"
                className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-2 ${
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
              <legend className="text-xs font-bold text-gray-400 mb-1.5">
                Talla (PE/EUR): <span className="text-[#00ff66] font-bold">{selectedSize}</span>
              </legend>
              <div className="grid grid-cols-7 gap-1.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    aria-pressed={selectedSize === sz}
                    className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-[#00ff66] text-black font-black'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
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
                <span className="text-xs text-gray-400 block">Precio Oficial</span>
                <span className="text-2xl sm:text-3xl font-black text-[#00ff66]">
                  {formatPeruvianCurrency(product.price)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleOrderWhatsApp}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-black text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
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
