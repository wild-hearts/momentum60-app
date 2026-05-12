-- Phase 6 Migration: Personalised Reminders

-- 1. Add new columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_time TEXT DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- 2. Create RPC to securely fetch email for the cron job
-- We use SECURITY DEFINER to bypass RLS and read auth.users
CREATE OR REPLACE FUNCTION get_email_for_user(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = target_user_id
  LIMIT 1;
  
  RETURN v_email;
END;
$$;
