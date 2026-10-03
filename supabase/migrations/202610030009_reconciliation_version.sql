BEGIN;
ALTER TABLE public.momentum_subscriptions ADD COLUMN reconciliation_version bigint NOT NULL DEFAULT 0, ADD COLUMN native_reconciliation_version bigint NOT NULL DEFAULT 0;
COMMIT;
