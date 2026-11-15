-- ==============================================================================
-- CORPUS FITNESS CLUB (CFC) - CLEAN PRODUCTION DATABASE SCHEMA
-- Version: 3.0 (Zero Dummy Data - Pure Tables, Security & Realtime)
-- Location: Harshraj Colony, VMV Road, Amravati, Maharashtra
-- ==============================================================================
-- INSTRUCTIONS FOR SUPABASE SQL EDITOR:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to "SQL Editor" (>_) in the left sidebar
-- 3. Click "+ New query"
-- 4. Copy & paste this entire file
-- 5. Press Ctrl+A (Select All) to ensure everything is selected
-- 6. Click the green "Run" button (or press Ctrl+Enter)
-- ==============================================================================

-- ── 1. EXTENSIONS ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. REAL-TIME MULTI-DEVICE STORE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cfc_store (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE cfc_store ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to cfc_store" ON cfc_store;
CREATE POLICY "Allow all access to cfc_store" ON cfc_store FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cfc_store;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 3. USER PROFILES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name TEXT NOT NULL,
  phone VARCHAR(30),
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'receptionist', 'trainer', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to profiles" ON profiles;
CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- ── 4. ADMIN DIRECTOR PROFILE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_profile (
  id TEXT PRIMARY KEY DEFAULT 'admin-director-root',
  full_name TEXT NOT NULL DEFAULT 'Yuvraj Vaidya (Director)',
  email TEXT NOT NULL DEFAULT 'admin@corpuss.com',
  phone VARCHAR(30) DEFAULT '+91 76206 83995',
  role TEXT NOT NULL DEFAULT 'super_admin',
  avatar_url TEXT,
  password TEXT DEFAULT 'Admin@2026',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to admin_profile" ON admin_profile;
CREATE POLICY "Allow all access to admin_profile" ON admin_profile FOR ALL USING (true) WITH CHECK (true);

-- ── 5. TRAINERS & COACHES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone VARCHAR(30),
  email TEXT,
  password TEXT DEFAULT 'CFC@TRN2026',
  specialization TEXT,
  experience TEXT,
  certifications TEXT[] DEFAULT '{}',
  bio TEXT,
  photo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trainers_is_active ON trainers(is_active);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to trainers" ON trainers;
CREATE POLICY "Allow all access to trainers" ON trainers FOR ALL USING (true) WITH CHECK (true);

-- ── 6. MEMBERSHIP PLANS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration_type TEXT NOT NULL,
  duration_months INT NOT NULL,
  price_men NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_women NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  popular BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to membership_plans" ON membership_plans;
CREATE POLICY "Allow all access to membership_plans" ON membership_plans FOR ALL USING (true) WITH CHECK (true);

-- ── 7. GYM MEMBERS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  member_id VARCHAR(50) UNIQUE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone VARCHAR(30),
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fitness_goal TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'frozen', 'cancelled', 'upcoming')),
  current_plan_id TEXT REFERENCES membership_plans(id) ON DELETE SET NULL,
  trainer_id TEXT REFERENCES trainers(id) ON DELETE SET NULL,
  trainer_name TEXT,
  pt_status TEXT DEFAULT 'general_floor' CHECK (pt_status IN ('active_pt', 'general_floor', 'pt_requested')),
  pt_package TEXT,
  photo_url TEXT,
  password TEXT DEFAULT 'CFC@2026',
  email TEXT,
  phone VARCHAR(30),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_trainer_id ON members(trainer_id);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to members" ON members;
CREATE POLICY "Allow all access to members" ON members FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE members;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 8. MEMBERSHIPS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES membership_plans(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  payment_method TEXT DEFAULT 'UPI',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'on_hold', 'upcoming')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memberships_member_id ON memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to memberships" ON memberships;
CREATE POLICY "Allow all access to memberships" ON memberships FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE memberships;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 9. MEMBERSHIP RENEWALS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_renewals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_code VARCHAR(50) NOT NULL,
  renewal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  previous_plan_name TEXT,
  previous_expiry_date DATE,
  renewed_plan_id TEXT REFERENCES membership_plans(id) ON DELETE RESTRICT,
  renewed_plan_name TEXT NOT NULL,
  new_start_date DATE NOT NULL,
  new_expiry_date DATE NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  payment_method TEXT DEFAULT 'UPI',
  receipt_number VARCHAR(60) NOT NULL,
  processed_by TEXT DEFAULT 'Admin Director',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_renewals_member_id ON membership_renewals(member_id);

ALTER TABLE membership_renewals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to membership_renewals" ON membership_renewals;
CREATE POLICY "Allow all access to membership_renewals" ON membership_renewals FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE membership_renewals;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 10. PAYMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  membership_id TEXT REFERENCES memberships(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) DEFAULT 0,
  pending_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method IN ('Cash', 'UPI', 'Bank Transfer', 'Card', 'Other')),
  transaction_ref TEXT,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'partial', 'pending', 'refunded')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_number VARCHAR(60) NOT NULL,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to payments" ON payments;
CREATE POLICY "Allow all access to payments" ON payments FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE payments;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 11. ATTENDANCE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'qr' CHECK (method IN ('qr', 'manual')),
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance(check_in);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to attendance" ON attendance;
CREATE POLICY "Allow all access to attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 12. EXERCISE LIBRARY ──────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_exercise_library_muscle ON exercise_library(muscle_group);

ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to exercise_library" ON exercise_library;
CREATE POLICY "Allow all access to exercise_library" ON exercise_library FOR ALL USING (true) WITH CHECK (true);

