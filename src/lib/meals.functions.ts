import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import { mealSchema, requireOwnerRole } from './meal-schema';

export const getPublicMeals = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Menu service is not configured.');
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from('meals').select('*').eq('published', true).order('created_at').limit(1000);
  if (error) throw new Error('The menu could not be loaded. Please try again.');
  return Promise.all(data.map(async meal => {
    if (!meal.image_path) return meal;
    const signed = await client.storage.from('meal-photos').createSignedUrl(meal.image_path, 3600);
    const signedUrl = signed.data?.signedUrl;
    // The storage request uses the server address; the browser must use its public address.
    return { ...meal, image_url: signedUrl?.replace(url, import.meta.env.VITE_SUPABASE_URL) ?? null };
  }));
});

export const getOwnerMeals = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  requireOwnerRole(role.data === true && !role.error);
  const { data, error } = await context.supabase.from('meals').select('*').order('created_at');
  if (error) throw new Error('Meals could not be loaded.');
  return data;
});
export const saveMeal = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => mealSchema.parse(input)).handler(async ({ data, context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  requireOwnerRole(role.data === true && !role.error);
  const { id, ...values } = data;
  const result = id ? await context.supabase.from('meals').update(values).eq('id', id).select('id').single() : await context.supabase.from('meals').insert(values).select('id').single();
  if (result.error) throw new Error('Meal could not be saved. Please try again.');
  return result.data;
});
export const deleteMeal = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: { id: string }) => ({ id: mealSchema.shape.id.unwrap().parse(input.id) })).handler(async ({ data, context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  requireOwnerRole(role.data === true && !role.error);
  const { error } = await context.supabase.from('meals').delete().eq('id', data.id);
  if (error) throw new Error('Meal could not be deleted.');
  return { ok: true };
});