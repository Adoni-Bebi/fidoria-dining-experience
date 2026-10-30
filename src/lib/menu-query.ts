import { queryOptions } from '@tanstack/react-query';
import { images, type MenuCategory } from '@/data/site';
import { getPublicMeals } from './meals.functions';
import type { Tables } from '@/integrations/supabase/types';

export const publicMenuOptions = queryOptions({ queryKey: ['public-menu'], queryFn: () => getPublicMeals(), staleTime: 0, refetchOnWindowFocus: true });
export function groupMeals(meals: Tables<'meals'>[]): MenuCategory[] {
  const groups = new Map<string, MenuCategory>();
  for (const meal of meals) {
    let group = groups.get(meal.category);
    if (!group) { group = { id: `category-${groups.size}`, title: meal.category, items: [] }; groups.set(meal.category, group); }
    const key = meal.image_key;
    group.items.push({ name: meal.name, description: meal.description, price: meal.price === null ? null : `${meal.price.toLocaleString('en-ET')} ETB`, image: meal.image_url ?? (key && key in images ? images[key as keyof typeof images] : images.noodles), isSample: meal.is_sample });
  }
  return [...groups.values()];
}