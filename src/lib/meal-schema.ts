import { z } from 'zod';

export const mealSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1200),
  category: z.string().trim().min(1).max(80),
  price: z.number().finite().nonnegative().max(9999999999.99).nullable(),
  image_key: z.string().nullable(),
  image_path: z.string().nullable(),
  image_url: z.string().url().refine(v => v.startsWith('https://'), 'Use a secure HTTPS image link').nullable(),
  published: z.boolean(),
  is_sample: z.boolean(),
});
export type MealInput = z.infer<typeof mealSchema>;
export function validatePhoto(file: { type: string; size: number }) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP photo.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose a photo smaller than 10 MB.');
}
export function requireOwnerRole(allowed: boolean) {
  if (!allowed) throw new Error('Owner access has not been granted to this account.');
}