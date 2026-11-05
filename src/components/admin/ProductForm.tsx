import React, { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import heroModels from '../../data/hero-models.json';
import type { ProductColorRow, ProductRow } from '../../lib/products';
import { fotoAWebp } from './imageTools';
import { inputClass } from './LoginForm';

type Models = Record<string, { colorways: { id: string; name: string; hex: string }[] }>;
const MODELS = heroModels as Models;
const MODEL_LABELS: Record<string, string> = {
  'futbol-pro': 'Fútbol Pro (chimpún)',
  'air-glow-tech': 'Air Glow Tech',
  'chunky-lavender': 'Chunky Lavender',
};
const SIZE_OPTIONS = Array.from({ length: 13 }, (_, i) => 34 + i);
const HEX = /^#[0-9a-f]{6}$/i;

interface ProductFormProps {
  client: SupabaseClient;
  /** null = producto nuevo; sin `id` = copia de otro; con `id` = edición. */
  initial: Partial<ProductRow> | null;
  nextOrden: number;
  onDone: (message: string, saved: ProductRow) => void;
  onCancel: () => void;
  onDirty: (dirty: boolean) => void;
}

const friendlyError = (e: unknown): string => {
  const err = e as { code?: string; message?: string; statusCode?: string } | undefined;
  if (err?.code === '42501' || err?.statusCode === '403') return 'No tienes permiso para guardar. Vuelve a iniciar sesión.';
  if (err?.code === '23514') return 'Algún dato no cumple las reglas (revisa longitudes, precio y que haya imagen).';
  if (e instanceof Error && !err?.code) return e.message;
  return 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.';
};

const Field: React.FC<{ id: string; label: string; hint?: string; children: React.ReactNode }> = ({ id, label, hint, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-xs font-bold text-gray-300">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
  </div>
);

export const ProductForm: React.FC<ProductFormProps> = ({ client, initial, nextOrden, onDone, onCancel, onDirty }) => {
  const init = initial ?? {};
  const isEdit = Boolean(init.id);
  const startModelo = init.modelo && MODELS[init.modelo] ? init.modelo : Object.keys(MODELS)[0];
  const startIds = (init.colores ?? []).map((c) => c.id).filter((id): id is string => Boolean(id));

  const [nombre, setNombre] = useState(init.nombre ?? '');
  const [codigo, setCodigo] = useState(init.codigo ?? '');
  const [precio, setPrecio] = useState(init.precio != null ? String(init.precio) : '');
  const [etiqueta, setEtiqueta] = useState(init.etiqueta ?? '');
  const [descripcion, setDescripcion] = useState(init.descripcion ?? '');
  const [tallas, setTallas] = useState<number[]>(init.tallas ?? [38, 39, 40, 41, 42, 43]);
  const [caracteristicas, setCaracteristicas] = useState((init.caracteristicas ?? []).join('\n'));
  const [combo, setCombo] = useState(init.combo ?? false);
  const [activo, setActivo] = useState(init.activo ?? true);

  const [mode, setMode] = useState<'modelo' | 'foto'>(init.imagen_url ? 'foto' : 'modelo');
  const [modelo, setModelo] = useState(startModelo);
  const [colorIds, setColorIds] = useState<string[]>(
    init.modelo && startIds.length ? startIds : MODELS[startModelo].colorways.map((c) => c.id),
  );
  const [custom, setCustom] = useState<ProductColorRow[]>(
    init.imagen_url ? (init.colores ?? []).map((c) => ({ nombre: c.nombre, hex: c.hex })) : [],
  );
  const [file, setFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : init.imagen_url ?? null), [file, init.imagen_url]);
  useEffect(() => () => {
    if (file && preview) URL.revokeObjectURL(preview);
  }, [file, preview]);

  const mark = () => onDirty(true);
  const palette = MODELS[modelo].colorways;

  const validate = (): string[] => {
    const list: string[] = [];
    const price = Number(precio.replace(',', '.'));
    if (nombre.trim().length < 3 || nombre.trim().length > 80) list.push('El nombre debe tener entre 3 y 80 caracteres.');
    if (!codigo.trim() || codigo.trim().length > 40) list.push('El código es obligatorio (máx. 40 caracteres).');
    if (precio.trim() === '' || !Number.isFinite(price) || price < 0 || price >= 100000) list.push('Ingresa un precio válido (por ejemplo 189 o 189.90).');
    else if (Math.round(price * 100) !== price * 100 && Math.abs(price * 100 - Math.round(price * 100)) > 1e-6) list.push('El precio admite máximo 2 decimales.');
    if (etiqueta.length > 30) list.push('La etiqueta admite máximo 30 caracteres.');
    if (descripcion.length > 400) list.push('La descripción admite máximo 400 caracteres.');
    if (tallas.length === 0) list.push('Elige al menos una talla.');
    const feats = caracteristicas.split('\n').map((l) => l.trim()).filter(Boolean);
    if (feats.length > 10 || feats.some((f) => f.length > 100)) list.push('Máximo 10 características de hasta 100 caracteres, una por línea.');
    if (mode === 'modelo' && colorIds.length === 0) list.push('Marca al menos un color del modelo.');
    if (mode === 'foto') {
      if (!file && !init.imagen_url) list.push('Sube una foto del producto.');
      if (custom.some((c) => !c.nombre.trim() || c.nombre.length > 30 || !HEX.test(c.hex))) list.push('Cada color necesita un nombre (máx. 30 caracteres) y un tono válido.');
    }
    return list;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const problems = validate();
    setErrors(problems);
    if (problems.length) return;

    setBusy(true);
    const bucket = client.storage.from('productos');
    let uploadedPath: string | null = null;
    try {
      let imagen_url: string | null = null;
      let imagen_path: string | null = null;
      let removeOld: string | null = null;

      if (mode === 'foto') {
        if (file) {
          const blob = await fotoAWebp(file);
          const path = `${crypto.randomUUID()}.webp`;
          const up = await bucket.upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
          if (up.error) throw up.error;
          uploadedPath = path;
          imagen_url = bucket.getPublicUrl(path).data.publicUrl;
          imagen_path = path;
          removeOld = init.imagen_path ?? null;
        } else {
          imagen_url = init.imagen_url ?? null;
          imagen_path = init.imagen_path ?? null;
        }
      } else {
        removeOld = init.imagen_path ?? null; // pasó de foto propia a imagen del sitio
      }

      const colores: ProductColorRow[] =
        mode === 'modelo'
          ? colorIds.map((id) => {
              const c = palette.find((p) => p.id === id)!;
              return { nombre: c.name, hex: c.hex, id };
            })
          : custom.map((c) => ({ nombre: c.nombre.trim(), hex: c.hex.toLowerCase() }));

      const payload = {
        nombre: nombre.trim(),
        codigo: codigo.trim(),
        precio: Math.round(Number(precio.replace(',', '.')) * 100) / 100,
        etiqueta: etiqueta.trim() || null,
        descripcion: descripcion.trim(),
        tallas: [...tallas].sort((a, b) => a - b),
        caracteristicas: caracteristicas.split('\n').map((l) => l.trim()).filter(Boolean),
        colores,
        modelo: mode === 'modelo' ? modelo : null,
        imagen_url,
        imagen_path,
        combo,
        activo,
      };

      const { data: saved, error } = isEdit
        ? await client.from('productos').update(payload).eq('id', init.id!).select('*').single()
        : await client.from('productos').insert({ ...payload, orden: nextOrden }).select('*').single();
      if (error) throw error;

      if (removeOld) await bucket.remove([removeOld]); // la foto anterior ya no se usa
      onDirty(false);
      onDone(isEdit ? 'Producto actualizado.' : 'Producto creado.', saved as ProductRow);
    } catch (err) {
      if (uploadedPath) await bucket.remove([uploadedPath]); // no dejar fotos huérfanas si falló el guardado
      setErrors([friendlyError(err)]);
    } finally {
      setBusy(false);
    }
  };

  const toggleSize = (n: number) => {
    setTallas((t) => (t.includes(n) ? t.filter((x) => x !== n) : [...t, n]));
    mark();
  };
  const toggleColor = (id: string) => {
    setColorIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    mark();
  };

  return (
    <form onSubmit={submit} onChange={mark} noValidate className="space-y-6">
      <h3 className="text-xl font-extrabold">{isEdit ? 'Editar producto' : init.nombre ? 'Copia de producto' : 'Nuevo producto'}</h3>

      {errors.length > 0 && (
        <ul role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 space-y-1 list-disc list-inside">
          {errors.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="f-nombre" label="Nombre *"><input id="f-nombre" value={nombre} maxLength={80} onChange={(e) => setNombre(e.target.value)} className={inputClass} placeholder="Punto Original Fútbol Pro 2026" /></Field>
        <Field id="f-codigo" label="Código *"><input id="f-codigo" value={codigo} maxLength={40} onChange={(e) => setCodigo(e.target.value)} className={inputClass} placeholder="EM0099-M9" /></Field>
        <Field id="f-precio" label="Precio (S/.) *"><input id="f-precio" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} className={inputClass} placeholder="189.00" /></Field>
        <Field id="f-etiqueta" label="Etiqueta" hint="Texto corto sobre la foto, por ejemplo “NUEVO” u “OFERTA”."><input id="f-etiqueta" value={etiqueta} maxLength={30} onChange={(e) => setEtiqueta(e.target.value)} className={inputClass} /></Field>
      </div>

      <Field id="f-desc" label="Descripción"><textarea id="f-desc" rows={3} maxLength={400} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputClass} /></Field>

      <fieldset className="space-y-2">
        <legend className="text-xs font-bold text-gray-300">Tallas disponibles *</legend>
        <div className="flex flex-wrap gap-1.5">
          {SIZE_OPTIONS.map((n) => (
            <button key={n} type="button" aria-pressed={tallas.includes(n)} onClick={() => toggleSize(n)}
              className={`w-11 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${tallas.includes(n) ? 'bg-[#00ff66] text-black border-[#00ff66]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}>
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <Field id="f-feats" label="Características" hint="Una por línea (máximo 10)."><textarea id="f-feats" rows={4} value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} className={inputClass} /></Field>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-4">
        <legend className="px-2 text-xs font-bold text-gray-300">Imagen y colores *</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer"><input type="radio" name="modo-imagen" checked={mode === 'modelo'} onChange={() => setMode('modelo')} className="accent-[#00ff66]" />Usar un modelo del sitio</label>
          <label className="inline-flex items-center gap-2 cursor-pointer"><input type="radio" name="modo-imagen" checked={mode === 'foto'} onChange={() => setMode('foto')} className="accent-[#00ff66]" />Subir mi propia foto</label>
        </div>

        {mode === 'modelo' ? (
          <div className="space-y-3">
            <Field id="f-modelo" label="Modelo" hint="Las imágenes de estos modelos ya vienen con el sitio y cambian con el color.">
              <select id="f-modelo" value={modelo} onChange={(e) => { setModelo(e.target.value); setColorIds(MODELS[e.target.value].colorways.map((c) => c.id)); }} className={inputClass}>
                {Object.keys(MODELS).map((id) => <option key={id} value={id} className="bg-[#0c1410]">{MODEL_LABELS[id] ?? id}</option>)}
              </select>
            </Field>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-gray-300">Colores a ofrecer (el marcado como principal se ve en el catálogo)</p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {palette.map((c) => {
                  const on = colorIds.includes(c.id);
                  return (
                    <li key={c.id} className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${on ? 'border-[#00ff66]/50 bg-[#00ff66]/5' : 'border-white/10'}`}>
                      <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={on} onChange={() => toggleColor(c.id)} className="accent-[#00ff66]" />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                        {c.name}
                      </label>
                      {on && (
                        <label className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                          <input type="radio" name="color-principal" checked={colorIds[0] === c.id} onChange={() => { setColorIds([c.id, ...colorIds.filter((x) => x !== c.id)]); mark(); }} className="accent-[#00ff66]" />
                          Principal
                        </label>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-28 h-28 rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_58%,#2a3d34_0%,#101a15_55%,#0a100d_100%)] flex items-center justify-center overflow-hidden">
                {preview ? <img src={preview} alt="Vista previa de la foto" className="w-full h-full object-contain" /> : <ImagePlus className="w-7 h-7 text-gray-500" aria-hidden="true" />}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="f-foto" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold cursor-pointer transition-colors">
                  <ImagePlus className="w-4 h-4" aria-hidden="true" />{preview ? 'Cambiar foto' : 'Elegir foto'}
                </label>
                <input id="f-foto" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] ?? null); mark(); }} />
                <p className="text-[11px] text-gray-500 max-w-xs">Mejor con fondo transparente (PNG) o fondo liso oscuro. Se reduce y optimiza sola al subirla.</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-300">Colores (opcional)</p>
              {custom.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input aria-label={`Color ${i + 1}: tono`} type="color" value={HEX.test(c.hex) ? c.hex : '#ffffff'} onChange={(e) => setCustom((l) => l.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="w-10 h-10 rounded-lg bg-transparent border border-white/15 cursor-pointer" />
                  <input aria-label={`Color ${i + 1}: nombre`} value={c.nombre} maxLength={30} placeholder="Nombre del color" onChange={(e) => setCustom((l) => l.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} className={inputClass} />
                  <button type="button" aria-label={`Quitar color ${i + 1}`} onClick={() => { setCustom((l) => l.filter((_, j) => j !== i)); mark(); }} className="p-2.5 rounded-lg text-gray-400 hover:text-red-300 hover:bg-white/5 cursor-pointer"><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                </div>
              ))}
              {custom.length < 8 && (
                <button type="button" onClick={() => { setCustom((l) => [...l, { nombre: '', hex: '#ffffff' }]); mark(); }} className="inline-flex items-center gap-1.5 text-sm text-[#00ff66] hover:underline cursor-pointer"><Plus className="w-4 h-4" aria-hidden="true" />Agregar color</button>
              )}
            </div>
          </div>
        )}
      </fieldset>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <label className="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={combo} onChange={(e) => setCombo(e.target.checked)} className="accent-[#00ff66]" />Incluye combo gratis (mochila + canilleras + medias)</label>
        <label className="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="accent-[#00ff66]" />Visible en la tienda</label>
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-white/10">
        <button type="button" onClick={onCancel} disabled={busy} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50">Cancelar</button>
        <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#1aff75] text-black text-sm font-extrabold transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-60">
          <Save className="w-4 h-4" aria-hidden="true" />{busy ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
