-- Phase 8 Migration: Head-to-Head Progress

-- Create a secure RPC to fetch the total completed days of a partner
CREATE OR REPLACE FUNCTION get_partner_progress()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_partner_id UUID;
  v_completed_days INTEGER;
BEGIN
  -- Get the ID of the user making the request
  v_user_id := auth.uid();
  
  -- If not logged in, fail
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Find the partner ID for this user
  SELECT partner_id INTO v_partner_id
  FROM user_profiles
  WHERE user_id = v_user_id
  LIMIT 1;

  -- If no partner, return 0
  IF v_partner_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate the number of distinct days completed by the partner
  SELECT COUNT(DISTINCT day_number) INTO v_completed_days
  FROM user_progress
  WHERE user_id = v_partner_id;

  RETURN COALESCE(v_completed_days, 0);
END;
$$;
