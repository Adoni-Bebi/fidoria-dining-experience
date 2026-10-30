import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Camera, Upload, Link as LinkIcon, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { images } from '@/data/site';
import { saveMeal } from '@/lib/meals.functions';
import { mealSchema, validatePhoto, type MealInput } from '@/lib/meal-schema';
import type { Tables } from '@/integrations/supabase/types';

export function MealEditor({ meal, categories, onSaved, onCancel }: { meal: Tables<'meals'> | null; categories: string[]; onSaved: () => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(meal?.name ?? '');
  const [description, setDescription] = useState(meal?.description ?? '');
  const [category, setCategory] = useState(meal?.category ?? categories[0] ?? '');
  const [price, setPrice] = useState(meal?.price?.toString() ?? '');
  const [published, setPublished] = useState(meal?.published ?? true);
  const [sample, setSample] = useState(meal?.is_sample ?? false);
  const [imageUrl, setImageUrl] = useState(meal?.image_path ? '' : meal?.image_url ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const save = useServerFn(saveMeal);
  useEffect(() => {
    if (file) { const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }
    if (imageUrl) { setPreview(imageUrl); return; }
    if (meal?.image_path) {
      let active = true;
      void supabase.storage.from('meal-photos').createSignedUrl(meal.image_path, 3600).then(({ data }) => { if (active) setPreview(data?.signedUrl ?? ''); });
      return () => { active = false; };
    }
    const key = meal?.image_key;
    setPreview(key && key in images ? images[key as keyof typeof images] : '');
    return undefined;
  }, [file, imageUrl, meal]);
  function chooseFile(candidate?: File) {
    if (!candidate) return;
    try { validatePhoto(candidate); setFile(candidate); setImageUrl(''); setMessage(''); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Photo could not be opened.'); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    let uploadedPath: string | null = null;
    let committed = false;
    try {
      let values: MealInput = mealSchema.parse({ id: meal?.id, name, description, category, price: price.trim() === '' ? null : Number(price), published, is_sample: sample, image_key: meal?.image_key ?? null, image_path: meal?.image_path ?? null, image_url: imageUrl.trim() || null });
      if (file) {
        validatePhoto(file);
        const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        uploadedPath = `${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from('meal-photos').upload(uploadedPath, file, { contentType: file.type });
        if (error) throw new Error('Photo upload failed. Please try again.');
        values = { ...values, image_path: uploadedPath, image_url: null, image_key: null };
      } else if (imageUrl.trim()) { values = { ...values, image_path: null, image_key: null }; }
      await save({ data: values }); committed = true;
      if (meal?.image_path && meal.image_path !== values.image_path) await supabase.storage.from('meal-photos').remove([meal.image_path]);
      await onSaved();
    } catch (error) {
      if (uploadedPath && !committed) await supabase.storage.from('meal-photos').remove([uploadedPath]);
      setMessage(error instanceof Error ? error.message : 'Meal could not be saved.');
    } finally { setBusy(false); }
  }
  return <section className="border-t pt-8">
    <div className="mb-7 flex items-center justify-between"><h2 className="text-3xl">{meal ? 'Edit meal' : 'New meal'}</h2><Button variant="ghost" size="icon" title="Cancel" aria-label="Cancel editing" disabled={busy} onClick={onCancel}><X /></Button></div>
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-muted">{preview ? <img src={preview} alt="Meal photo preview" className="size-full object-cover" onError={() => { setPreview(''); setMessage('The image link could not be displayed. Try another link or upload a photo.'); }} /> : <Camera className="size-12 text-muted-foreground" />}</div>
        <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Upload meal photo" onChange={e => chooseFile(e.target.files?.[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Take meal photo" onChange={e => chooseFile(e.target.files?.[0])} />
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => uploadRef.current?.click()}><Upload />Browse files</Button><Button type="button" variant="outline" onClick={() => cameraRef.current?.click()}><Camera />Take photo</Button><Button type="button" variant="outline" onClick={() => linkRef.current?.focus()}><LinkIcon />Image link</Button></div>
        <label className="block space-y-2 text-sm">Internet image link<Input ref={linkRef} type="url" placeholder="https://…" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setFile(null); }} /></label>
      </div>
      <div className="space-y-5">
        <label className="block space-y-2 text-sm font-semibold">Meal name<Input required maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="block space-y-2 text-sm font-semibold">Description<Textarea maxLength={1200} rows={4} value={description} onChange={e => setDescription(e.target.value)} /></label>
        <div className="grid gap-5 sm:grid-cols-2"><label className="block space-y-2 text-sm font-semibold">Category<Input required list="meal-categories" value={category} onChange={e => setCategory(e.target.value)} /><datalist id="meal-categories">{categories.map(c => <option key={c} value={c} />)}</datalist></label><label className="block space-y-2 text-sm font-semibold">Price (ETB)<Input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Not confirmed" /></label></div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />Visible on menu</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={sample} onChange={e => setSample(e.target.checked)} />Sample / unconfirmed meal</label>
        {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
        <div className="flex flex-wrap gap-3"><Button disabled={busy}><Save />{busy ? 'Saving…' : 'Save meal'}</Button><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button></div>
      </div>
    </form>
  </section>;
}