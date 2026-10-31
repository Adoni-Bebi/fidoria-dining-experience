import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LockKeyhole, MailCheck } from 'lucide-react';
import { requireConfirmedEmail, requireVerificationCode } from '@/lib/account-rules';

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
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [code, setCode] = useState('');
  async function verifyEmail(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const token = requireVerificationCode(code);
      const { data, error } = await supabase.auth.verifyOtp({ email: confirmationEmail, token, type: 'signup' });
      if (error) throw new Error('That code is incorrect or has expired. Try again, or request a new code.');
      requireConfirmedEmail(data.user?.email_confirmed_at);
      const role = data.user ? await supabase.rpc('has_role', { _user_id: data.user.id, _role: 'admin' }) : null;
      await supabase.auth.signOut();
      setConfirmationEmail(''); setCode(''); setMode('login');
      setMessage(role?.data === true ? 'Email verified. You can now sign in.' : 'Email verified. Your admin request has been sent to the owner. You can sign in after approval.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Your email could not be verified. Please try again.'); }
    finally { setBusy(false); }
  }
  async function resendConfirmation() {
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: confirmationEmail, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      if (error) throw error;
      setCode(''); setMessage('A new verification code has been sent. Please also check your spam folder.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The email could not be sent. Please try again.'); }
    finally { setBusy(false); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
        if (error) throw error;
        if (data.session) {
          await supabase.auth.signOut();
          setMessage('Email verification is not enabled yet. Please ask the restaurant owner to enable it before creating an account.');
        } else {
          setConfirmationEmail(email);
          setCode('');
          setMessage('');
        }
        setPassword('');
        setMode('login');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        try { requireConfirmedEmail(data.user.email_confirmed_at); }
        catch (confirmationError) { await supabase.auth.signOut(); setConfirmationEmail(email); throw confirmationError; }
        const role = await supabase.rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
        if (role.data !== true) {
          await supabase.auth.signOut();
          throw new Error('Your email is confirmed. The restaurant owner still needs to approve your account before you can sign in.');
        }
        await navigate({ to: '/admin' });
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'email_not_confirmed') {
        setConfirmationEmail(email); setCode(''); setMessage('Please verify your email address before signing in. Select Send a new code if you need one.');
      } else setMessage(error instanceof Error ? error.message : 'Please try again.');
    }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-md px-6 pt-40 pb-24">
    <LockKeyhole className="mb-5 size-8 text-primary" />
    <p className="text-sm text-muted-foreground">Fidoria · Owner access</p>
    <h1 className="mt-3 text-4xl">{confirmationEmail ? 'Check your email' : mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Request admin access' : 'Reset your password'}</h1>
    {confirmationEmail ? <div className="mt-8 space-y-5">
      <MailCheck className="size-10 text-primary" />
      <p>Enter the verification code sent to <strong className="break-all">{confirmationEmail}</strong>.</p>
      <p className="text-sm text-muted-foreground">Your request goes to the owner only after your email is verified. Owner approval is still required to manage meals.</p>
      <form onSubmit={verifyEmail} className="space-y-5">
        <label className="block space-y-2"><span>Email verification code</span><Input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></label>
        {message && <p role="status" className="text-sm text-primary">{message}</p>}
        <Button className="w-full" disabled={busy}>{busy ? 'Please wait…' : 'Verify email'}</Button>
      </form>
      <Button className="w-full" variant="outline" disabled={busy} onClick={resendConfirmation}>Send a new code</Button>
      <Button className="w-full" variant="link" disabled={busy} onClick={() => { setConfirmationEmail(''); setCode(''); setMessage(''); setMode('login'); }}>Back to sign in</Button>
    </div> : <>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block space-y-2"><span>Email</span><Input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      {mode !== 'forgot' && <label className="block space-y-2"><span>Password</span><Input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label>}
      {message && <p role="status" className="text-sm text-primary">{message}</p>}
      <Button disabled={busy} className="w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</Button>
    </form>
    <div className="mt-4 flex flex-wrap gap-2"><Button variant="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Request admin access' : 'Back to sign in'}</Button>{mode === 'login' && <Button variant="link" onClick={() => setMode('forgot')}>Forgot password?</Button>}</div>
    </>}
    <Link to="/" className="mt-8 block text-sm text-muted-foreground">Back to restaurant</Link>
  </section>;
}