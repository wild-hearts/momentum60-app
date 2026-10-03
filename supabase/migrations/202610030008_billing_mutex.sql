BEGIN;
ALTER TABLE public.momentum_subscriptions ADD COLUMN checkout_token uuid, ADD COLUMN checkout_expires_at timestamptz;
ALTER TABLE public.momentum_subscriptions ADD COLUMN deleting boolean NOT NULL DEFAULT false;
CREATE FUNCTION public.begin_momentum_billing(owner_id uuid, deleting_account boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.momentum_subscriptions; token uuid:=gen_random_uuid();
BEGIN
 INSERT INTO public.momentum_subscriptions(user_id) VALUES(owner_id) ON CONFLICT DO NOTHING;
 SELECT * INTO s FROM public.momentum_subscriptions WHERE user_id=owner_id FOR UPDATE;
 IF s.checkout_expires_at>now() OR (s.deleting AND NOT deleting_account) THEN RAISE EXCEPTION 'Another billing operation is in progress';END IF;
 UPDATE public.momentum_subscriptions SET checkout_token=CASE WHEN deleting_account THEN NULL ELSE token END,checkout_expires_at=CASE WHEN deleting_account THEN NULL ELSE now()+interval '5 minutes' END,deleting=deleting_account WHERE user_id=owner_id;
 RETURN token;
END;
$$;
REVOKE ALL ON FUNCTION public.begin_momentum_billing(uuid,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.begin_momentum_billing(uuid,boolean) TO service_role;
COMMIT;
