-- Account deletion, in one function the app can call as the signed-in user.
--
-- Apple requires an app that creates accounts to delete them from inside the
-- app (App Store Review Guideline 5.1.1(v)). Deleting a row from auth.users
-- normally needs the service key, and a service key must never be shipped in
-- a client, so the work is done here instead: the function runs as its owner,
-- and all the app has to do is ask.
--
-- Run this once in the Supabase SQL editor for the momentum60 project
-- (ousyawhlmfktommyrrnw). It is safe to re-run.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  -- No session, no deletion. Without this an anonymous caller could invoke
  -- the function and delete the row belonging to a null user id.
  if uid is null then
    raise exception 'delete_own_account requires a signed-in user';
  end if;

  delete from public.daily_reflections where user_id = uid;
  delete from public.custom_rules      where user_id = uid;
  delete from public.user_progress     where user_id = uid;
  delete from public.user_profiles     where user_id = uid;

  -- The login last, so a failure above leaves the account intact and the
  -- person can try again rather than being locked out of their own data.
  delete from auth.users where id = uid;
end;
$$;

-- Only a signed-in user may call it, and the function itself checks that the
-- caller is deleting their own id.
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
