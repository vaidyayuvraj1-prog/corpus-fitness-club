-- ==============================================================================
-- CORPUS FITNESS CLUB (CFC) - COMPLETE FAIL-SAFE DATABASE SETUP
-- Version: 2.1 (Self-Contained & Modular for Supabase)
-- ==============================================================================
-- TIPS FOR SUPABASE SQL EDITOR:
-- 1. Ensure NO TEXT is highlighted/selected in the editor before clicking "Run".
--    (If text is highlighted, Supabase only runs the selected text!)
-- 2. Press Ctrl+A (Select All) then click "Run" (or Ctrl+Enter).
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

-- ── 3. MEMBERSHIP PLANS ───────────────────────────────────────────────────────
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

INSERT INTO membership_plans (id, name, duration_type, duration_months, price_men, price_women, price, description, features, popular, is_active)
VALUES
  ('monthly', 'Monthly Plan', '1 Month', 1, 700.00, 500.00, 700.00, 'Perfect starting plan with full facility access.',
   ARRAY['Full Gym & Cardio Access', 'Locker & Shower Facility', 'General Floor Trainer Support', 'Free Fitness Assessment', 'Access During All Shifts'], false, true),
  ('quarterly', 'Quarterly Plan', '3 Months', 3, 1800.00, 1400.00, 1800.00, '3 months of consistent training with moderate savings.',
   ARRAY['Full Gym & Cardio Access', 'Locker Room Access', 'Custom Workout Routine Card', 'Basic Diet Guidelines', 'Monthly Body Composition Check'], false, true),
  ('half-yearly', 'Half-Yearly Plan', '6 Months', 6, 3200.00, 2500.00, 3200.00, 'Our most popular plan! Best value for building habit & physique.',
   ARRAY['Full Gym & Cardio Zone Access', 'Zumba & Aerobics Classes Included', 'Personalized Workout Plan', 'Custom Diet Chart & Nutrition Consult', 'Bi-weekly Body Measurements', 'Dedicated Locker Storage'], true, true),
  ('annual', 'Yearly Plan', '12 Months', 12, 5000.00, 4000.00, 5000.00, 'Maximum savings for serious fitness enthusiasts. Complete transformation.',
   ARRAY['365 Days Unlimited Gym Access', 'Zumba & Aerobics Batches Included', 'Dedicated Trainer Consultation', 'Advanced Nutrition & Diet Schedule', 'Free CFC Branded Gym Kit & Shaker', '1 Month Membership Freeze Option', 'Priority Locker Allotment'], false, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_men = EXCLUDED.price_men,
  price_women = EXCLUDED.price_women,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  features = EXCLUDED.features;

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

INSERT INTO admin_profile (id, full_name, email, phone, role, avatar_url, password)
VALUES (
  'admin-director-root',
  'Yuvraj Vaidya (Director)',
  'admin@corpuss.com',
  '+91 76206 83995',
  'super_admin',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'Admin@2026'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone;

-- ── 5. PROFILES ───────────────────────────────────────────────────────────────
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

INSERT INTO profiles (id, full_name, phone, email, role, avatar_url)
VALUES
  ('super-admin-uuid', 'Yuvraj Vaidya (Director)', '+91 76206 83995', 'superadmin@corpuss.com', 'super_admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
  ('admin-uuid', 'CFC Gym Manager', '+91 76206 83995', 'admin@corpuss.com', 'admin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'),
  ('reception-uuid', 'Pooja (Front Desk Officer)', '+91 76206 83995', 'reception@corpuss.com', 'receptionist', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'),
  ('trainer-uuid-1', 'Coach Rohit Deshmukh', '+91 98220 12345', 'rohit.deshmukh@corpuss.com', 'trainer', 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80'),
  ('trainer-uuid-2', 'Priya Bhagat', '+91 94231 67890', 'priya.bhagat@corpuss.com', 'trainer', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=400&q=80'),
  ('trainer-uuid-3', 'Amit Thakre', '+91 97654 32109', 'amit.thakre@corpuss.com', 'trainer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
  ('trainer-uuid-4', 'Sneha More', '+91 98810 54321', 'sneha.more@corpuss.com', 'trainer', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'),
  ('mem-prof-1', 'Yuvraj Vaidya', '+91 76206 83995', 'yuvraj.vaidya@corpuss.com', 'member', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ── 6. TRAINERS ───────────────────────────────────────────────────────────────
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

INSERT INTO trainers (id, profile_id, name, phone, email, password, specialization, experience, certifications, bio, photo, is_active)
VALUES
  ('trainer-1', 'trainer-uuid-1', 'Rohit Deshmukh', '+91 98220 12345', 'rohit.deshmukh@corpuss.com', 'CFC@TRN2026', 'Strength Training, Powerlifting & Body Transformation', '8+ Years', ARRAY['ISSA Certified Strength Coach', 'District Powerlifter'], 'Former district powerlifter with extensive certifications in biomechanics and injury-free hypertrophy training.', 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80', true),
  ('trainer-2', 'trainer-uuid-2', 'Priya Bhagat', '+91 94231 67890', 'priya.bhagat@corpuss.com', 'CFC@TRN2026', 'Aerobics, Weight Loss & Female Toning', '5+ Years', ARRAY['ACE Certified', 'Aerobic Conditioning Specialist'], 'Specialist in postpartum fitness, aerobic endurance, and sustainable fat-loss regimens for women.', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80', true),
  ('trainer-3', 'trainer-uuid-3', 'Amit Thakre', '+91 97654 32109', 'amit.thakre@corpuss.com', 'CFC@TRN2026', 'Contest Prep, Dietetics & Muscle Hypertrophy', '6+ Years', ARRAY['Certified Sports Nutritionist'], 'Certified sports nutritionist helping members fuel their workouts with practical Indian nutrition plans.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', true),
  ('trainer-4', 'trainer-uuid-4', 'Sneha More', '+91 98810 54321', 'sneha.more@corpuss.com', 'CFC@TRN2026', 'Zumba Fitness, HIIT & Mobility Coaching', '4+ Years', ARRAY['Licensed Zumba Instructor', 'HIIT Specialist'], 'Licensed Zumba instructor bringing infectious energy to every session. Expert in joint flexibility and stamina.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  specialization = EXCLUDED.specialization,
  experience = EXCLUDED.experience;

-- ── 7. MEMBERS ────────────────────────────────────────────────────────────────
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

INSERT INTO members (id, profile_id, member_id, gender, date_of_birth, address, emergency_contact, emergency_phone, registration_date, fitness_goal, status, current_plan_id, trainer_id, trainer_name, pt_status, pt_package, photo_url, password, email, phone, notes)
VALUES (
  'mem-6',
  'mem-prof-1',
  'CFC-2026-0001',
  'male',
  '1998-05-15',
  '3rd Floor, Harshraj Colony – Vidyut Nagar Square, VMV Road, Amravati, Maharashtra 444604',
  '7620683995',
  '7620683995',
  '2026-01-01',
  'Strength & Muscle Building',
  'active',
  'half-yearly',
  'trainer-1',
  'Coach Rohit Deshmukh',
  'active_pt',
  'Strength & Hypertrophy Master',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'CFC@2026',
  'yuvraj.vaidya@corpuss.com',
  '+91 76206 83995',
  'VIP Club Member & Managing Director'
) ON CONFLICT (id) DO UPDATE SET
  member_id = EXCLUDED.member_id,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status;

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

INSERT INTO memberships (id, member_id, plan_id, start_date, end_date, amount_paid, discount_amount, payment_method, status, created_by)
VALUES (
  'mship-root-1',
  'mem-6',
  'half-yearly',
  '2026-01-01',
  '2026-07-01',
  3200.00,
  0.00,
  'UPI',
  'active',
  'admin-director-root'
) ON CONFLICT (id) DO UPDATE SET
  end_date = EXCLUDED.end_date,
  status = EXCLUDED.status;

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

INSERT INTO payments (id, member_id, membership_id, amount, total_amount, pending_amount, discount_amount, payment_method, transaction_ref, status, payment_date, receipt_number, notes, recorded_by)
VALUES (
  'pay-root-1',
  'mem-6',
  'mship-root-1',
  3200.00,
  3200.00,
  0.00,
  0.00,
  'UPI',
  'UPI-TXN-CFC-20260101',
  'paid',
  '2026-01-01',
  'CFC-REC-2026-0001',
  'Half-Yearly Membership Subscription Payment',
  'Admin Director'
) ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  status = EXCLUDED.status;

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

ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to exercise_library" ON exercise_library;
CREATE POLICY "Allow all access to exercise_library" ON exercise_library FOR ALL USING (true) WITH CHECK (true);

INSERT INTO exercise_library (id, name, muscle_group, equipment, difficulty, instructions, default_sets, default_reps, default_rest_seconds)
VALUES
  ('lib-ex-1', 'Barbell Flat Bench Press', 'Chest', 'Barbell', 'intermediate', 'Retract scapulae, touch bar to mid-sternum with elbows at ~45 degrees, and drive through chest to lockout.', 4, '8 - 12', 90),
  ('lib-ex-2', 'Incline Dumbbell Press', 'Chest', 'Dumbbell', 'intermediate', 'Set bench to 30 degrees, lower dumbbells with deep upper chest stretch, and press upwards in an arc.', 3, '10 - 12', 75),
  ('lib-ex-3', 'Cable Chest Flyes', 'Chest', 'Cable', 'beginner', 'Stand upright with slight forward lean, bring handles together in hugging motion, squeezing inner chest.', 3, '12 - 15', 60),
  ('lib-ex-4', 'Push-Ups (Standard / Diamond)', 'Chest', 'Bodyweight', 'beginner', 'Maintain rigid plank line from head to heels, lower chest to floor, drive up explosively.', 3, '15 - 20', 45),
  ('lib-ex-5', 'Parallel Bar Dips', 'Chest', 'Bodyweight', 'advanced', 'Lean torso forward 30 degrees to bias lower chest, lower to 90 degrees elbow bend, push upward.', 3, '8 - 12', 90),
  ('lib-ex-6', 'Barbell Conventional Deadlift', 'Back', 'Barbell', 'advanced', 'Feet hip-width, engage lats, drive floor away through heels, locking hips and knees synchronously.', 4, '5', 180),
  ('lib-ex-7', 'Wide-Grip Lat Pulldown', 'Back', 'Cable', 'beginner', 'Pull bar to upper chest pulling with elbows down and back, squeeze lats at peak contraction.', 4, '10 - 12', 60),
  ('lib-ex-8', 'Barbell Bent-Over Row', 'Back', 'Barbell', 'intermediate', 'Hinge at 45 degrees, pull bar to belly button while keeping neutral spine.', 4, '8 - 10', 90),
  ('lib-ex-9', 'Seated Cable Row', 'Back', 'Cable', 'beginner', 'Keep back flat, drive elbows past torso and hold peak squeeze for 1 second.', 3, '12', 60),
  ('lib-ex-10', 'Pull-Ups / Chin-Ups', 'Back', 'Bodyweight', 'intermediate', 'Full dead-hang at bottom, pull until chin clears the bar without swinging.', 4, '6 - 10', 90),
  ('lib-ex-11', 'Barbell Back Squat', 'Legs', 'Barbell', 'advanced', 'Bar resting on upper traps, break hips and knees simultaneously, achieve parallel depth or below.', 4, '6 - 10', 120),
  ('lib-ex-12', 'Leg Press 45-Degree', 'Legs', 'Machine', 'intermediate', 'Lower platform until knees are at 90 degrees, press through mid-foot without hyperextending knees.', 4, '10 - 12', 90),
  ('lib-ex-13', 'Romanian Deadlift (RDL)', 'Legs', 'Barbell', 'intermediate', 'Push hips backward with soft knee bend until deep hamstring stretch is felt, squeeze glutes to return.', 3, '10 - 12', 75),
  ('lib-ex-14', 'Walking Dumbbell Lunges', 'Legs', 'Dumbbell', 'intermediate', 'Step forward landing heel to toe, lower rear knee an inch off ground, drive through lead heel.', 3, '12 per leg', 60),
  ('lib-ex-15', 'Standing Machine Calf Raises', 'Legs', 'Machine', 'beginner', 'Full stretch at bottom heel drop, raise to tip-toes and hold for 2 seconds.', 4, '15 - 20', 45),
  ('lib-ex-16', 'Overhead Barbell Military Press', 'Shoulders', 'Barbell', 'intermediate', 'Brace core and glutes, press barbell straight overhead locking out with head through the window.', 4, '8 - 10', 90),
  ('lib-ex-17', 'Dumbbell Lateral Raises', 'Shoulders', 'Dumbbell', 'beginner', 'Raise dumbbells to shoulder height leading with elbows with slight pinky tilt, 2-sec eccentric.', 4, '12 - 15', 60),
  ('lib-ex-18', 'Face Pulls with Rope', 'Shoulders', 'Cable', 'beginner', 'Set pulley to eye level, pull rope to ears while externally rotating shoulders, target rear delts.', 3, '15', 45),
  ('lib-ex-19', 'Seated Arnold Press', 'Shoulders', 'Dumbbell', 'intermediate', 'Start with palms facing chest, rotate outwards while pressing overhead in a fluid arc.', 3, '10', 75),
  ('lib-ex-20', 'Standing Barbell Bicep Curl', 'Arms', 'Barbell', 'beginner', 'Keep elbows tucked tightly at sides, curl bar toward shoulders, lower under 3-second control.', 3, '10 - 12', 60),
  ('lib-ex-21', 'Incline Dumbbell Hammer Curls', 'Arms', 'Dumbbell', 'beginner', 'Neutral palms facing each other, curls isolate brachialis and forearm thickness.', 3, '12', 60),
  ('lib-ex-22', 'Tricep Cable Rope Pushdown', 'Arms', 'Cable', 'beginner', 'Pin elbows to sides, press downward spreading rope ends apart at bottom for full tricep lockout.', 4, '12 - 15', 45),
  ('lib-ex-23', 'EZ-Bar Skull Crushers', 'Arms', 'Barbell', 'intermediate', 'Lie on flat bench, lower bar toward forehead by flexing elbows, extend back to vertical.', 3, '10', 60),
  ('lib-ex-24', 'Hanging Leg Raises', 'Core', 'Bodyweight', 'intermediate', 'Hang from pull-up bar, raise legs to 90 degrees or touch toes to bar without swinging hips.', 3, '12 - 15', 45),
  ('lib-ex-25', 'Forearm Plank with Hip Taps', 'Core', 'Bodyweight', 'beginner', 'Maintain horizontal torso, alternate gently tapping hips side to side for anti-rotational stability.', 3, '60 seconds', 30),
  ('lib-ex-26', 'Ab Wheel Rollouts', 'Core', 'Bodyweight', 'advanced', 'From knees, roll wheel forward with braced core until nose is near ground, pull back with abs.', 3, '10', 60),
  ('lib-ex-27', 'Treadmill Incline Interval Sprints', 'Cardio', 'Machine', 'intermediate', '8-10% incline, alternate 1 minute sprint at 10-12 km/h with 1 minute recovery walk.', 6, '1 min / 1 min', 60),
  ('lib-ex-28', 'Russian Kettlebell Swings', 'Full Body', 'Kettlebell', 'intermediate', 'Explosive hip hinge driving bell to eye level through powerful glute contraction.', 4, '20', 45),
  ('lib-ex-29', 'Dumbbell Thrusters (Squat to Press)', 'Full Body', 'Dumbbell', 'intermediate', 'Front squat to full depth and utilize leg drive to pop dumbbells into overhead lockout.', 4, '12', 60),
  ('lib-ex-30', 'High Intensity Burpees', 'Cardio', 'Bodyweight', 'intermediate', 'Drop chest to floor, jump feet forward, explode upwards clapping overhead.', 4, '15', 45)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  muscle_group = EXCLUDED.muscle_group,
  instructions = EXCLUDED.instructions;

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

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_plans" ON workout_plans;
CREATE POLICY "Allow all access to workout_plans" ON workout_plans FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE workout_plans;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

INSERT INTO workout_plans (id, name, category, level, description, trainer_name, is_active, is_default, is_custom, created_by_role, duration_weeks, days_per_week)
VALUES
  ('wp-default-beginner', 'Beginner Workout – Foundation Protocol', 'Beginner Workout', 'beginner', 'Complete introductory strength & conditioning split designed to build joint stability, neural adaptation, and safe lifting form across major movements.', 'Coach Rohit Deshmukh', true, true, false, 'admin', 6, 3),
  ('wp-default-weightloss', 'Weight Loss – Fat Burning Program', 'Weight Loss', 'intermediate', 'High-caloric burn circuit combining compound resistance lifting with short rest intervals and cardio finishers for optimal EPOC fat loss.', 'Priya Bhagat', true, true, false, 'admin', 8, 4),
  ('wp-default-musclebuilding', 'Muscle Building – Hypertrophy Program', 'Muscle Building', 'intermediate', 'Hypertrophy-focused volume training targeting mechanical tension and metabolic stress across major muscle groups for maximum size and symmetry.', 'Coach Rohit Deshmukh', true, true, false, 'admin', 12, 4),
  ('wp-default-strength', 'Strength Training – Power Protocol', 'Strength Training', 'advanced', 'Linear progressive overload protocol built around the Big 3 power movements: Squat, Bench Press, and Deadlift for maximal force output.', 'Amol Sawant', true, true, false, 'admin', 12, 4),
  ('wp-default-fullbody', 'Full Body – Functional Conditioning', 'Full Body Workout', 'beginner', '3-day full body split designed for peak athletic conditioning, functional mobility, core stability, and total body strength.', 'Coach Rohit Deshmukh', true, true, false, 'admin', 8, 3),
  ('wp-default-ppl', 'Push Pull Legs – Elite Split', 'Push Pull Legs', 'advanced', 'The premier 6-day hypertrophy and athletic split isolating push mechanics (chest/delts/triceps), pull mechanics (back/biceps), and lower body.', 'Coach Rohit Deshmukh', true, true, false, 'admin', 12, 6),
  ('wp-default-home', 'Home Workout – No Equipment', 'Home Workout', 'beginner', 'Zero-equipment home & travel routine utilizing bodyweight leverage, core isometric holds, and high-frequency cardiovascular conditioning.', 'Priya Bhagat', true, true, false, 'admin', 4, 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  description = EXCLUDED.description,
  duration_weeks = EXCLUDED.duration_weeks,
  days_per_week = EXCLUDED.days_per_week;

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

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_exercises" ON workout_exercises;
CREATE POLICY "Allow all access to workout_exercises" ON workout_exercises FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE workout_exercises;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

INSERT INTO workout_exercises (id, plan_id, name, muscle_group, sets, reps, weight, rest_seconds, day_of_week, instructions)
VALUES
  -- 1. Beginner Workout
  ('ex-b-1', 'wp-default-beginner', 'Dumbbell Flat Bench Press', 'Chest', 3, '10 - 12', '12-16 kg', 60, 'Monday', 'Plant feet firmly, lower dumbbells in control to chest level, press up without clanking.'),
  ('ex-b-2', 'wp-default-beginner', 'Wide-Grip Lat Pulldown', 'Back', 3, '10 - 12', '35-45 kg', 60, 'Monday', 'Pull toward clavicle leading with elbows, keep chest proud.'),
  ('ex-b-3', 'wp-default-beginner', 'Dumbbell Goblet Squat', 'Legs', 3, '12', '12-16 kg', 60, 'Wednesday', 'Hold dumbbell vertically at sternum, squat deep pushing knees outward.'),
  ('ex-b-4', 'wp-default-beginner', 'Seated Overhead Dumbbell Press', 'Shoulders', 3, '10', '8-12 kg', 60, 'Wednesday', 'Press straight up until arms are fully extended overhead.'),
  ('ex-b-5', 'wp-default-beginner', 'Forearm Plank with Hip Taps', 'Core', 3, '45 seconds', 'Bodyweight', 45, 'Friday', 'Maintain tight abdominal brace without sagging hips.'),
  ('ex-b-6', 'wp-default-beginner', 'Treadmill Incline Brisk Walk', 'Cardio', 1, '20 mins', '6% Incline', 0, 'Friday', '5.5 km/h steady brisk walk for cardiovascular conditioning.'),

  -- 2. Weight Loss
  ('ex-wl-1', 'wp-default-weightloss', 'Russian Kettlebell Swings', 'Full Body', 4, '20', '16-20 kg', 45, 'Monday', 'Hinge back explosively and snap hips forward, bell reaches shoulder height.'),
  ('ex-wl-2', 'wp-default-weightloss', 'Dumbbell Thrusters (Squat to Press)', 'Full Body', 4, '12 - 15', '10-14 kg', 45, 'Monday', 'Front squat deep, explode upward pressing dumbbells overhead.'),
  ('ex-wl-3', 'wp-default-weightloss', 'Walking Dumbbell Lunges', 'Legs', 3, '15 per leg', '10-12 kg', 45, 'Tuesday', 'Continuous walking steps, knee almost brushing floor.'),
  ('ex-wl-4', 'wp-default-weightloss', 'High Intensity Burpees', 'Cardio', 4, '15', 'Bodyweight', 45, 'Thursday', 'Chest to floor, leap up dynamically with arms outstretched.'),
  ('ex-wl-5', 'wp-default-weightloss', 'Treadmill Incline Interval Sprints', 'Cardio', 6, '1 min sprint / 1 min walk', '10% Incline', 60, 'Friday', 'High metabolic spike at 10-12 km/h sprint pace.'),

  -- 3. Muscle Building
  ('ex-mb-1', 'wp-default-musclebuilding', 'Barbell Flat Bench Press', 'Chest', 4, '8 - 12', '60-80 kg', 90, 'Monday', 'Retract scapulae, touch lower sternum, drive through chest.'),
  ('ex-mb-2', 'wp-default-musclebuilding', 'Incline Dumbbell Press', 'Chest', 3, '10 - 12', '22.5 kg', 75, 'Monday', '30 degree bench, deep stretch, pause for 1 second at bottom.'),
  ('ex-mb-3', 'wp-default-musclebuilding', 'Barbell Bent-Over Row', 'Back', 4, '8 - 10', '60-75 kg', 90, 'Tuesday', 'Torso hinged at 45 degrees, pull barbell to lower ribcage.'),
  ('ex-mb-4', 'wp-default-musclebuilding', 'Barbell Back Squat', 'Legs', 4, '8 - 10', '80-100 kg', 120, 'Thursday', 'Feet shoulder-width, drive out of the hole with powerful quad contraction.'),
  ('ex-mb-5', 'wp-default-musclebuilding', 'Overhead Barbell Military Press', 'Shoulders', 4, '8 - 10', '40-50 kg', 90, 'Friday', 'Brace core glutes, press overhead vertically through full lockout.'),
  ('ex-mb-6', 'wp-default-musclebuilding', 'Standing Barbell Bicep Curl', 'Arms', 3, '10 - 12', '30 kg', 60, 'Friday', 'Keep elbows tucked tightly at sides, curl bar toward shoulders.'),

  -- 4. Strength Training
  ('ex-st-1', 'wp-default-strength', 'Barbell Back Squat', 'Legs', 5, '5', '100-125 kg', 180, 'Monday', 'Heavy compound 5x5. Full brace, break hips, hit parallel depth.'),
  ('ex-st-2', 'wp-default-strength', 'Barbell Flat Bench Press', 'Chest', 5, '5', '80-100 kg', 180, 'Monday', 'Competition pause on chest, drive feet into floor, explode up.'),
  ('ex-st-3', 'wp-default-strength', 'Barbell Conventional Deadlift', 'Back', 4, '5', '120-150 kg', 180, 'Wednesday', 'Lock lats in place, push floor away, lock out hips fully.'),
  ('ex-st-4', 'wp-default-strength', 'Overhead Barbell Military Press', 'Shoulders', 5, '5', '50-60 kg', 150, 'Wednesday', 'Strict military press without leg dip.'),
  ('ex-st-5', 'wp-default-strength', 'Parallel Bar Dips', 'Chest', 4, '6 - 8', 'Bodyweight + 15 kg', 120, 'Friday', 'Heavy weighted dips targeting upper body pushing power.'),

  -- 5. Full Body
  ('ex-fb-1', 'wp-default-fullbody', 'Barbell Back Squat', 'Legs', 4, '8 - 10', '75-90 kg', 90, 'Monday', 'Primary compound leg movement of the day.'),
  ('ex-fb-2', 'wp-default-fullbody', 'Incline Dumbbell Press', 'Chest', 4, '10', '20-25 kg', 75, 'Monday', 'Smooth eccentric, explosive press.'),
  ('ex-fb-3', 'wp-default-fullbody', 'Pull-Ups / Chin-Ups', 'Back', 4, '8', 'Bodyweight', 75, 'Wednesday', 'Chest to bar, full arm extension at bottom.'),
  ('ex-fb-4', 'wp-default-fullbody', 'Romanian Deadlift (RDL)', 'Legs', 3, '10 - 12', '60-80 kg', 75, 'Wednesday', 'Hinge back deeply feeling hamstring stretch.'),
  ('ex-fb-5', 'wp-default-fullbody', 'Dumbbell Thrusters (Squat to Press)', 'Full Body', 4, '12', '14 kg', 60, 'Friday', 'Combine squat and overhead press dynamically.'),
  ('ex-fb-6', 'wp-default-fullbody', 'Hanging Leg Raises', 'Core', 3, '15', 'Bodyweight', 45, 'Friday', 'Bring toes to 90 degrees with controlled core contraction.'),

  -- 6. Push Pull Legs
  ('ex-ppl-1', 'wp-default-ppl', 'Barbell Flat Bench Press', 'Chest', 4, '8 - 10', '70-85 kg', 90, 'Monday', 'Heavy push compound for chest and anterior delts.'),
  ('ex-ppl-2', 'wp-default-ppl', 'Dumbbell Lateral Raises', 'Shoulders', 4, '12 - 15', '10-12 kg', 60, 'Monday', 'Side deltoid isolation, control the descent.'),
  ('ex-ppl-3', 'wp-default-ppl', 'Tricep Cable Rope Pushdown', 'Arms', 4, '12', '25-30 kg', 45, 'Monday', 'Squeeze triceps at bottom extension.'),
  ('ex-ppl-4', 'wp-default-ppl', 'Barbell Bent-Over Row', 'Back', 4, '8 - 10', '65-80 kg', 90, 'Tuesday', 'Primary pull compound for upper back thickness.'),
  ('ex-ppl-5', 'wp-default-ppl', 'Standing Barbell Bicep Curl', 'Arms', 4, '10 - 12', '30-35 kg', 60, 'Tuesday', 'Full peak contraction on biceps.'),
  ('ex-ppl-6', 'wp-default-ppl', 'Barbell Back Squat', 'Legs', 4, '8 - 10', '90-110 kg', 120, 'Wednesday', 'Lower body foundation movement.'),
  ('ex-ppl-7', 'wp-default-ppl', 'Romanian Deadlift (RDL)', 'Legs', 3, '10 - 12', '70-90 kg', 75, 'Wednesday', 'Posterior chain focus for hamstrings and glutes.'),

  -- 7. Home Workout
  ('ex-hw-1', 'wp-default-home', 'Push-Ups (Standard / Diamond)', 'Chest', 4, '15 - 20', 'Bodyweight', 45, 'Monday', 'Keep body locked in plank, full range down and up.'),
  ('ex-hw-2', 'wp-default-home', 'Bodyweight Deep Squats & Jump Squats', 'Legs', 4, '20', 'Bodyweight', 45, 'Monday', '15 standard squats followed immediately by 5 jump squats.'),
  ('ex-hw-3', 'wp-default-home', 'Forearm Plank with Hip Taps', 'Core', 4, '60 seconds', 'Bodyweight', 30, 'Wednesday', 'Isometric hold engaging transverse abdominis.'),
  ('ex-hw-4', 'wp-default-home', 'High Intensity Burpees', 'Cardio', 4, '12 - 15', 'Bodyweight', 45, 'Friday', 'Explosive full-body cardio conditioning.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sets = EXCLUDED.sets,
  reps = EXCLUDED.reps,
  weight = EXCLUDED.weight,
  rest_seconds = EXCLUDED.rest_seconds;

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

ALTER TABLE member_workout_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to member_workout_assignments" ON member_workout_assignments;
CREATE POLICY "Allow all access to member_workout_assignments" ON member_workout_assignments FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE member_workout_assignments;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

INSERT INTO member_workout_assignments (id, member_id, member_name, member_code, member_phone, workout_plan_id, workout_plan_name, plan_snapshot, trainer_id, trainer_name, assigned_by, assigned_by_role, start_date, end_date, personal_instructions, status)
VALUES (
  'mwa-root-1',
  'mem-6',
  'Yuvraj Vaidya',
  'CFC-2026-0001',
  '+91 76206 83995',
  'wp-default-ppl',
  'Push Pull Legs – Elite Split',
  '{"id": "wp-default-ppl", "name": "Push Pull Legs – Elite Split", "category": "Push Pull Legs", "level": "advanced", "duration_weeks": 12, "days_per_week": 6}'::jsonb,
  'trainer-1',
  'Coach Rohit Deshmukh',
  'Admin Director',
  'admin',
  '2026-01-01',
  '2026-03-31',
  'Focus on progressive overload on compound lifts. Drink 4L water daily.',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  workout_plan_name = EXCLUDED.workout_plan_name,
  status = EXCLUDED.status;

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

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to workout_sessions" ON workout_sessions;
CREATE POLICY "Allow all access to workout_sessions" ON workout_sessions FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE workout_sessions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── 17. DIET PLANS & MEALS ────────────────────────────────────────────────────
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

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to enquiries" ON enquiries;
CREATE POLICY "Allow all access to enquiries" ON enquiries FOR ALL USING (true) WITH CHECK (true);

-- ── 19. EXPENSES ──────────────────────────────────────────────────────────────
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

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to notifications" ON notifications;
CREATE POLICY "Allow all access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

INSERT INTO notifications (id, user_id, title, message, type, is_read, target_audience, sent_by, priority, channels)
VALUES (
  'notif-root-1',
  NULL,
  'Welcome to Corpus Fitness Club Official Portal',
  'Welcome to Corpus Fitness Club, Amravati. Your member dashboard is ready with interactive workout routines, attendance tracking, and diet schedules.',
  'info',
  false,
  'all',
  'Admin Director',
  'normal',
  ARRAY['in_app']
) ON CONFLICT (id) DO NOTHING;

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

INSERT INTO gallery (id, category, title, image)
VALUES
  ('g1', 'Gym Interior', 'Spacious 3rd Floor Main Floor', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80'),
  ('g2', 'Equipment', 'Heavy Free Weights & Dumbbell Rack', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80'),
  ('g3', 'Training', 'Olympic Barbell Deadlift Session', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'),
  ('g4', 'Equipment', 'Plate Loaded Leg Press & Hack Squat', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'),
  ('g5', 'Activities', 'Evening Zumba Group Batch', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'),
  ('g6', 'Training', '1-on-1 Personal Coaching Session', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

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

INSERT INTO testimonials (id, name, role, rating, text, achievement)
VALUES
  ('t1', 'Sanket Deshmukh', 'Member since 2022', 5, 'Joined Corpus Fitness Club with 88 kg weight and low stamina. With coach Rohit’s guidance and clean diet plan, I lost 16 kg in 6 months! Best gym on VMV road.', 'Lost 16 kg & gained lean strength'),
  ('t2', 'Kavita Joshi', 'Member since 2023', 5, 'The women-friendly environment, dedicated trainers, and separate shifting times make CFC the safest and most comfortable gym in Amravati. Zumba classes are super energetic!', 'Toned physique & healthy habits'),
  ('t3', 'Akash Wankhade', 'Member since 2021', 5, 'Equipment is very well maintained, heavy weights up to 50kg, and great ventilation. The QR attendance and mobile portal make tracking workouts very easy.', 'Squat PR: 160 kg, Bench PR: 110 kg')
ON CONFLICT (id) DO NOTHING;

-- ── SUCCESS STATUS ────────────────────────────────────────────────────────────
SELECT 'CORPUS FITNESS CLUB DATABASE READY! ALL 26 TABLES & POLICIES INITIALIZED.' AS status;
