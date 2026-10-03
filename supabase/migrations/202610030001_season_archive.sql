-- Additive schema; execute in staging first after a verified backup.
BEGIN;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS season_started_at timestamptz;
ALTER TABLE public.daily_reflections ADD COLUMN IF NOT EXISTS season_started_at timestamptz;
UPDATE public.user_progress p SET season_started_at=u.start_date FROM public.user_profiles u WHERE p.user_id=u.user_id AND p.season_started_at IS NULL;
UPDATE public.daily_reflections r SET season_started_at=u.start_date FROM public.user_profiles u WHERE r.user_id=u.user_id AND r.season_started_at IS NULL;
CREATE OR REPLACE FUNCTION public.check_active_season_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE started timestamptz;
BEGIN
 SELECT start_date INTO started FROM public.user_profiles WHERE user_id=NEW.user_id FOR SHARE;
 IF NEW.season_started_at IS NULL OR NEW.season_started_at IS DISTINCT FROM started THEN
   RAISE EXCEPTION 'This season changed. Reload before saving.';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.check_active_season_write() FROM PUBLIC;
CREATE TRIGGER progress_season_guard BEFORE INSERT OR UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.check_active_season_write();
CREATE TRIGGER reflection_season_guard BEFORE INSERT OR UPDATE ON public.daily_reflections FOR EACH ROW EXECUTE FUNCTION public.check_active_season_write();
CREATE TABLE IF NOT EXISTS public.momentum_season_archives (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 operation_id uuid NOT NULL,
 archived_at timestamptz NOT NULL DEFAULT now(),
 profile jsonb NOT NULL,
 rules jsonb NOT NULL,
 progress jsonb NOT NULL,
 reflections jsonb NOT NULL,
 UNIQUE(user_id, operation_id)
);
ALTER TABLE public.momentum_season_archives ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.momentum_season_archives FROM anon, authenticated;
GRANT SELECT ON public.momentum_season_archives TO authenticated;
CREATE POLICY own_archives ON public.momentum_season_archives FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION public.archive_and_start_season(request_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE owner_id uuid := auth.uid(); archived_id uuid; current_profile jsonb;
BEGIN
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF request_id IS NULL THEN RAISE EXCEPTION 'Request identifier required'; END IF;
 -- Lock the user's profile so overlapping new-season requests cannot interleave.
 SELECT to_jsonb(p) INTO current_profile FROM public.user_profiles p WHERE p.user_id=owner_id FOR UPDATE;
 IF current_profile IS NULL THEN RAISE EXCEPTION 'No active season'; END IF;
 SELECT id INTO archived_id FROM public.momentum_season_archives WHERE user_id=owner_id AND operation_id=request_id;
 IF archived_id IS NOT NULL THEN RETURN archived_id; END IF;
 INSERT INTO public.momentum_season_archives(user_id, operation_id, profile, rules, progress, reflections)
 VALUES(owner_id,request_id,current_profile,
  COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM public.custom_rules r WHERE r.user_id=owner_id),'[]'::jsonb),
  COALESCE((SELECT jsonb_agg(to_jsonb(p)) FROM public.user_progress p WHERE p.user_id=owner_id),'[]'::jsonb),
  COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM public.daily_reflections r WHERE r.user_id=owner_id),'[]'::jsonb)) RETURNING id INTO archived_id;
 -- Archive and clearing of the active view commit together or not at all.
 DELETE FROM public.user_progress WHERE user_id=owner_id;
 DELETE FROM public.daily_reflections WHERE user_id=owner_id;
 UPDATE public.user_profiles SET start_date=now() WHERE user_id=owner_id;
 RETURN archived_id;
END;
$$;
REVOKE ALL ON FUNCTION public.archive_and_start_season(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_and_start_season(uuid) TO authenticated;
COMMIT;
