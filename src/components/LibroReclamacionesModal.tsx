import React, { useState } from 'react';
import { STORE_INFO } from '../data/storeData';
import { formatClaimTicketCode } from '../utils/b2b-logic';
import { X, BookOpen, CheckCircle, AlertCircle, FileText, Send, Download } from 'lucide-react';

interface LibroReclamacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LibroReclamacionesModal: React.FC<LibroReclamacionesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [claimType, setClaimType] = useState<'RECLAMO' | 'QUEJA'>('RECLAMO');
  const [formData, setFormData] = useState({
    fullName: '',
    docType: 'DNI',
    docNumber: '',
    phone: '',
    email: '',
    address: '',
    isMinor: false,
    parentName: '',
    goodType: 'PRODUCTO',
    amount: '',
    goodDescription: '',
    claimDetail: '',
    consumerRequest: '',
    agreed: false,
  });

  const [submittedTicket, setSubmittedTicket] = useState<{
    code: string;
    date: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.docNumber || !formData.claimDetail || !formData.agreed) {
      alert('Por favor complete los campos obligatorios y acepte los términos de veracidad.');
      return;
    }

    const ticketCode = formatClaimTicketCode(claimType, Math.floor(Math.random() * 900) + 100);
    const dateStr = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setSubmittedTicket({
      code: ticketCode,
      date: dateStr,
    });
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reclamaciones-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0c1410] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar Libro de Reclamaciones"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedTicket ? (
          /* Confirmation View */
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#00ff66]/20 border border-[#00ff66] flex items-center justify-center mx-auto text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.5)]">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-[#00ff66] tracking-widest block">
                HOJA DE RECLAMACIÓN VIRTUAL REGISTRADA
              </span>
              <h3 className="text-2xl font-black text-white uppercase mt-1">
                Constancia de Registro
              </h3>
              <p className="text-sm text-gray-300 mt-2 max-w-md mx-auto">
                Hemos registrado satisfactoriamente su {claimType.toLowerCase()}. Conforme a la legislación peruana (Ley N° 29571 / D.S. N° 011-2011-PCM), daremos respuesta formal en un plazo máximo de quince (15) días hábiles.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="p-5 rounded-2xl bg-black/50 border border-emerald-500/30 text-left max-w-md mx-auto space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-gray-400">N° de Registro:</span>
                <strong className="text-[#00ff66] font-bold text-sm">{submittedTicket.code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha y Hora:</span>
                <span className="text-gray-200">{submittedTicket.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Consumidor:</span>
                <span className="text-gray-200">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{formData.docType}:</span>
                <span className="text-gray-200">{formData.docNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white font-bold">{claimType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Proveedor:</span>
                <span className="text-emerald-400">{STORE_INFO.legalName} (RUC: {STORE_INFO.ruc})</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-[#00ff66] text-black font-extrabold text-xs uppercase tracking-wide hover:bg-[#1aff75] transition-all cursor-pointer"
              >
                Aceptar y Salir
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-[#00ff66] mb-1">
                <BookOpen className="w-5 h-5" />
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

            {/* Type selector: RECLAMO vs QUEJA */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">
                Seleccione el tipo de trámite:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setClaimType('RECLAMO')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    claimType === 'RECLAMO'
                      ? 'border-[#00ff66] bg-[#00ff66]/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase text-[#00ff66]">1. Reclamo</div>
                  <div className="text-[10px] text-gray-300 mt-0.5">
                    Disconformidad relacionada a los productos o servicios adquiridos.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setClaimType('QUEJA')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    claimType === 'QUEJA'
                      ? 'border-[#00ff66] bg-[#00ff66]/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase text-[#00ff66]">2. Queja</div>
                  <div className="text-[10px] text-gray-300 mt-0.5">
                    Malestar o descontento respecto a la atención o trato al público.
                  </div>
                </button>
              </div>
            </div>

            {/* Step 1: Identificación del Consumidor */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">
                1. Identificación del Consumidor Reclamante
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ej. Juan Carlos Pérez"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-gray-400 mb-1">Doc.</label>
                    <select
                      value={formData.docType}
                      onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                      className="w-full px-2 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">C.E.</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 mb-1">N° Documento *</label>
                    <input
                      type="text"
                      required
                      value={formData.docNumber}
                      onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                      placeholder="8 dígitos"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="987654321"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-400 mb-1">Domicilio (Dirección, Ciudad)</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej. Jr. Comercio 123, Cajamarca"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Identificación del Bien Contratado */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">
                2. Identificación del Bien Contratado
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Bien</label>
                  <select
                    value={formData.goodType}
                    onChange={(e) => setFormData({ ...formData, goodType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  >
                    <option value="PRODUCTO">Producto (Calzado / Chimpunes / Zapatillas)</option>
                    <option value="SERVICIO">Servicio (Envío / Despacho / Atención)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Monto Reclamado (S/.)</label>
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Ej. S/. 189.00"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-400 mb-1">Descripción del Producto / Servicio</label>
                  <input
                    type="text"
                    value={formData.goodDescription}
                    onChange={(e) => setFormData({ ...formData, goodDescription: e.target.value })}
                    placeholder="Ej. Chimpún Punto Original EM0099-M9 Talla 41"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Detalle y Pedido */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">
                3. Detalle de la Reclamación y Pedido
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Detalle del {claimType.toLowerCase()} *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.claimDetail}
                    onChange={(e) => setFormData({ ...formData, claimDetail: e.target.value })}
                    placeholder="Describa con precisión los hechos ocurridos..."
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Pedido Concreto del Consumidor *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.consumerRequest}
                    onChange={(e) => setFormData({ ...formData, consumerRequest: e.target.value })}
                    placeholder="Indique qué solución solicita (cambio de talla, revisión, reposición, etc.)..."
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:border-[#00ff66] outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Verification checkbox */}
            <div className="flex items-start gap-2.5 text-xs text-gray-300">
              <input
                type="checkbox"
                id="legal-agree"
                required
                checked={formData.agreed}
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                className="mt-0.5 rounded border-white/20 text-[#00ff66] focus:ring-[#00ff66]"
              />
              <label htmlFor="legal-agree" className="text-[11px] leading-tight text-gray-400">
                Declaro ser el titular del servicio o apoderado y que la información consignada en esta hoja de reclamación es verídica y fidedigna.
              </label>
            </div>

            {/* Buttons */}
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
                className="px-6 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#1aff75] text-black font-extrabold text-xs uppercase tracking-wide shadow-[0_0_15px_rgba(0,255,102,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Registrar Hoja de Reclamación</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
