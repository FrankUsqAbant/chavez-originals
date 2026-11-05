import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ADMIN_STORAGE_KEY, supabaseConfig } from '../../lib/supabaseConfig';

let client: SupabaseClient | null = null;

/**
 * Cliente de Supabase del panel de administración. La sesión vive en sessionStorage: se cierra sola al cerrar
 * la pestaña (más seguro si se entra desde un equipo compartido). Qué puede hacer el usuario lo decide la base
 * de datos: solo los administradores pueden escribir en `productos` y en el almacenamiento de fotos.
 */
export function adminClient(): SupabaseClient | null {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  client ??= createClient(cfg.url, cfg.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: window.sessionStorage,
      storageKey: ADMIN_STORAGE_KEY,
    },
  });
  return client;
}
