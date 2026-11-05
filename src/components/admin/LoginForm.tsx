import React, { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  client: SupabaseClient;
  /** 'admin' = acceso completo · 'cambiar_clave' = entra con contraseña temporal y debe cambiarla. */
  onLoggedIn: (estado: 'admin' | 'cambiar_clave') => void;
}

export const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-[#00ff66] focus:bg-white/[0.07]';

export const LoginForm: React.FC<LoginFormProps> = ({ client, onLoggedIn }) => {
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
    <form onSubmit={submit} className="max-w-sm mx-auto py-10 space-y-5" noValidate>
      <div className="space-y-1 text-center">
        <h3 className="text-xl font-extrabold">Acceso de administrador</h3>
        <p className="text-sm text-gray-400">Ingresa con la cuenta autorizada para gestionar los productos.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="admin-email" className="text-xs font-bold text-gray-300">Correo</label>
        <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="admin-password" className="text-xs font-bold text-gray-300">Contraseña</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>

      <p role="alert" aria-live="assertive" className={`text-sm text-red-300 min-h-5 ${error ? '' : 'invisible'}`}>{error || '.'}</p>

      <button
        type="submit"
        disabled={busy || !email || !password}
        className="w-full py-3 rounded-xl bg-[#00ff66] hover:bg-[#1aff75] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogIn className="w-4 h-4" aria-hidden="true" />
        {busy ? 'Verificando…' : 'Ingresar'}
      </button>
    </form>
  );
};
