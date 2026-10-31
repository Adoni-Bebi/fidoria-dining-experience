import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { requireVerificationCode, requireVerifiedOwnerEmail } from '@/lib/account-rules';

export function OwnerEmailForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [code, setCode] = useState('');
  const [inbox, setInbox] = useState<'new' | 'current'>('new');
  async function verify(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const token = requireVerificationCode(code);
      const { error } = await supabase.auth.verifyOtp({ email: inbox === 'new' ? pendingEmail : currentEmail, token, type: 'email_change' });
      if (error) throw new Error('That code is incorrect or has expired. Try again, or request a new code.');
      const result = await supabase.auth.getUser();
      if (result.error || !result.data.user) throw new Error('Please sign in again.');
      if (result.data.user.email?.toLowerCase() !== pendingEmail.toLowerCase()) {
        setInbox(inbox === 'new' ? 'current' : 'new'); setCode('');
        setMessage('Code accepted. Enter the code from the other inbox to complete the change.');
        return;
      }
      requireVerifiedOwnerEmail(result.data.user.email, pendingEmail);
      setMessage('Owner email verified and changed. The new owner can sign in with this email and the account password.');
      setPendingEmail(''); setCurrentEmail(''); setCode(''); setEmail('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The email could not be verified. Please try again.'); }
    finally { setBusy(false); }
  }
  async function resend() {
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.resend({ type: 'email_change', email: pendingEmail });
      if (error) throw error;
      setCode(''); setMessage('New verification codes sent. Please check both inboxes and the spam folders.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The code could not be sent. Please try again.'); }
    finally { setBusy(false); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const user = await supabase.auth.getUser();
      if (user.error || !user.data.user?.email) throw new Error('Please sign in again.');
      const requestedEmail = email.trim().toLowerCase();
      if (requestedEmail === user.data.user.email.toLowerCase()) throw new Error('Enter a different email address for the new owner.');
      const owner = await supabase.rpc('is_owner', { _user_id: user.data.user.id });
      if (owner.error || owner.data !== true) throw new Error('Only the restaurant owner can transfer ownership.');
      const check = await supabase.auth.signInWithPassword({ email: user.data.user.email, password });
      if (check.error) throw check.error;
      const { error } = await supabase.auth.updateUser({ email: requestedEmail }, { emailRedirectTo: `${window.location.origin}/auth` });
      if (error) throw error;
      setPendingEmail(requestedEmail); setCurrentEmail(user.data.user.email); setInbox('new'); setCode('');
      setMessage('Verification codes have been sent. The current owner keeps access until the email change is complete.');
      setPassword('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Email could not be changed.'); }
    finally { setBusy(false); }
  }
  return <section className="border-t pt-8"><h2 className="text-3xl">Change owner email</h2>
    {pendingEmail ? <div className="mt-6 max-w-md space-y-5">
      <p>Enter the code sent to <strong className="break-all">{inbox === 'new' ? pendingEmail : currentEmail}</strong>.</p>
      <p className="text-sm text-muted-foreground">Both inboxes may need verification. Ownership stays with this account; only the sign-in email changes.</p>
      <form onSubmit={verify} className="space-y-5"><label className="block space-y-2">Email verification code<Input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></label>{message && <p role="status" className="text-sm text-primary">{message}</p>}<Button disabled={busy}><Mail />{busy ? 'Please wait…' : 'Verify owner email'}</Button></form>
      <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={resend}>Send a new code</Button><Button variant="link" disabled={busy} onClick={() => { setInbox(inbox === 'new' ? 'current' : 'new'); setCode(''); setMessage(''); }}>Use the other inbox</Button></div>
    </div> : <form onSubmit={submit} className="mt-6 max-w-md space-y-5"><label className="block space-y-2">New owner email<Input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><label className="block space-y-2">Current password<Input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>{message && <p role="status" className="text-sm text-primary">{message}</p>}<Button disabled={busy}><Mail />{busy ? 'Sending…' : 'Send verification code'}</Button></form>}
  </section>;
}