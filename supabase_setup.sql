-- 1. Create User Progress Table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  day_number INTEGER NOT NULL,
  rule_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_number, rule_id)
);

-- 2. Create Custom Rules Table
CREATE TABLE custom_rules (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  UNIQUE(user_id, id)
);

-- 3. Turn on Row Level Security (RLS) for absolute privacy
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_rules ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies (Users can only see/edit their own data)
CREATE POLICY "Users can only see their own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON user_progress FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own rules" ON custom_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rules" ON custom_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rules" ON custom_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rules" ON custom_rules FOR DELETE USING (auth.uid() = user_id);
