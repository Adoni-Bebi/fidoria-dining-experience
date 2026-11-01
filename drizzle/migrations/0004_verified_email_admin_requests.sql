CREATE OR REPLACE FUNCTION public.email_is_confirmed(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id AND email_confirmed_at IS NOT NULL)
$$;
REVOKE EXECUTE ON FUNCTION public.email_is_confirmed(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.email_is_confirmed(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT public.email_is_confirmed(_user_id) AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.record_access_request() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.email_confirmed_at IS NOT NULL THEN
  INSERT INTO public.access_requests(user_id, email, status)
  VALUES (NEW.id, coalesce(NEW.email, ''), CASE WHEN public.is_owner(NEW.id) THEN 'approved' ELSE 'pending' END)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
 END IF;
 RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.record_access_request() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_auth_user_access_request ON auth.users;
CREATE TRIGGER on_auth_user_access_request AFTER INSERT OR UPDATE OF email_confirmed_at, email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.record_access_request();

DROP POLICY IF EXISTS owner_read_requests ON public.access_requests;
CREATE POLICY owner_read_requests ON public.access_requests FOR SELECT TO authenticated
USING (public.is_owner(auth.uid()) AND public.email_is_confirmed(auth.uid()) AND public.email_is_confirmed(user_id));
DROP POLICY IF EXISTS own_read_request ON public.access_requests;
CREATE POLICY own_read_request ON public.access_requests FOR SELECT TO authenticated
USING (user_id = auth.uid() AND public.email_is_confirmed(auth.uid()));

CREATE OR REPLACE FUNCTION public.decide_access_request(_user_id uuid, _approve boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT public.is_owner(auth.uid()) OR NOT public.email_is_confirmed(auth.uid()) THEN RAISE EXCEPTION 'Only the verified owner can approve admins'; END IF;
 IF public.is_owner(_user_id) THEN RAISE EXCEPTION 'You cannot change the owner''s access'; END IF;
 IF _approve THEN
  IF NOT public.email_is_confirmed(_user_id) THEN RAISE EXCEPTION 'This account must verify its email first'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.access_requests WHERE user_id = _user_id) THEN RAISE EXCEPTION 'No verified admin request was found'; END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (_user_id, 'admin') ON CONFLICT DO NOTHING;
  UPDATE public.access_requests SET status = 'approved' WHERE user_id = _user_id;
 ELSE
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  UPDATE public.access_requests SET status = 'rejected' WHERE user_id = _user_id;
 END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.decide_access_request(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_access_request(uuid, boolean) TO authenticated;