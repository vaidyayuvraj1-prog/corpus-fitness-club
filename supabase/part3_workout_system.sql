-- PART 3: WORKOUT PLANS, EXERCISES & SESSIONS
CREATE TABLE IF NOT EXISTS exercise_library (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL DEFAULT 'Barbell',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  instructions TEXT,
  default_sets INT NOT NULL DEFAULT 3,
  default_reps TEXT NOT NULL DEFAULT '10 - 12',
  default_rest_seconds INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to exercise_library" ON exercise_library;
CREATE POLICY "Allow all access to exercise_library" ON exercise_library FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS workout_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  description TEXT,
  trainer_id TEXT REFERENCES trainers(id) ON DELETE SET NULL,
  trainer_name TEXT,
  assigned_member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_by_role TEXT NOT NULL DEFAULT 'admin' CHECK (created_by_role IN ('admin', 'trainer', 'member')),
  duration_weeks INT NOT NULL DEFAULT 8,
  days_per_week INT NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_plans" ON workout_plans;
CREATE POLICY "Allow all access to workout_plans" ON workout_plans FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE workout_plans; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plan_id TEXT REFERENCES workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  sets INT NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '10 - 12',
  weight TEXT DEFAULT 'Bodyweight',
  rest_seconds INT NOT NULL DEFAULT 60,
  day_of_week TEXT NOT NULL DEFAULT 'Monday',
  instructions TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_exercises" ON workout_exercises;
CREATE POLICY "Allow all access to workout_exercises" ON workout_exercises FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE workout_exercises; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS member_workout_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_code VARCHAR(50) NOT NULL,
  member_phone VARCHAR(30),
  workout_plan_id TEXT REFERENCES workout_plans(id) ON DELETE SET NULL,
  workout_plan_name TEXT NOT NULL,
  plan_snapshot JSONB NOT NULL,
  trainer_id TEXT REFERENCES trainers(id) ON DELETE SET NULL,
  trainer_name TEXT,
  assigned_by TEXT NOT NULL DEFAULT 'Admin Director',
  assigned_by_role TEXT NOT NULL DEFAULT 'admin' CHECK (assigned_by_role IN ('admin', 'trainer')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  personal_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE member_workout_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to member_workout_assignments" ON member_workout_assignments;
CREATE POLICY "Allow all access to member_workout_assignments" ON member_workout_assignments FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE member_workout_assignments; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT,
  plan_id TEXT REFERENCES workout_plans(id) ON DELETE SET NULL,
  plan_name TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INT DEFAULT 45,
  notes TEXT,
  trainer_id TEXT REFERENCES trainers(id) ON DELETE SET NULL,
  trainer_name TEXT,
  completed_sets JSONB DEFAULT '[]'::jsonb,
  completion_percentage INT DEFAULT 100,
  total_volume_kg NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_sessions" ON workout_sessions;
CREATE POLICY "Allow all access to workout_sessions" ON workout_sessions FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE workout_sessions; EXCEPTION WHEN OTHERS THEN NULL; END $$;
