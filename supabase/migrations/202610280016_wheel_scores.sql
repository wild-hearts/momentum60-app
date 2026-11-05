-- The Wheel: eight areas scored 1-10 at the start, day 30 and day 60 of a season.
-- Written by src/components/WheelCard.jsx. Until this is applied the Wheel card hides itself.
BEGIN;
CREATE TABLE IF NOT EXISTS public.momentum_wheel_scores (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 season_start timestamptz NOT NULL,
 checkpoint integer NOT NULL CHECK(checkpoint IN (1,30,60)),
 scores jsonb NOT NULL CHECK(jsonb_typeof(scores)='object'),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, season_start, checkpoint)
);
ALTER TABLE public.momentum_wheel_scores ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.momentum_wheel_scores TO authenticated;
CREATE POLICY own_wheel_score ON public.momentum_wheel_scores TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY paid_wheel_score_insert ON public.momentum_wheel_scores AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_momentum_access(auth.uid()));
CREATE POLICY paid_wheel_score_update ON public.momentum_wheel_scores AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_momentum_access(auth.uid()));
COMMIT;
