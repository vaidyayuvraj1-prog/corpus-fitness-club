-- CORPUS FITNESS CLUB (CFC), Amravati - PostgreSQL Database Schema
-- Production Migration Script

-- Create Enums
CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'GYM_ADMIN', 'RECEPTIONIST', 'TRAINER', 'MEMBER');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'UPCOMING', 'ON_HOLD', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'PENDING', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'NOT_INTERESTED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'PAYMENT', 'ATTENDANCE');

-- 1. Roles
CREATE TABLE "roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" "RoleType" NOT NULL UNIQUE,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE RESTRICT,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(20) NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_phone" ON "users"("phone");

-- 3. Members
CREATE TABLE "members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "member_code" VARCHAR(50) NOT NULL UNIQUE,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(20) NOT NULL UNIQUE,
    "date_of_birth" DATE,
    "gender" "Gender" NOT NULL,
    "blood_group" VARCHAR(10),
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL DEFAULT 'Amravati',
    "state" VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    "pincode" VARCHAR(10) NOT NULL DEFAULT '444604',
    "emergency_contact" VARCHAR(20) NOT NULL,
    "emergency_name" VARCHAR(100),
    "photo_url" TEXT,
    "qr_code" VARCHAR(255) NOT NULL UNIQUE,
    "fitness_goals" TEXT,
    "medical_history" TEXT,
    "joined_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_members_code" ON "members"("member_code");
CREATE INDEX "idx_members_phone" ON "members"("phone");
CREATE INDEX "idx_members_status" ON "members"("status");

-- 4. Trainers
CREATE TABLE "trainers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "trainer_code" VARCHAR(50) NOT NULL UNIQUE,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(20) NOT NULL UNIQUE,
    "gender" "Gender" NOT NULL,
    "specialization" VARCHAR(255) NOT NULL,
    "experience_yrs" INTEGER NOT NULL DEFAULT 1,
    "bio" TEXT,
    "photo_url" TEXT,
    "shift_timing" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_trainers_code" ON "trainers"("trainer_code");

-- 5. Membership Plans
CREATE TABLE "membership_plans" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL UNIQUE,
    "duration_months" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "price_inr" DECIMAL(10, 2) NOT NULL,
    "admission_fee_inr" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "description" TEXT,
    "features" TEXT[] NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Memberships
CREATE TABLE "memberships" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
    "plan_id" UUID NOT NULL REFERENCES "membership_plans"("id") ON DELETE RESTRICT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "total_amount" DECIMAL(10, 2) NOT NULL,
    "discount_amount" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "paid_amount" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_memberships_member" ON "memberships"("member_id");
CREATE INDEX "idx_memberships_status" ON "memberships"("status");
CREATE INDEX "idx_memberships_end_date" ON "memberships"("end_date");

-- 7. Payments
CREATE TABLE "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "payment_number" VARCHAR(50) NOT NULL UNIQUE,
    "member_id" UUID NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
    "membership_id" UUID REFERENCES "memberships"("id") ON DELETE SET NULL,
    "amount_inr" DECIMAL(10, 2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "transaction_ref" VARCHAR(100),
    "notes" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_payments_number" ON "payments"("payment_number");
CREATE INDEX "idx_payments_member" ON "payments"("member_id");
CREATE INDEX "idx_payments_date" ON "payments"("payment_date");

-- 8. Receipts
CREATE TABLE "receipts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "receipt_number" VARCHAR(50) NOT NULL UNIQUE,
    "payment_id" UUID NOT NULL UNIQUE REFERENCES "payments"("id") ON DELETE CASCADE,
    "pdf_url" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_receipts_number" ON "receipts"("receipt_number");

-- 9. Attendance
CREATE TABLE "attendance" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
    "check_in" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out" TIMESTAMP(3),
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "source" VARCHAR(50) NOT NULL DEFAULT 'QR_SCANNER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_member_attendance_date" UNIQUE ("member_id", "date")
);
CREATE INDEX "idx_attendance_member" ON "attendance"("member_id");
CREATE INDEX "idx_attendance_date" ON "attendance"("date");

-- 10. Workout Plans
CREATE TABLE "workout_plans" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
    "trainer_id" UUID REFERENCES "trainers"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Exercises
CREATE TABLE "exercises" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "workout_plan_id" UUID NOT NULL REFERENCES "workout_plans"("id") ON DELETE CASCADE,
    "day_of_week" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "target_muscle" VARCHAR(50) NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" VARCHAR(20) NOT NULL,
    "weight_kg" DECIMAL(6, 2),
    "rest_seconds" INTEGER NOT NULL DEFAULT 60,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_exercises_plan" ON "exercises"("workout_plan_id");

-- 12. Diet Plans
CREATE TABLE "diet_plans" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
    "trainer_id" UUID REFERENCES "trainers"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "target_cals" INTEGER NOT NULL,
    "protein_g" INTEGER NOT NULL,
    "carbs_g" INTEGER NOT NULL,
    "fats_g" INTEGER NOT NULL,
    "water_ltr" DECIMAL(4, 2) NOT NULL DEFAULT 3.50,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Diet Items
