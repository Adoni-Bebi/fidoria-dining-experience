import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, X, Trash2 } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { deleteAdminAccount } from '@/lib/accounts.functions';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';

type Req = { user_id: string; email: string; status: string; created_at: string };

export function AccessRequests() {
  const [rows, setRows] = useState<Req[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Req | null>(null);
  const removeAccount = useServerFn(deleteAdminAccount);
  async function load() {
    const { data: u } = await supabase.auth.getUser();
    setMe(u.user?.id ?? null);
    const { data, error } = await supabase.from('access_requests').select('*').order('created_at', { ascending: false });
    if (error) setMessage(error.message); else setRows(data as Req[]);
  }
  useEffect(() => { void load(); }, []);
  async function decide(id: string, approve: boolean) {
    setMessage(''); setBusy(true);
    try {
      const { error } = await supabase.rpc('decide_access_request', { _user_id: id, _approve: approve });
      if (error) throw error;
      await load(); setMessage(approve ? 'Account approved. They can sign in after confirming their email.' : 'Menu access removed. The account still exists.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The account could not be updated. Please try again.'); }
    finally { setBusy(false); }
  }
  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true); setMessage('');
    try {
      await removeAccount({ data: { userId: deleting.user_id } });
      setDeleting(null); await load(); setMessage('Account deleted. Your restaurant menu has not changed.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The account could not be deleted. Please try again.'); }
    finally { setBusy(false); }
  }
  const others = rows.filter(r => r.user_id !== me);
  return <section>
    <h2 className="text-3xl">Manage admin accounts</h2>
    <p className="mt-2 text-sm text-muted-foreground">New admins must confirm their email and receive your approval before signing in.</p>
    {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}
    <div className="mt-6 divide-y border-y">
      {others.map(r => <div key={r.user_id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0"><p className="break-all">{r.email}</p><p className="text-sm text-muted-foreground">{r.status === 'approved' ? 'Approved' : r.status === 'rejected' ? 'Declined' : 'Waiting for approval'}</p></div>
        <div className="flex gap-2">
          {r.status !== 'approved' && <Button disabled={busy} size="sm" onClick={() => decide(r.user_id, true)}><Check />Approve</Button>}
          {r.status !== 'rejected' && <Button disabled={busy} size="sm" variant="outline" onClick={() => decide(r.user_id, false)}><X />{r.status === 'approved' ? 'Remove access' : 'Decline'}</Button>}
          <Button disabled={busy} size="sm" variant="destructive" aria-label={`Delete account for ${r.email}`} onClick={() => { setMessage(''); setDeleting(r); }}><Trash2 />Delete account</Button>
        </div>
      </div>)}
      {!others.length && <p className="py-8 text-center text-muted-foreground">No other accounts yet.</p>}
    </div>
    <AlertDialog open={deleting !== null} onOpenChange={open => { if (!open && !busy) setDeleting(null); }}>
      <AlertDialogContent className="z-[80] max-w-[calc(100%-2rem)] sm:max-w-lg">
        <AlertDialogHeader><AlertDialogTitle>Delete this admin account?</AlertDialogTitle><AlertDialogDescription className="break-all">{deleting?.email}</AlertDialogDescription></AlertDialogHeader>
        <p className="text-sm text-muted-foreground">This permanently deletes their sign-in and menu access. Your meals and prices stay unchanged. This cannot be undone.</p>
        {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
        <AlertDialogFooter><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Keep account</Button><Button variant="destructive" disabled={busy} onClick={confirmDelete}><Trash2 />{busy ? 'Deleting…' : 'Delete account'}</Button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}
