// Database & Application Type Definitions for Corpus Fitness Club

export type UserRole = 'super_admin' | 'admin' | 'receptionist' | 'trainer' | 'member'

export interface Profile {
  id: string
  full_name: string
  phone: string
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  profile_id: string
  member_id: string // e.g. CFC-2026-0001
  gender: 'male' | 'female' | 'other'
  date_of_birth: string
  address: string
  emergency_contact?: string
  emergency_phone?: string
  registration_date: string
  fitness_goal: string
  status: 'active' | 'expired' | 'frozen' | 'cancelled' | 'upcoming'
  current_plan_id: string | null
  trainer_id?: string | null
  trainer_name?: string | null
  pt_status?: 'active_pt' | 'general_floor' | 'pt_requested'
  pt_package?: string | null
  photo_url?: string | null
  password?: string
  email?: string
  phone?: string
  notes?: string | null
  created_at: string
  updated_at: string
  // Relations
  profile?: Profile
  current_plan?: Membership
}

export interface Trainer {
  id: string
  profile_id: string
  name: string
  phone: string
  email: string
  password?: string
  specialization: string
  experience: string
  certifications: string[]
  bio: string
  photo?: string | null
  is_active: boolean
  assigned_member_count?: number
  created_at: string
  profile?: Profile
}

export interface MembershipPlan {
  id: string
  name: string
  duration_type: string
  duration_months: number
  price_men: number
  price_women: number
  price?: number
  description: string
  features?: string[]
  popular?: boolean
  is_active: boolean
  created_at: string
}

export interface Membership {
  id: string
  member_id: string
  plan_id: string
  start_date: string
  end_date: string
  amount_paid: number
  discount_amount?: number
  payment_method: string
  status: 'active' | 'expired' | 'cancelled' | 'on_hold' | 'upcoming'
  created_by?: string
  created_at: string
  // Relations
  plan?: MembershipPlan
  member?: Member
}

export interface MembershipRenewalLog {
  id: string
  member_id: string
  member_name: string
  member_code: string
  renewal_date: string // Date when customer renewed (YYYY-MM-DD or ISO)
  previous_plan_name: string
  previous_expiry_date: string
  renewed_plan_id: string
  renewed_plan_name: string
  new_start_date: string
  new_expiry_date: string
  amount_paid: number
  discount_amount: number
  payment_method: string
  receipt_number: string
  processed_by: string
  notes?: string
  created_at: string
}

export interface Payment {
  id: string
  member_id: string
  membership_id: string | null
  amount: number
  total_amount?: number
  pending_amount?: number
  discount_amount?: number
  payment_method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other'
  transaction_ref?: string | null
  status: 'paid' | 'partial' | 'pending' | 'refunded'
  payment_date: string
  receipt_number: string // e.g. CFC-REC-2026-0001
  notes?: string | null
  recorded_by?: string
  created_at: string
  // Relations
  member?: Member
}

export interface Attendance {
  id: string
  member_id: string
  check_in: string
  check_out?: string | null
  method: 'qr' | 'manual'
  recorded_by?: string | null
  // Relations
  member?: Member
}

export interface Exercise {
  id: string
  plan_id: string
  name: string
  muscle_group: string
  sets: number
  reps: string
  weight?: string
  rest_seconds: number
  day_of_week: string
  instructions: string
  video_url?: string | null
}

export interface ExerciseLibraryItem {
  id: string
  name: string
  muscle_group: string // Chest, Back, Legs, Shoulders, Biceps, Triceps, Core, Cardio, Full Body
  equipment: string // Barbell, Dumbbell, Machine, Cable, Bodyweight, Kettlebell
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string
  default_sets: number
  default_reps: string
  default_rest_seconds: number
}

export interface WorkoutPlan {
  id: string
  name: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  description: string
  trainer_id?: string | null
  trainer_name?: string | null
  assigned_member_id?: string | null
  member_id?: string | null // For custom plans owned by member
  is_active: boolean
  is_default?: boolean // True for the 7 Admin core templates
  is_custom?: boolean // True for custom plans created by members
  created_by_role?: 'admin' | 'trainer' | 'member'
  days_per_week?: number
  exercises?: Exercise[]
  created_at: string
  updated_at?: string
}

export interface WorkoutDay {
  id: string
  workout_plan_id: string
  day_name: string
  day_number: number
  focus_muscle: string
  created_at: string
  workout_exercises?: WorkoutExercise[]
}

export interface WorkoutExercise {
  id: string
  workout_day_id: string
  exercise_name: string
  muscle_group: string
  target_sets: number
  target_reps: string
  target_weight?: number
  rest_seconds: number
  instructions?: string
  created_at: string
}

export interface MemberWorkout {
  id: string
  member_id: string
  workout_plan_id: string
  assigned_by: 'TRAINER' | 'ADMIN' | 'SELF'
  start_date: string
  end_date?: string | null
  is_active: boolean
  created_at: string
}

export interface WorkoutSetRecord {
  id: string
  exercise_id?: string
  exercise_name: string
  muscle_group: string
  set_number: number
  reps: number
  weight_kg: number
  completed: boolean
}

export interface WorkoutSession {
  id: string
  member_id: string
  member_name?: string
  plan_id?: string | null
  plan_name?: string
  date: string // YYYY-MM-DD
  start_time?: string
  end_time?: string
  duration_minutes: number
  notes?: string
  trainer_id?: string | null
  trainer_name?: string | null
  completed_sets: WorkoutSetRecord[]
  created_at: string
}

