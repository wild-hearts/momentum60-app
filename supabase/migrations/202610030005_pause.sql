BEGIN;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS paused_since date;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS paused_dates date[] NOT NULL DEFAULT '{}';
CREATE OR REPLACE FUNCTION public.set_momentum_pause(should_pause boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE owner_id uuid:=auth.uid(); p public.user_profiles; today date;
BEGIN
 IF owner_id IS NULL OR NOT public.has_momentum_access(owner_id) THEN RAISE EXCEPTION 'Active access required';END IF;
 SELECT * INTO p FROM public.user_profiles WHERE user_id=owner_id FOR UPDATE;
 IF p.user_id IS NULL THEN RAISE EXCEPTION 'Season not started';END IF;
 today:=(now() AT TIME ZONE COALESCE(NULLIF(p.timezone,''),'UTC'))::date;
 IF should_pause THEN
  UPDATE public.user_profiles SET paused_since=COALESCE(paused_since,today) WHERE user_id=owner_id;
 ELSIF p.paused_since IS NOT NULL THEN
  UPDATE public.user_profiles SET paused_dates=ARRAY(SELECT DISTINCT d FROM unnest(p.paused_dates || ARRAY(SELECT generate_series(p.paused_since,today-1,'1 day')::date)) d ORDER BY d),paused_since=NULL WHERE user_id=owner_id;
 END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.set_momentum_pause(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_momentum_pause(boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.clear_pause_on_new_season()
RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF NEW.start_date IS DISTINCT FROM OLD.start_date THEN NEW.paused_since:=NULL;NEW.paused_dates:='{}';END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER reset_season_pause BEFORE UPDATE OF start_date ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.clear_pause_on_new_season();
COMMIT;
BEGIN;
CREATE OR REPLACE FUNCTION public.check_action_calendar()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.user_profiles; today date; started date; active_day int;
BEGIN
 SELECT * INTO p FROM public.user_profiles WHERE user_id=NEW.user_id FOR SHARE;
 today:=(now() AT TIME ZONE COALESCE(NULLIF(p.timezone,''),'UTC'))::date;
 started:=(p.start_date AT TIME ZONE COALESCE(NULLIF(p.timezone,''),'UTC'))::date;
 active_day:=today-started+1-(SELECT count(*) FROM unnest(p.paused_dates) d WHERE d>=started AND d<=today);
 IF p.paused_since IS NOT NULL OR active_day<1 OR active_day>60 OR NEW.day_number<>active_day THEN RAISE EXCEPTION 'Only the current active programme day can be recorded';END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.check_action_calendar() FROM PUBLIC;
CREATE TRIGGER current_action_day BEFORE INSERT OR UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.check_action_calendar();
COMMIT;
