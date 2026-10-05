BEGIN;
-- Retain legacy relationship records, but expose no sharing until mutual consent
-- and atomic revocation are implemented. This protects old installed clients too.
CREATE OR REPLACE FUNCTION public.link_partner_by_code(friend_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 RAISE EXCEPTION 'Partner sharing is unavailable';
END;
$$;
CREATE OR REPLACE FUNCTION public.get_partner_progress()
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ SELECT 0; $$;
REVOKE ALL ON FUNCTION public.link_partner_by_code(text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.get_partner_progress() FROM PUBLIC,anon,authenticated;
COMMIT;
