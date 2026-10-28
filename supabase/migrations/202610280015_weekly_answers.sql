-- Her answer to each week's bigger question, kept per season so a new season starts clean.
-- Written by the Momentum Book (src/components/WeeklyQuestion.jsx). Not applied to the live
-- database yet: until it is, the weekly question card hides itself.
BEGIN;
CREATE TABLE IF NOT EXISTS public.momentum_weekly_answers (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 season_start timestamptz NOT NULL,
 week integer NOT NULL CHECK(week BETWEEN 1 AND 9),
 content text NOT NULL CHECK(length(content) <= 4000),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, season_start, week)
);
ALTER TABLE public.momentum_weekly_answers ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.momentum_weekly_answers TO authenticated;
CREATE POLICY own_weekly_answer ON public.momentum_weekly_answers TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY paid_weekly_answer_insert ON public.momentum_weekly_answers AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_momentum_access(auth.uid()));
CREATE POLICY paid_weekly_answer_update ON public.momentum_weekly_answers AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_momentum_access(auth.uid()));
COMMIT;
