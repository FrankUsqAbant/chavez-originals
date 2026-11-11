import React from 'react';
import { STORE_INFO } from '../data/storeData';
import { useModal } from '../hooks/useModal';
import { X } from 'lucide-react';

export type LegalDocId = 'terminos' | 'privacidad' | 'garantias';

// TODO: textos base. Revisar y completar con un asesor legal antes de publicar.
const DOCS: Record<LegalDocId, { title: string; body: string[] }> = {
  terminos: {
    title: 'Términos y Condiciones',
    body: [
      `Las ventas al por mayor y al por menor de ${STORE_INFO.legalName} se rigen por la garantía de fábrica Punto Orito, con reemplazo inmediato en tienda cuando corresponda.`,
      'Los precios y la disponibilidad de modelos, tallas y colores pueden variar sin previo aviso. La disponibilidad se confirma por WhatsApp antes de concretar la compra.',
      'Los colores mostrados en pantalla son referenciales y pueden diferir ligeramente del producto real.',
    ],
  },
  privacidad: {
    title: 'Política de Privacidad',
    body: [
      'Los datos de contacto que nos proporcionas son confidenciales y se utilizan únicamente para procesar tu pedido, coordinar envíos con agencias de transporte y atender reclamos.',
      'Los pedidos se envían por WhatsApp. Si presentas una hoja de reclamación, sus datos se guardan en un servicio de base de datos con acceso restringido al titular del negocio, y se usan solo para atender tu reclamo y cumplir la normativa de protección al consumidor.',
      `Para consultas sobre tus datos escribe a ${STORE_INFO.email}.`,
    ],
  },
  garantias: {
    title: 'Envíos y Garantías',
    body: [
      'Los despachos se realizan con guía de remisión a todo el norte peruano, mediante agencias autorizadas.',
      'Todos los productos cuentan con garantía por defecto de fabricación. Conserva tu comprobante de pago para cualquier cambio o reclamo.',
      'Puedes probarte tu talla en tienda antes de comprar: Av. San Martín 7399, Cajamarca.',
    ],
  },
};

interface LegalModalProps {
  doc: LegalDocId | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ doc, onClose }) => {
  if (!doc) return null;
  return <LegalContent doc={doc} onClose={onClose} />;
};

const LegalContent: React.FC<{ doc: LegalDocId; onClose: () => void }> = ({ doc, onClose }) => {
  const ref = useModal<HTMLDivElement>(true, onClose);
  const { title, body } = DOCS[doc];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-in"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        className="relative w-full max-w-lg rounded-3xl bg-[#0c1410] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 text-white outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 id="legal-title" className="text-xl font-black uppercase tracking-tight pr-10">
          {title}
        </h3>
        <div className="mt-4 space-y-3 text-sm text-gray-300 leading-relaxed">
          {body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
