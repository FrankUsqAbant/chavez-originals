import React, { useEffect, useRef, useState } from 'react';
import { KeyRound, LogOut, X } from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { adminClient } from './client';
import { LoginForm } from './LoginForm';
import { PasswordForm } from './PasswordForm';
import { ProductsManager } from './ProductsManager';

interface AdminPanelProps {
  onClose: () => void;
}

/** checking: verificando sesión · out: sin sesión · in: administrador · temp: debe cambiar la contraseña temporal */
type Auth = 'checking' | 'out' | 'in' | 'temp';

/**
 * Panel de administración de productos. Se descarga solo cuando alguien pulsa el botón de administrador.
 * Aunque alguien vea este código, no puede modificar nada: la base de datos solo acepta cambios de la
 * cuenta de administrador (reglas RLS de la tabla `productos` y del almacenamiento de fotos), y solo cuando
 * esa cuenta ya no usa su contraseña temporal.
 */
const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const client = adminClient();
  const [auth, setAuth] = useState<Auth>('checking');
  const [email, setEmail] = useState('');
  const [view, setView] = useState<'productos' | 'clave'>('productos');
  const [flash, setFlash] = useState('');
  const dirty = useRef(false);

  const requestClose = () => {
    if (dirty.current && !window.confirm('Hay cambios sin guardar. ¿Salir de todos modos?')) return;
    onClose();
  };
  const dialogRef = useModal<HTMLDivElement>(true, requestClose);

  /** Lee de la base de datos qué puede hacer la sesión actual y muestra la pantalla que corresponde. */
  const enter = async () => {
    if (!client) return setAuth('out');
    const { data } = await client.auth.getSession();
    if (!data.session) return setAuth('out');
    const { data: estado } = await client.rpc('estado_admin');
    setEmail(data.session.user.email ?? '');
    setAuth(estado === 'admin' ? 'in' : estado === 'cambiar_clave' ? 'temp' : 'out');
  };

  useEffect(() => {
    if (!client) {
      setAuth('out');
      return;
    }
    void enter();
    const { data: sub } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setAuth('out'); // sesión vencida o cerrada en otra pestaña
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(''), 7000);
    return () => window.clearTimeout(t);
  }, [flash]);

  const logout = async () => {
    await client?.auth.signOut();
    dirty.current = false;
    setView('productos');
    setAuth('out');
  };

  const openPasswordForm = () => {
    if (dirty.current && !window.confirm('Hay cambios sin guardar en el producto. ¿Descartarlos y cambiar la contraseña?')) return;
    dirty.current = false;
    setView('clave');
  };

  const afterPasswordChange = async () => {
    setFlash('Contraseña actualizada. Las demás sesiones abiertas se cerraron.');
    setView('productos');
    await enter(); // en el primer ingreso, pasa de "contraseña temporal" a administrador
  };

  const headerButton = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors cursor-pointer';

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-title"
        className="relative w-full max-w-5xl mx-auto my-4 rounded-3xl bg-[#0c1410] border border-emerald-500/30 shadow-2xl text-white outline-none"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 border-b border-white/10">
          <div>
            <h2 id="admin-title" className="text-lg font-extrabold tracking-tight">Panel de administración</h2>
            {(auth === 'in' || auth === 'temp') && email && <p className="text-xs text-gray-400">Sesión: {email}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {auth === 'in' && view === 'productos' && (
              <button type="button" onClick={openPasswordForm} className={headerButton}>
                <KeyRound className="w-4 h-4" aria-hidden="true" />Cambiar contraseña
              </button>
            )}
            {(auth === 'in' || auth === 'temp') && (
              <button type="button" onClick={() => void logout()} className={headerButton}>
                <LogOut className="w-4 h-4" aria-hidden="true" />Cerrar sesión
              </button>
            )}
            <button type="button" onClick={requestClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer" aria-label="Cerrar panel de administración">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="px-5 sm:px-8 py-6">
          <div role="status" aria-live="polite">
            {flash && <p className="mb-4 rounded-xl border border-[#00ff66]/30 bg-[#00ff66]/10 px-4 py-2.5 text-sm font-semibold text-[#00ff66]">{flash}</p>}
          </div>

          {!client ? (
            <p className="py-10 text-center text-gray-300">Falta la configuración de Supabase (variables VITE_SUPABASE_URL y VITE_SUPABASE_KEY).</p>
          ) : auth === 'checking' ? (
            <p className="py-10 text-center text-gray-400" role="status">Verificando sesión…</p>
          ) : auth === 'out' ? (
            <LoginForm client={client} onLoggedIn={() => void enter()} />
          ) : auth === 'temp' ? (
            <PasswordForm client={client} email={email} forced onDone={() => void afterPasswordChange()} />
          ) : view === 'clave' ? (
            <PasswordForm client={client} email={email} forced={false} onDone={() => void afterPasswordChange()} onCancel={() => setView('productos')} />
          ) : (
            <ProductsManager client={client} onDirty={(d) => { dirty.current = d; }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
