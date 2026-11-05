BEGIN;
-- Apple stamps every purchase record and renewal notice with the moment it
-- signed it. The newest one applied to each subscription is kept, so a stale
-- record (a receipt saved before a refund and replayed, or Apple redelivering
-- an old notice out of order) can never undo newer truth. See shouldApply in
-- api/_lib/nativeAccess.js.
ALTER TABLE public.momentum_native_purchases ADD COLUMN IF NOT EXISTS last_signed_ms bigint;
-- TestFlight, App Review and Google licence-tester purchases are marked
-- 'Sandbox' so they can be limited to named testers (ALLOW_SANDBOX_ACCESS).
ALTER TABLE public.momentum_native_purchases ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'Production'
 CHECK (environment IN ('Production','Sandbox'));
COMMIT;
