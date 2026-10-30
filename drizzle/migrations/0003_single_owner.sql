CREATE TABLE public.restaurant_owner (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  user_id uuid NOT NULL UNIQUE
);
GRANT ALL ON public.restaurant_owner TO service_role;
ALTER TABLE public.restaurant_owner ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.restaurant_owner WHERE user_id = _user_id)
$$;
REVOKE EXECUTE ON FUNCTION public.is_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_owner(uuid) TO authenticated;

INSERT INTO public.restaurant_owner(user_id)
SELECT id FROM auth.users WHERE lower(email) = 'adonayalemu21@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles(user_id, role) SELECT user_id, 'admin' FROM public.restaurant_owner ON CONFLICT DO NOTHING;
UPDATE public.access_requests SET status = 'approved' WHERE user_id IN (SELECT user_id FROM public.restaurant_owner);

DROP POLICY admin_read_requests ON public.access_requests;
CREATE POLICY owner_read_requests ON public.access_requests FOR SELECT TO authenticated USING (public.is_owner(auth.uid()));

CREATE OR REPLACE FUNCTION public.decide_access_request(_user_id uuid, _approve boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_owner(auth.uid()) THEN RAISE EXCEPTION 'Only the owner can approve admins'; END IF;
  IF public.is_owner(_user_id) THEN RAISE EXCEPTION 'You cannot change the owner''s access'; END IF;
  IF _approve THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_user_id, 'admin') ON CONFLICT DO NOTHING;
    UPDATE public.access_requests SET status = 'approved' WHERE user_id = _user_id;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    UPDATE public.access_requests SET status = 'rejected' WHERE user_id = _user_id;
  END IF;
END $$;