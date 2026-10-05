BEGIN;
-- One row per store subscription, written only by the server after it has
-- verified the purchase with Apple's signature or Google's API. The first
-- account to present a purchase owns it, so one store subscription cannot
-- unlock several Momentum60 accounts.
CREATE TABLE public.momentum_native_purchases (
 store text NOT NULL CHECK(store IN ('app_store','play_store')),
 purchase_id text NOT NULL,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 product text NOT NULL,
 expires_at timestamptz,
 entitled boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(store,purchase_id)
);
CREATE INDEX momentum_native_purchases_user ON public.momentum_native_purchases(user_id);
ALTER TABLE public.momentum_native_purchases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.momentum_native_purchases FROM PUBLIC,anon,authenticated;
COMMIT;
