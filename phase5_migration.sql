-- Phase 5 Migration: Real "Team Up" Architecture

-- 1. Add new columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES user_profiles(user_id);

-- 2. Create the secure RPC function for linking accounts
-- We use SECURITY DEFINER so this function bypasses normal RLS
-- This allows a user to "find" the owner of an invite code without us
-- having to make the entire user_profiles table publicly readable.
CREATE OR REPLACE FUNCTION link_partner_by_code(friend_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_friend_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the ID of the user making the request
  v_user_id := auth.uid();
  
  -- If not logged in, fail
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find the user who owns the provided invite code
  SELECT user_id INTO v_friend_id
  FROM user_profiles
  WHERE invite_code = friend_code
  LIMIT 1;

  -- If no user found, return false
  IF v_friend_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If trying to link with yourself, return false
  IF v_friend_id = v_user_id THEN
    RETURN FALSE;
  END IF;

  -- Update the calling user to point to the friend
  UPDATE user_profiles
  SET partner_id = v_friend_id
  WHERE user_id = v_user_id;

  -- Update the friend to point to the calling user (mutual link)
  UPDATE user_profiles
  SET partner_id = v_user_id
  WHERE user_id = v_friend_id;

  RETURN TRUE;
END;
$$;

-- 3. Update existing users to have an invite code if they don't
-- (Generates a random 6 character alphanumeric code)
UPDATE user_profiles
SET invite_code = substring(md5(random()::text), 1, 6)
WHERE invite_code IS NULL;
