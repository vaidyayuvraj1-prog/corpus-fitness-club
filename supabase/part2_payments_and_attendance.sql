-- PART 2: MEMBERSHIPS, RENEWALS, PAYMENTS & ATTENDANCE
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
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to memberships" ON memberships;
CREATE POLICY "Allow all access to memberships" ON memberships FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE memberships; EXCEPTION WHEN OTHERS THEN NULL; END $$;

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
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE membership_renewals; EXCEPTION WHEN OTHERS THEN NULL; END $$;

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
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to payments" ON payments;
CREATE POLICY "Allow all access to payments" ON payments FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE payments; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'qr' CHECK (method IN ('qr', 'manual')),
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to attendance" ON attendance;
CREATE POLICY "Allow all access to attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE attendance; EXCEPTION WHEN OTHERS THEN NULL; END $$;
