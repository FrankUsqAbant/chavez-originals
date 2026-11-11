import React, { useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Package, Pencil, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { rowToProduct, type ProductRow } from '../lib/products';
import { formatPeruvianCurrency } from '../utils/store';
import { notifyStore } from './client';
import { btnGhost, btnIcon, btnPrimary, cardClass, inputClass, Switch, type ToastData } from './ui';

interface ProductsPageProps {
  client: SupabaseClient;
  rows: ProductRow[] | null;
  failed: boolean;
  setRows: (rows: ProductRow[]) => void;
  reload: () => Promise<void>;
  onNew: () => void;
  onEdit: (row: ProductRow) => void;
  onDuplicate: (row: ProductRow) => void;
  notify: (toast: ToastData) => void;
}

const FILTERS = [
  ['todos', 'Todos'],
  ['visibles', 'Visibles'],
  ['ocultos', 'Ocultos'],
] as const;
type Filter = (typeof FILTERS)[number][0];

type Result = PromiseLike<{ data: ProductRow[] | null; error: unknown }>;

// Columnas de ancho fijo (salvo la del producto) para que el encabezado y las filas queden alineados
const GRID = 'md:grid md:grid-cols-[minmax(0,1fr)_6.5rem_6rem_4.5rem_15.5rem] md:items-center md:gap-4';

export const ProductsPage: React.FC<ProductsPageProps> = ({ client, rows, failed, setRows, reload, onNew, onEdit, onDuplicate, notify }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const all = rows ?? [];
  const visibles = all.filter((r) => r.activo);
  const average = visibles.length ? visibles.reduce((s, r) => s + Number(r.precio), 0) / visibles.length : 0;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((r) => (filter === 'todos' || (filter === 'visibles') === r.activo) && (!q || `${r.nombre} ${r.codigo}`.toLowerCase().includes(q)));
  }, [all, query, filter]);
  const canReorder = !query.trim() && filter === 'todos';

  /** Si salió bien, el cambio se ve al instante, se avisa a la tienda y se verifica contra la base de datos. */
  const run = async (id: string, okText: string, action: () => Result, onOk: (changed: ProductRow[]) => ProductRow[]) => {
    setBusyId(id);
    try {
      const { data, error } = await action();
      if (error || !data || data.length === 0) notify({ ok: false, text: 'No se pudo completar. Vuelve a iniciar sesión e inténtalo otra vez.' });
      else {
        notify({ ok: true, text: okText });
        setRows(onOk(data));
        notifyStore();
        void reload();
      }
    } catch {
      notify({ ok: false, text: 'Sin conexión. Inténtalo de nuevo.' });
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  const toggle = (row: ProductRow) =>
    run(
      row.id,
      row.activo ? 'Producto oculto de la tienda.' : 'Producto visible en la tienda.',
      () => client.from('productos').update({ activo: !row.activo }).eq('id', row.id).select('*') as Result,
      ([changed]) => all.map((r) => (r.id === changed.id ? changed : r)),
    );

  const remove = async (row: ProductRow) => {
    await run(row.id, 'Producto eliminado.', () => client.from('productos').delete().eq('id', row.id).select('*') as Result, () => all.filter((r) => r.id !== row.id));
    if (row.imagen_path) await client.storage.from('productos').remove([row.imagen_path]);
  };

  const move = async (row: ProductRow, dir: -1 | 1) => {
    const index = all.findIndex((r) => r.id === row.id);
    const j = index + dir;
    if (index < 0 || j < 0 || j >= all.length) return;
    const next = [...all];
    [next[index], next[j]] = [next[j], next[index]];
    const changes = next.map((r, i) => ({ r, orden: i + 1 })).filter(({ r, orden }) => r.orden !== orden);
    setBusyId(row.id);
    const results = await Promise.all(changes.map(({ r, orden }) => client.from('productos').update({ orden }).eq('id', r.id).select('id')));
    setBusyId(null);
    if (results.some((r) => r.error || !r.data?.length)) notify({ ok: false, text: 'No se pudo cambiar el orden.' });
    else {
      setRows(next.map((r, i) => ({ ...r, orden: i + 1 })));
      notifyStore();
    }
    void reload();
  };

  const stats = [
    { label: 'Productos', value: String(all.length), Icon: Package },
    { label: 'Visibles en la tienda', value: String(visibles.length), Icon: Eye },
    { label: 'Ocultos', value: String(all.length - visibles.length), Icon: EyeOff },
    { label: 'Precio promedio', value: formatPeruvianCurrency(average), Icon: Tag },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Productos</h1>
          <p className="text-sm text-gray-400 mt-1">Lo que cambies aquí se ve en la tienda al instante.</p>
        </div>
        <button type="button" onClick={onNew} className={btnPrimary}><Plus className="w-4 h-4" aria-hidden="true" />Nuevo producto</button>
      </div>

      <section aria-label="Resumen" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between text-gray-500"><span className="text-xs font-semibold">{label}</span><Icon className="w-4 h-4" aria-hidden="true" /></div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">{rows ? value : '–'}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o código…" aria-label="Buscar productos" className={`${inputClass} pl-9`} />
        </div>
        <div role="group" aria-label="Filtrar por estado" className="inline-flex rounded-lg border border-white/10 bg-[#0b110e] p-1">
          {FILTERS.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={`px-3.5 py-1.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${filter === id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>{label}</button>
          ))}
        </div>
      </div>

      <section className={`${cardClass} overflow-hidden`} aria-label="Lista de productos">
        <div className={`${GRID} hidden px-5 py-3 border-b border-white/10 text-[11px] font-bold text-gray-500`} aria-hidden="true">
          <span>Producto</span><span>Precio</span><span>Tallas</span><span>Visible</span><span className="text-right">Acciones</span>
        </div>

        {failed && <p className="p-8 text-center text-red-300">No se pudo cargar la lista. Revisa tu conexión y recarga la página.</p>}
        {!failed && !rows && <p className="p-8 text-center text-gray-400" role="status">Cargando productos…</p>}
        {rows && shown.length === 0 && (
          <p className="p-10 text-center text-gray-400">{all.length === 0 ? 'Aún no hay productos. Crea el primero con “Nuevo producto”.' : 'Ningún producto coincide con la búsqueda.'}</p>
        )}

        <ul className="divide-y divide-white/[0.06]">
          {shown.map((row) => {
            const product = rowToProduct(row);
            const busy = busyId === row.id;
            const index = all.findIndex((r) => r.id === row.id);
            return (
              <li key={row.id} className={`${GRID} px-4 sm:px-5 py-4 space-y-3 md:space-y-0 transition-opacity ${busy ? 'opacity-60' : ''} ${row.activo ? '' : 'bg-white/[0.015]'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 shrink-0 rounded-lg bg-[radial-gradient(ellipse_at_50%_58%,#2a3d34_0%,#101a15_55%,#0a100d_100%)] grid place-items-center overflow-hidden">
                    {product.image && <img src={product.image} alt="" loading="lazy" className="w-full h-full object-contain" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold leading-snug break-words">{row.nombre}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                      <span>{row.codigo}</span>
                      <span className="flex items-center gap-1" aria-label={`${row.colores.length} colores`}>
                        {row.colores.slice(0, 5).map((c) => <span key={c.nombre} title={c.nombre} className="w-2.5 h-2.5 rounded-full border border-white/25" style={{ backgroundColor: c.hex }} />)}
                        {row.colores.length > 5 && <span>+{row.colores.length - 5}</span>}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:contents">
                  <span className="font-extrabold text-[#00ff66]">{formatPeruvianCurrency(Number(row.precio))}</span>
                  <span className="text-sm text-gray-400">Tallas {Math.min(...row.tallas)} a {Math.max(...row.tallas)}</span>
                  <Switch checked={row.activo} disabled={busy} onChange={() => void toggle(row)} label={row.activo ? `Ocultar ${row.nombre} de la tienda` : `Mostrar ${row.nombre} en la tienda`} />
                </div>

                {confirmId === row.id ? (
                  <div className="flex flex-wrap items-center justify-end gap-2 text-sm" role="alertdialog" aria-label={`Confirmar eliminación de ${row.nombre}`}>
                    <span className="text-red-200">¿Eliminar? No se puede deshacer.</span>
                    <button type="button" disabled={busy} onClick={() => void remove(row)} className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold cursor-pointer disabled:opacity-60">Sí, eliminar</button>
                    <button type="button" onClick={() => setConfirmId(null)} className={btnGhost + ' !py-1.5'}>Cancelar</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-0.5">
                    <button type="button" disabled={busy} onClick={() => onEdit(row)} className={`${btnGhost} !py-2 mr-1`} aria-label={`Editar ${row.nombre}`}><Pencil className="w-3.5 h-3.5" aria-hidden="true" />Editar</button>
                    <button type="button" className={btnIcon} disabled={busy || !canReorder || index === 0} onClick={() => void move(row, -1)} aria-label={`Subir ${row.nombre}`} title={canReorder ? 'Subir' : 'Quita la búsqueda y el filtro para reordenar'}><ArrowUp className="w-4 h-4" aria-hidden="true" /></button>
                    <button type="button" className={btnIcon} disabled={busy || !canReorder || index === all.length - 1} onClick={() => void move(row, 1)} aria-label={`Bajar ${row.nombre}`} title={canReorder ? 'Bajar' : 'Quita la búsqueda y el filtro para reordenar'}><ArrowDown className="w-4 h-4" aria-hidden="true" /></button>
                    {!row.imagen_path && <button type="button" className={btnIcon} disabled={busy} onClick={() => onDuplicate(row)} aria-label={`Duplicar ${row.nombre}`} title="Duplicar"><Copy className="w-4 h-4" aria-hidden="true" /></button>}
                    <button type="button" className={`${btnIcon} hover:!text-red-300`} disabled={busy} onClick={() => setConfirmId(row.id)} aria-label={`Eliminar ${row.nombre}`} title="Eliminar"><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
