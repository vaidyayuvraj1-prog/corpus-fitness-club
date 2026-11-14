-- ============================================================
-- Corpus Fitness Club - Initial Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  phone       varchar(20),
  email       text,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'trainer', 'member')),
  avatar_url  text,
  created_at  timestamp WITH TIME ZONE DEFAULT now(),
  updated_at  timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================
-- TABLE: trainers (declared before members to allow FK from members)
-- ============================================================
CREATE TABLE trainers (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialization  text,
  experience      int,
  certifications  text[],
  bio             text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_trainers_profile_id ON trainers(profile_id);
CREATE INDEX idx_trainers_is_active ON trainers(is_active);

-- ============================================================
-- TABLE: membership_plans
-- ============================================================
CREATE TABLE membership_plans (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             text NOT NULL,
  duration_type    text NOT NULL,
  duration_months  int NOT NULL,
  price_men        decimal(10, 2) NOT NULL DEFAULT 0,
  price_women      decimal(10, 2) NOT NULL DEFAULT 0,
  description      text,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamp WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE: members
-- ============================================================
CREATE TABLE members (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id         varchar(50) UNIQUE NOT NULL,
  gender            text CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth     date,
  address           text,
  registration_date date NOT NULL DEFAULT CURRENT_DATE,
  fitness_goal      text,
  status            text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'frozen', 'cancelled')),
  current_plan_id   uuid REFERENCES membership_plans(id) ON DELETE SET NULL,
  created_at        timestamp WITH TIME ZONE DEFAULT now(),
  updated_at        timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_members_profile_id ON members(profile_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_member_id ON members(member_id);

-- ============================================================
-- TABLE: memberships
-- ============================================================
CREATE TABLE memberships (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id         uuid NOT NULL REFERENCES membership_plans(id),
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  amount_paid     decimal(10, 2) NOT NULL DEFAULT 0,
  payment_method  text,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_memberships_member_id ON memberships(member_id);
CREATE INDEX idx_memberships_plan_id ON memberships(plan_id);
CREATE INDEX idx_memberships_status ON memberships(status);

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE payments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  membership_id   uuid REFERENCES memberships(id) ON DELETE SET NULL,
  amount          decimal(10, 2) NOT NULL,
  payment_method  text NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Bank Transfer', 'Cheque')),
  transaction_ref text,
  status          text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'refunded')),
  payment_date    date NOT NULL DEFAULT CURRENT_DATE,
  receipt_number  varchar(50) UNIQUE,
  notes           text,
  recorded_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_membership_id ON payments(membership_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- TABLE: attendance
-- ============================================================
CREATE TABLE attendance (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id   uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  check_in    timestamp WITH TIME ZONE NOT NULL,
  check_out   timestamp WITH TIME ZONE,
  method      text NOT NULL DEFAULT 'manual' CHECK (method IN ('qr', 'manual')),
  recorded_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Prevent duplicate daily check-ins per member
CREATE UNIQUE INDEX idx_attendance_daily_checkin ON attendance(member_id, DATE(check_in AT TIME ZONE 'UTC'));
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_check_in ON attendance(check_in);

-- ============================================================
-- TABLE: workout_plans
-- ============================================================
CREATE TABLE workout_plans (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  category    text,
  level       text NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  description text,
  trainer_id  uuid REFERENCES trainers(id) ON DELETE SET NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_workout_plans_trainer_id ON workout_plans(trainer_id);
CREATE INDEX idx_workout_plans_is_active ON workout_plans(is_active);

-- ============================================================
-- TABLE: exercises
-- ============================================================
CREATE TABLE exercises (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id      uuid NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  name         text NOT NULL,
  muscle_group text,
  sets         int,
  reps         varchar(50),
  rest_seconds int,
  day_of_week  int CHECK (day_of_week BETWEEN 1 AND 7),
  instructions text,
  video_url    text
);

CREATE INDEX idx_exercises_plan_id ON exercises(plan_id);

-- ============================================================
-- TABLE: diet_plans
-- ============================================================
CREATE TABLE diet_plans (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            text NOT NULL,
  goal            text,
  total_calories  int,
  protein_g       int,
  carbs_g         int,
  fats_g          int,
  trainer_id      uuid REFERENCES trainers(id) ON DELETE SET NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_diet_plans_trainer_id ON diet_plans(trainer_id);
CREATE INDEX idx_diet_plans_is_active ON diet_plans(is_active);

-- ============================================================
-- TABLE: meal_items
-- ============================================================
CREATE TABLE meal_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_plan_id  uuid NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
  meal_type     text NOT NULL,
  food_item     text NOT NULL,
  quantity_g    int,
  calories      int,
  protein_g     int,
  carbs_g       int,
  fats_g        int,
  timing        text
);

CREATE INDEX idx_meal_items_diet_plan_id ON meal_items(diet_plan_id);

-- ============================================================
-- TABLE: member_plans
-- ============================================================
CREATE TABLE member_plans (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id        uuid UNIQUE NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  workout_plan_id  uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  diet_plan_id     uuid REFERENCES diet_plans(id) ON DELETE SET NULL,
  assigned_date    date NOT NULL DEFAULT CURRENT_DATE,
  assigned_by      uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_member_plans_member_id ON member_plans(member_id);

-- ============================================================
-- TABLE: body_measurements
-- ============================================================
CREATE TABLE body_measurements (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id   uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  measured_on date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg   decimal(5, 2),
  height_cm   decimal(5, 2),
  bmi         decimal(5, 2),
  chest_cm    decimal(5, 2),
  waist_cm    decimal(5, 2),
  hips_cm     decimal(5, 2),
  bicep_cm    decimal(5, 2),
  thigh_cm    decimal(5, 2),
  notes       text,
  created_at  timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_body_measurements_member_id ON body_measurements(member_id);
CREATE INDEX idx_body_measurements_measured_on ON body_measurements(measured_on);

-- ============================================================
-- TABLE: enquiries
-- ============================================================
CREATE TABLE enquiries (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name           text NOT NULL,
  phone               varchar(20) NOT NULL,
  email               text,
  gender              text CHECK (gender IN ('male', 'female', 'other')),
  interested_plan     text,
  fitness_goal        text,
  message             text,
  status              text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'converted', 'not_interested')),
  follow_up_notes     text,
  created_at          timestamp WITH TIME ZONE DEFAULT now(),
  converted_member_id uuid REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created_at ON enquiries(created_at);

-- ============================================================
-- TABLE: expenses
-- ============================================================
CREATE TABLE expenses (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category        text NOT NULL,
  description     text,
  amount          decimal(10, 2) NOT NULL,
  expense_date    date NOT NULL DEFAULT CURRENT_DATE,
  payment_method  text,
  receipt_url     text,
  recorded_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE notifications (
  id        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title     text NOT NULL,
  message   text NOT NULL,
  type      text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read   boolean NOT NULL DEFAULT false,
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================================
-- TABLE: gallery
-- ============================================================
CREATE TABLE gallery (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text NOT NULL,
  image_url   text NOT NULL,
  category    text NOT NULL CHECK (category IN ('transformation', 'facility', 'events', 'training')),
  is_featured boolean NOT NULL DEFAULT false,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_gallery_is_featured ON gallery(is_featured);
CREATE INDEX idx_gallery_sort_order ON gallery(sort_order);

-- ============================================================
-- TABLE: testimonials
-- ============================================================
CREATE TABLE testimonials (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_name text NOT NULL,
  content     text NOT NULL,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  avatar_url  text,
  is_featured boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  created_at  timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_testimonials_is_approved ON testimonials(is_approved);
CREATE INDEX idx_testimonials_is_featured ON testimonials(is_featured);

-- ============================================================
-- TABLE: website_settings
-- ============================================================
CREATE TABLE website_settings (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        varchar(100) UNIQUE NOT NULL,
  value      text,
  updated_at timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_website_settings_key ON website_settings(key);

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE audit_logs (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action     text NOT NULL,
  table_name text NOT NULL,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- DEFAULT DATA: membership_plans
-- ============================================================
INSERT INTO membership_plans (name, duration_type, duration_months, price_men, price_women, description, is_active) VALUES
  ('Monthly',     'monthly',    1,  1200.00, 1000.00, 'Standard monthly membership with full gym access.',              true),
  ('Quarterly',   'quarterly',  3,  3200.00, 2800.00, '3-month membership with discounted rate.',                       true),
  ('Half-Yearly', 'half-yearly',6,  5500.00, 4800.00, '6-month membership for committed fitness enthusiasts.',          true),
  ('Annual',      'annual',     12, 9000.00, 7500.00, 'Best value yearly membership with maximum savings.',             true),
  ('Student',     'monthly',    1,   800.00,  700.00, 'Discounted plan for students with valid ID.',                    true),
  ('Couple',      'monthly',    1,  2000.00, 2000.00, 'Special plan for couples training together.',                    true);

-- ============================================================
-- DEFAULT DATA: website_settings
-- ============================================================
INSERT INTO website_settings (key, value) VALUES
  ('gym_name',       'Corpus Fitness Club'),
  ('phone',          '+91 76206 83995'),
  ('email',          'corpusfitnessamravati@gmail.com'),
  ('address',        '3rd Floor, Above State Bank of India, Harshraj Colony – Vidyut Nagar Square, VMV Road, Amravati, Maharashtra 444604'),
  ('whatsapp_number','+917620683995'),
  ('morning_hours',  '6:00 AM – 11:00 AM'),
  ('evening_hours',  '5:00 PM – 10:00 PM'),
  ('sunday_status',  'Closed');

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery            ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses           ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper function to check trainer role
CREATE OR REPLACE FUNCTION is_trainer()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'trainer'
  );
$$;

-- ---- profiles ----
CREATE POLICY "profiles_select_own"   ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "profiles_insert_admin" ON profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (id = auth.uid() OR is_admin());
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (is_admin());

-- ---- members ----
CREATE POLICY "members_select" ON members FOR SELECT USING (
  is_admin()
  OR (is_trainer())
  OR (profile_id = auth.uid())
);
CREATE POLICY "members_insert_admin" ON members FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "members_update_admin" ON members FOR UPDATE USING (is_admin());
CREATE POLICY "members_delete_admin" ON members FOR DELETE USING (is_admin());

-- ---- trainers ----
CREATE POLICY "trainers_select" ON trainers FOR SELECT USING (true);
CREATE POLICY "trainers_insert_admin" ON trainers FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "trainers_update_admin" ON trainers FOR UPDATE USING (is_admin());
CREATE POLICY "trainers_delete_admin" ON trainers FOR DELETE USING (is_admin());

-- ---- membership_plans ----
CREATE POLICY "plans_select_all"   ON membership_plans FOR SELECT USING (true);
CREATE POLICY "plans_insert_admin" ON membership_plans FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "plans_update_admin" ON membership_plans FOR UPDATE USING (is_admin());
CREATE POLICY "plans_delete_admin" ON membership_plans FOR DELETE USING (is_admin());

-- ---- memberships ----
CREATE POLICY "memberships_select" ON memberships FOR SELECT USING (
  is_admin()
  OR (member_id IN (SELECT id FROM members WHERE profile_id = auth.uid()))
);
CREATE POLICY "memberships_insert_admin" ON memberships FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "memberships_update_admin" ON memberships FOR UPDATE USING (is_admin());
CREATE POLICY "memberships_delete_admin" ON memberships FOR DELETE USING (is_admin());

-- ---- payments ----
CREATE POLICY "payments_select" ON payments FOR SELECT USING (
  is_admin()
  OR (member_id IN (SELECT id FROM members WHERE profile_id = auth.uid()))
);
CREATE POLICY "payments_insert_admin" ON payments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "payments_update_admin" ON payments FOR UPDATE USING (is_admin());
CREATE POLICY "payments_delete_admin" ON payments FOR DELETE USING (is_admin());

-- ---- attendance ----
CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (
  is_admin()
  OR (member_id IN (SELECT id FROM members WHERE profile_id = auth.uid()))
);
CREATE POLICY "attendance_insert_admin_trainer" ON attendance FOR INSERT WITH CHECK (is_admin() OR is_trainer());
CREATE POLICY "attendance_update_admin" ON attendance FOR UPDATE USING (is_admin());
CREATE POLICY "attendance_delete_admin" ON attendance FOR DELETE USING (is_admin());

-- ---- enquiries ----
CREATE POLICY "enquiries_insert_public" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "enquiries_select_admin"  ON enquiries FOR SELECT USING (is_admin());
CREATE POLICY "enquiries_update_admin"  ON enquiries FOR UPDATE USING (is_admin());
CREATE POLICY "enquiries_delete_admin"  ON enquiries FOR DELETE USING (is_admin());

-- ---- gallery ----
CREATE POLICY "gallery_select_public" ON gallery FOR SELECT USING (true);
CREATE POLICY "gallery_insert_admin"  ON gallery FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "gallery_update_admin"  ON gallery FOR UPDATE USING (is_admin());
CREATE POLICY "gallery_delete_admin"  ON gallery FOR DELETE USING (is_admin());

-- ---- testimonials ----
CREATE POLICY "testimonials_select_approved" ON testimonials FOR SELECT USING (is_approved = true OR is_admin());
CREATE POLICY "testimonials_insert_admin"    ON testimonials FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "testimonials_update_admin"    ON testimonials FOR UPDATE USING (is_admin());
CREATE POLICY "testimonials_delete_admin"    ON testimonials FOR DELETE USING (is_admin());

-- ---- workout_plans ----
CREATE POLICY "workout_plans_select" ON workout_plans FOR SELECT USING (
  is_admin()
  OR is_trainer()
  OR (id IN (SELECT workout_plan_id FROM member_plans WHERE member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())))
);
CREATE POLICY "workout_plans_insert" ON workout_plans FOR INSERT WITH CHECK (is_admin() OR is_trainer());
CREATE POLICY "workout_plans_update" ON workout_plans FOR UPDATE USING (
  is_admin()
  OR (is_trainer() AND trainer_id IN (SELECT id FROM trainers WHERE profile_id = auth.uid()))
);
CREATE POLICY "workout_plans_delete_admin" ON workout_plans FOR DELETE USING (is_admin());

-- ---- exercises ----
CREATE POLICY "exercises_select" ON exercises FOR SELECT USING (
  is_admin()
  OR is_trainer()
  OR (plan_id IN (SELECT workout_plan_id FROM member_plans WHERE member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())))
);
CREATE POLICY "exercises_insert" ON exercises FOR INSERT WITH CHECK (is_admin() OR is_trainer());
CREATE POLICY "exercises_update" ON exercises FOR UPDATE USING (is_admin() OR is_trainer());
CREATE POLICY "exercises_delete_admin" ON exercises FOR DELETE USING (is_admin());

-- ---- diet_plans ----
CREATE POLICY "diet_plans_select" ON diet_plans FOR SELECT USING (
  is_admin()
  OR is_trainer()
  OR (id IN (SELECT diet_plan_id FROM member_plans WHERE member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())))
);
CREATE POLICY "diet_plans_insert" ON diet_plans FOR INSERT WITH CHECK (is_admin() OR is_trainer());
CREATE POLICY "diet_plans_update" ON diet_plans FOR UPDATE USING (
  is_admin()
  OR (is_trainer() AND trainer_id IN (SELECT id FROM trainers WHERE profile_id = auth.uid()))
);
CREATE POLICY "diet_plans_delete_admin" ON diet_plans FOR DELETE USING (is_admin());

-- ---- meal_items ----
CREATE POLICY "meal_items_select" ON meal_items FOR SELECT USING (
  is_admin()
  OR is_trainer()
  OR (diet_plan_id IN (SELECT diet_plan_id FROM member_plans WHERE member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())))
);
CREATE POLICY "meal_items_insert" ON meal_items FOR INSERT WITH CHECK (is_admin() OR is_trainer());
CREATE POLICY "meal_items_update" ON meal_items FOR UPDATE USING (is_admin() OR is_trainer());
CREATE POLICY "meal_items_delete_admin" ON meal_items FOR DELETE USING (is_admin());

-- ---- member_plans ----
CREATE POLICY "member_plans_select" ON member_plans FOR SELECT USING (
  is_admin()
  OR is_trainer()
  OR (member_id IN (SELECT id FROM members WHERE profile_id = auth.uid()))
);
CREATE POLICY "member_plans_insert_admin_trainer" ON member_plans FOR INSERT WITH CHECK (is_admin() OR is_trainer());
CREATE POLICY "member_plans_update_admin_trainer" ON member_plans FOR UPDATE USING (is_admin() OR is_trainer());
CREATE POLICY "member_plans_delete_admin" ON member_plans FOR DELETE USING (is_admin());

-- ---- body_measurements ----
CREATE POLICY "body_measurements_select" ON body_measurements FOR SELECT USING (
  is_admin()
  OR is_trainer()
  OR (member_id IN (SELECT id FROM members WHERE profile_id = auth.uid()))
);
CREATE POLICY "body_measurements_insert" ON body_measurements FOR INSERT WITH CHECK (is_admin() OR is_trainer());
CREATE POLICY "body_measurements_update" ON body_measurements FOR UPDATE USING (is_admin() OR is_trainer());
CREATE POLICY "body_measurements_delete_admin" ON body_measurements FOR DELETE USING (is_admin());

-- ---- notifications ----
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "notifications_delete_own_or_admin" ON notifications FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- ---- expenses ----
CREATE POLICY "expenses_select_admin"  ON expenses FOR SELECT USING (is_admin());
CREATE POLICY "expenses_insert_admin"  ON expenses FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "expenses_update_admin"  ON expenses FOR UPDATE USING (is_admin());
CREATE POLICY "expenses_delete_admin"  ON expenses FOR DELETE USING (is_admin());

-- ---- website_settings ----
CREATE POLICY "settings_select_all"   ON website_settings FOR SELECT USING (true);
CREATE POLICY "settings_insert_admin" ON website_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "settings_update_admin" ON website_settings FOR UPDATE USING (is_admin());
CREATE POLICY "settings_delete_admin" ON website_settings FOR DELETE USING (is_admin());

-- ---- audit_logs ----
CREATE POLICY "audit_logs_select_admin"  ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "audit_logs_insert_admin"  ON audit_logs FOR INSERT WITH CHECK (is_admin() OR is_trainer());
CREATE POLICY "audit_logs_delete_admin"  ON audit_logs FOR DELETE USING (is_admin());

-- ============================================================
-- FUNCTION & TRIGGER: handle_new_user
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNCTION: auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
