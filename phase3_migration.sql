-- Phase 3 Migration: Accountability Window & Journal Mode

-- 1. Create User Profiles Table
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accountability_mode TEXT NOT NULL DEFAULT 'honor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Daily Reflections Table
CREATE TABLE daily_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  day_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_number)
);

-- 3. Turn on Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON user_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reflections" ON daily_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reflections" ON daily_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reflections" ON daily_reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reflections" ON daily_reflections FOR DELETE USING (auth.uid() = user_id);

-- 5. IMPORTANT: Wipe existing test data to enforce the new clock system cleanly
DELETE FROM user_progress;
