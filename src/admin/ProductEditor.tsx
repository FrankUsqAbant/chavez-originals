import React, { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import heroModels from '../data/hero-models.json';
import { shoeImage } from '../data/storeData';
import type { ProductColorRow, ProductRow } from '../lib/products';
import { fotoAWebp } from './imageTools';
import { btnGhost, btnIcon, btnPrimary, cardClass, Field, inputClass, Switch } from './ui';

type Models = Record<string, { colorways: { id: string; name: string; hex: string }[] }>;
const MODELS = heroModels as Models;
const MODEL_LABELS: Record<string, string> = {
  'futbol-pro': 'Fútbol Pro (chimpún)',
  'air-glow-tech': 'Air Glow Tech',
  'chunky-lavender': 'Chunky Lavender',
};
const SIZE_OPTIONS = Array.from({ length: 13 }, (_, i) => 34 + i);
const HEX = /^#[0-9a-f]{6}$/i;

interface ProductEditorProps {
  client: SupabaseClient;
  /** null = producto nuevo; sin `id` = copia de otro; con `id` = edición. */
  initial: Partial<ProductRow> | null;
  nextOrden: number;
  onSaved: (message: string, saved: ProductRow) => void;
  onBack: () => void;
  onDirty: (dirty: boolean) => void;
}

const friendlyError = (e: unknown): string => {
  const err = e as { code?: string; message?: string; statusCode?: string } | undefined;
  if (err?.code === '42501' || err?.statusCode === '403') return 'No tienes permiso para guardar. Vuelve a iniciar sesión.';
  if (err?.code === '23514') return 'Algún dato no cumple las reglas (revisa longitudes, precio y que haya imagen).';
  if (e instanceof Error && !err?.code) return e.message;
  return 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.';
};

const Card: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section className={`${cardClass} p-5 space-y-4`}>
    <div>
      <h2 className="text-sm font-extrabold">{title}</h2>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
    {children}
  </section>
);

