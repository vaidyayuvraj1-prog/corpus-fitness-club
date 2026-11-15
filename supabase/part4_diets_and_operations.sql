-- PART 4: DIETS, ENQUIRIES, EXPENSES, NOTIFICATIONS & TRAINERS
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
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notifications; EXCEPTION WHEN OTHERS THEN NULL; END $$;

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
