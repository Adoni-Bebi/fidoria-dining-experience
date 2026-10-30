import { Link, useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
export function OwnerLink() {
  const [signedIn, setSignedIn] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) setSignedIn(Boolean(data.user)); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'PASSWORD_RECOVERY'].includes(event)) return;
      setSignedIn(Boolean(session?.user));
      if (event === 'PASSWORD_RECOVERY') return;
      void router.invalidate();
      if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries();
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [router, queryClient]);
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await router.navigate({ to: '/auth', replace: true }); }
  return <div className="flex items-center gap-2"><Link to={signedIn ? '/admin' : '/auth'} className="hover:text-cream">{signedIn ? 'Owner menu' : 'Owner sign in'}</Link>{signedIn && <Button variant="link" className="h-auto p-0 text-cream-muted" onClick={signOut}>Sign out</Button>}</div>;
}