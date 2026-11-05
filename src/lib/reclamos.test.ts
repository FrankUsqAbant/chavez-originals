import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enviarReclamo, ReclamoError, reclamosConfigurado } from './reclamos';
import type { ClaimFormData } from '../utils/claims';

const data: ClaimFormData = {
  fullName: 'Ana Quispe',
  docType: 'DNI',
  docNumber: '12345678',
  phone: '987654321',
  email: 'ana@example.com',
  address: '',
  goodType: 'PRODUCTO',
  amount: '',
  goodDescription: '',
  claimDetail: 'La suela llegó despegada.',
  consumerRequest: 'Cambio del producto',
};

const jsonResponse = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

describe('enviarReclamo', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co/');
    vi.stubEnv('VITE_SUPABASE_KEY', 'sb_publishable_demo');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('envía los datos a la función RPC y devuelve el número asignado por el servidor', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { codigo: 'REC-2026-0001', creado_en: '2026-11-05T15:00:00Z' }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await enviarReclamo('RECLAMO', data, '');
    expect(res).toEqual({ code: 'REC-2026-0001', createdAt: '2026-11-05T15:00:00Z' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://demo.supabase.co/rest/v1/rpc/registrar_reclamo');
    expect(init.headers.apikey).toBe('sb_publishable_demo');
    expect(init.headers.Authorization).toBeUndefined(); // la clave publishable no es un JWT
    const body = JSON.parse(init.body);
    expect(body.p).toMatchObject({ tipo: 'RECLAMO', nombre: 'Ana Quispe', correo: 'ana@example.com', website: '' });
  });

  it('traduce los errores del servidor', async () => {
    const cases: [unknown, string][] = [
      [{ message: 'limite_excedido' }, 'limite'],
      [{ message: 'datos_invalidos' }, 'datos'],
      [{ message: 'otra cosa' }, 'red'],
    ];
    for (const [body, tipo] of cases) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(400, body)));
      await expect(enviarReclamo('QUEJA', data)).rejects.toMatchObject({ tipo });
    }
  });

  it('error de red -> "red"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(enviarReclamo('RECLAMO', data)).rejects.toBeInstanceOf(ReclamoError);
    await expect(enviarReclamo('RECLAMO', data)).rejects.toMatchObject({ tipo: 'red' });
  });

  it('sin variables de entorno -> "sin_config"', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_KEY', '');
    expect(reclamosConfigurado()).toBe(false);
    await expect(enviarReclamo('RECLAMO', data)).rejects.toMatchObject({ tipo: 'sin_config' });
  });
});