export interface TrainerAssignment {
  id: string
  member_id: string
  member_name: string
  member_code: string
  trainer_id: string | null
  trainer_name: string | null
  assigned_date: string // ISO or YYYY-MM-DD
  status: 'active' | 'changed' | 'removed'
  assigned_by: string
  notes?: string
  previous_trainer_id?: string | null
  previous_trainer_name?: string | null
  pt_package?: string | null
  created_at: string
}

export interface TrainerFeedback {
  id: string
  member_id: string
  trainer_id: string
  trainer_name: string
  month: number // 1 - 12
  year: number // e.g. 2026
  rating: number // 1 - 5 stars
  feedback: string
  focus_areas: string[] // e.g. ["Squat Depth", "Protein Intake", "Rest Intervals"]
  recommendations: string
  created_at: string
  updated_at?: string
}

export interface MonthlyFitnessReportData {
  member_id: string
  member_name: string
  member_code: string
  month: number // 1 - 12
  month_name: string // e.g. "November"
  year: number // 2026
  has_trainer: boolean
  trainer_name?: string | null
  assignment_date?: string | null
  pt_package?: string | null
  // Attendance metrics
  total_attendance_days: number
  attendance_dates: string[] // ["2026-11-01", "2026-11-03", ...]
  attendance_streak: number
  // Workout metrics
  total_completed_workouts: number
  total_workout_minutes: number
  total_exercises_performed: number
  total_sets_completed: number
  total_reps_completed: number
  total_volume_kg: number // sum of (weight_kg * reps) for all completed sets
  // Exercise-wise progression
  exercise_progressions: {
    exercise_name: string
    muscle_group: string
    starting_weight_kg: number
    max_weight_kg: number
    progression_pct: number
    history: { date: string; weight_kg: number; reps: number }[]
  }[]
  // Personal Records
  personal_records: {
    exercise_name: string
    best_weight_kg: number
    best_reps: number
    achieved_date: string
  }[]
  // Consistency
  weekly_consistency: {
    week_number: number
    week_label: string
    workouts_count: number
    attendance_count: number
  }[]
  // Month-over-month comparison
  comparison_vs_prev_month: {
    prev_month_name: string
    attendance_diff: number
    workouts_diff: number
    volume_diff_pct: number
    sets_diff: number
  }
  // Body weight progress
  body_weight?: {
    start_weight_kg: number
    end_weight_kg: number
    diff_kg: number
    readings: { date: string; weight_kg: number }[]
  }
  // Trainer review
  trainer_feedback?: TrainerFeedback | null
  // Self review (for without trainer)
  self_evaluation?: {
    consistency_score: number // 1-100
    grade: string // "A+", "A", "B", etc.
    summary_remarks: string
  }
}

export interface MealItem {
  id: string
  diet_plan_id: string
  meal_type: 'Breakfast' | 'Mid-Morning Snack' | 'Lunch' | 'Evening Snack' | 'Dinner' | 'Post-Workout'
  food_item: string
  quantity: string
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  notes?: string
}

export interface DietPlan {
  id: string
  name: string
  goal: string
  total_calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  water_liters: number
  trainer_id?: string | null
  trainer_name?: string | null
  assigned_member_id?: string | null
  is_active: boolean
  meals?: MealItem[]
  meal_items?: MealItem[]
  created_at: string
}

export interface Enquiry {
  id: string
  reference_no: string // e.g. CFC-ENQ-2026-0042
  full_name: string
  phone: string
  email: string
  gender: 'male' | 'female' | 'other'
  age: number | string
  interested_plan: string
  fitness_goal: string
  message?: string
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'not_interested'
  lead_source?: string
  assigned_staff?: string
  follow_up_date?: string
  notes?: string
  created_at: string
}

export interface Expense {
  id: string
  category: 'Rent' | 'Electricity' | 'Equipment' | 'Maintenance' | 'Salary' | 'Marketing' | 'Supplements' | 'Cleaning & Sanitization' | 'Other'
  amount: number
  expense_date: string
  description: string
  payment_method: string
  receipt_url?: string | null
  recorded_by?: string
  created_at: string
}

export interface FitnessProgress {
  id: string
  member_id: string
  recorded_date: string
  weight_kg: number
  body_fat_pct?: number
  chest_cm?: number
  waist_cm?: number
  hips_cm?: number
  biceps_cm?: number
  notes?: string
}

export interface NotificationItem {
  id: string
  user_id?: string | null
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'alert'
  read: boolean
  is_read?: boolean
  target_audience?: 'all' | 'active_members' | 'trainers' | 'expired_members'
  sent_by?: string
  priority?: 'normal' | 'high' | 'urgent'
  channels?: string[]
  created_at: string
}

export type Notification = NotificationItem

export interface AuditLog {
  id: string
  user_id: string
  user_name: string
  action: string
  entity_type: string
  entity_id?: string
  details?: string
  created_at: string
}

export interface GymClass {
  id: string
  name: string
  instructor: string
  day: string
  start_time: string
  end_time: string
  capacity: number
  enrolled: number
  category: string
}

export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  todayAttendance: number
  monthlyRevenue: number
  pendingPayments: number
  totalTrainers: number
  newEnquiries: number
}
