BEGIN;
ALTER TABLE public.momentum_subscriptions ADD COLUMN access_paused_since timestamptz;
CREATE FUNCTION public.pause_momentum_subscription_gap()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE old_end timestamptz; new_end timestamptz; gap_start timestamptz; zone text; from_day date; today date;
BEGIN
 IF OLD.legacy_access OR NEW.legacy_access THEN RETURN NEW;END IF;
 old_end:=greatest(OLD.native_paid_until,CASE WHEN OLD.status IN ('active','past_due','trialing','canceled') THEN OLD.paid_until END);
 new_end:=greatest(NEW.native_paid_until,CASE WHEN NEW.status IN ('active','past_due','trialing','canceled') THEN NEW.paid_until END);
 IF new_end IS NULL OR new_end<=now() THEN
  NEW.access_paused_since:=COALESCE(OLD.access_paused_since,least(old_end,now()));
 ELSIF OLD.access_paused_since IS NOT NULL OR old_end<now() THEN
  gap_start:=COALESCE(OLD.access_paused_since,old_end);
  SELECT COALESCE(NULLIF(timezone,''),'UTC') INTO zone FROM public.user_profiles WHERE user_id=NEW.user_id FOR UPDATE;
  IF zone IS NOT NULL THEN
   from_day:=(gap_start AT TIME ZONE zone)::date+CASE WHEN (gap_start AT TIME ZONE zone)::time=time '00:00:00' THEN 0 ELSE 1 END;today:=(now() AT TIME ZONE zone)::date;
   UPDATE public.user_profiles SET paused_dates=ARRAY(SELECT DISTINCT d FROM unnest(paused_dates || ARRAY(SELECT generate_series(from_day,today-1,'1 day')::date)) d ORDER BY d) WHERE user_id=NEW.user_id;
  END IF;
  NEW.access_paused_since:=NULL;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.pause_momentum_subscription_gap() FROM PUBLIC;
CREATE TRIGGER preserve_subscription_gap BEFORE UPDATE OF paid_until,native_paid_until,status ON public.momentum_subscriptions FOR EACH ROW EXECUTE FUNCTION public.pause_momentum_subscription_gap();
COMMIT;
