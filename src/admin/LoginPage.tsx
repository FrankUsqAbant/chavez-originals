import React, { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LogIn, ShieldCheck } from 'lucide-react';
import { AuthLayout, btnPrimary, cardClass, Field, inputClass } from './ui';

interface LoginPageProps {
  client: SupabaseClient;
  /** Mensaje previo (por ejemplo, "Sesión cerrada por inactividad"). */
  notice?: string;
  /** 'admin' = acceso completo · 'cambiar_clave' = entra con contraseña temporal y debe cambiarla. */
  onLoggedIn: (estado: 'admin' | 'cambiar_clave') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ client, notice, onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) {
        // Mensaje único: no se revela si el correo existe
        setError(authError.status === 429 ? 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' : 'Correo o contraseña incorrectos.');
        return;
      }
      const { data: estado, error: rpcError } = await client.rpc('estado_admin');
      if (rpcError || (estado !== 'admin' && estado !== 'cambiar_clave')) {
        await client.auth.signOut();
        setError('Esta cuenta no tiene permisos de administrador.');
        return;
      }
      onLoggedIn(estado);
    } catch {
      setError('No se pudo conectar. Revisa tu conexión a internet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} noValidate className={`${cardClass} p-6 sm:p-8 space-y-5`}>
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-lg bg-[#00ff66]/10 text-[#00ff66]"><ShieldCheck className="w-5 h-5" aria-hidden="true" /></span>
          <div>
            <h1 className="text-lg font-extrabold leading-tight">Administración</h1>
            <p className="text-xs text-gray-400">Acceso solo para el equipo de Clavez Originals</p>
          </div>
        </div>

        {notice && <p role="status" className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{notice}</p>}

        <Field id="login-email" label="Correo">
          <input id="login-email" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field id="login-password" label="Contraseña">
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>

        <p role="alert" aria-live="assertive" className={`text-sm text-red-300 min-h-5 ${error ? '' : 'invisible'}`}>{error || '.'}</p>

        <button type="submit" disabled={busy || !email || !password} className={`${btnPrimary} w-full`}>
          <LogIn className="w-4 h-4" aria-hidden="true" />{busy ? 'Verificando…' : 'Ingresar'}
        </button>
      </form>
    </AuthLayout>
  );
};
