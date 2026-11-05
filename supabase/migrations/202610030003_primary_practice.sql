BEGIN;
CREATE TABLE public.momentum_practices (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 id uuid NOT NULL DEFAULT gen_random_uuid(),
 normal_action text NOT NULL CHECK(length(normal_action) BETWEEN 1 AND 300),
 fallback_action text NOT NULL CHECK(length(fallback_action) BETWEEN 1 AND 300),
 cue text NOT NULL CHECK(length(cue) BETWEEN 1 AND 300)
);
ALTER TABLE public.momentum_practices ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.momentum_practices TO authenticated;
CREATE POLICY own_practice ON public.momentum_practices TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY paid_practice_insert ON public.momentum_practices AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_momentum_access(auth.uid()));
CREATE POLICY paid_practice_update ON public.momentum_practices AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_momentum_access(auth.uid()));
COMMIT;
BEGIN;
CREATE OR REPLACE FUNCTION public.capture_practice_for_archive()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT public.has_momentum_access(NEW.user_id) THEN RAISE EXCEPTION 'Active access required'; END IF;
 NEW.profile := NEW.profile || jsonb_build_object('primary_practice',(SELECT to_jsonb(p) FROM public.momentum_practices p WHERE p.user_id=NEW.user_id));
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_practice_for_archive() FROM PUBLIC;
CREATE TRIGGER capture_archive_practice BEFORE INSERT ON public.momentum_season_archives FOR EACH ROW EXECUTE FUNCTION public.capture_practice_for_archive();
COMMIT;
