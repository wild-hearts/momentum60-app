-- Phase 9 Migration: close the email-address disclosure, and make the
-- reminder job safe to run twice.
--
-- PREPARED 3 September 2026, NOT APPLIED. Run this in the Supabase SQL editor
-- for project ousyawhlmfktommyrrnw ("Momentum 60") before setting the reminder
-- job's environment variables in Vercel. Applying it does not change anything a
-- user can see.
--
-- ---------------------------------------------------------------------------
-- 1. WHY. get_email_for_user was created by phase6_migration.sql as
--    SECURITY DEFINER so the hourly cron could read auth.users. It takes the
--    user id as a parameter and never checks who is calling. Postgres grants
--    EXECUTE to PUBLIC by default and Supabase exposes public schema functions
--    to the anon role, so the function is callable by anyone holding the anon
--    key. The anon key ships inside the browser bundle and the repository is
--    public, so it is not a secret. Anyone who obtains a user id can therefore
--    turn it into that user's email address.
--
--    Verified 3 September 2026 by POSTing an all-zero UUID to
--    /rest/v1/rpc/get_email_for_user with only the anon key. It returned
--    HTTP 200. No real user's data was read: the all-zero UUID matches nobody,
--    so the response was null, which is exactly what proves the call succeeds.
--
--    The other two SECURITY DEFINER functions are fine and are left alone.
--    get_partner_progress and link_partner_by_code both derive the caller from
--    auth.uid() instead of trusting a parameter, so neither can be aimed at a
--    third party. This migration touches only the one that trusts its input.
-- ---------------------------------------------------------------------------

-- 1a. Take the function away from every browser-reachable role. After this,
--     only the service role can call it, which is why api/remind.js was changed
--     to authenticate with SUPABASE_SERVICE_ROLE_KEY instead of the anon key.
REVOKE EXECUTE ON FUNCTION public.get_email_for_user(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_email_for_user(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_email_for_user(UUID) FROM authenticated;

-- 1b. Belt as well as braces. Even holding the service role key, the function
--     should refuse to be aimed at a user by a caller that is not the server.
--     search_path is pinned because a SECURITY DEFINER function without one can
--     be redirected by a caller-controlled search_path.
CREATE OR REPLACE FUNCTION public.get_email_for_user(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- auth.uid() is NULL for the service role and set for a logged-in user.
  -- Allow the server, and allow a user to read only their own address.
  IF auth.uid() IS NOT NULL AND auth.uid() <> target_user_id THEN
    RAISE EXCEPTION 'not permitted';
  END IF;

  SELECT email INTO v_email
  FROM auth.users
  WHERE id = target_user_id
  LIMIT 1;

  RETURN v_email;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_email_for_user(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_email_for_user(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_email_for_user(UUID) FROM authenticated;

-- ---------------------------------------------------------------------------
-- 2. Make the reminder job safe to run twice.
--    The job sends email, so it must never be retried blindly. The unique
--    constraint below is the thing that makes a repeat run harmless: the job
--    claims a row before it sends, and a duplicate key means the reminder has
--    already gone out. api/remind.js refuses to send at all if this table is
--    absent, which is why this migration has to be applied before the job is
--    switched on.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, day_number)
);

-- No user should be able to read or write the send log from the browser.
-- RLS on with no policy means the anon and authenticated roles get nothing,
-- while the service role bypasses RLS and can still write it.
ALTER TABLE public.reminder_log ENABLE ROW LEVEL SECURITY;

-- Lets a future check answer "did last night's reminders actually go out"
-- without scanning the whole table.
CREATE INDEX IF NOT EXISTS reminder_log_sent_at_idx
  ON public.reminder_log (sent_at DESC);
