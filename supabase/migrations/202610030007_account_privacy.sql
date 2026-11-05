BEGIN;
-- The former email lookup exposed arbitrary customer emails. The reminder worker
-- now uses the authenticated server admin API instead.
DROP FUNCTION IF EXISTS public.get_email_for_user(uuid);
DROP FUNCTION IF EXISTS public.delete_own_account();
CREATE OR REPLACE FUNCTION public.delete_momentum_account(owner_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Owner required';END IF;
 PERFORM 1 FROM public.momentum_subscriptions WHERE user_id=owner_id FOR UPDATE;
 PERFORM 1 FROM public.user_profiles WHERE user_id=owner_id OR partner_id=owner_id ORDER BY user_id FOR UPDATE;
 DELETE FROM public.daily_reflections WHERE user_id=owner_id;
 DELETE FROM public.custom_rules WHERE user_id=owner_id;
 DELETE FROM public.user_progress WHERE user_id=owner_id;
 UPDATE public.user_profiles SET partner_id=NULL WHERE partner_id=owner_id;
 DELETE FROM public.user_profiles WHERE user_id=owner_id;
 DELETE FROM auth.users WHERE id=owner_id;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_momentum_account(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.delete_momentum_account(uuid) TO service_role;
COMMIT;
