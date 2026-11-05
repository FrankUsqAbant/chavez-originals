import { useSyncExternalStore } from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS, shoeImage, type Product } from '../data/storeData';
import heroModels from '../data/hero-models.json';
import { restHeaders, supabaseConfig } from './supabaseConfig';

/**
 * Catálogo desde Supabase (tabla `productos`). Cualquiera puede leer los productos activos; solo el
 * administrador puede modificarlos (ver el panel en components/admin). Si no hay conexión o falta la
 * configuración, se usa el catálogo incluido en el sitio (storeData.ts) para que la tienda nunca quede vacía.
 */

export interface ProductColorRow {
  nombre: string;
  hex: string;
  /** Color de las imágenes incluidas en el sitio (solo si el producto usa un `modelo`). */
  id?: string;
}

export interface ProductRow {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  etiqueta: string | null;
  descripcion: string;
  tallas: number[];
  caracteristicas: string[];
  colores: ProductColorRow[];
  /** Modelo con imágenes incluidas en el sitio (futbol-pro, air-glow-tech, ...). */
  modelo: string | null;
  /** Foto propia subida a Storage. */
  imagen_url: string | null;
  imagen_path: string | null;
  combo: boolean;
  activo: boolean;
  orden: number;
}

type ModelsJson = Record<string, { colorways: { id: string }[] }>;
const models = heroModels as ModelsJson;

/** Solo se aceptan fotos que estén en el almacenamiento de este proyecto. */
function trustedPhoto(url: string | null): string | undefined {
  const cfg = supabaseConfig();
  return url && cfg && url.startsWith(`${cfg.url}/storage/v1/object/public/productos/`) ? url : undefined;
}

function imageFor(row: ProductRow, colorId: string | undefined, file: '01' | 'thumb'): string | undefined {
  if (row.modelo && models[row.modelo]) {
    const id = colorId ?? models[row.modelo].colorways[0]?.id;
    if (id) return shoeImage(row.modelo, id, file);
  }
  return trustedPhoto(row.imagen_url);
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.nombre,
    code: row.codigo,
    price: Number(row.precio),
    image: imageFor(row, row.colores[0]?.id, 'thumb') ?? '',
    badge: row.etiqueta ?? undefined,
    description: row.descripcion,
    sizes: row.tallas,
    colors: row.colores.map((c) => ({ name: c.nombre, hex: c.hex, previewImage: imageFor(row, c.id, '01') })),
    features: row.caracteristicas,
    comboIncluded: row.combo || undefined,
  };
}

/* ------------------------------ almacén reactivo ------------------------------ */
interface CatalogState {
  products: Product[];
  /** loading: aún sin respuesta · ready: desde la base de datos · fallback: catálogo incluido en el sitio */
  status: 'loading' | 'ready' | 'fallback';
}

let state: CatalogState = { products: [], status: 'loading' };
const listeners = new Set<() => void>();
const set = (next: CatalogState) => {
  state = next;
  listeners.forEach((l) => l());
};

/** El panel de administración publica aquí la lista que acaba de guardar, para que la tienda se actualice al instante. */
export function setCatalogFromRows(rows: ProductRow[]) {
  const active = rows.filter((r) => r.activo).sort((a, b) => a.orden - b.orden);
  set({ products: active.map(rowToProduct).filter((p) => p.image), status: 'ready' });
}

let inFlight: Promise<void> | null = null;

/** Vuelve a leer el catálogo (el panel de administración lo llama después de cada cambio). */
export function refreshProducts(): Promise<void> {
  inFlight ??= (async () => {
    const cfg = supabaseConfig();
    if (!cfg) return set({ products: FALLBACK_PRODUCTS, status: 'fallback' });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${cfg.url}/rest/v1/productos?select=*&activo=eq.true&order=orden.asc,creado.asc`, {
        headers: restHeaders(cfg.key),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(String(res.status));
      const rows = (await res.json()) as ProductRow[];
      set({ products: rows.map(rowToProduct).filter((p) => p.image), status: 'ready' });
    } catch {
      // Sin conexión o servidor caído: se conserva lo último que se había cargado, o el catálogo del sitio
      if (state.status !== 'ready') set({ products: FALLBACK_PRODUCTS, status: 'fallback' });
    } finally {
      clearTimeout(timer);
      inFlight = null;
    }
  })();
  return inFlight;
};

let started = false;
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!started) {
    started = true;
    void refreshProducts();
  }
  return () => listeners.delete(listener);
};

export const useProducts = (): CatalogState => useSyncExternalStore(subscribe, () => state);
