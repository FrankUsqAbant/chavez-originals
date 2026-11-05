import React, { useId, useState } from 'react';
import { STORE_INFO } from '../data/storeData';
import { useModal } from '../hooks/useModal';
import {
  buildClaimMessage,
  registerClaim,
  type ClaimFormData,
  type ClaimType,
  type StoredClaim,
} from '../utils/claims';
import { X, BookOpen, CheckCircle, Send, Mail, MessageCircle } from 'lucide-react';

interface LibroReclamacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM: ClaimFormData = {
  fullName: '',
  docType: 'DNI',
  docNumber: '',
  phone: '',
  email: '',
  address: '',
  goodType: 'PRODUCTO',
  amount: '',
  goodDescription: '',
  claimDetail: '',
  consumerRequest: '',
};

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:border-[#00ff66] focus:ring-1 focus:ring-[#00ff66]/40 outline-none text-xs';

/** Contenedor: el formulario se monta solo al abrir, así siempre empieza vacío. */
export const LibroReclamacionesModal: React.FC<LibroReclamacionesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <LibroForm onClose={onClose} />;
};

interface FieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: (id: string) => React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, required, className, children }) => {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-gray-400 mb-1">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children(id)}
    </div>
  );
};

const LibroForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const dialogRef = useModal<HTMLDivElement>(true, onClose);
  const [claimType, setClaimType] = useState<ClaimType>('RECLAMO');
  const [form, setForm] = useState<ClaimFormData>(EMPTY_FORM);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState<StoredClaim | null>(null);

  const set = <K extends keyof ClaimFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setSubmitted(registerClaim(claimType, form));
  };

  const claimMessage = submitted
    ? buildClaimMessage(submitted, STORE_INFO.legalName, STORE_INFO.ruc)
    : '';
  const whatsappUrl = `https://wa.me/51${STORE_INFO.whatsapp}?text=${encodeURIComponent(claimMessage)}`;
  const mailUrl = submitted
    ? `mailto:${STORE_INFO.email}?subject=${encodeURIComponent(`Hoja de reclamación ${submitted.code}`)}&body=${encodeURIComponent(claimMessage)}`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reclamaciones-title"
        className="relative w-full max-w-2xl rounded-3xl bg-[#0c1410] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh] text-white outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar Libro de Reclamaciones"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4 space-y-5 animate-in">
            <div className="w-16 h-16 rounded-full bg-[#00ff66]/20 border border-[#00ff66] flex items-center justify-center mx-auto text-[#00ff66]">
              <CheckCircle className="w-8 h-8" aria-hidden="true" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-[#00ff66] tracking-widest block">
                Hoja generada · falta enviarla
              </span>
              <h3 id="reclamaciones-title" className="text-2xl font-black text-white uppercase mt-1">
                Hoja N° {submitted.code}
              </h3>
              <p className="text-sm text-gray-300 mt-2 max-w-md mx-auto">
                Tu {submitted.type.toLowerCase()} queda presentado cuando envías esta hoja a la tienda.
                Usa uno de los botones y conserva el número de hoja. La respuesta se brinda dentro del
                plazo que establece la normativa de protección al consumidor.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/50 border border-emerald-500/30 text-left max-w-md mx-auto space-y-2 text-xs font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Consumidor:</span>
                <span className="text-gray-200 text-right">{submitted.data.fullName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">{submitted.data.docType}:</span>
                <span className="text-gray-200">{submitted.data.docNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Proveedor:</span>
                <span className="text-emerald-400 text-right">{STORE_INFO.legalName}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ff66] text-black font-extrabold text-xs uppercase tracking-wide hover:bg-[#1aff75] transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" aria-hidden="true" />
                Enviar por WhatsApp
              </a>
              <a
                href={mailUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wide hover:bg-white/20 border border-white/15 transition-all"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Enviar por correo
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-gray-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-[#00ff66] mb-1">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                <span className="font-mono text-xs font-bold tracking-wider uppercase">
                  Conforme al D.S. N° 011-2011-PCM / INDECOPI
                </span>
              </div>
              <h3 id="reclamaciones-title" className="text-2xl font-black uppercase text-white tracking-tight">
                Libro de Reclamaciones Virtual
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                <strong>{STORE_INFO.legalName}</strong> · RUC: {STORE_INFO.ruc} · Sede: {STORE_INFO.address}
              </p>
            </div>

            <fieldset>
              <legend className="text-xs font-bold text-gray-300 mb-2">Tipo de trámite:</legend>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['RECLAMO', '1. Reclamo', 'Disconformidad con los productos o servicios adquiridos.'],
                    ['QUEJA', '2. Queja', 'Malestar con la atención o el trato al público.'],
                  ] as const
                ).map(([value, title, desc]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setClaimType(value)}
                    aria-pressed={claimType === value}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      claimType === value
                        ? 'border-[#00ff66] bg-[#00ff66]/10 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-extrabold text-xs uppercase text-[#00ff66]">{title}</div>
                    <div className="text-xs text-gray-300 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </fieldset>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">
                1. Identificación del consumidor
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Field label="Nombre completo" required>
                  {(id) => (
                    <input id={id} type="text" required autoComplete="name" value={form.fullName}
                      onChange={set('fullName')} placeholder="Ej. Juan Carlos Pérez" className={inputCls} />
                  )}
                </Field>

                <div className="grid grid-cols-3 gap-2">
                  <Field label="Doc.">
                    {(id) => (
                      <select id={id} value={form.docType} onChange={set('docType')} className={inputCls}>
                        <option value="DNI">DNI</option>
                        <option value="CE">C.E.</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                    )}
                  </Field>
                  <Field label="N° documento" required className="col-span-2">
                    {(id) => (
                      <input id={id} type="text" required inputMode="numeric" value={form.docNumber}
                        onChange={set('docNumber')} placeholder="8 dígitos" className={inputCls} />
                    )}
                  </Field>
                </div>

                <Field label="Teléfono / WhatsApp" required>
                  {(id) => (
                    <input id={id} type="tel" required autoComplete="tel" value={form.phone}
                      onChange={set('phone')} placeholder="987654321" className={inputCls} />
                  )}
                </Field>
                <Field label="Correo electrónico" required>
                  {(id) => (
                    <input id={id} type="email" required autoComplete="email" value={form.email}
                      onChange={set('email')} placeholder="correo@ejemplo.com" className={inputCls} />
                  )}
                </Field>
                <Field label="Domicilio (dirección, ciudad)" className="sm:col-span-2">
                  {(id) => (
                    <input id={id} type="text" autoComplete="street-address" value={form.address}
                      onChange={set('address')} placeholder="Ej. Jr. Comercio 123, Cajamarca" className={inputCls} />
                  )}
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">
                2. Identificación del bien contratado
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Field label="Tipo de bien">
                  {(id) => (
                    <select id={id} value={form.goodType} onChange={set('goodType')} className={inputCls}>
                      <option value="PRODUCTO">Producto (calzado)</option>
                      <option value="SERVICIO">Servicio (envío / atención)</option>
                    </select>
                  )}
                </Field>
                <Field label="Monto reclamado (S/.)">
                  {(id) => (
                    <input id={id} type="text" inputMode="decimal" value={form.amount}
                      onChange={set('amount')} placeholder="Ej. 189.00" className={inputCls} />
                  )}
                </Field>
                <Field label="Descripción del producto / servicio" className="sm:col-span-2">
                  {(id) => (
                    <input id={id} type="text" value={form.goodDescription}
                      onChange={set('goodDescription')}
                      placeholder="Ej. Chimpún Punto Original EM0099-M9 talla 41" className={inputCls} />
                  )}
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">
                3. Detalle y pedido del consumidor
              </h4>
              <div className="space-y-3 text-xs">
                <Field label={`Detalle del ${claimType.toLowerCase()}`} required>
                  {(id) => (
                    <textarea id={id} required rows={3} value={form.claimDetail}
                      onChange={set('claimDetail')}
                      placeholder="Describa con precisión los hechos ocurridos..." className={inputCls} />
                  )}
                </Field>
                <Field label="Pedido concreto del consumidor" required>
                  {(id) => (
                    <textarea id={id} required rows={2} value={form.consumerRequest}
                      onChange={set('consumerRequest')}
                      placeholder="Qué solución solicita (cambio de talla, revisión, reposición...)" className={inputCls} />
                  )}
                </Field>
              </div>
            </section>

            <div className="flex items-start gap-2.5 text-xs text-gray-300">
              <input
                type="checkbox"
                id="legal-agree"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-white/20 accent-[#00ff66]"
              />
              <label htmlFor="legal-agree" className="text-xs leading-tight text-gray-400">
                Declaro ser el titular del servicio o apoderado y que la información consignada en esta
                hoja de reclamación es verídica.
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-extrabold text-xs uppercase tracking-wide transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Generar hoja de reclamación</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
