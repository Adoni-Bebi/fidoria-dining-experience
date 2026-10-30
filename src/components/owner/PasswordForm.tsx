import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound } from 'lucide-react';
export function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage('');
    if (password !== confirm) { setMessage('New passwords do not match.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password, current_password: current });
    setMessage(error?.message ?? 'Password changed successfully.');
    if (!error) { setCurrent(''); setPassword(''); setConfirm(''); }
    setBusy(false);
  }
  return <section className="border-t pt-8"><h2 className="text-3xl">Change password</h2><form onSubmit={submit} className="mt-6 max-w-md space-y-5"><label className="block space-y-2">Current password<Input type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} /></label><label className="block space-y-2">New password<Input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label><label className="block space-y-2">Confirm new password<Input type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></label>{message && <p role="status" className="text-sm text-primary">{message}</p>}<Button disabled={busy}><KeyRound />{busy ? 'Updating…' : 'Update password'}</Button></form></section>;
}