import React, { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Check, Circle, KeyRound } from 'lucide-react';
import { btnGhost, btnPrimary, cardClass, Field, inputClass } from './ui';

interface PasswordFormProps {
  client: SupabaseClient;
  email: string;
  /** Primer ingreso con contraseña temporal: no se puede omitir. */
  forced: boolean;
  onDone: () => void;
  onCancel?: () => void;
}

const MIN_LENGTH = 10;

/** Reglas de la nueva contraseña (se muestran en vivo como lista de verificación). */
function rules(current: string, next: string, email: string) {
  const local = email.split('@')[0].toLowerCase();
  return [
    { ok: next.length >= MIN_LENGTH, label: `Al menos ${MIN_LENGTH} caracteres` },
    { ok: /[a-zA-Z]/.test(next) && /\d/.test(next), label: 'Letras y números' },
    { ok: next.length > 0 && next !== current, label: 'Distinta de la actual' },
    { ok: next.length > 0 && !(local.length >= 4 && next.toLowerCase().includes(local)), label: 'Sin partes de tu correo' },
  ];
}

const friendly = (e: { message?: string; status?: number }): string => {
  const m = (e.message ?? '').toLowerCase();
  if (e.status === 429) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (m.includes('different from the old')) return 'La nueva contraseña debe ser distinta de la actual.';
  if (m.includes('pwned') || m.includes('weak') || m.includes('easy to guess')) return 'Esa contraseña es demasiado común. Elige otra.';
  if (m.includes('at least')) return 'La contraseña es demasiado corta.';
  return 'No se pudo cambiar la contraseña. Inténtalo de nuevo.';
};

export const PasswordForm: React.FC<PasswordFormProps> = ({ client, email, forced, onDone, onCancel }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const checks = rules(current, next, email);
  const valid = checks.every((c) => c.ok) && next === repeat && current.length > 0;
  const type = show ? 'text' : 'password';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      // Se vuelve a comprobar la contraseña actual (por si alguien dejó la sesión abierta)
      const { error: authError } = await client.auth.signInWithPassword({ email, password: current });
      if (authError) {
        setError(authError.status === 429 ? friendly(authError) : 'La contraseña actual no es correcta.');
        return;
      }
      const { error: updateError } = await client.auth.updateUser({ password: next });
      if (updateError) {
        setError(friendly(updateError));
        return;
      }
      await client.auth.signOut({ scope: 'others' }); // cierra cualquier otra sesión abierta con la clave anterior
      onDone();
    } catch {
      setError('No se pudo conectar. Revisa tu conexión a internet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={`${cardClass} p-6 sm:p-8 space-y-5`}>
      {forced && (
        <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <strong>Elige tu contraseña.</strong> Tu cuenta tiene una contraseña <strong>temporal</strong>: por seguridad no podrás administrar productos hasta cambiarla.
        </div>
      )}

      {/* Ayuda a los gestores de contraseñas a guardar la clave de esta cuenta */}
      <input type="email" autoComplete="username" value={email} readOnly hidden aria-hidden="true" />

      <Field id="pw-current" label="Contraseña actual">
        <input id="pw-current" type={type} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
      </Field>
      <Field id="pw-new" label="Nueva contraseña">
        <input id="pw-new" type={type} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
      </Field>
      <div className="space-y-1.5">
        <Field id="pw-repeat" label="Repite la nueva contraseña">
          <input id="pw-repeat" type={type} autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} className={inputClass} />
        </Field>
        {repeat.length > 0 && next !== repeat && <p className="text-xs text-red-300">Las contraseñas no coinciden.</p>}
      </div>

      <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs" aria-label="Requisitos de la contraseña">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1.5 ${c.ok ? 'text-[#00ff66]' : 'text-gray-500'}`}>
            {c.ok ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Circle className="w-3 h-3" aria-hidden="true" />}
            {c.label}
          </li>
        ))}
      </ul>

      <label className="inline-flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-[#00ff66]" />
        Mostrar contraseñas
      </label>

      <p role="alert" aria-live="assertive" className={`text-sm text-red-300 min-h-5 ${error ? '' : 'invisible'}`}>{error || '.'}</p>

      <div className="flex flex-wrap justify-end gap-3">
        {!forced && onCancel && <button type="button" onClick={onCancel} disabled={busy} className={btnGhost}>Cancelar</button>}
        <button type="submit" disabled={!valid || busy} className={btnPrimary}>
          <KeyRound className="w-4 h-4" aria-hidden="true" />{busy ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </div>
    </form>
  );
};
