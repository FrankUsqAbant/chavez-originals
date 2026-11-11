import React, { useId, useState } from 'react';
import { STORE_INFO } from '../data/storeData';
import { useModal } from '../hooks/useModal';
import {
  buildClaimMessage,
  provisionalCode,
  type ClaimFormData,
  type ClaimRecord,
  type ClaimType,
} from '../utils/claims';
import { enviarReclamo, ReclamoError } from '../lib/reclamos';
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
  const [submitted, setSubmitted] = useState<ClaimRecord | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trap, setTrap] = useState('');

  const set = <K extends keyof ClaimFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || sending) return;
    setError(null);
    setSending(true);
    try {
      const { code, createdAt } = await enviarReclamo(claimType, form, trap);
      setSubmitted({ code, type: claimType, createdAt, data: form, saved: true });
    } catch (err) {
      const tipo = err instanceof ReclamoError ? err.tipo : 'red';
      if (tipo === 'limite') {
        setError('Has enviado varias hojas seguidas. Espera una hora o escríbenos por WhatsApp.');
      } else if (tipo === 'datos') {
        setError('Revisa los datos: algún campo está vacío, es muy corto o tiene un formato inválido.');
      } else {
        // Sin conexión o servicio caído: la hoja no se pierde, se entrega por WhatsApp o correo.
        setSubmitted({
          code: provisionalCode(),
          type: claimType,
          createdAt: new Date().toISOString(),
          data: form,
          saved: false,
        });
      }
    } finally {
      setSending(false);
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 animate-in"
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
              <span className="text-xs text-[#00ff66] block">
                {submitted.saved ? 'Hoja registrada' : 'Hoja generada · falta enviarla'}
              </span>
              <h3 id="reclamaciones-title" className="text-2xl font-black text-white mt-1">
                Hoja N° {submitted.code}
              </h3>
              <p className="text-sm text-gray-300 mt-2 max-w-md mx-auto">
                {submitted.saved ? (
                  <>
                    Tu {submitted.type.toLowerCase()} quedó registrado. Conserva este número de hoja. La
                    respuesta se brinda dentro del plazo que establece la normativa de protección al
                    consumidor. Si quieres, envía una copia a la tienda.
                  </>
                ) : (
                  <>
                    No pudimos registrar tu hoja en línea. Tu {submitted.type.toLowerCase()} queda presentado
                    cuando la envías a la tienda: usa uno de los botones y conserva este número provisional.
                  </>
                )}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/50 border border-emerald-500/30 text-left max-w-md mx-auto space-y-2 text-xs ">
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ff66] text-black font-extrabold text-xs hover:bg-[#1aff75] transition-[color,background-color,border-color,opacity,transform]"
              >
                <MessageCircle className="w-4 h-4 fill-current" aria-hidden="true" />
                {submitted.saved ? 'Enviar copia por WhatsApp' : 'Enviar por WhatsApp'}
              </a>
              <a
                href={mailUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 border border-white/15 transition-[color,background-color,border-color,opacity,transform]"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                {submitted.saved ? 'Enviar copia por correo' : 'Enviar por correo'}
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
                <span className="text-xs font-bold ">
                  Conforme al D.S. N° 011-2011-PCM / INDECOPI
                </span>
              </div>
              <h3 id="reclamaciones-title" className="text-2xl font-black text-white tracking-tight">
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
                    className={`p-3 rounded-xl border text-left transition-[color,background-color,border-color,opacity,transform] cursor-pointer ${
                      claimType === value
                        ? 'border-[#00ff66] bg-[#00ff66]/10 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-[#00ff66]">{title}</div>
                    <div className="text-xs text-gray-300 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </fieldset>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] ">
                1. Identificación del consumidor
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Field label="Nombre completo" required>
                  {(id) => (
                    <input id={id} type="text" required autoComplete="name" value={form.fullName}
                      onChange={set('fullName')} minLength={3} maxLength={120} placeholder="Ej. Juan Carlos Pérez" className={inputCls} />
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
                        onChange={set('docNumber')} minLength={5} maxLength={20} placeholder="8 dígitos" className={inputCls} />
                    )}
                  </Field>
                </div>

                <Field label="Teléfono / WhatsApp" required>
                  {(id) => (
                    <input id={id} type="tel" required autoComplete="tel" value={form.phone}
                      onChange={set('phone')} minLength={6} maxLength={20} placeholder="987654321" className={inputCls} />
                  )}
                </Field>
                <Field label="Correo electrónico" required>
                  {(id) => (
                    <input id={id} type="email" required autoComplete="email" value={form.email}
                      onChange={set('email')} maxLength={160} placeholder="correo@ejemplo.com" className={inputCls} />
                  )}
                </Field>
                <Field label="Domicilio (dirección, ciudad)" className="sm:col-span-2">
                  {(id) => (
                    <input id={id} type="text" autoComplete="street-address" value={form.address}
                      onChange={set('address')} maxLength={200} placeholder="Ej. Jr. Comercio 123, Cajamarca" className={inputCls} />
                  )}
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] ">
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
                      onChange={set('amount')} maxLength={40} placeholder="Ej. 189.00" className={inputCls} />
                  )}
                </Field>
                <Field label="Descripción del producto / servicio" className="sm:col-span-2">
                  {(id) => (
                    <input id={id} type="text" value={form.goodDescription}
                      onChange={set('goodDescription')} maxLength={300}
                      placeholder="Ej. Chimpún Punto Orito EM0099-M9 talla 41" className={inputCls} />
                  )}
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] ">
                3. Detalle y pedido del consumidor
              </h4>
              <div className="space-y-3 text-xs">
                <Field label={`Detalle del ${claimType.toLowerCase()}`} required>
                  {(id) => (
                    <textarea id={id} required rows={3} value={form.claimDetail}
                      onChange={set('claimDetail')} minLength={10} maxLength={3000}
                      placeholder="Describa con precisión los hechos ocurridos..." className={inputCls} />
                  )}
                </Field>
                <Field label="Pedido concreto del consumidor" required>
                  {(id) => (
                    <textarea id={id} required rows={2} value={form.consumerRequest}
                      onChange={set('consumerRequest')} minLength={5} maxLength={1500}
                      placeholder="Qué solución solicita (cambio de talla, revisión, reposición...)" className={inputCls} />
                  )}
                </Field>
              </div>
            </section>

            {/* Campo trampa para bots: invisible para las personas */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Sitio web
                <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
              </label>
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

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
                disabled={sending}
                className="px-6 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-extrabold text-xs transition-[color,background-color,border-color,opacity,transform] flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{sending ? 'Enviando…' : 'Generar hoja de reclamación'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
