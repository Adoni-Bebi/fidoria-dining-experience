import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { requireAccountOwner, requireDeletableAccount } from './account-rules';

export const deleteAdminAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const token = getRequest().headers.get('authorization')?.replace(/^Bearer /, '');
    const current = await context.supabase.auth.getUser(token);
    if (current.error || current.data.user?.id !== context.userId) throw new Error('Please sign in again.');
    const owner = await context.supabase.rpc('is_owner', { _user_id: context.userId });
    requireAccountOwner(!owner.error && owner.data === true);
    const targetOwner = await context.supabase.rpc('is_owner', { _user_id: data.userId });
    if (targetOwner.error) throw new Error('Account access could not be checked. Please try again.');
    requireDeletableAccount(context.userId, data.userId, targetOwner.data === true);

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const target = await supabaseAdmin.auth.admin.getUserById(data.userId);
    if (target.error && target.error.status !== 404) throw new Error('Account could not be loaded. Please try again.');
    if (target.data.user) {
      const deleted = await supabaseAdmin.auth.admin.deleteUser(data.userId);
      if (deleted.error) throw new Error('This account could not be deleted. Its meal photos may need to be reassigned first.');
    }
    // Roles cascade on Auth deletion; remove orphaned approval rows too. Retry is safe.
    const roles = await supabaseAdmin.from('user_roles').delete().eq('user_id', data.userId);
    const request = await supabaseAdmin.from('access_requests').delete().eq('user_id', data.userId);
    if (roles.error || request.error) throw new Error('Sign-in has been deleted, but the account list could not be updated. Please try again.');
    return { ok: true };
  });