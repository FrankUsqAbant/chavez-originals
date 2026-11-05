import type { ClaimFormData, ClaimType } from '../utils/claims';
import { restHeaders, supabaseConfig } from './supabaseConfig';

/**
 * Envío de hojas de reclamación a Supabase (función `registrar_reclamo`).
 * - El número de hoja lo asigna el servidor.
 * - La tabla no es legible desde internet: solo esta función puede escribir en ella.
 * - La clave "publishable" es pública por diseño; sin la función no da acceso a ningún dato.
 */

export type ReclamoErrorTipo =
  | 'sin_config' // faltan las variables de entorno
  | 'limite' // demasiados envíos desde la misma conexión
  | 'datos' // el servidor rechazó los datos
  | 'red'; // sin conexión o servidor caído

export class ReclamoError extends Error {
  constructor(public readonly tipo: ReclamoErrorTipo) {
    super(tipo);
    this.name = 'ReclamoError';
  }
}

export const reclamosConfigurado = () => supabaseConfig() !== null;

export async function enviarReclamo(
  type: ClaimType,
  data: ClaimFormData,
  trap = '',
): Promise<{ code: string; createdAt: string }> {
  const cfg = supabaseConfig();
  if (!cfg) throw new ReclamoError('sin_config');
  const headers = restHeaders(cfg.key);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${cfg.url}/rest/v1/rpc/registrar_reclamo`, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        p: {
          tipo: type,
          nombre: data.fullName,
          tipo_doc: data.docType,
          nro_doc: data.docNumber,
          telefono: data.phone,
          correo: data.email,
          domicilio: data.address,
          tipo_bien: data.goodType,
          descripcion_bien: data.goodDescription,
          monto: data.amount,
          detalle: data.claimDetail,
          pedido: data.consumerRequest,
          website: trap,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = String(body?.message ?? '');
      if (message.includes('limite_excedido')) throw new ReclamoError('limite');
      if (message.includes('datos_invalidos')) throw new ReclamoError('datos');
      throw new ReclamoError('red');
    }

    const json = await res.json();
    if (typeof json?.codigo !== 'string') throw new ReclamoError('red');
    return { code: json.codigo, createdAt: String(json.creado_en ?? new Date().toISOString()) };
  } catch (err) {
    if (err instanceof ReclamoError) throw err;
    throw new ReclamoError('red');
  } finally {
    clearTimeout(timer);
  }
}