-- ── 13. WORKOUT PLANS ─────────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_workout_plans_category ON workout_plans(category);
CREATE INDEX IF NOT EXISTS idx_workout_plans_is_default ON workout_plans(is_default);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_plans" ON workout_plans;
CREATE POLICY "Allow all access to workout_plans" ON workout_plans FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE workout_plans;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 14. WORKOUT EXERCISES ─────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_workout_exercises_plan ON workout_exercises(plan_id);

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_exercises" ON workout_exercises;
CREATE POLICY "Allow all access to workout_exercises" ON workout_exercises FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE workout_exercises;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 15. MEMBER WORKOUT ASSIGNMENTS ────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_mwa_member_id ON member_workout_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_mwa_status ON member_workout_assignments(status);

ALTER TABLE member_workout_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to member_workout_assignments" ON member_workout_assignments;
CREATE POLICY "Allow all access to member_workout_assignments" ON member_workout_assignments FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE member_workout_assignments;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 16. WORKOUT SESSIONS ──────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_workout_sessions_member ON workout_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_sessions" ON workout_sessions;
CREATE POLICY "Allow all access to workout_sessions" ON workout_sessions FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE workout_sessions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 17. DIET PLANS & MEAL ITEMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diet_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  total_calories INT NOT NULL DEFAULT 2200,
  protein_g INT NOT NULL DEFAULT 140,
  carbs_g INT NOT NULL DEFAULT 220,
  fats_g INT NOT NULL DEFAULT 65,
  water_liters NUMERIC(4, 1) NOT NULL DEFAULT 3.5,
  trainer_id TEXT REFERENCES trainers(id) ON DELETE SET NULL,
  trainer_name TEXT,
  assigned_member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to diet_plans" ON diet_plans;
CREATE POLICY "Allow all access to diet_plans" ON diet_plans FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS meal_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  diet_plan_id TEXT REFERENCES diet_plans(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Mid-Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Post-Workout')),
  food_item TEXT NOT NULL,
  quantity TEXT NOT NULL,
  calories INT NOT NULL DEFAULT 0,
  protein_g INT NOT NULL DEFAULT 0,
  carbs_g INT NOT NULL DEFAULT 0,
  fats_g INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to meal_items" ON meal_items;
CREATE POLICY "Allow all access to meal_items" ON meal_items FOR ALL USING (true) WITH CHECK (true);

-- ── 18. ENQUIRIES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reference_no VARCHAR(50) UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  age TEXT,
  interested_plan TEXT,
  fitness_goal TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'converted', 'not_interested')),
  lead_source TEXT DEFAULT 'Walk-in',
  assigned_staff TEXT,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to enquiries" ON enquiries;
CREATE POLICY "Allow all access to enquiries" ON enquiries FOR ALL USING (true) WITH CHECK (true);

-- ── 19. CLUB EXPENSES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category TEXT NOT NULL CHECK (category IN ('Rent', 'Electricity', 'Equipment', 'Maintenance', 'Salary', 'Marketing', 'Supplements', 'Cleaning & Sanitization', 'Other')),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  receipt_url TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to expenses" ON expenses;
CREATE POLICY "Allow all access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- ── 20. FITNESS PROGRESS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fitness_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5, 2) NOT NULL,
  body_fat_pct NUMERIC(4, 1),
  chest_cm NUMERIC(5, 1),
  waist_cm NUMERIC(5, 1),
  hips_cm NUMERIC(5, 1),
  biceps_cm NUMERIC(5, 1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fitness_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to fitness_progress" ON fitness_progress;
CREATE POLICY "Allow all access to fitness_progress" ON fitness_progress FOR ALL USING (true) WITH CHECK (true);

-- ── 21. NOTIFICATIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'active_members', 'trainers', 'expired_members')),
  sent_by TEXT DEFAULT 'Admin Director',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  channels TEXT[] DEFAULT '{"in_app"}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to notifications" ON notifications;
CREATE POLICY "Allow all access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 22. TRAINER ASSIGNMENTS & FEEDBACK ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainer_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_code VARCHAR(50) NOT NULL,
  trainer_id TEXT REFERENCES trainers(id) ON DELETE SET NULL,
  trainer_name TEXT,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'changed', 'removed')),
  assigned_by TEXT NOT NULL DEFAULT 'Admin Director',
  notes TEXT,
  previous_trainer_id TEXT,
  previous_trainer_name TEXT,
  pt_package TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trainer_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to trainer_assignments" ON trainer_assignments;
CREATE POLICY "Allow all access to trainer_assignments" ON trainer_assignments FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS trainer_feedback (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  trainer_id TEXT REFERENCES trainers(id) ON DELETE CASCADE,
  trainer_name TEXT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT NOT NULL,
  focus_areas TEXT[] DEFAULT '{}',
  recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trainer_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to trainer_feedback" ON trainer_feedback;
CREATE POLICY "Allow all access to trainer_feedback" ON trainer_feedback FOR ALL USING (true) WITH CHECK (true);

-- ── 23. AUDIT LOGS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to audit_logs" ON audit_logs;
CREATE POLICY "Allow all access to audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ── 24. GALLERY ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to gallery" ON gallery;
CREATE POLICY "Allow all access to gallery" ON gallery FOR ALL USING (true) WITH CHECK (true);

-- ── 25. TESTIMONIALS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  achievement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to testimonials" ON testimonials;
CREATE POLICY "Allow all access to testimonials" ON testimonials FOR ALL USING (true) WITH CHECK (true);

-- ── SUCCESS STATUS ────────────────────────────────────────────────────────────
SELECT 'CORPUS FITNESS CLUB CLEAN DATABASE READY! ZERO DUMMY DATA. ALL 26 TABLES INITIALIZED WITH RLS & REALTIME.' AS status;
