import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ADMIN_STORAGE_KEY, CATALOG_CHANNEL, supabaseConfig } from '../lib/supabaseConfig';

let client: SupabaseClient | null = null;

/**
 * Cliente de Supabase del panel de administración. La sesión se guarda en el navegador (localStorage) para que
 * sirva en todas las pestañas del panel; se cierra al pulsar "Cerrar sesión" o tras 60 minutos sin actividad.
 * Qué puede hacer el usuario lo decide la base de datos: solo los administradores pueden escribir en
 * `productos` y en el almacenamiento de fotos.
 */
export function adminClient(): SupabaseClient | null {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  client ??= createClient(cfg.url, cfg.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: window.localStorage,
      storageKey: ADMIN_STORAGE_KEY,
    },
  });
  return client;
}

/** Avisa a las pestañas abiertas de la tienda que el catálogo cambió, para que se actualicen solas. */
export function notifyStore() {
  try {
    const channel = new BroadcastChannel(CATALOG_CHANNEL);
    channel.postMessage('cambio');
    channel.close();
  } catch {
    /* navegador sin BroadcastChannel: la tienda mostrará el cambio al recargar */
  }
}
