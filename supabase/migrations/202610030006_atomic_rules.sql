BEGIN;
CREATE OR REPLACE FUNCTION public.replace_momentum_rules(rules jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE owner_id uuid:=auth.uid();
BEGIN
 IF owner_id IS NULL OR NOT public.has_momentum_access(owner_id) THEN RAISE EXCEPTION 'Active access required';END IF;
 IF jsonb_typeof(rules) IS DISTINCT FROM 'array' OR jsonb_array_length(rules)>20 THEN RAISE EXCEPTION 'Invalid rules';END IF;
 PERFORM 1 FROM public.user_profiles WHERE user_id=owner_id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(rules) r WHERE length(trim(r->>'label')) NOT BETWEEN 1 AND 300 OR r->>'label' IS NULL OR r->>'id' IS NULL) THEN RAISE EXCEPTION 'Invalid rule';END IF;
 DELETE FROM public.custom_rules WHERE user_id=owner_id;
 INSERT INTO public.custom_rules(id,user_id,label,sort_order) SELECT r->>'id',owner_id,r->>'label',n::int FROM jsonb_array_elements(rules) WITH ORDINALITY AS a(r,n);
END;
$$;
REVOKE ALL ON FUNCTION public.replace_momentum_rules(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_momentum_rules(jsonb) TO authenticated;
COMMIT;
