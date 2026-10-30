import { createFileRoute, Link, useNavigate, type ErrorComponentProps } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { Plus, Pencil, Trash2, LogOut, KeyRound, UtensilsCrossed, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MealEditor } from '@/components/owner/MealEditor';
import { PasswordForm } from '@/components/owner/PasswordForm';
import { OwnerEmailForm } from '@/components/owner/OwnerEmailForm';
import { AccessRequests } from '@/components/owner/AccessRequests';
import { getOwnerMeals, deleteMeal } from '@/lib/meals.functions';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

const ownerOptions = queryOptions({ queryKey: ['owner-meals'], queryFn: () => getOwnerMeals(), retry: false });
export const Route = createFileRoute('/_authenticated/admin')({
  loader: ({ context }) => context.queryClient.ensureQueryData(ownerOptions),
  head: () => ({ meta: [{ title: 'Owner menu manager — Fidoria' }, { name: 'description', content: 'Manage Fidoria meals, prices, and photos.' }, { property: 'og:title', content: 'Fidoria menu manager' }, { property: 'og:description', content: 'Private restaurant owner workspace.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  errorComponent: OwnerError,
  component: Admin,
});
function OwnerError({ error }: ErrorComponentProps) {
  return <section className="mx-auto max-w-xl px-6 pt-40 pb-24"><h1 className="text-4xl">Owner access</h1><p role="alert" className="mt-6 text-muted-foreground">{error instanceof Error ? error.message : 'Owner access could not be verified.'}</p><p className="mt-4">Your account is waiting for the restaurant owner's approval. Once approved, sign in again to change the menu.</p><Button asChild variant="outline" className="mt-6"><Link to="/auth">Back to sign in</Link></Button></section>;
}
function Admin() {
  const { data: meals } = useSuspenseQuery(ownerOptions);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const remove = useServerFn(deleteMeal);
  const [editing, setEditing] = useState<Tables<'meals'> | null | undefined>(undefined);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Tables<'meals'> | null>(null);
  async function refreshed() { await queryClient.invalidateQueries({ queryKey: ['owner-meals'] }); await queryClient.invalidateQueries({ queryKey: ['public-menu'] }); setEditing(undefined); setMessage('Meal saved.'); }
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }); }
  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true); setMessage('');
    try { await remove({ data: { id: deleting.id } }); if (deleting.image_path) await supabase.storage.from('meal-photos').remove([deleting.image_path]); await queryClient.invalidateQueries({ queryKey: ['owner-meals'] }); await queryClient.invalidateQueries({ queryKey: ['public-menu'] }); setDeleting(null); setMessage('Meal deleted.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Meal could not be deleted.'); }
    finally { setBusy(false); }
  }
  const filtered = meals.filter(m => `${m.name} ${m.category}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="mx-auto max-w-6xl px-6 pt-36 pb-24">
    <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm font-semibold text-primary">Fidoria · Owner workspace</p><h1 className="mt-3 text-4xl md:text-5xl">Your menu</h1></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/menu"><ExternalLink />View menu</Link></Button><Button variant="outline" onClick={() => { setPasswordOpen(v => !v); setEditing(undefined); }}><KeyRound />Accounts & password</Button><Button variant="ghost" onClick={signOut}><LogOut />Sign out</Button></div></div>
    <div className="my-8 flex flex-wrap items-center justify-between gap-4 border-y py-5"><div className="flex items-center gap-3"><UtensilsCrossed className="text-primary" /><span className="text-sm">{meals.length} meals · {meals.filter(m => m.published).length} visible</span></div><Button onClick={() => { setEditing(null); setPasswordOpen(false); setMessage(''); }}><Plus />Add meal</Button></div>
    {message && <p role="status" className="mb-5 text-sm text-primary">{message}</p>}
    {passwordOpen ? <div className="space-y-12"><AccessRequests /><PasswordForm /><OwnerEmailForm /></div> : editing !== undefined ? <MealEditor key={editing?.id ?? 'new'} meal={editing} categories={[...new Set(meals.map(m => m.category))]} onSaved={refreshed} onCancel={() => setEditing(undefined)} /> : <>
      <Input type="search" placeholder="Search meals…" aria-label="Search meals" className="mb-6 max-w-md" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="divide-y border-y">{filtered.map(meal => <article key={meal.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div className="min-w-0 flex-1"><h2 className="break-words text-xl">{meal.name}</h2><p className="mt-1 text-sm text-muted-foreground">{meal.category} · {meal.published ? 'Visible' : 'Hidden'}{meal.is_sample ? ' · Sample' : ''}</p></div><div className="flex items-center gap-3"><span className="font-semibold text-primary">{meal.price === null ? 'ETB —' : `${meal.price.toLocaleString()} ETB`}</span><Button variant="outline" size="icon" aria-label={`Edit ${meal.name}`} title="Edit meal" onClick={() => setEditing(meal)}><Pencil /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${meal.name}`} title="Delete meal" onClick={() => setDeleting(meal)}><Trash2 /></Button></div></article>)}{!filtered.length && <p className="py-12 text-center text-muted-foreground">No meals found.</p>}</div>
    </>}
    {deleting && <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/70 px-6"><div className="w-full max-w-md rounded-lg bg-card p-7"><h2 id="delete-title" className="text-2xl">Delete meal?</h2><p className="my-5 break-words">{deleting.name}</p><div className="flex gap-3"><Button variant="destructive" disabled={busy} onClick={confirmDelete}>{busy ? 'Deleting…' : 'Delete meal'}</Button><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Cancel</Button></div></div></div>}
  </div>;
}