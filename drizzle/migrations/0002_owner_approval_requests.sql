CREATE TABLE public.access_requests (
  user_id uuid PRIMARY KEY,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.access_requests TO authenticated;
GRANT ALL ON public.access_requests TO service_role;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_read_requests ON public.access_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY own_read_request ON public.access_requests FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.record_access_request() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.access_requests(user_id, email) VALUES (NEW.id, coalesce(NEW.email, ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.record_access_request() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_access_request AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.record_access_request();

INSERT INTO public.access_requests(user_id, email, status)
SELECT u.id, coalesce(u.email,''), CASE WHEN public.has_role(u.id,'admin') THEN 'approved' ELSE 'pending' END FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.decide_access_request(_user_id uuid, _approve boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only the owner can approve accounts'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot change your own access'; END IF;
  IF _approve THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_user_id, 'admin') ON CONFLICT DO NOTHING;
    UPDATE public.access_requests SET status = 'approved' WHERE user_id = _user_id;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    UPDATE public.access_requests SET status = 'rejected' WHERE user_id = _user_id;
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.decide_access_request(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_access_request(uuid, boolean) TO authenticated;