import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [{ title: 'Reset password — Fidoria' }, { name: 'description', content: 'Reset your Fidoria owner password securely.' }, { property: 'og:title', content: 'Reset your Fidoria password' }, { property: 'og:description', content: 'Secure owner password recovery.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: ResetPassword,
});
function ResetPassword() {
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setValid(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'); }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setMessage('Passwords do not match.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error?.message ?? 'Password updated. You can now sign in.'); setBusy(false);
  }
  return <section className="mx-auto max-w-md px-6 pt-40 pb-24"><h1 className="text-4xl">New password</h1>{valid ? <form onSubmit={submit} className="mt-8 space-y-5"><label className="block space-y-2">New password<Input type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label><label className="block space-y-2">Confirm new password<Input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></label><Button disabled={busy}>Save password</Button></form> : <p className="mt-6">Open the password reset link from your email.</p>}{message && <p role="status" className="mt-5">{message}</p>}<Link to="/auth" className="mt-6 block text-primary">Back to sign in</Link></section>;
}