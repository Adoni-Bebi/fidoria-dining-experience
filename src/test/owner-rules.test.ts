import { describe, it, expect } from 'vitest';
import { mealSchema, requireOwnerRole, validatePhoto } from '@/lib/meal-schema';
const meal = { name: 'Test meal', description: '', category: 'Test category', price: 125.5, image_key: null, image_path: null, image_url: null, published: true, is_sample: false };
describe('Owner meal rules', () => {
  it('keeps the entered meal price, including decimals', () => { expect(mealSchema.parse(meal).price).toBe(125.5); });
  it('allows an unconfirmed price without inventing one', () => { expect(mealSchema.parse({ ...meal, price: null }).price).toBeNull(); });
  it('does not allow negative prices', () => { expect(() => mealSchema.parse({ ...meal, price: -1 })).toThrow(); });
  it('allows internet image links but not unsafe protocols', () => { expect(mealSchema.parse({ ...meal, image_url: 'https://example.com/meal.jpg' }).image_url).toBe('https://example.com/meal.jpg'); expect(() => mealSchema.parse({ ...meal, image_url: 'javascript:alert(1)' })).toThrow(); });
  it('requires owner permission to change meals', () => { expect(() => requireOwnerRole(false)).toThrow(); expect(() => requireOwnerRole(true)).not.toThrow(); });
  it('preserves hidden meals in owner input', () => { expect(mealSchema.parse({ ...meal, published: false }).published).toBe(false); });
  it('accepts camera and file photos but rejects non-images', () => { expect(() => validatePhoto({ type: 'image/jpeg', size: 1000 })).not.toThrow(); expect(() => validatePhoto({ type: 'text/html', size: 1000 })).toThrow(); });
});