-- PART 1: PROFILES, TRAINERS, PLANS & MEMBERS
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
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to profiles" ON profiles;
CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

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
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to trainers" ON trainers;
CREATE POLICY "Allow all access to trainers" ON trainers FOR ALL USING (true) WITH CHECK (true);

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
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to members" ON members;
CREATE POLICY "Allow all access to members" ON members FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE members; EXCEPTION WHEN OTHERS THEN NULL; END $$;
