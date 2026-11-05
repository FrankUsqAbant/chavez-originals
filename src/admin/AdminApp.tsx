import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductRow } from '../lib/products';
import { adminClient, notifyStore } from './client';
import { watchIdle } from './idle';
import { LoginPage } from './LoginPage';
import { PasswordForm } from './PasswordForm';
import { ProductEditor } from './ProductEditor';
import { ProductsPage } from './ProductsPage';
import { Shell, type Page } from './Shell';
import { AuthLayout, Toast, type ToastData } from './ui';
import { useAdminProducts } from './useAdminProducts';

/** checking: verificando sesión · out: sin sesión · in: administrador · temp: debe cambiar la contraseña temporal */
type Auth = 'checking' | 'out' | 'in' | 'temp';
type View = { name: 'productos' } | { name: 'editor'; initial: Partial<ProductRow> | null } | { name: 'clave' };

const IDLE_MS = 60 * 60 * 1000; // 60 minutos sin actividad cierran la sesión

/**
 * Panel de administración de productos: una página propia (/admin). Aunque alguien lea este código, no puede
 * modificar nada: la base de datos solo acepta cambios de la cuenta de administrador (reglas RLS de la tabla
 * `productos` y del almacenamiento de fotos), y solo cuando esa cuenta ya no usa su contraseña temporal.
 */
export const AdminApp: React.FC = () => {
  const client = adminClient();
  const [auth, setAuth] = useState<Auth>('checking');
  const [email, setEmail] = useState('');
  const [view, setView] = useState<View>({ name: 'productos' });
  const [toast, setToast] = useState<ToastData>(null);
  const [loginNotice, setLoginNotice] = useState('');
  const dirty = useRef(false);
  const { rows, setRows, failed, load } = useAdminProducts(client, auth === 'in');

  /** Lee de la base de datos qué puede hacer la sesión actual y muestra la pantalla que corresponde. */
  const enter = useCallback(async () => {
    if (!client) return setAuth('out');
    const { data } = await client.auth.getSession();
    if (!data.session) return setAuth('out');
    const { data: estado } = await client.rpc('estado_admin');
    setEmail(data.session.user.email ?? '');
    setAuth(estado === 'admin' ? 'in' : estado === 'cambiar_clave' ? 'temp' : 'out');
  }, [client]);

  useEffect(() => {
    void enter();
    if (!client) return;
    const { data: sub } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setAuth('out'); // sesión cerrada o vencida (también desde otra pestaña)
    });
    return () => sub.subscription.unsubscribe();
  }, [client, enter]);

  const logout = useCallback(
    async (message = '') => {
      await client?.auth.signOut();
      dirty.current = false;
      setView({ name: 'productos' });
      setLoginNotice(message);
      setAuth('out');
    },
    [client],
  );

  // Cierre automático por inactividad
  useEffect(() => {
    if (auth !== 'in' && auth !== 'temp') return;
    return watchIdle(window, IDLE_MS, () => void logout('Tu sesión se cerró por inactividad. Ingresa de nuevo.'));
  }, [auth, logout]);

  // Avisa si se intenta cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  /** Cambia de pantalla; si hay un formulario con cambios sin guardar, pide confirmación. */
  const go = (next: View) => {
    if (dirty.current && !window.confirm('Hay cambios sin guardar. ¿Salir de todos modos?')) return;
    dirty.current = false;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const afterPasswordChange = async () => {
    setToast({ ok: true, text: 'Contraseña actualizada. Las demás sesiones abiertas se cerraron.' });
    setView({ name: 'productos' });
    await enter(); // en el primer ingreso, pasa de "contraseña temporal" a administrador
  };

  const onSaved = (message: string, saved: ProductRow) => {
    const current = rows ?? [];
    const exists = current.some((r) => r.id === saved.id);
    setRows((exists ? current.map((r) => (r.id === saved.id ? saved : r)) : [...current, saved]).sort((a, b) => a.orden - b.orden));
    setToast({ ok: true, text: message });
    notifyStore();
    setView({ name: 'productos' });
    window.scrollTo({ top: 0 });
    void load();
  };

  let screen: React.ReactNode;
  if (!client) {
    screen = <AuthLayout><p className="text-center text-gray-300">Falta la configuración de Supabase (variables VITE_SUPABASE_URL y VITE_SUPABASE_KEY).</p></AuthLayout>;
  } else if (auth === 'checking') {
    screen = <div className="min-h-screen grid place-items-center text-gray-400" role="status">Verificando sesión…</div>;
  } else if (auth === 'out') {
    screen = <LoginPage client={client} notice={loginNotice} onLoggedIn={() => { setLoginNotice(''); void enter(); }} />;
  } else if (auth === 'temp') {
    screen = <AuthLayout><PasswordForm client={client} email={email} forced onDone={() => void afterPasswordChange()} /></AuthLayout>;
  } else {
    const active: Page = view.name === 'clave' ? 'clave' : 'productos';
    screen = (
      <Shell email={email} active={active} onNavigate={(page) => go({ name: page })} onLogout={() => void logout()}>
        {view.name === 'productos' && (
          <ProductsPage
            client={client}
            rows={rows}
            failed={failed}
            setRows={setRows}
            reload={load}
            notify={setToast}
            onNew={() => go({ name: 'editor', initial: null })}
            onEdit={(row) => go({ name: 'editor', initial: row })}
            onDuplicate={(row) => go({ name: 'editor', initial: { ...row, id: undefined, nombre: `${row.nombre} (copia)`, codigo: `${row.codigo}-2`, activo: false } })}
          />
        )}
        {view.name === 'editor' && (
          <ProductEditor
            key={view.initial?.id ?? view.initial?.nombre ?? 'nuevo'}
            client={client}
            initial={view.initial}
            nextOrden={(rows?.reduce((m, r) => Math.max(m, r.orden), 0) ?? 0) + 1}
            onSaved={onSaved}
            onBack={() => go({ name: 'productos' })}
            onDirty={(d) => { dirty.current = d; }}
          />
        )}
        {view.name === 'clave' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Cambiar contraseña</h1>
              <p className="text-sm text-gray-400 mt-1">Usa una contraseña que no uses en ningún otro sitio.</p>
            </div>
            <PasswordForm client={client} email={email} forced={false} onDone={() => void afterPasswordChange()} onCancel={() => go({ name: 'productos' })} />
          </div>
        )}
      </Shell>
    );
  }

  return (
    <>
      {screen}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
};
