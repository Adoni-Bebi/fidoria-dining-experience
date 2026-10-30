import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LockKeyhole } from 'lucide-react';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [{ title: 'Owner sign in — Fidoria' }, { name: 'description', content: 'Secure owner access for Fidoria menu management.' }, { property: 'og:title', content: 'Fidoria owner sign in' }, { property: 'og:description', content: 'Owner access to Fidoria.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: Auth,
});
function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
        if (error) throw error;
        setMessage('Account created. You can sign in now. Only the approved owner account can edit meals.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: '/admin' });
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-md px-6 pt-40 pb-24">
    <LockKeyhole className="mb-5 size-8 text-primary" />
    <p className="text-sm text-muted-foreground">Fidoria · Owner access</p>
    <h1 className="mt-3 text-4xl">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : 'Reset your password'}</h1>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block space-y-2"><span>Email</span><Input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      {mode !== 'forgot' && <label className="block space-y-2"><span>Password</span><Input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label>}
      {message && <p role="status" className="text-sm text-primary">{message}</p>}
      <Button disabled={busy} className="w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</Button>
    </form>
    <div className="mt-4 flex flex-wrap gap-2"><Button variant="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Create account' : 'Back to sign in'}</Button>{mode === 'login' && <Button variant="link" onClick={() => setMode('forgot')}>Forgot password?</Button>}</div>
    <Link to="/" className="mt-8 block text-sm text-muted-foreground">Back to restaurant</Link>
  </section>;
}