CREATE TABLE "diet_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "diet_plan_id" UUID NOT NULL REFERENCES "diet_plans"("id") ON DELETE CASCADE,
    "meal_type" VARCHAR(50) NOT NULL,
    "time_slot" VARCHAR(20) NOT NULL,
    "food_name" VARCHAR(255) NOT NULL,
    "quantity" VARCHAR(100) NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein_g" INTEGER NOT NULL,
    "carbs_g" INTEGER NOT NULL,
    "fats_g" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_diet_items_plan" ON "diet_items"("diet_plan_id");

-- 14. Enquiries CRM
CREATE TABLE "enquiries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "enquiry_code" VARCHAR(50) NOT NULL UNIQUE,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "gender" "Gender",
    "age" INTEGER,
    "interested_plan" VARCHAR(100),
    "fitness_goal" TEXT,
    "source" VARCHAR(50) NOT NULL DEFAULT 'WEBSITE',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "follow_up_date" TIMESTAMP(3),
    "assigned_to" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_enquiries_code" ON "enquiries"("enquiry_code");
CREATE INDEX "idx_enquiries_phone" ON "enquiries"("phone");
CREATE INDEX "idx_enquiries_status" ON "enquiries"("status");

-- 15. Notifications
CREATE TABLE "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
    "link_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_notifications_user" ON "notifications"("user_id");

-- 16. Expenses
CREATE TABLE "expenses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "amount_inr" DECIMAL(10, 2) NOT NULL,
    "expense_date" DATE NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'UPI',
    "recipient" VARCHAR(255),
    "receipt_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_expenses_category" ON "expenses"("category");
CREATE INDEX "idx_expenses_date" ON "expenses"("expense_date");

-- 17. Fitness Progress
CREATE TABLE "fitness_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
    "record_date" DATE NOT NULL,
    "weight_kg" DECIMAL(5, 2) NOT NULL,
    "body_fat_pct" DECIMAL(4, 2),
    "chest_cm" DECIMAL(5, 2),
    "waist_cm" DECIMAL(5, 2),
    "arms_cm" DECIMAL(5, 2),
    "thighs_cm" DECIMAL(5, 2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_progress_member" ON "fitness_progress"("member_id");

-- 18. Gym Classes
CREATE TABLE "gym_classes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(100) NOT NULL,
    "trainer_id" UUID REFERENCES "trainers"("id") ON DELETE SET NULL,
    "day_of_week" VARCHAR(20) NOT NULL,
    "start_time" VARCHAR(20) NOT NULL,
    "end_time" VARCHAR(20) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 25,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 19. Class Bookings
CREATE TABLE "class_bookings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "class_id" UUID NOT NULL REFERENCES "gym_classes"("id") ON DELETE CASCADE,
    "member_id" UUID NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
    "booking_date" DATE NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_class_booking" UNIQUE ("class_id", "member_id", "booking_date")
);

-- 20. Testimonials
CREATE TABLE "testimonials" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "client_name" VARCHAR(100) NOT NULL,
    "achievement" VARCHAR(255) NOT NULL,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatar_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. Gallery Images
CREATE TABLE "gallery_images" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_gallery_category" ON "gallery_images"("category");

-- 22. Gym Settings
CREATE TABLE "gym_settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "business_name" VARCHAR(255) NOT NULL DEFAULT 'CORPUS FITNESS CLUB (CFC)',
    "tagline" VARCHAR(255) NOT NULL DEFAULT 'Transform Your Body. Transform Your Life.',
    "established" INTEGER NOT NULL DEFAULT 2019,
    "address" TEXT NOT NULL DEFAULT '3rd Floor, Above State Bank of India, Harshraj Colony – Vidyut Nagar Square, VMV Road, Amravati, Maharashtra 444604',
    "phone" VARCHAR(20) NOT NULL DEFAULT '+91 76206 83995',
    "whatsapp" VARCHAR(20) NOT NULL DEFAULT '+91 76206 83995',
    "instagram" VARCHAR(100) NOT NULL DEFAULT 'corpus_fitnessclub',
    "email" VARCHAR(255) NOT NULL DEFAULT 'info@corpusfitness.in',
    "upi_id" VARCHAR(100) NOT NULL DEFAULT 'corpusfitness@sbi',
    "gst_number" VARCHAR(50),
    "morning_hours" VARCHAR(100) NOT NULL DEFAULT '6:00 AM – 11:00 AM',
    "evening_hours" VARCHAR(100) NOT NULL DEFAULT '5:00 PM – 10:00 PM',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 23. Audit Logs
CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100),
    "details" JSONB,
    "ip_address" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_audit_user" ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_action" ON "audit_logs"("action");
CREATE INDEX "idx_audit_created" ON "audit_logs"("created_at");
