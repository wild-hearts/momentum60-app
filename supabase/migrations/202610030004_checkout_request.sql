BEGIN;
ALTER TABLE public.momentum_subscriptions ADD COLUMN checkout_request_id uuid;
CREATE OR REPLACE FUNCTION public.ensure_momentum_checkout(owner_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE request uuid;
BEGIN
 INSERT INTO public.momentum_subscriptions(user_id) VALUES(owner_id) ON CONFLICT DO NOTHING;
 SELECT checkout_request_id INTO request FROM public.momentum_subscriptions WHERE user_id=owner_id FOR UPDATE;
 IF request IS NULL THEN request:=gen_random_uuid();UPDATE public.momentum_subscriptions SET checkout_request_id=request WHERE user_id=owner_id;END IF;
 RETURN request;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_momentum_checkout(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_momentum_checkout(uuid) TO service_role;
COMMIT;
