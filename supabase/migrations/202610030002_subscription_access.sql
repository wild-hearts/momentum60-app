BEGIN;
CREATE TABLE public.momentum_subscriptions (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 stripe_customer text UNIQUE,
 stripe_subscription text UNIQUE,
 paid_until timestamptz,
 last_paid_until timestamptz,
 native_paid_until timestamptz,
 status text NOT NULL DEFAULT 'inactive',
 legacy_access boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.momentum_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.momentum_subscriptions FROM anon, authenticated;
GRANT SELECT ON public.momentum_subscriptions TO authenticated;
CREATE POLICY own_subscription ON public.momentum_subscriptions FOR SELECT TO authenticated USING(user_id=auth.uid());
-- Existing programme participants retain their previously promised access.
INSERT INTO public.momentum_subscriptions(user_id,legacy_access,status) SELECT user_id,true,'legacy' FROM public.user_profiles ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.has_momentum_access(owner_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT owner_id = auth.uid() AND EXISTS(SELECT 1 FROM public.momentum_subscriptions WHERE user_id=owner_id AND (legacy_access OR native_paid_until>now() OR (status IN ('active','trialing','past_due','canceled') AND paid_until>now())));
$$;
REVOKE ALL ON FUNCTION public.has_momentum_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_momentum_access(uuid) TO authenticated;
CREATE POLICY paid_progress_insert ON public.user_progress AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_momentum_access(auth.uid()));
CREATE POLICY paid_reflection_insert ON public.daily_reflections AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_momentum_access(auth.uid()));
CREATE POLICY paid_reflection_update ON public.daily_reflections AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_momentum_access(auth.uid()));
COMMIT;
