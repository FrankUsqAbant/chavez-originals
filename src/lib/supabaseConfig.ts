/**
 * Configuración de Supabase (variables VITE_SUPABASE_URL y VITE_SUPABASE_KEY).
 * La clave "publishable" es pública por diseño: lo que se puede hacer con ella lo decide la base de datos
 * (reglas RLS), no el navegador.
 */
export function supabaseConfig() {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, '');
  const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined;
  return url && key ? { url, key } : null;
}

/** Cabeceras para la API REST pública (clave anon clásica = JWT; la nueva "publishable" va solo en apikey). */
export function restHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: key };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  return headers;
}

/** Clave con la que el panel de administración guarda su sesión (localStorage, compartida entre pestañas). */
export const ADMIN_STORAGE_KEY = 'chavez-admin-auth';

/** Canal por el que el panel avisa a la tienda abierta en otra pestaña que el catálogo cambió. */
export const CATALOG_CHANNEL = 'chavez-catalogo';