export const ProductEditor: React.FC<ProductEditorProps> = ({ client, initial, nextOrden, onSaved, onBack, onDirty }) => {
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
  const [colorIds, setColorIds] = useState<string[]>(init.modelo && startIds.length ? startIds : MODELS[startModelo].colorways.map((c) => c.id));
  const [custom, setCustom] = useState<ProductColorRow[]>(init.imagen_url ? (init.colores ?? []).map((c) => ({ nombre: c.nombre, hex: c.hex })) : []);
  const [file, setFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const filePreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
  }, [filePreview]);
  const preview = mode === 'foto' ? filePreview ?? init.imagen_url ?? null : colorIds[0] ? shoeImage(modelo, colorIds[0], '01') : null;

  const mark = () => onDirty(true);
  const palette = MODELS[modelo].colorways;

  const validate = (): string[] => {
    const list: string[] = [];
    const price = Number(precio.replace(',', '.'));
    if (nombre.trim().length < 3 || nombre.trim().length > 80) list.push('El nombre debe tener entre 3 y 80 caracteres.');
    if (!codigo.trim() || codigo.trim().length > 40) list.push('El código es obligatorio (máx. 40 caracteres).');
    if (precio.trim() === '' || !Number.isFinite(price) || price < 0 || price >= 100000) list.push('Ingresa un precio válido (por ejemplo 189 o 189.90).');
    else if (Math.abs(price * 100 - Math.round(price * 100)) > 1e-6) list.push('El precio admite máximo 2 decimales.');
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
    if (problems.length) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
      onSaved(isEdit ? 'Producto actualizado.' : 'Producto creado.', saved as ProductRow);
    } catch (err) {
      if (uploadedPath) await bucket.remove([uploadedPath]); // no dejar fotos huérfanas si falló el guardado
      setErrors([friendlyError(err)]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const title = isEdit ? 'Editar producto' : init.nombre ? 'Copia de producto' : 'Nuevo producto';

  return (
    <form onSubmit={submit} onChange={mark} noValidate>
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#00ff66] transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />Productos
      </button>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{title}</h1>
      {isEdit && <p className="text-sm text-gray-500 mt-1">{init.nombre}</p>}

      {errors.length > 0 && (
        <ul role="alert" className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 text-sm text-red-200 space-y-1 list-disc list-inside">
          {errors.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}

      <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_21rem] gap-6 items-start">
        <div className="space-y-6">
          <Card title="Información">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="f-nombre" label="Nombre *"><input id="f-nombre" value={nombre} maxLength={80} onChange={(e) => setNombre(e.target.value)} className={inputClass} placeholder="Punto Orito Fútbol Pro 2026" /></Field>
              <Field id="f-codigo" label="Código *"><input id="f-codigo" value={codigo} maxLength={40} onChange={(e) => setCodigo(e.target.value)} className={inputClass} placeholder="EM0099-M9" /></Field>
              <Field id="f-precio" label="Precio (S/.) *"><input id="f-precio" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} className={inputClass} placeholder="189.00" /></Field>
              <Field id="f-etiqueta" label="Etiqueta" hint="Texto corto sobre la foto: “NUEVO”, “OFERTA”…"><input id="f-etiqueta" value={etiqueta} maxLength={30} onChange={(e) => setEtiqueta(e.target.value)} className={inputClass} /></Field>
            </div>
            <Field id="f-desc" label="Descripción" hint={`${descripcion.length}/400`}><textarea id="f-desc" rows={3} maxLength={400} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputClass} /></Field>
          </Card>

          <Card title="Tallas disponibles *" hint="Toca para marcar o quitar.">
            <div className="flex flex-wrap gap-1.5">
              {SIZE_OPTIONS.map((n) => (
                <button key={n} type="button" aria-pressed={tallas.includes(n)} onClick={() => toggleSize(n)}
                  className={`w-11 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${tallas.includes(n) ? 'bg-[#00ff66] text-black border-[#00ff66]' : 'bg-white/[0.03] text-gray-300 border-white/10 hover:bg-white/10'}`}>
                  {n}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Características">
            <Field id="f-feats" label="Una por línea (máximo 10)"><textarea id="f-feats" rows={5} value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} className={inputClass} /></Field>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Imagen y colores *">
            <div className="aspect-[4/3] rounded-lg border border-white/10 bg-[radial-gradient(ellipse_at_50%_58%,#2a3d34_0%,#101a15_55%,#0a100d_100%)] grid place-items-center overflow-hidden">
              {preview ? <img src={preview} alt="Vista previa del producto" className="w-full h-full object-contain p-3" /> : <ImagePlus className="w-8 h-8 text-gray-600" aria-hidden="true" />}
            </div>

            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="modo-imagen" checked={mode === 'modelo'} onChange={() => setMode('modelo')} className="accent-[#00ff66]" />Usar un modelo del sitio</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="modo-imagen" checked={mode === 'foto'} onChange={() => setMode('foto')} className="accent-[#00ff66]" />Subir mi propia foto</label>
            </div>

            {mode === 'modelo' ? (
              <div className="space-y-3">
                <Field id="f-modelo" label="Modelo" hint="Estas imágenes ya vienen con el sitio y cambian con el color.">
                  <select id="f-modelo" value={modelo} onChange={(e) => { setModelo(e.target.value); setColorIds(MODELS[e.target.value].colorways.map((c) => c.id)); }} className={inputClass}>
                    {Object.keys(MODELS).map((id) => <option key={id} value={id} className="bg-[#0c1410]">{MODEL_LABELS[id] ?? id}</option>)}
                  </select>
                </Field>
                <fieldset className="space-y-1.5">
                  <legend className="text-xs font-semibold text-gray-300">Colores a ofrecer</legend>
                  <ul className="space-y-1.5">
                    {palette.map((c) => {
                      const on = colorIds.includes(c.id);
                      return (
                        <li key={c.id} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${on ? 'border-[#00ff66]/40 bg-[#00ff66]/5' : 'border-white/10'}`}>
                          <label className="inline-flex items-center gap-2 text-sm cursor-pointer min-w-0">
                            <input type="checkbox" checked={on} onChange={() => toggleColor(c.id)} className="accent-[#00ff66]" />
                            <span className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                            <span className="truncate">{c.name}</span>
                          </label>
                          {on && (
                            <label className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer shrink-0">
                              <input type="radio" name="color-principal" checked={colorIds[0] === c.id} onChange={() => { setColorIds([c.id, ...colorIds.filter((x) => x !== c.id)]); mark(); }} className="accent-[#00ff66]" />
                              Principal
                            </label>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="f-foto" className={`${btnGhost} w-full`}><ImagePlus className="w-4 h-4" aria-hidden="true" />{preview ? 'Cambiar foto' : 'Elegir foto'}</label>
                  <input id="f-foto" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] ?? null); mark(); }} />
                  <p className="mt-1.5 text-[11px] text-gray-500">Mejor con fondo transparente (PNG) o liso oscuro. Se reduce y optimiza sola al subirla.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-300">Colores (opcional)</p>
                  {custom.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input aria-label={`Color ${i + 1}: tono`} type="color" value={HEX.test(c.hex) ? c.hex : '#ffffff'} onChange={(e) => setCustom((l) => l.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="w-10 h-10 shrink-0 rounded-lg bg-transparent border border-white/15 cursor-pointer" />
                      <input aria-label={`Color ${i + 1}: nombre`} value={c.nombre} maxLength={30} placeholder="Nombre del color" onChange={(e) => setCustom((l) => l.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} className={inputClass} />
                      <button type="button" aria-label={`Quitar color ${i + 1}`} onClick={() => { setCustom((l) => l.filter((_, j) => j !== i)); mark(); }} className={btnIcon}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                    </div>
                  ))}
                  {custom.length < 8 && (
                    <button type="button" onClick={() => { setCustom((l) => [...l, { nombre: '', hex: '#ffffff' }]); mark(); }} className="inline-flex items-center gap-1.5 text-sm text-[#00ff66] hover:underline cursor-pointer"><Plus className="w-4 h-4" aria-hidden="true" />Agregar color</button>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card title="Opciones">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-sm font-semibold">Visible en la tienda</p><p className="text-xs text-gray-500">Si lo ocultas, solo tú lo ves aquí.</p></div>
              <Switch checked={activo} onChange={(v) => { setActivo(v); mark(); }} label="Visible en la tienda" />
            </div>
            <label className="flex items-start gap-2 text-sm cursor-pointer"><input type="checkbox" checked={combo} onChange={(e) => setCombo(e.target.checked)} className="accent-[#00ff66] mt-0.5" /><span>Incluye combo gratis<span className="block text-xs text-gray-500">Mochila + canilleras + medias</span></span></label>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 sm:-mx-6 lg:-mx-10 mt-8 px-4 sm:px-6 lg:px-10 py-3 border-t border-white/10 bg-[#070b09]/95 flex flex-wrap items-center justify-end gap-3">
        <button type="button" onClick={onBack} disabled={busy} className={btnGhost}>Cancelar</button>
        <button type="submit" disabled={busy} className={btnPrimary}><Save className="w-4 h-4" aria-hidden="true" />{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
};
