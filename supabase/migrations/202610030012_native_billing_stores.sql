BEGIN;
ALTER TABLE public.momentum_subscriptions ADD COLUMN native_billing_stores text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.momentum_subscriptions ADD CONSTRAINT known_native_billing_stores CHECK(native_billing_stores <@ ARRAY['app_store','play_store']::text[]);
-- Existing RLS permits the owner to read, and only the service role to write.
COMMIT;
