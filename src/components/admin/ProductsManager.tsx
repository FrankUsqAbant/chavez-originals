import React, { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { rowToProduct, setCatalogFromRows, type ProductRow } from '../../lib/products';
import { formatPeruvianCurrency } from '../../utils/store';
import { ProductForm } from './ProductForm';

interface ProductsManagerProps {
  client: SupabaseClient;
  onDirty: (dirty: boolean) => void;
}

type View = { kind: 'list' } | { kind: 'form'; initial: Partial<ProductRow> | null };
type Notice = { ok: boolean; text: string } | null;

const iconBtn =
  'p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';

export const ProductsManager: React.FC<ProductsManagerProps> = ({ client, onDirty }) => {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [view, setView] = useState<View>({ kind: 'list' });
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  /** Muestra la lista y la publica en la tienda al mismo tiempo. */
  const apply = useCallback((next: ProductRow[]) => {
    setRows(next);
    setCatalogFromRows(next);
  }, []);

  const load = useCallback(async () => {
    const { data, error } = await client.from('productos').select('*').order('orden', { ascending: true }).order('creado', { ascending: true });
    if (error) setNotice({ ok: false, text: 'No se pudo cargar la lista de productos.' });
    else apply(data as ProductRow[]);
  }, [client, apply]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(t);
  }, [notice]);

  /**
   * Las reglas de la base de datos pueden rechazar un cambio sin dar error (0 filas): se avisa igual.
   * Si salió bien, el cambio se ve al instante y se verifica contra la base de datos en segundo plano.
   */
  const run = async (
    id: string,
    okText: string,
    action: () => PromiseLike<{ data: ProductRow[] | null; error: unknown }>,
    onOk: (changed: ProductRow[]) => ProductRow[],
  ) => {
    setBusyId(id);
    try {
      const { data, error } = await action();
      if (error || !data || data.length === 0) setNotice({ ok: false, text: 'No se pudo completar. Vuelve a iniciar sesión e inténtalo otra vez.' });
      else {
        setNotice({ ok: true, text: okText });
        apply(onOk(data));
        void load();
      }
    } catch {
      setNotice({ ok: false, text: 'Sin conexión. Inténtalo de nuevo.' });
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  const toggleActivo = (row: ProductRow) =>
    run(
      row.id,
      row.activo ? 'Producto oculto de la tienda.' : 'Producto visible en la tienda.',
      () => client.from('productos').update({ activo: !row.activo }).eq('id', row.id).select('*') as PromiseLike<{ data: ProductRow[] | null; error: unknown }>,
      ([changed]) => (rows ?? []).map((r) => (r.id === changed.id ? changed : r)),
    );

  const remove = async (row: ProductRow) => {
    await run(
      row.id,
      'Producto eliminado.',
      () => client.from('productos').delete().eq('id', row.id).select('*') as PromiseLike<{ data: ProductRow[] | null; error: unknown }>,
      () => (rows ?? []).filter((r) => r.id !== row.id),
    );
    if (row.imagen_path) await client.storage.from('productos').remove([row.imagen_path]);
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!rows) return;
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[index], next[j]] = [next[j], next[index]];
    const changes = next.map((r, i) => ({ r, orden: i + 1 })).filter(({ r, orden }) => r.orden !== orden);
    setBusyId(rows[index].id);
    const results = await Promise.all(changes.map(({ r, orden }) => client.from('productos').update({ orden }).eq('id', r.id).select('id')));
    setBusyId(null);
    if (results.some((r) => r.error || !r.data?.length)) setNotice({ ok: false, text: 'No se pudo cambiar el orden.' });
    else apply(next.map((r, i) => ({ ...r, orden: i + 1 })));
    void load();
  };

  const closeForm = (message?: string, saved?: ProductRow) => {
    onDirty(false);
    setView({ kind: 'list' });
    if (message) setNotice({ ok: true, text: message });
    if (saved) {
      const current = rows ?? [];
      const exists = current.some((r) => r.id === saved.id);
      apply((exists ? current.map((r) => (r.id === saved.id ? saved : r)) : [...current, saved]).sort((a, b) => a.orden - b.orden));
    }
    void load();
  };

  if (view.kind === 'form') {
    return (
      <ProductForm
        client={client}
        initial={view.initial}
        nextOrden={(rows?.reduce((m, r) => Math.max(m, r.orden), 0) ?? 0) + 1}
        onDone={closeForm}
        onCancel={() => closeForm()}
        onDirty={onDirty}
      />
    );
  }

  const visibles = rows?.filter((r) => r.activo).length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-extrabold">Productos</h3>
          <p className="text-sm text-gray-400">{rows ? `${rows.length} en total · ${visibles} visibles en la tienda` : 'Cargando…'}</p>
        </div>
        <button type="button" onClick={() => setView({ kind: 'form', initial: null })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#1aff75] text-black text-sm font-extrabold transition-colors cursor-pointer">
          <Plus className="w-4 h-4" aria-hidden="true" />Nuevo producto
        </button>
      </div>

      <div role="status" aria-live="polite" className="min-h-6">
        {notice && <p className={`text-sm font-semibold ${notice.ok ? 'text-[#00ff66]' : 'text-red-300'}`}>{notice.text}</p>}
      </div>

      {rows && rows.length === 0 && <p className="py-10 text-center text-gray-400">Aún no hay productos. Crea el primero con “Nuevo producto”.</p>}

      <ul className="space-y-3">
        {rows?.map((row, i) => {
          const product = rowToProduct(row);
          const busy = busyId === row.id;
          return (
            <li key={row.id} className={`rounded-2xl border p-3 sm:p-4 ${row.activo ? 'border-white/10 bg-white/[0.03]' : 'border-dashed border-white/15 bg-white/[0.01]'}`}>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 shrink-0 rounded-xl bg-[radial-gradient(ellipse_at_50%_58%,#2a3d34_0%,#101a15_55%,#0a100d_100%)] flex items-center justify-center overflow-hidden">
                  {product.image && <img src={product.image} alt="" className="w-full h-full object-contain" loading="lazy" />}
                </div>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="font-bold leading-snug break-words">{row.nombre}</p>
                  <p className="text-sm text-gray-400">
                    {row.codigo} · <span className="text-[#00ff66] font-bold">{formatPeruvianCurrency(Number(row.precio))}</span> · tallas {Math.min(...row.tallas)}–{Math.max(...row.tallas)}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${row.activo ? 'bg-[#00ff66]/15 text-[#00ff66]' : 'bg-white/10 text-gray-400'}`}>{row.activo ? 'Visible' : 'Oculto'}</span>
                </div>

                {confirmId === row.id ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm" role="alertdialog" aria-label={`Confirmar eliminación de ${row.nombre}`}>
                    <span className="text-red-200">¿Eliminar este producto? No se puede deshacer.</span>
                    <button type="button" disabled={busy} onClick={() => void remove(row)} className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold cursor-pointer disabled:opacity-60">Sí, eliminar</button>
                    <button type="button" onClick={() => setConfirmId(null)} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 font-semibold cursor-pointer">Cancelar</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 ml-auto">
                    <button type="button" className={iconBtn} disabled={busy || i === 0} onClick={() => void move(i, -1)} aria-label={`Subir ${row.nombre}`} title="Subir"><ArrowUp className="w-4 h-4" aria-hidden="true" /></button>
                    <button type="button" className={iconBtn} disabled={busy || i === rows.length - 1} onClick={() => void move(i, 1)} aria-label={`Bajar ${row.nombre}`} title="Bajar"><ArrowDown className="w-4 h-4" aria-hidden="true" /></button>
                    <button type="button" className={iconBtn} disabled={busy} onClick={() => void toggleActivo(row)} aria-label={row.activo ? `Ocultar ${row.nombre}` : `Mostrar ${row.nombre}`} title={row.activo ? 'Ocultar de la tienda' : 'Mostrar en la tienda'}>{row.activo ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}</button>
                    <button type="button" className={iconBtn} disabled={busy} onClick={() => setView({ kind: 'form', initial: row })} aria-label={`Editar ${row.nombre}`} title="Editar"><Pencil className="w-4 h-4" aria-hidden="true" /></button>
                    {!row.imagen_path && (
                      <button type="button" className={iconBtn} disabled={busy} onClick={() => setView({ kind: 'form', initial: { ...row, id: undefined, nombre: `${row.nombre} (copia)`, codigo: `${row.codigo}-2`, activo: false } })} aria-label={`Duplicar ${row.nombre}`} title="Duplicar"><Copy className="w-4 h-4" aria-hidden="true" /></button>
                    )}
                    <button type="button" className={`${iconBtn} hover:!text-red-300`} disabled={busy} onClick={() => setConfirmId(row.id)} aria-label={`Eliminar ${row.nombre}`} title="Eliminar"><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
