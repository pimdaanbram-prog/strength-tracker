-- =====================================================
-- STRENGTH TRACKER — DATABASE SCHEMA
-- Draai dit in Supabase SQL Editor (supabase.com → SQL Editor)
-- =====================================================

-- Training profiles (meerdere per account: "Pim", "Lisa" etc)
CREATE TABLE public.training_profiles (
  id TEXT PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  age INTEGER NOT NULL,
  weight NUMERIC(5,1) NOT NULL,
  height NUMERIC(5,1) NOT NULL,
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  goals TEXT[] DEFAULT '{}',
  available_equipment TEXT[] DEFAULT '{}',
  avatar TEXT DEFAULT '💪',
  color TEXT DEFAULT '#3B82F6',
  created_at TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout sessies (exercises opgeslagen als JSONB)
CREATE TABLE public.workout_sessions (
  id TEXT PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id TEXT NOT NULL,
  date TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  day_label TEXT NOT NULL,
  workout_name TEXT NOT NULL,
  exercises JSONB DEFAULT '[]',
  duration_minutes INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  completed_at TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wekelijkse logs met feedback
CREATE TABLE public.week_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  sessions TEXT[] DEFAULT '{}',
  feedback_generated BOOLEAN DEFAULT false,
  feedback JSONB,
  UNIQUE(profile_id, week_number, year)
);

-- Row Level Security inschakelen
ALTER TABLE public.training_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users zien alleen eigen data
CREATE POLICY "Users manage own training profiles"
  ON public.training_profiles FOR ALL
  USING (auth.uid() = account_id);

CREATE POLICY "Users manage own sessions"
  ON public.workout_sessions FOR ALL
  USING (auth.uid() = account_id);

CREATE POLICY "Users manage own week logs"
  ON public.week_logs FOR ALL
  USING (auth.uid() = account_id);

-- Realtime inschakelen
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.week_logs;
