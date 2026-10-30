CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE POLICY own_role_read ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.meals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK (length(trim(name)) > 0), description text NOT NULL DEFAULT '', category text NOT NULL, price numeric(12,2) CHECK (price >= 0), image_key text, image_path text, image_url text, published boolean NOT NULL DEFAULT true, is_sample boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.meals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meals TO authenticated;
GRANT ALL ON public.meals TO service_role;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_meals ON public.meals FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY admin_read_meals ON public.meals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_insert_meals ON public.meals FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_update_meals ON public.meals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_delete_meals ON public.meals FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_upload_photos ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'meal-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_read_photos ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'meal-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_delete_photos ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'meal-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY published_meal_photos ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'meal-photos' AND EXISTS (SELECT 1 FROM public.meals WHERE image_path = storage.objects.name AND published));
INSERT INTO public.meals (name,description,category,price,image_key,is_sample) VALUES
('Sample: Spicy Stir-Fried Noodles','Placeholder description — replace with the real dish details.','Signature Noodles',NULL,'noodles',true),
('Sample: Chicken Noodle Bowl','Placeholder description — replace with the real dish details.','Signature Noodles',NULL,'hero',true),
('Sample: Crispy Fried Chicken','Placeholder description — replace with the real dish details.','Chicken Dishes',NULL,'chicken',true),
('Sample: Glazed Chicken Wings','Placeholder description — replace with the real dish details.','Chicken Dishes',NULL,'wings',true),
('Sample: Fried Rice with Chicken','Placeholder description — replace with the real dish details.','Rice & Sides',NULL,'rice',true),
('Sample: Fresh Juices','Placeholder description — replace with the real drink details.','Drinks',NULL,'drinks',true);