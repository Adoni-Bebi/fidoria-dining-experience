import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

export function OwnerEmailForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const user = await supabase.auth.getUser();
      if (user.error || !user.data.user?.email) throw new Error('Please sign in again.');
      const check = await supabase.auth.signInWithPassword({ email: user.data.user.email, password });
      if (check.error) throw check.error;
      const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: `${window.location.origin}/auth` });
      if (error) throw error;
      setMessage('Check the current and new email inboxes for confirmation links. Owner access stays with this account.');
      setPassword('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Email could not be changed.'); }
    finally { setBusy(false); }
  }
  return <section className="border-t pt-8"><h2 className="text-3xl">Change owner email</h2><form onSubmit={submit} className="mt-6 max-w-md space-y-5"><label className="block space-y-2">New owner email<Input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><label className="block space-y-2">Current password<Input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>{message && <p role="status" className="text-sm text-primary">{message}</p>}<Button disabled={busy}><Mail />{busy ? 'Sending…' : 'Change owner email'}</Button></form></section>;
}