CREATE TABLE public.owner_invitations (email text PRIMARY KEY);
GRANT ALL ON public.owner_invitations TO service_role;
ALTER TABLE public.owner_invitations ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.activate_designated_owner() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
IF NEW.email_confirmed_at IS NOT NULL THEN
  DELETE FROM public.owner_invitations WHERE email = lower(NEW.email);
  IF FOUND THEN
    INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,'admin') ON CONFLICT DO NOTHING;
  END IF;
END IF;
RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.activate_designated_owner() FROM PUBLIC;
CREATE TRIGGER activate_designated_owner AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.activate_designated_owner();