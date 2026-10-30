import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

type Req = { user_id: string; email: string; status: string; created_at: string };

export function AccessRequests() {
  const [rows, setRows] = useState<Req[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  async function load() {
    const { data: u } = await supabase.auth.getUser();
    setMe(u.user?.id ?? null);
    const { data, error } = await supabase.from('access_requests').select('*').order('created_at', { ascending: false });
    if (error) setMessage(error.message); else setRows(data as Req[]);
  }
  useEffect(() => { void load(); }, []);
  async function decide(id: string, approve: boolean) {
    setMessage('');
    const { error } = await supabase.rpc('decide_access_request', { _user_id: id, _approve: approve });
    if (error) setMessage(error.message); else { setMessage(approve ? 'Account approved.' : 'Access removed.'); await load(); }
  }
  const others = rows.filter(r => r.user_id !== me);
  return <section>
    <h2 className="text-3xl">Account approvals</h2>
    <p className="mt-2 text-sm text-muted-foreground">New accounts can't change the menu until you approve them.</p>
    {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}
    <div className="mt-6 divide-y border-y">
      {others.map(r => <div key={r.user_id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0"><p className="break-all">{r.email}</p><p className="text-sm text-muted-foreground">{r.status === 'approved' ? 'Approved' : r.status === 'rejected' ? 'Declined' : 'Waiting for approval'}</p></div>
        <div className="flex gap-2">
          {r.status !== 'approved' && <Button size="sm" onClick={() => decide(r.user_id, true)}><Check />Approve</Button>}
          {r.status !== 'rejected' && <Button size="sm" variant="outline" onClick={() => decide(r.user_id, false)}><X />{r.status === 'approved' ? 'Remove access' : 'Decline'}</Button>}
        </div>
      </div>)}
      {!others.length && <p className="py-8 text-center text-muted-foreground">No other accounts yet.</p>}
    </div>
  </section>;
}
