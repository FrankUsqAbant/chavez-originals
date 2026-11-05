import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProductRow } from '../lib/products';

/** Lista completa de productos (incluye los ocultos: el administrador los ve por las reglas de la base de datos). */
export function useAdminProducts(client: SupabaseClient | null, enabled: boolean) {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!client) return;
    const { data, error } = await client.from('productos').select('*').order('orden', { ascending: true }).order('creado', { ascending: true });
    if (error) setFailed(true);
    else {
      setFailed(false);
      setRows(data as ProductRow[]);
    }
  }, [client]);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  return { rows, setRows, failed, load };
}
