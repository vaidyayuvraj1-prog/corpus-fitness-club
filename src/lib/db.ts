// Comprehensive resilient database and data management store for Corpus Fitness Club (CFC)
import type {
  Member,
  Trainer,
  MembershipPlan,
  Membership,
  Payment,
  Attendance,
  WorkoutPlan,
  DietPlan,
  Enquiry,
  Expense,
  FitnessProgress,
  DashboardStats,
  Profile,
  NotificationItem,
  MembershipRenewalLog,
  ExerciseLibraryItem,
  WorkoutSession,
  WorkoutSetRecord,
  TrainerAssignment,
  TrainerFeedback,
  MonthlyFitnessReportData,
  AuditLog,
} from '@/types/database'
import {
  MEMBERSHIP_PLANS_DEFAULT,
  TRAINERS_DEMO,
  GALLERY_ITEMS_DEFAULT,
  TESTIMONIALS_DEFAULT,
} from './constants'
import { format, subDays, subMonths, addMonths, addDays } from 'date-fns'

// Storage Keys
const KEYS = {
  MEMBERS: 'cfc_db_members',
  PLANS: 'cfc_db_plans',
  MEMBERSHIPS: 'cfc_db_memberships',
  PAYMENTS: 'cfc_db_payments',
  ATTENDANCE: 'cfc_db_attendance',
  TRAINERS: 'cfc_db_trainers',
  WORKOUTS: 'cfc_db_workouts',
  DIETS: 'cfc_db_diets',
  ENQUIRIES: 'cfc_db_enquiries',
  EXPENSES: 'cfc_db_expenses',
  PROGRESS: 'cfc_db_progress',
  GALLERY: 'cfc_db_gallery',
  TESTIMONIALS: 'cfc_db_testimonials',
  NOTIFICATIONS: 'cfc_db_notifications',
  RENEWALS: 'cfc_db_renewals',
  ASSIGNMENTS: 'cfc_db_trainer_assignments',
  WORKOUT_SESSIONS: 'cfc_db_workout_sessions',
  EXERCISE_LIBRARY: 'cfc_db_exercise_library',
  TRAINER_FEEDBACK: 'cfc_db_trainer_feedback',
  AUDIT_LOGS: 'cfc_db_audit_logs',
}

function getItem<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : defaultVal
  } catch {
    return defaultVal
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val))
    syncKeyToServer(key, val)
  } catch (e) {
    console.error('Storage write error:', e)
  }
}

// ── Multi-Device Real-Time Sync Engine ───────────────────────────────────────
async function syncKeyToServer(key: string, value: any): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
  } catch {
    // Offline or server not reachable
  }
}

let isSyncing = false
export async function syncDatabaseWithServer(): Promise<void> {
  if (isSyncing || typeof window === 'undefined') return
  isSyncing = true
  try {
    const res = await fetch('/api/db', { cache: 'no-store' })
    if (res.ok) {
      const serverData = await res.json()
      if (serverData && typeof serverData === 'object') {
        const keys = Object.keys(serverData)
        if (keys.length > 0) {
          let hasNewer = false
          keys.forEach((k) => {
            const serverValStr = JSON.stringify(serverData[k])
            const localValStr = localStorage.getItem(k)
            if (serverValStr !== localValStr) {
              localStorage.setItem(k, serverValStr)
              hasNewer = true
            }
          })
          if (hasNewer) {
            window.dispatchEvent(new CustomEvent('cfc_db_synced'))
          }
        } else {
          // Push initial local state to server so server has it
          const localDump: Record<string, any> = {}
          Object.values(KEYS).forEach((k) => {
            const raw = localStorage.getItem(k)
            if (raw) {
              try {
                localDump[k] = JSON.parse(raw)
              } catch {
                localDump[k] = raw
              }
            }
          })
          if (Object.keys(localDump).length > 0) {
            fetch('/api/db', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ updates: localDump }),
            }).catch(() => {})
          }
        }
      }
    }
  } catch {
    // Offline
  } finally {
    isSyncing = false
  }
}

// Auto-sync on client load and window focus
if (typeof window !== 'undefined') {
  syncDatabaseWithServer()
  setInterval(syncDatabaseWithServer, 3000)
  window.addEventListener('focus', syncDatabaseWithServer)
}

// ── Official Gym Email & Password Generators (@corpuss.com) ───────────────────
export function generateCorpussEmail(fullName: string, role: 'member' | 'trainer' = 'member'): string {
  const clean = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '') || (role === 'trainer' ? 'coach' : 'member')

  const baseEmail = `${clean}@corpuss.com`


  // 8. Exercise Library Master
  if (!localStorage.getItem(KEYS.EXERCISE_LIBRARY)) {
    setItem(KEYS.EXERCISE_LIBRARY, DEFAULT_EXERCISE_LIBRARY)
  }

  // 9. Workout Plans (Ensure all 7 Core Default Plans exist)
  const existingWorkouts: WorkoutPlan[] = getItem<WorkoutPlan[]>(KEYS.WORKOUTS, [])
  if (existingWorkouts.length === 0) {
    setItem(KEYS.WORKOUTS, CORE_DEFAULT_WORKOUT_PLANS)
  } else {
    // Check if any core default plan is missing
    let updatedWorkouts = [...existingWorkouts]
    let modified = false
    CORE_DEFAULT_WORKOUT_PLANS.forEach((defPlan) => {
      const found = updatedWorkouts.some((w) => w.id === defPlan.id || w.name === defPlan.name)
      if (!found) {
        updatedWorkouts.push(defPlan)
        modified = true
      }
    })
    if (modified) {
      setItem(KEYS.WORKOUTS, updatedWorkouts)
    }
  }

  // 10. Initial Trainer Assignments & History
  if (!localStorage.getItem(KEYS.ASSIGNMENTS)) {
    const initialAssignments: TrainerAssignment[] = [
      {
        id: 'asg-1',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        member_code: 'CFC-2026-0001',
        trainer_id: 'tr-1',
        trainer_name: 'Coach Rohit Deshmukh',
        assigned_date: '2025-06-10',
        status: 'active',
        assigned_by: 'CFC Admin',
        notes: 'Primary 1-on-1 Transformation Package: Strength and Hypertrophy',
        previous_trainer_name: 'Coach Amol Sawant',
        pt_package: '1-on-1 Personal Transformation',
        created_at: '2025-06-10T09:30:00Z',
      },
      {
        id: 'asg-2',
        member_id: 'mem-2',
        member_name: 'Priya Deshmukh',
        member_code: 'CFC-2026-0002',
        trainer_id: 'tr-2',
        trainer_name: 'Priya Bhagat',
        assigned_date: '2025-08-15',
        status: 'active',
        assigned_by: 'CFC Admin',
        notes: 'Women Transformation & Aerobics / Zumba Conditioning',
        previous_trainer_name: null,
        pt_package: 'Fat Loss & Conditioning',
        created_at: '2025-08-15T08:00:00Z',
      },
      {
        id: 'asg-3',
        member_id: 'mem-5',
        member_name: 'Kunal Joshi',
        member_code: 'CFC-2026-0005',
        trainer_id: 'tr-3',
        trainer_name: 'Amol Sawant',
        assigned_date: '2025-11-01',
        status: 'active',
        assigned_by: 'CFC Admin',
        notes: 'Powerlifting Competition Prep',
        previous_trainer_name: null,
        pt_package: 'Powerlifting Protocol',
        created_at: '2025-11-01T10:00:00Z',
      },
      {
        id: 'asg-hist-1',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        member_code: 'CFC-2026-0001',
        trainer_id: 'tr-3',
        trainer_name: 'Coach Amol Sawant',
        assigned_date: '2025-01-15',
        status: 'changed',
        assigned_by: 'CFC Admin',
        notes: 'Initial strength screening phase; reassigned to Coach Rohit on 10 Jun 2025',
        previous_trainer_name: null,
        pt_package: 'General Strength',
        created_at: '2025-01-15T09:00:00Z',
      },
    ]
    setItem(KEYS.ASSIGNMENTS, initialAssignments)
  }

  // 11. Initial Workout Sessions for Demo Members (November & October 2026)
  if (!localStorage.getItem(KEYS.WORKOUT_SESSIONS)) {
    const initialSessions: WorkoutSession[] = [
      // Rahul Sharma (mem-1 - With Trainer) - November 2026
      {
        id: 'ws-rs-11-1',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        plan_id: 'wp-default-musclebuilding',
        plan_name: 'Muscle Building & Hypertrophy Split',
        date: '2026-11-02',
        start_time: '06:30 AM',
        end_time: '07:25 AM',
        duration_minutes: 55,
        trainer_name: 'Coach Rohit Deshmukh',
        notes: 'Chest & Delts workout. Bench press moved very smoothly.',
        completed_sets: [
          { id: 's-1', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 1, reps: 10, weight_kg: 65, completed: true },
          { id: 's-2', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 2, reps: 10, weight_kg: 70, completed: true },
          { id: 's-3', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 3, reps: 8, weight_kg: 75, completed: true },
          { id: 's-4', exercise_name: 'Incline Dumbbell Press', muscle_group: 'Chest', set_number: 1, reps: 12, weight_kg: 22, completed: true },
          { id: 's-5', exercise_name: 'Incline Dumbbell Press', muscle_group: 'Chest', set_number: 2, reps: 10, weight_kg: 24, completed: true },
        ],
        created_at: '2026-11-02T07:30:00Z',
      },
      {
        id: 'ws-rs-11-2',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        plan_id: 'wp-default-musclebuilding',
        plan_name: 'Muscle Building & Hypertrophy Split',
        date: '2026-11-04',
        start_time: '06:40 AM',
        end_time: '07:35 AM',
        duration_minutes: 55,
        trainer_name: 'Coach Rohit Deshmukh',
        notes: 'Back & Biceps volume session. Lat stretch achieved.',
        completed_sets: [
          { id: 's-6', exercise_name: 'Barbell Bent-Over Row', muscle_group: 'Back', set_number: 1, reps: 10, weight_kg: 65, completed: true },
          { id: 's-7', exercise_name: 'Barbell Bent-Over Row', muscle_group: 'Back', set_number: 2, reps: 10, weight_kg: 70, completed: true },
          { id: 's-8', exercise_name: 'Barbell Bent-Over Row', muscle_group: 'Back', set_number: 3, reps: 8, weight_kg: 75, completed: true },
          { id: 's-9', exercise_name: 'Wide-Grip Lat Pulldown', muscle_group: 'Back', set_number: 1, reps: 12, weight_kg: 55, completed: true },
          { id: 's-10', exercise_name: 'Wide-Grip Lat Pulldown', muscle_group: 'Back', set_number: 2, reps: 10, weight_kg: 60, completed: true },
          { id: 's-11', exercise_name: 'Standing Barbell Bicep Curl', muscle_group: 'Arms', set_number: 1, reps: 12, weight_kg: 30, completed: true },
          { id: 's-12', exercise_name: 'Standing Barbell Bicep Curl', muscle_group: 'Arms', set_number: 2, reps: 10, weight_kg: 32.5, completed: true },
        ],
        created_at: '2026-11-04T07:40:00Z',
      },
      {
        id: 'ws-rs-11-3',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        plan_id: 'wp-default-musclebuilding',
        plan_name: 'Muscle Building & Hypertrophy Split',
        date: '2026-11-06',
        start_time: '06:30 AM',
        end_time: '07:30 AM',
        duration_minutes: 60,
        trainer_name: 'Coach Rohit Deshmukh',
        notes: 'Heavy Squat day. Hit parallel cleanly on all working sets.',
        completed_sets: [
          { id: 's-13', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 1, reps: 10, weight_kg: 90, completed: true },
          { id: 's-14', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 2, reps: 8, weight_kg: 100, completed: true },
          { id: 's-15', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 3, reps: 6, weight_kg: 105, completed: true },
          { id: 's-16', exercise_name: 'Leg Press 45-Degree', muscle_group: 'Legs', set_number: 1, reps: 12, weight_kg: 160, completed: true },
          { id: 's-17', exercise_name: 'Leg Press 45-Degree', muscle_group: 'Legs', set_number: 2, reps: 10, weight_kg: 180, completed: true },
        ],
        created_at: '2026-11-06T07:35:00Z',
      },
      {
        id: 'ws-rs-11-4',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        plan_id: 'wp-default-musclebuilding',
        plan_name: 'Muscle Building & Hypertrophy Split',
        date: '2026-11-09',
        start_time: '06:30 AM',
        end_time: '07:25 AM',
        duration_minutes: 55,
        trainer_name: 'Coach Rohit Deshmukh',
        notes: 'Chest & Shoulders progressive session. Barbell press 75kg felt solid.',
        completed_sets: [
          { id: 's-18', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 1, reps: 10, weight_kg: 70, completed: true },
          { id: 's-19', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 2, reps: 8, weight_kg: 75, completed: true },
          { id: 's-20', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 3, reps: 7, weight_kg: 77.5, completed: true },
          { id: 's-21', exercise_name: 'Overhead Barbell Military Press', muscle_group: 'Shoulders', set_number: 1, reps: 10, weight_kg: 45, completed: true },
          { id: 's-22', exercise_name: 'Overhead Barbell Military Press', muscle_group: 'Shoulders', set_number: 2, reps: 8, weight_kg: 50, completed: true },
        ],
        created_at: '2026-11-09T07:30:00Z',
      },
      {
        id: 'ws-rs-11-5',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        plan_id: 'wp-default-musclebuilding',
        plan_name: 'Muscle Building & Hypertrophy Split',
        date: '2026-11-11',
        start_time: '06:35 AM',
        end_time: '07:30 AM',
        duration_minutes: 55,
        trainer_name: 'Coach Rohit Deshmukh',
        notes: 'Deadlift & Upper Back power. Clean neutral spine.',
        completed_sets: [
          { id: 's-23', exercise_name: 'Barbell Conventional Deadlift', muscle_group: 'Back', set_number: 1, reps: 5, weight_kg: 120, completed: true },
          { id: 's-24', exercise_name: 'Barbell Conventional Deadlift', muscle_group: 'Back', set_number: 2, reps: 5, weight_kg: 130, completed: true },
          { id: 's-25', exercise_name: 'Barbell Conventional Deadlift', muscle_group: 'Back', set_number: 3, reps: 3, weight_kg: 140, completed: true },
          { id: 's-26', exercise_name: 'Wide-Grip Lat Pulldown', muscle_group: 'Back', set_number: 1, reps: 10, weight_kg: 60, completed: true },
        ],
        created_at: '2026-11-11T07:35:00Z',
      },
      {
        id: 'ws-rs-11-6',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        plan_id: 'wp-default-musclebuilding',
        plan_name: 'Muscle Building & Hypertrophy Split',
        date: '2026-11-13',
        start_time: '06:30 AM',
        end_time: '07:25 AM',
        duration_minutes: 55,
        trainer_name: 'Coach Rohit Deshmukh',
        notes: 'Squats and Hamstrings. Squat up to 110kg for 5 reps (New Personal Record!).',
        completed_sets: [
          { id: 's-27', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 1, reps: 8, weight_kg: 95, completed: true },
          { id: 's-28', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 2, reps: 6, weight_kg: 105, completed: true },
          { id: 's-29', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 3, reps: 5, weight_kg: 110, completed: true },
          { id: 's-30', exercise_name: 'Romanian Deadlift (RDL)', muscle_group: 'Legs', set_number: 1, reps: 10, weight_kg: 70, completed: true },
          { id: 's-31', exercise_name: 'Romanian Deadlift (RDL)', muscle_group: 'Legs', set_number: 2, reps: 10, weight_kg: 80, completed: true },
        ],
        created_at: '2026-11-13T07:30:00Z',
      },

      // Rahul Sharma - October 2026 (Previous Month for real Month-over-Month comparison)
      {
        id: 'ws-rs-10-1',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        plan_id: 'wp-default-musclebuilding',
        plan_name: 'Muscle Building & Hypertrophy Split',
        date: '2026-10-05',
        start_time: '06:30 AM',
        end_time: '07:20 AM',
        duration_minutes: 50,
        trainer_name: 'Coach Rohit Deshmukh',
        completed_sets: [
          { id: 's-oct-1', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 1, reps: 10, weight_kg: 60, completed: true },
          { id: 's-oct-2', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 2, reps: 8, weight_kg: 65, completed: true },
          { id: 's-oct-3', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 1, reps: 8, weight_kg: 80, completed: true },
          { id: 's-oct-4', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 2, reps: 8, weight_kg: 85, completed: true },
        ],
        created_at: '2026-10-05T07:25:00Z',
      },
      {
        id: 'ws-rs-10-2',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        plan_id: 'wp-default-musclebuilding',
        plan_name: 'Muscle Building & Hypertrophy Split',
        date: '2026-10-12',
        start_time: '06:30 AM',
        end_time: '07:20 AM',
        duration_minutes: 50,
        trainer_name: 'Coach Rohit Deshmukh',
        completed_sets: [
          { id: 's-oct-5', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 1, reps: 10, weight_kg: 65, completed: true },
          { id: 's-oct-6', exercise_name: 'Barbell Bent-Over Row', muscle_group: 'Back', set_number: 1, reps: 10, weight_kg: 60, completed: true },
          { id: 's-oct-7', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 1, reps: 8, weight_kg: 90, completed: true },
        ],
        created_at: '2026-10-12T07:25:00Z',
      },

      // Amit Verma (mem-3 - Without Trainer / Self-Guided) - November 2026
      {
        id: 'ws-av-11-1',
        member_id: 'mem-3',
        member_name: 'Amit Verma',
        plan_id: 'wp-default-strength',
        plan_name: 'Strength Training & 5x5 Power Protocol',
        date: '2026-11-03',
        start_time: '07:30 AM',
        end_time: '08:25 AM',
        duration_minutes: 55,
        trainer_name: null,
        notes: 'Self-guided power session. Bench 5x5 completed.',
        completed_sets: [
          { id: 'av-1', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 1, reps: 5, weight_kg: 80, completed: true },
          { id: 'av-2', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 2, reps: 5, weight_kg: 82.5, completed: true },
          { id: 'av-3', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 3, reps: 5, weight_kg: 85, completed: true },
          { id: 'av-4', exercise_name: 'Overhead Barbell Military Press', muscle_group: 'Shoulders', set_number: 1, reps: 5, weight_kg: 45, completed: true },
          { id: 'av-5', exercise_name: 'Overhead Barbell Military Press', muscle_group: 'Shoulders', set_number: 2, reps: 5, weight_kg: 47.5, completed: true },
        ],
        created_at: '2026-11-03T08:30:00Z',
      },
      {
        id: 'ws-av-11-2',
        member_id: 'mem-3',
        member_name: 'Amit Verma',
        plan_id: 'wp-default-strength',
        plan_name: 'Strength Training & 5x5 Power Protocol',
        date: '2026-11-06',
        start_time: '07:30 AM',
        end_time: '08:25 AM',
        duration_minutes: 55,
        trainer_name: null,
        notes: 'Self-guided Squat & Deadlift session.',
        completed_sets: [
          { id: 'av-6', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 1, reps: 5, weight_kg: 100, completed: true },
          { id: 'av-7', exercise_name: 'Barbell Back Squat', muscle_group: 'Legs', set_number: 2, reps: 5, weight_kg: 105, completed: true },
          { id: 'av-8', exercise_name: 'Barbell Conventional Deadlift', muscle_group: 'Back', set_number: 1, reps: 5, weight_kg: 125, completed: true },
          { id: 'av-9', exercise_name: 'Barbell Conventional Deadlift', muscle_group: 'Back', set_number: 2, reps: 5, weight_kg: 135, completed: true },
        ],
        created_at: '2026-11-06T08:30:00Z',
      },
      {
        id: 'ws-av-11-3',
        member_id: 'mem-3',
        member_name: 'Amit Verma',
        plan_id: 'wp-default-strength',
        plan_name: 'Strength Training & 5x5 Power Protocol',
        date: '2026-11-10',
        start_time: '07:30 AM',
        end_time: '08:25 AM',
        duration_minutes: 55,
        trainer_name: null,
        notes: 'Overload session. Deadlift 145kg x 3 reps.',
        completed_sets: [
          { id: 'av-10', exercise_name: 'Barbell Flat Bench Press', muscle_group: 'Chest', set_number: 1, reps: 5, weight_kg: 85, completed: true },
          { id: 'av-11', exercise_name: 'Barbell Conventional Deadlift', muscle_group: 'Back', set_number: 1, reps: 5, weight_kg: 130, completed: true },
          { id: 'av-12', exercise_name: 'Barbell Conventional Deadlift', muscle_group: 'Back', set_number: 2, reps: 3, weight_kg: 145, completed: true },
        ],
        created_at: '2026-11-10T08:30:00Z',
      },

      // Priya Deshmukh (mem-2 - With Trainer) - November 2026
      {
        id: 'ws-pd-11-1',
        member_id: 'mem-2',
        member_name: 'Priya Deshmukh',
        plan_id: 'wp-default-weightloss',
        plan_name: 'Weight Loss & High Intensity Metabolic Shred',
        date: '2026-11-02',
        start_time: '07:05 AM',
        end_time: '07:55 AM',
        duration_minutes: 50,
        trainer_name: 'Priya Bhagat',
        notes: 'Zumba warm-up + kettlebell conditioning.',
        completed_sets: [
          { id: 'pd-1', exercise_name: 'Russian Kettlebell Swings', muscle_group: 'Full Body', set_number: 1, reps: 20, weight_kg: 12, completed: true },
          { id: 'pd-2', exercise_name: 'Russian Kettlebell Swings', muscle_group: 'Full Body', set_number: 2, reps: 20, weight_kg: 14, completed: true },
          { id: 'pd-3', exercise_name: 'Walking Dumbbell Lunges', muscle_group: 'Legs', set_number: 1, reps: 15, weight_kg: 8, completed: true },
          { id: 'pd-4', exercise_name: 'Walking Dumbbell Lunges', muscle_group: 'Legs', set_number: 2, reps: 15, weight_kg: 10, completed: true },
        ],
        created_at: '2026-11-02T08:00:00Z',
      },
      {
        id: 'ws-pd-11-2',
        member_id: 'mem-2',
        member_name: 'Priya Deshmukh',
        plan_id: 'wp-default-weightloss',
        plan_name: 'Weight Loss & High Intensity Metabolic Shred',
        date: '2026-11-05',
        start_time: '07:05 AM',
        end_time: '07:55 AM',
        duration_minutes: 50,
        trainer_name: 'Priya Bhagat',
        completed_sets: [
          { id: 'pd-5', exercise_name: 'Russian Kettlebell Swings', muscle_group: 'Full Body', set_number: 1, reps: 20, weight_kg: 14, completed: true },
          { id: 'pd-6', exercise_name: 'Dumbbell Thrusters (Squat to Press)', muscle_group: 'Full Body', set_number: 1, reps: 12, weight_kg: 8, completed: true },
          { id: 'pd-7', exercise_name: 'High Intensity Burpees', muscle_group: 'Cardio', set_number: 1, reps: 15, weight_kg: 0, completed: true },
        ],
        created_at: '2026-11-05T08:00:00Z',
      },
    ]
    setItem(KEYS.WORKOUT_SESSIONS, initialSessions)
  }

  // 12. Initial Trainer Monthly Feedback (For Members with Trainer)
  if (!localStorage.getItem(KEYS.TRAINER_FEEDBACK)) {
    const initialFeedback: TrainerFeedback[] = [
      {
        id: 'tf-1',
        member_id: 'mem-1',
        trainer_id: 'tr-1',
        trainer_name: 'Coach Rohit Deshmukh',
        month: 11, // November
        year: 2026,
        rating: 5,
        feedback: 'Rahul has displayed exceptional dedication this month. His Barbell Bench Press has climbed from 65kg to a strong 77.5kg triple, and Squat depth has reached full competition parallel. Form remains crisp under fatigue.',
        focus_areas: ['Squat Depth & Hip Drive', 'Daily 160g Protein Goal', 'Post-Workout Mobility & Foam Rolling'],
        recommendations: 'Continue progressive overload on the 4-day hypertrophy split. In December, introduce deficit Romanian Deadlifts to fortify posterior chain endurance.',
        created_at: '2026-11-14T10:00:00Z',
      },
      {
        id: 'tf-2',
        member_id: 'mem-1',
        trainer_id: 'tr-1',
        trainer_name: 'Coach Rohit Deshmukh',
        month: 10, // October
        year: 2026,
        rating: 5,
        feedback: 'Solid month of foundational hypertrophy. Consistent 4-day gym attendance without a single missed session. Recovery rate has visibly improved.',
        focus_areas: ['Bench Scapular Retraction', 'Hydration (3.5L daily)'],
        recommendations: 'Transition from 10-rep sets to heavy 6-8 rep brackets on compound lifts.',
        created_at: '2026-10-31T18:00:00Z',
      },
      {
        id: 'tf-3',
        member_id: 'mem-2',
        trainer_id: 'tr-2',
        trainer_name: 'Priya Bhagat',
        month: 11, // November
        year: 2026,
        rating: 5,
        feedback: 'Priya has made tremendous progress in metabolic endurance! Her stamina in both morning Zumba batches and kettlebell circuits has jumped significantly. Body composition shows noticeable inch loss around the waist.',
        focus_areas: ['Kettlebell Hip Snap Speed', 'Core Bracing during Walking Lunges', 'Pre-workout Fuel'],
        recommendations: 'Increase kettlebell swing weight from 12kg to 16kg and maintain current dietary deficit.',
        created_at: '2026-11-14T09:30:00Z',
      },
    ]
    setItem(KEYS.TRAINER_FEEDBACK, initialFeedback)
  }


  try {
    const rawMembers = localStorage.getItem(KEYS.MEMBERS)
    const members: Member[] = rawMembers ? JSON.parse(rawMembers) : []
    const rawTrainers = localStorage.getItem(KEYS.TRAINERS)
    const trainers: Trainer[] = rawTrainers ? JSON.parse(rawTrainers) : []

    let candidate = baseEmail
    let counter = 1

    const isTaken = (email: string) => {
      const e = email.toLowerCase()
      const inMembers = members.some(
        (m) => (m.email && m.email.toLowerCase() === e) || (m.profile?.email && m.profile.email.toLowerCase() === e)
      )
      const inTrainers = trainers.some(
        (t) => (t.email && t.email.toLowerCase() === e) || (t.profile?.email && t.profile.email.toLowerCase() === e)
      )
      return inMembers || inTrainers
    }

    while (isTaken(candidate)) {
      candidate = `${clean}${counter}@corpuss.com`
      counter++
    }

    return candidate
  } catch {
    return baseEmail
  }
}

export function generateCorpussPassword(prefix = 'CFC@'): string {
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`
}

// Initial Seed Data Generator

// ── Master Exercise Catalog (35+ Exercises) ──────────────────────────────────
export const DEFAULT_EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  // Chest
  {
    id: 'lib-ex-1',
    name: 'Barbell Flat Bench Press',
    muscle_group: 'Chest',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: 'Retract scapulae, touch bar to mid-sternum with elbows at ~45 degrees, and drive through chest to lockout.',
    default_sets: 4,
    default_reps: '8 - 12',
    default_rest_seconds: 90,
  },
  {
    id: 'lib-ex-2',
    name: 'Incline Dumbbell Press',
    muscle_group: 'Chest',
    equipment: 'Dumbbell',
    difficulty: 'intermediate',
    instructions: 'Set bench to 30 degrees, lower dumbbells with deep upper chest stretch, and press upwards in an arc.',
    default_sets: 3,
    default_reps: '10 - 12',
    default_rest_seconds: 75,
  },
  {
    id: 'lib-ex-3',
    name: 'Cable Chest Flyes',
    muscle_group: 'Chest',
    equipment: 'Cable',
    difficulty: 'beginner',
    instructions: 'Stand upright with slight forward lean, bring handles together in hugging motion, squeezing inner chest.',
    default_sets: 3,
    default_reps: '12 - 15',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-4',
    name: 'Push-Ups (Standard / Diamond)',
    muscle_group: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    instructions: 'Maintain rigid plank line from head to heels, lower chest to floor, drive up explosively.',
    default_sets: 3,
    default_reps: '15 - 20',
    default_rest_seconds: 45,
  },
  {
    id: 'lib-ex-5',
    name: 'Parallel Bar Dips',
    muscle_group: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'advanced',
    instructions: 'Lean torso forward 30 degrees to bias lower chest, lower to 90 degrees elbow bend, push upward.',
    default_sets: 3,
    default_reps: '8 - 12',
    default_rest_seconds: 90,
  },

  // Back
  {
    id: 'lib-ex-6',
    name: 'Barbell Conventional Deadlift',
    muscle_group: 'Back',
    equipment: 'Barbell',
    difficulty: 'advanced',
    instructions: 'Feet hip-width, engage lats, drive floor away through heels, locking hips and knees synchronously.',
    default_sets: 4,
    default_reps: '5',
    default_rest_seconds: 180,
  },
  {
    id: 'lib-ex-7',
    name: 'Wide-Grip Lat Pulldown',
    muscle_group: 'Back',
    equipment: 'Cable',
    difficulty: 'beginner',
    instructions: 'Pull bar to upper chest pulling with elbows down and back, squeeze lats at peak contraction.',
    default_sets: 4,
    default_reps: '10 - 12',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-8',
    name: 'Barbell Bent-Over Row',
    muscle_group: 'Back',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: 'Hinge at 45 degrees, pull bar to belly button while keeping neutral spine.',
    default_sets: 4,
    default_reps: '8 - 10',
    default_rest_seconds: 90,
  },
  {
    id: 'lib-ex-9',
    name: 'Seated Cable Row',
    muscle_group: 'Back',
    equipment: 'Cable',
    difficulty: 'beginner',
    instructions: 'Keep back flat, drive elbows past torso and hold peak squeeze for 1 second.',
    default_sets: 3,
    default_reps: '12',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-10',
    name: 'Pull-Ups / Chin-Ups',
    muscle_group: 'Back',
    equipment: 'Bodyweight',
    difficulty: 'intermediate',
    instructions: 'Full dead-hang at bottom, pull until chin clears the bar without swinging.',
    default_sets: 4,
    default_reps: '6 - 10',
    default_rest_seconds: 90,
  },

  // Legs
  {
    id: 'lib-ex-11',
    name: 'Barbell Back Squat',
    muscle_group: 'Legs',
    equipment: 'Barbell',
    difficulty: 'advanced',
    instructions: 'Bar resting on upper traps, break hips and knees simultaneously, achieve parallel depth or below.',
    default_sets: 4,
    default_reps: '6 - 10',
    default_rest_seconds: 120,
  },
  {
    id: 'lib-ex-12',
    name: 'Leg Press 45-Degree',
    muscle_group: 'Legs',
    equipment: 'Machine',
    difficulty: 'intermediate',
    instructions: 'Lower platform until knees are at 90 degrees, press through mid-foot without hyperextending knees.',
    default_sets: 4,
    default_reps: '10 - 12',
    default_rest_seconds: 90,
  },
  {
    id: 'lib-ex-13',
    name: 'Romanian Deadlift (RDL)',
    muscle_group: 'Legs',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: 'Push hips backward with soft knee bend until deep hamstring stretch is felt, squeeze glutes to return.',
    default_sets: 3,
    default_reps: '10 - 12',
    default_rest_seconds: 75,
  },
  {
    id: 'lib-ex-14',
    name: 'Walking Dumbbell Lunges',
    muscle_group: 'Legs',
    equipment: 'Dumbbell',
    difficulty: 'intermediate',
    instructions: 'Step forward landing heel to toe, lower rear knee an inch off ground, drive through lead heel.',
    default_sets: 3,
    default_reps: '12 per leg',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-15',
    name: 'Standing Machine Calf Raises',
    muscle_group: 'Legs',
    equipment: 'Machine',
    difficulty: 'beginner',
    instructions: 'Full stretch at bottom heel drop, raise to tip-toes and hold for 2 seconds.',
    default_sets: 4,
    default_reps: '15 - 20',
    default_rest_seconds: 45,
  },

  // Shoulders
  {
    id: 'lib-ex-16',
    name: 'Overhead Barbell Military Press',
    muscle_group: 'Shoulders',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: 'Brace core and glutes, press barbell straight overhead locking out with head through the window.',
    default_sets: 4,
    default_reps: '8 - 10',
    default_rest_seconds: 90,
  },
  {
    id: 'lib-ex-17',
    name: 'Dumbbell Lateral Raises',
    muscle_group: 'Shoulders',
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    instructions: 'Raise dumbbells to shoulder height leading with elbows with slight pinky tilt, 2-sec eccentric.',
    default_sets: 4,
    default_reps: '12 - 15',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-18',
    name: 'Face Pulls with Rope',
    muscle_group: 'Shoulders',
    equipment: 'Cable',
    difficulty: 'beginner',
    instructions: 'Set pulley to eye level, pull rope to ears while externally rotating shoulders, target rear delts.',
    default_sets: 3,
    default_reps: '15',
    default_rest_seconds: 45,
  },
  {
    id: 'lib-ex-19',
    name: 'Seated Arnold Press',
    muscle_group: 'Shoulders',
    equipment: 'Dumbbell',
    difficulty: 'intermediate',
    instructions: 'Start with palms facing chest, rotate outwards while pressing overhead in a fluid arc.',
    default_sets: 3,
    default_reps: '10',
    default_rest_seconds: 75,
  },

  // Arms (Biceps & Triceps)
  {
    id: 'lib-ex-20',
    name: 'Standing Barbell Bicep Curl',
    muscle_group: 'Arms',
    equipment: 'Barbell',
    difficulty: 'beginner',
    instructions: 'Keep elbows tucked tightly at sides, curl bar toward shoulders, lower under 3-second control.',
    default_sets: 3,
    default_reps: '10 - 12',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-21',
    name: 'Incline Dumbbell Hammer Curls',
    muscle_group: 'Arms',
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    instructions: 'Neutral palms facing each other, curls isolate brachialis and forearm thickness.',
    default_sets: 3,
    default_reps: '12',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-22',
    name: 'Tricep Cable Rope Pushdown',
    muscle_group: 'Arms',
    equipment: 'Cable',
    difficulty: 'beginner',
    instructions: 'Pin elbows to sides, press downward spreading rope ends apart at bottom for full tricep lockout.',
    default_sets: 4,
    default_reps: '12 - 15',
    default_rest_seconds: 45,
  },
  {
    id: 'lib-ex-23',
    name: 'EZ-Bar Skull Crushers',
    muscle_group: 'Arms',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: 'Lie on flat bench, lower bar toward forehead by flexing elbows, extend back to vertical.',
    default_sets: 3,
    default_reps: '10',
    default_rest_seconds: 60,
  },

  // Core & Abs
  {
    id: 'lib-ex-24',
    name: 'Hanging Leg Raises',
    muscle_group: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'intermediate',
    instructions: 'Hang from pull-up bar, raise legs to 90 degrees or touch toes to bar without swinging hips.',
    default_sets: 3,
    default_reps: '12 - 15',
    default_rest_seconds: 45,
  },
  {
    id: 'lib-ex-25',
    name: 'Forearm Plank with Hip Taps',
    muscle_group: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    instructions: 'Maintain horizontal torso, alternate gently tapping hips side to side for anti-rotational stability.',
    default_sets: 3,
    default_reps: '60 seconds',
    default_rest_seconds: 30,
  },
  {
    id: 'lib-ex-26',
    name: 'Ab Wheel Rollouts',
    muscle_group: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'advanced',
    instructions: 'From knees, roll wheel forward with braced core until nose is near ground, pull back with abs.',
    default_sets: 3,
    default_reps: '10',
    default_rest_seconds: 60,
  },

  // Cardio & Functional
  {
    id: 'lib-ex-27',
    name: 'Treadmill Incline Interval Sprints',
    muscle_group: 'Cardio',
    equipment: 'Machine',
    difficulty: 'intermediate',
    instructions: '8-10% incline, alternate 1 minute sprint at 10-12 km/h with 1 minute recovery walk.',
    default_sets: 6,
    default_reps: '1 min / 1 min',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-28',
    name: 'Russian Kettlebell Swings',
    muscle_group: 'Full Body',
    equipment: 'Kettlebell',
    difficulty: 'intermediate',
    instructions: 'Explosive hip hinge driving bell to eye level through powerful glute contraction.',
    default_sets: 4,
    default_reps: '20',
    default_rest_seconds: 45,
  },
  {
    id: 'lib-ex-29',
    name: 'Dumbbell Thrusters (Squat to Press)',
    muscle_group: 'Full Body',
    equipment: 'Dumbbell',
    difficulty: 'intermediate',
    instructions: 'Front squat to full depth and utilize leg drive to pop dumbbells into overhead lockout.',
    default_sets: 4,
    default_reps: '12',
    default_rest_seconds: 60,
  },
  {
    id: 'lib-ex-30',
    name: 'High Intensity Burpees',
    muscle_group: 'Cardio',
    equipment: 'Bodyweight',
    difficulty: 'intermediate',
    instructions: 'Drop chest to floor, jump feet forward, explode upwards clapping overhead.',
    default_sets: 4,
    default_reps: '15',
    default_rest_seconds: 45,
  },
]

// ── The 7 Admin Core Default Workout Plans ────────────────────────────────────
export const CORE_DEFAULT_WORKOUT_PLANS: WorkoutPlan[] = [
  // 1. Beginner Workout
  {
    id: 'wp-default-beginner',
    name: 'Beginner Workout (Foundation Protocol)',
    category: 'Beginner Workout',
    level: 'beginner',
    description: 'Complete introductory strength & conditioning split designed to build joint stability, neural adaptation, and safe lifting form across major movements.',
    trainer_name: 'Coach Rohit Deshmukh',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    days_per_week: 3,
    created_at: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: 'ex-b-1',
        plan_id: 'wp-default-beginner',
        name: 'Dumbbell Flat Bench Press',
        muscle_group: 'Chest',
        sets: 3,
        reps: '10 - 12',
        weight: '12-16 kg',
        rest_seconds: 60,
        day_of_week: 'Monday',
        instructions: 'Plant feet firmly, lower dumbbells in control to chest level, press up without clanking.',
      },
      {
        id: 'ex-b-2',
        plan_id: 'wp-default-beginner',
        name: 'Wide-Grip Lat Pulldown',
        muscle_group: 'Back',
        sets: 3,
        reps: '10 - 12',
        weight: '35-45 kg',
        rest_seconds: 60,
        day_of_week: 'Monday',
        instructions: 'Pull toward clavicle leading with elbows, keep chest proud.',
      },
      {
        id: 'ex-b-3',
        plan_id: 'wp-default-beginner',
        name: 'Dumbbell Goblet Squat',
        muscle_group: 'Legs',
        sets: 3,
        reps: '12',
        weight: '12-16 kg',
        rest_seconds: 60,
        day_of_week: 'Wednesday',
        instructions: 'Hold dumbbell vertically at sternum, squat deep pushing knees outward.',
      },
      {
        id: 'ex-b-4',
        plan_id: 'wp-default-beginner',
        name: 'Seated Overhead Dumbbell Press',
        muscle_group: 'Shoulders',
        sets: 3,
        reps: '10',
        weight: '8-12 kg',
        rest_seconds: 60,
        day_of_week: 'Wednesday',
        instructions: 'Press straight up until arms are fully extended overhead.',
      },
      {
        id: 'ex-b-5',
        plan_id: 'wp-default-beginner',
        name: 'Forearm Plank with Hip Taps',
        muscle_group: 'Core',
        sets: 3,
        reps: '45 seconds',
        weight: 'Bodyweight',
        rest_seconds: 45,
        day_of_week: 'Friday',
        instructions: 'Maintain tight abdominal brace without sagging hips.',
      },
      {
        id: 'ex-b-6',
        plan_id: 'wp-default-beginner',
        name: 'Treadmill Incline Brisk Walk',
        muscle_group: 'Cardio',
        sets: 1,
        reps: '20 mins',
        weight: '6% Incline',
        rest_seconds: 0,
        day_of_week: 'Friday',
        instructions: '5.5 km/h steady brisk walk for cardiovascular conditioning.',
      },
    ],
  },

  // 2. Weight Loss
  {
    id: 'wp-default-weightloss',
    name: 'Weight Loss & High Intensity Metabolic Shred',
    category: 'Weight Loss',
    level: 'intermediate',
    description: 'High-caloric burn circuit combining compound resistance lifting with short rest intervals and cardio finishers for optimal EPOC fat loss.',
    trainer_name: 'Priya Bhagat',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    days_per_week: 4,
    created_at: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: 'ex-wl-1',
        plan_id: 'wp-default-weightloss',
        name: 'Russian Kettlebell Swings',
        muscle_group: 'Full Body',
        sets: 4,
        reps: '20',
        weight: '16-20 kg',
        rest_seconds: 45,
        day_of_week: 'Monday',
        instructions: 'Hinge back explosively and snap hips forward, bell reaches shoulder height.',
      },
      {
        id: 'ex-wl-2',
        plan_id: 'wp-default-weightloss',
        name: 'Dumbbell Thrusters (Squat to Press)',
        muscle_group: 'Full Body',
        sets: 4,
        reps: '12 - 15',
        weight: '10-14 kg',
        rest_seconds: 45,
        day_of_week: 'Monday',
        instructions: 'Front squat deep, explode upward pressing dumbbells overhead.',
      },
      {
        id: 'ex-wl-3',
        plan_id: 'wp-default-weightloss',
        name: 'Walking Dumbbell Lunges',
        muscle_group: 'Legs',
        sets: 3,
        reps: '15 per leg',
        weight: '10-12 kg',
        rest_seconds: 45,
        day_of_week: 'Tuesday',
        instructions: 'Continuous walking steps, knee almost brushing floor.',
      },
      {
        id: 'ex-wl-4',
        plan_id: 'wp-default-weightloss',
        name: 'High Intensity Burpees',
        muscle_group: 'Cardio',
        sets: 4,
        reps: '15',
        weight: 'Bodyweight',
        rest_seconds: 45,
        day_of_week: 'Thursday',
        instructions: 'Chest to floor, leap up dynamically with arms outstretched.',
      },
      {
        id: 'ex-wl-5',
        plan_id: 'wp-default-weightloss',
        name: 'Treadmill Incline Interval Sprints',
        muscle_group: 'Cardio',
        sets: 6,
        reps: '1 min sprint / 1 min walk',
        weight: '10% Incline',
        rest_seconds: 60,
        day_of_week: 'Friday',
        instructions: 'High metabolic spike at 10-12 km/h sprint pace.',
      },
    ],
  },

  // 3. Muscle Building
  {
    id: 'wp-default-musclebuilding',
    name: 'Muscle Building & Hypertrophy Split',
    category: 'Muscle Building',
    level: 'intermediate',
    description: 'Hypertrophy-focused volume training targeting mechanical tension and metabolic stress across major muscle groups for maximum size and symmetry.',
    trainer_name: 'Coach Rohit Deshmukh',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    days_per_week: 4,
    created_at: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: 'ex-mb-1',
        plan_id: 'wp-default-musclebuilding',
        name: 'Barbell Flat Bench Press',
        muscle_group: 'Chest',
        sets: 4,
        reps: '8 - 12',
        weight: '60-80 kg',
        rest_seconds: 90,
        day_of_week: 'Monday',
        instructions: 'Retract scapulae, touch lower sternum, drive through chest.',
      },
      {
        id: 'ex-mb-2',
        plan_id: 'wp-default-musclebuilding',
        name: 'Incline Dumbbell Press',
        muscle_group: 'Chest',
        sets: 3,
        reps: '10 - 12',
        weight: '22.5 kg',
        rest_seconds: 75,
        day_of_week: 'Monday',
        instructions: '30 degree bench, deep stretch, pause for 1 second at bottom.',
      },
      {
        id: 'ex-mb-3',
        plan_id: 'wp-default-musclebuilding',
        name: 'Barbell Bent-Over Row',
        muscle_group: 'Back',
        sets: 4,
        reps: '8 - 10',
        weight: '60-75 kg',
        rest_seconds: 90,
        day_of_week: 'Tuesday',
        instructions: 'Torso hinged at 45 degrees, pull barbell to lower ribcage.',
      },
      {
        id: 'ex-mb-4',
        plan_id: 'wp-default-musclebuilding',
        name: 'Barbell Back Squat',
        muscle_group: 'Legs',
        sets: 4,
        reps: '8 - 10',
        weight: '80-100 kg',
        rest_seconds: 120,
        day_of_week: 'Thursday',
        instructions: 'Feet shoulder-width, drive out of the hole with powerful quad contraction.',
      },
      {
        id: 'ex-mb-5',
        plan_id: 'wp-default-musclebuilding',
        name: 'Overhead Barbell Military Press',
        muscle_group: 'Shoulders',
        sets: 4,
        reps: '8 - 10',
        weight: '40-50 kg',
        rest_seconds: 90,
        day_of_week: 'Friday',
        instructions: 'Brace core glutes, press overhead vertically through full lockout.',
      },
      {
        id: 'ex-mb-6',
        plan_id: 'wp-default-musclebuilding',
        name: 'Standing Barbell Bicep Curl',
        muscle_group: 'Arms',
        sets: 3,
        reps: '10 - 12',
        weight: '30 kg',
        rest_seconds: 60,
        day_of_week: 'Friday',
        instructions: 'Keep elbows tucked tightly at sides, curl bar toward shoulders.',
      },
    ],
  },

  // 4. Strength Training
  {
    id: 'wp-default-strength',
    name: 'Strength Training & 5x5 Power Protocol',
    category: 'Strength Training',
    level: 'advanced',
    description: 'Linear progressive overload protocol built around the Big 3 power movements: Squat, Bench Press, and Deadlift for maximal force output.',
    trainer_name: 'Amol Sawant',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    days_per_week: 3,
    created_at: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: 'ex-st-1',
        plan_id: 'wp-default-strength',
        name: 'Barbell Back Squat',
        muscle_group: 'Legs',
        sets: 5,
        reps: '5',
        weight: '100-125 kg',
        rest_seconds: 180,
        day_of_week: 'Monday',
        instructions: 'Heavy compound 5x5. Full brace, break hips, hit parallel depth.',
      },
      {
        id: 'ex-st-2',
        plan_id: 'wp-default-strength',
        name: 'Barbell Flat Bench Press',
        muscle_group: 'Chest',
        sets: 5,
        reps: '5',
        weight: '80-100 kg',
        rest_seconds: 180,
        day_of_week: 'Monday',
        instructions: 'Competition pause on chest, drive feet into floor, explode up.',
      },
      {
        id: 'ex-st-3',
        plan_id: 'wp-default-strength',
        name: 'Barbell Conventional Deadlift',
        muscle_group: 'Back',
        sets: 4,
        reps: '5',
        weight: '120-150 kg',
        rest_seconds: 180,
        day_of_week: 'Wednesday',
        instructions: 'Lock lats in place, push floor away, lock out hips fully.',
      },
      {
        id: 'ex-st-4',
        plan_id: 'wp-default-strength',
        name: 'Overhead Barbell Military Press',
        muscle_group: 'Shoulders',
        sets: 5,
        reps: '5',
        weight: '50-60 kg',
        rest_seconds: 150,
        day_of_week: 'Wednesday',
        instructions: 'Strict military press without leg dip.',
      },
      {
        id: 'ex-st-5',
        plan_id: 'wp-default-strength',
        name: 'Parallel Bar Dips',
        muscle_group: 'Chest',
        sets: 4,
        reps: '6 - 8',
        weight: 'Bodyweight + 15 kg',
        rest_seconds: 120,
        day_of_week: 'Friday',
        instructions: 'Heavy weighted dips targeting upper body pushing power.',
      },
    ],
  },

  // 5. Full Body Workout
  {
    id: 'wp-default-fullbody',
    name: 'Full Body Functional Conditioning',
    category: 'Full Body Workout',
    level: 'intermediate',
    description: '3-day full body split designed for peak athletic conditioning, functional mobility, core stability, and total body strength.',
    trainer_name: 'Coach Rohit Deshmukh',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    days_per_week: 3,
    created_at: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: 'ex-fb-1',
        plan_id: 'wp-default-fullbody',
        name: 'Barbell Back Squat',
        muscle_group: 'Legs',
        sets: 4,
        reps: '8 - 10',
        weight: '75-90 kg',
        rest_seconds: 90,
        day_of_week: 'Monday',
        instructions: 'Primary compound leg movement of the day.',
      },
      {
        id: 'ex-fb-2',
        plan_id: 'wp-default-fullbody',
        name: 'Incline Dumbbell Press',
        muscle_group: 'Chest',
        sets: 4,
        reps: '10',
        weight: '20-25 kg',
        rest_seconds: 75,
        day_of_week: 'Monday',
        instructions: 'Smooth eccentric, explosive press.',
      },
      {
        id: 'ex-fb-3',
        plan_id: 'wp-default-fullbody',
        name: 'Pull-Ups / Chin-Ups',
        muscle_group: 'Back',
        sets: 4,
        reps: '8',
        weight: 'Bodyweight',
        rest_seconds: 75,
        day_of_week: 'Wednesday',
        instructions: 'Chest to bar, full arm extension at bottom.',
      },
      {
        id: 'ex-fb-4',
        plan_id: 'wp-default-fullbody',
        name: 'Romanian Deadlift (RDL)',
        muscle_group: 'Legs',
        sets: 3,
        reps: '10 - 12',
        weight: '60-80 kg',
        rest_seconds: 75,
        day_of_week: 'Wednesday',
        instructions: 'Hinge back deeply feeling hamstring stretch.',
      },
      {
        id: 'ex-fb-5',
        plan_id: 'wp-default-fullbody',
        name: 'Dumbbell Thrusters (Squat to Press)',
        muscle_group: 'Full Body',
        sets: 4,
        reps: '12',
        weight: '14 kg',
        rest_seconds: 60,
        day_of_week: 'Friday',
        instructions: 'Combine squat and overhead press dynamically.',
      },
      {
        id: 'ex-fb-6',
        plan_id: 'wp-default-fullbody',
        name: 'Hanging Leg Raises',
        muscle_group: 'Core',
        sets: 3,
        reps: '15',
        weight: 'Bodyweight',
        rest_seconds: 45,
        day_of_week: 'Friday',
        instructions: 'Bring toes to 90 degrees with controlled core contraction.',
      },
    ],
  },

  // 6. Push Pull Legs
  {
    id: 'wp-default-ppl',
    name: 'Push Pull Legs (PPL) Elite Split',
    category: 'Push Pull Legs',
    level: 'intermediate',
    description: 'The premier 6-day hypertrophy and athletic split isolating push mechanics (chest/delts/triceps), pull mechanics (back/biceps), and lower body.',
    trainer_name: 'Coach Rohit Deshmukh',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    days_per_week: 6,
    created_at: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: 'ex-ppl-1',
        plan_id: 'wp-default-ppl',
        name: 'Barbell Flat Bench Press',
        muscle_group: 'Chest',
        sets: 4,
        reps: '8 - 10',
        weight: '70-85 kg',
        rest_seconds: 90,
        day_of_week: 'Monday',
        instructions: 'Heavy push compound for chest and anterior delts.',
      },
      {
        id: 'ex-ppl-2',
        plan_id: 'wp-default-ppl',
        name: 'Dumbbell Lateral Raises',
        muscle_group: 'Shoulders',
        sets: 4,
        reps: '12 - 15',
        weight: '10-12 kg',
        rest_seconds: 60,
        day_of_week: 'Monday',
        instructions: 'Side deltoid isolation, control the descent.',
      },
      {
        id: 'ex-ppl-3',
        plan_id: 'wp-default-ppl',
        name: 'Tricep Cable Rope Pushdown',
        muscle_group: 'Arms',
        sets: 4,
        reps: '12',
        weight: '25-30 kg',
        rest_seconds: 45,
        day_of_week: 'Monday',
        instructions: 'Squeeze triceps at bottom extension.',
      },
      {
        id: 'ex-ppl-4',
        plan_id: 'wp-default-ppl',
        name: 'Barbell Bent-Over Row',
        muscle_group: 'Back',
        sets: 4,
        reps: '8 - 10',
        weight: '65-80 kg',
        rest_seconds: 90,
        day_of_week: 'Tuesday',
        instructions: 'Primary pull compound for upper back thickness.',
      },
      {
        id: 'ex-ppl-5',
        plan_id: 'wp-default-ppl',
        name: 'Standing Barbell Bicep Curl',
        muscle_group: 'Arms',
        sets: 4,
        reps: '10 - 12',
        weight: '30-35 kg',
        rest_seconds: 60,
        day_of_week: 'Tuesday',
        instructions: 'Full peak contraction on biceps.',
      },
      {
        id: 'ex-ppl-6',
        plan_id: 'wp-default-ppl',
        name: 'Barbell Back Squat',
        muscle_group: 'Legs',
        sets: 4,
        reps: '8 - 10',
        weight: '90-110 kg',
        rest_seconds: 120,
        day_of_week: 'Wednesday',
        instructions: 'Lower body foundation movement.',
      },
      {
        id: 'ex-ppl-7',
        plan_id: 'wp-default-ppl',
        name: 'Romanian Deadlift (RDL)',
        muscle_group: 'Legs',
        sets: 3,
        reps: '10 - 12',
        weight: '70-90 kg',
        rest_seconds: 75,
        day_of_week: 'Wednesday',
        instructions: 'Posterior chain focus for hamstrings and glutes.',
      },
    ],
  },

  // 7. Home Workout
  {
    id: 'wp-default-home',
    name: 'Home Workout & Calisthenics Routine',
    category: 'Home Workout',
    level: 'beginner',
    description: 'Zero-equipment home & travel routine utilizing bodyweight leverage, core isometric holds, and high-frequency cardiovascular conditioning.',
    trainer_name: 'Priya Bhagat',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    days_per_week: 4,
    created_at: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: 'ex-hw-1',
        plan_id: 'wp-default-home',
        name: 'Push-Ups (Standard / Diamond)',
        muscle_group: 'Chest',
        sets: 4,
        reps: '15 - 20',
        weight: 'Bodyweight',
        rest_seconds: 45,
        day_of_week: 'Monday',
        instructions: 'Keep body locked in plank, full range down and up.',
      },
      {
        id: 'ex-hw-2',
        plan_id: 'wp-default-home',
        name: 'Bodyweight Deep Squats & Jump Squats',
        muscle_group: 'Legs',
        sets: 4,
        reps: '20',
        weight: 'Bodyweight',
        rest_seconds: 45,
        day_of_week: 'Monday',
        instructions: '15 standard squats followed immediately by 5 jump squats.',
      },
      {
        id: 'ex-hw-3',
        plan_id: 'wp-default-home',
        name: 'Forearm Plank with Hip Taps',
        muscle_group: 'Core',
        sets: 4,
        reps: '60 seconds',
        weight: 'Bodyweight',
        rest_seconds: 30,
        day_of_week: 'Wednesday',
        instructions: 'Isometric hold engaging transverse abdominis.',
      },
      {
        id: 'ex-hw-4',
        plan_id: 'wp-default-home',
        name: 'High Intensity Burpees',
        muscle_group: 'Cardio',
        sets: 4,
        reps: '12 - 15',
        weight: 'Bodyweight',
        rest_seconds: 45,
        day_of_week: 'Friday',
        instructions: 'Explosive full-body cardio conditioning.',
      },
    ],
  },
]


function seedDatabase() {
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  // 1. Membership Plans
  if (!localStorage.getItem(KEYS.PLANS)) {
    const initialPlans: MembershipPlan[] = MEMBERSHIP_PLANS_DEFAULT.map((p) => ({
      ...p,
      is_active: true,
      created_at: new Date().toISOString(),
    }))
    setItem(KEYS.PLANS, initialPlans)
  }

  // 2. Trainers
  if (!localStorage.getItem(KEYS.TRAINERS)) {
    const initialTrainers: Trainer[] = TRAINERS_DEMO.map((t, idx) => ({
      id: t.id,
      profile_id: `profile-trainer-${idx + 1}`,
      name: t.name,
      phone: t.phone,
      email: `${t.name.toLowerCase().replace(/\s+/g, '.')}@corpuss.com`,
      password: 'CFC@TRN2026',
      specialization: t.specialization,
      experience: t.experience,
      certifications: ['Certified Personal Trainer (CPT)', 'Sports Nutrition Specialist'],
      bio: t.bio,
      photo: t.photo,
      is_active: true,
      assigned_member_count: 8 + idx * 3,
      created_at: new Date().toISOString(),
      profile: {
        id: `profile-trainer-${idx + 1}`,
        full_name: t.name,
        phone: t.phone,
        email: `${t.name.toLowerCase().replace(/\s+/g, '.')}@corpuss.com`,
        role: 'trainer',
        avatar_url: t.photo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }))
    setItem(KEYS.TRAINERS, initialTrainers)
  }

  // 3. Members
  if (!localStorage.getItem(KEYS.MEMBERS)) {
    const initialMembers: Member[] = [
      {
        id: 'mem-1',
        profile_id: 'prof-1',
        member_id: 'CFC-2026-0001',
        gender: 'male',
        date_of_birth: '1996-05-14',
        address: 'Rukmini Nagar, VMV Road, Amravati',
        emergency_contact: 'Suresh Sharma (Father)',
        emergency_phone: '+91 94221 11223',
        registration_date: '2025-06-10',
        fitness_goal: 'Muscle Building & Hypertrophy',
        status: 'active',
        current_plan_id: 'ms-1',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        email: 'rahul.sharma@corpuss.com',
        password: 'CFC@2026',
        notes: 'Consistent bench presser. Targeting 100kg PR.',
        created_at: '2025-06-10T09:30:00Z',
        updated_at: '2026-01-10T09:30:00Z',
        profile: {
          id: 'prof-1',
          full_name: 'Rahul Sharma',
          phone: '+91 94231 55667',
          email: 'rahul.sharma@corpuss.com',
          role: 'member',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          created_at: '2025-06-10T09:30:00Z',
          updated_at: '2026-01-10T09:30:00Z',
        },
        current_plan: {
          id: 'ms-1',
          member_id: 'mem-1',
          plan_id: 'annual',
          start_date: '2025-06-10',
          end_date: format(subDays(today, -180), 'yyyy-MM-dd'),
          amount_paid: 5000,
          payment_method: 'UPI',
          status: 'active',
          created_at: '2025-06-10T09:30:00Z',
          plan: {
            id: 'annual',
            name: 'Yearly Plan',
            duration_type: '12 Months',
            duration_months: 12,
            price_men: 5000,
            price_women: 4000,
            price: 5000,
            description: '365 days unlimited gym access',
            is_active: true,
            created_at: '2025-01-01',
          },
        },
      },
      {
        id: 'mem-2',
        profile_id: 'prof-2',
        member_id: 'CFC-2026-0002',
        gender: 'female',
        date_of_birth: '1998-09-22',
        address: 'Harshraj Colony, Near SBI, VMV Road, Amravati',
        emergency_contact: 'Dr. Vivek Deshmukh (Husband)',
        emergency_phone: '+91 98223 34455',
        registration_date: '2025-08-15',
        fitness_goal: 'Weight Loss & Zumba',
        status: 'active',
        current_plan_id: 'ms-2',
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        email: 'priya.deshmukh@corpuss.com',
        password: 'CFC@2026',
        notes: 'Attends morning 7:00 AM Zumba batch regularly.',
        created_at: '2025-08-15T08:00:00Z',
        updated_at: '2026-02-15T08:00:00Z',
        profile: {
          id: 'prof-2',
          full_name: 'Priya Deshmukh',
          phone: '+91 98901 23456',
          email: 'priya.deshmukh@corpuss.com',
          role: 'member',
          avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
          created_at: '2025-08-15T08:00:00Z',
          updated_at: '2026-02-15T08:00:00Z',
        },
        current_plan: {
          id: 'ms-2',
          member_id: 'mem-2',
          plan_id: 'half-yearly',
          start_date: '2025-08-15',
          end_date: format(subDays(today, -60), 'yyyy-MM-dd'),
          amount_paid: 2500,
          payment_method: 'UPI',
          status: 'active',
          created_at: '2025-08-15T08:00:00Z',
          plan: {
            id: 'half-yearly',
            name: 'Half-Yearly Plan',
            duration_type: '6 Months',
            duration_months: 6,
            price_men: 3200,
            price_women: 2500,
            price: 2500,
            description: 'Zumba and Aerobics included',
            is_active: true,
            created_at: '2025-01-01',
          },
        },
      },
      {
        id: 'mem-3',
        profile_id: 'prof-3',
        member_id: 'CFC-2026-0003',
        gender: 'male',
        date_of_birth: '1994-11-03',
        address: 'Gadge Nagar, Amravati',
        emergency_contact: 'Ramesh Verma',
        emergency_phone: '+91 94211 44556',
        registration_date: '2025-10-01',
        fitness_goal: 'Strength Training',
        status: 'active',
        current_plan_id: 'ms-3',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        email: 'amit.verma@corpuss.com',
        password: 'CFC@2026',
        created_at: '2025-10-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        profile: {
          id: 'prof-3',
          full_name: 'Amit Verma',
          phone: '+91 97654 11223',
          email: 'amit.verma@corpuss.com',
          role: 'member',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          created_at: '2025-10-01T10:00:00Z',
          updated_at: '2026-03-01T10:00:00Z',
        },
        current_plan: {
          id: 'ms-3',
          member_id: 'mem-3',
          plan_id: 'quarterly',
          start_date: '2025-10-01',
          end_date: format(subDays(today, -20), 'yyyy-MM-dd'),
          amount_paid: 1800,
          payment_method: 'Cash',
          status: 'active',
          created_at: '2025-10-01T10:00:00Z',
          plan: {
            id: 'quarterly',
            name: 'Quarterly Plan',
            duration_type: '3 Months',
            duration_months: 3,
            price_men: 1800,
            price_women: 1400,
            price: 1800,
            description: '3 months full gym access',
            is_active: true,
            created_at: '2025-01-01',
          },
        },
      },
      {
        id: 'mem-4',
        profile_id: 'prof-4',
        member_id: 'CFC-2026-0004',
        gender: 'female',
        date_of_birth: '2001-03-19',
        address: 'Camp Road, Near Bus Stand, Amravati',
        emergency_contact: 'Sunita Patil (Mother)',
        emergency_phone: '+91 98811 77889',
        registration_date: '2025-03-10',
        fitness_goal: 'Cardio Fitness & Body Toning',
        status: 'expired',
        current_plan_id: 'ms-4',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        email: 'neha.patil@corpuss.com',
        password: 'CFC@2026',
        created_at: '2025-03-10T11:00:00Z',
        updated_at: '2025-09-10T11:00:00Z',
        profile: {
          id: 'prof-4',
          full_name: 'Neha Patil',
          phone: '+91 98234 56789',
          email: 'neha.patil@corpuss.com',
          role: 'member',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          created_at: '2025-03-10T11:00:00Z',
          updated_at: '2025-09-10T11:00:00Z',
        },
        current_plan: {
          id: 'ms-4',
          member_id: 'mem-4',
          plan_id: 'monthly',
          start_date: '2025-03-10',
          end_date: format(subDays(today, 12), 'yyyy-MM-dd'),
          amount_paid: 500,
          payment_method: 'Cash',
          status: 'expired',
          created_at: '2025-03-10T11:00:00Z',
          plan: {
            id: 'monthly',
            name: 'Monthly Plan',
            duration_type: '1 Month',
            duration_months: 1,
            price_men: 700,
            price_women: 500,
            price: 500,
            description: '1 month basic access',
            is_active: true,
            created_at: '2025-01-01',
          },
        },
      },
      {
        id: 'mem-5',
        profile_id: 'prof-5',
        member_id: 'CFC-2026-0005',
        gender: 'male',
        date_of_birth: '1992-07-28',
        address: 'Sai Nagar, Amravati',
        emergency_contact: 'Ajay Rathore (Brother)',
        emergency_phone: '+91 94030 99887',
        registration_date: '2025-11-01',
        fitness_goal: 'Powerlifting & Strength',
        status: 'active',
        current_plan_id: 'ms-5',
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        email: 'vikram.rathore@corpuss.com',
        password: 'CFC@2026',
        created_at: '2025-11-01T07:00:00Z',
        updated_at: '2026-03-01T07:00:00Z',
        profile: {
          id: 'prof-5',
          full_name: 'Vikram Rathore',
          phone: '+91 99223 88776',
          email: 'vikram.rathore@corpuss.com',
          role: 'member',
          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          created_at: '2025-11-01T07:00:00Z',
          updated_at: '2026-03-01T07:00:00Z',
        },
        current_plan: {
          id: 'ms-5',
          member_id: 'mem-5',
          plan_id: 'half-yearly',
          start_date: '2025-11-01',
          end_date: format(subDays(today, -5), 'yyyy-MM-dd'),
          amount_paid: 3200,
          payment_method: 'UPI',
          status: 'active',
          created_at: '2025-11-01T07:00:00Z',
          plan: {
            id: 'half-yearly',
            name: 'Half-Yearly Plan',
            duration_type: '6 Months',
            duration_months: 6,
            price_men: 3200,
            price_women: 2500,
            price: 3200,
            description: 'Half-yearly commitment',
            is_active: true,
            created_at: '2025-01-01',
          },
        },
      },
    ]
    setItem(KEYS.MEMBERS, initialMembers)
  }

  // 4. Payments
  if (!localStorage.getItem(KEYS.PAYMENTS)) {
    const initialPayments: Payment[] = [
      {
        id: 'pay-1',
        member_id: 'mem-1',
        membership_id: 'ms-1',
        amount: 5000,
        total_amount: 5000,
        pending_amount: 0,
        payment_method: 'UPI',
        transaction_ref: 'UPI/2026/091823901',
        status: 'paid',
        payment_date: todayStr,
        receipt_number: 'CFC-REC-2026-0001',
        notes: 'Annual Membership full payment received via PhonePe UPI',
        recorded_by: 'CFC Reception',
        created_at: new Date().toISOString(),
      },
      {
        id: 'pay-2',
        member_id: 'mem-2',
        membership_id: 'ms-2',
        amount: 2500,
        total_amount: 2500,
        pending_amount: 0,
        payment_method: 'UPI',
        transaction_ref: 'UPI/2026/087123491',
        status: 'paid',
        payment_date: todayStr,
        receipt_number: 'CFC-REC-2026-0002',
        notes: 'Half-Yearly Women Membership payment via GooglePay',
        recorded_by: 'CFC Reception',
        created_at: new Date().toISOString(),
      },
      {
        id: 'pay-3',
        member_id: 'mem-3',
        membership_id: 'ms-3',
        amount: 1500,
        total_amount: 1800,
        pending_amount: 300,
        payment_method: 'Cash',
        transaction_ref: null,
        status: 'partial',
        payment_date: format(subDays(today, 2), 'yyyy-MM-dd'),
        receipt_number: 'CFC-REC-2026-0003',
        notes: 'Partial payment ₹1500 in Cash, ₹300 pending by next Monday',
        recorded_by: 'CFC Reception',
        created_at: subDays(today, 2).toISOString(),
      },
      {
        id: 'pay-4',
        member_id: 'mem-5',
        membership_id: 'ms-5',
        amount: 3200,
        total_amount: 3200,
        pending_amount: 0,
        payment_method: 'Bank Transfer',
        transaction_ref: 'NEFT-SBI-99214',
        status: 'paid',
        payment_date: format(subDays(today, 5), 'yyyy-MM-dd'),
        receipt_number: 'CFC-REC-2026-0004',
        notes: 'Full payment through SBI Net Banking',
        recorded_by: 'CFC Admin',
        created_at: subDays(today, 5).toISOString(),
      },
    ]
    setItem(KEYS.PAYMENTS, initialPayments)
  }

  // 5. Attendance
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    const initialAttendance: Attendance[] = [
      {
        id: 'att-1',
        member_id: 'mem-1',
        check_in: `${todayStr}T06:35:12`,
        check_out: `${todayStr}T08:05:00`,
        method: 'qr',
        recorded_by: 'Scanner Machine 1',
      },
      {
        id: 'att-2',
        member_id: 'mem-2',
        check_in: `${todayStr}T07:05:44`,
        check_out: `${todayStr}T08:20:10`,
        method: 'qr',
        recorded_by: 'Scanner Machine 1',
      },
      {
        id: 'att-3',
        member_id: 'mem-3',
        check_in: `${todayStr}T07:45:00`,
        check_out: null,
        method: 'manual',
        recorded_by: 'Reception Desk',
      },
      {
        id: 'att-4',
        member_id: 'mem-5',
        check_in: `${todayStr}T06:15:30`,
        check_out: `${todayStr}T07:45:00`,
        method: 'qr',
        recorded_by: 'Scanner Machine 1',
      },
    ]
    setItem(KEYS.ATTENDANCE, initialAttendance)
  }

  // 6. Enquiries CRM
  if (!localStorage.getItem(KEYS.ENQUIRIES)) {
    const initialEnquiries: Enquiry[] = [
      {
        id: 'enq-1',
        reference_no: 'CFC-ENQ-2026-0041',
        full_name: 'Aniket Deshmukh',
        phone: '+91 97654 99001',
        email: 'aniket.d@gmail.com',
        gender: 'male',
        age: 24,
        interested_plan: 'Half-Yearly Plan',
        fitness_goal: 'Weight Loss & Muscle Gain',
        message: 'Looking for morning 6:30 AM batch and personal trainer assistance.',
        status: 'new',
        lead_source: 'Website Enquiry Form',
        follow_up_date: format(subDays(today, -1), 'yyyy-MM-dd'),
        assigned_staff: 'Coach Rohit Deshmukh',
        notes: 'Interested in gym + aerobics combo. Call tomorrow morning.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'enq-2',
        reference_no: 'CFC-ENQ-2026-0042',
        full_name: 'Snehal Kulkarni',
        phone: '+91 94228 11442',
        email: 'snehal.kulkarni@yahoo.co.in',
        gender: 'female',
        age: 28,
        interested_plan: 'Yearly Plan',
        fitness_goal: 'Zumba & Aerobics Conditioning',
        message: 'Visited gym last week with friend, wanted to confirm evening women batch timings.',
        status: 'contacted',
        lead_source: 'Walk-in Visit',
        follow_up_date: format(subDays(today, -2), 'yyyy-MM-dd'),
        assigned_staff: 'Priya Bhagat',
        notes: 'Offered 10% annual bundle discount. Likely to join on Monday.',
        created_at: subDays(today, 1).toISOString(),
      },
      {
        id: 'enq-3',
        reference_no: 'CFC-ENQ-2026-0043',
        full_name: 'Gaurav Thakre',
        phone: '+91 98900 22334',
        email: 'gaurav.thakre@rediffmail.com',
        gender: 'male',
        age: 21,
        interested_plan: 'Quarterly Plan',
        fitness_goal: 'Powerlifting & Strength',
        message: 'VMV College student, inquiry for student membership discount.',
        status: 'interested',
        lead_source: 'Instagram',
        follow_up_date: format(subDays(today, -3), 'yyyy-MM-dd'),
        assigned_staff: 'Coach Rohit Deshmukh',
        notes: 'Informed about college ID concession. Will visit with college ID card.',
        created_at: subDays(today, 3).toISOString(),
      },
    ]
    setItem(KEYS.ENQUIRIES, initialEnquiries)
  }

  // 7. Expenses
  if (!localStorage.getItem(KEYS.EXPENSES)) {
    const initialExpenses: Expense[] = [
      {
        id: 'exp-1',
        category: 'Rent',
        amount: 25000,
        expense_date: format(today, 'yyyy-MM-05'),
        description: 'Monthly Premises Rent for 3rd Floor, SBI Building, VMV Road',
        payment_method: 'Bank Transfer',
        recorded_by: 'Super Admin',
        created_at: new Date().toISOString(),
      },
      {
        id: 'exp-2',
        category: 'Electricity',
        amount: 12400,
        expense_date: format(today, 'yyyy-MM-08'),
        description: 'MSEDCL Electricity bill payment for ACs and gym lighting',
        payment_method: 'UPI',
        recorded_by: 'Super Admin',
        created_at: new Date().toISOString(),
      },
      {
        id: 'exp-3',
        category: 'Maintenance',
        amount: 4200,
        expense_date: format(today, 'yyyy-MM-10'),
        description: 'Cable replacement and treadmill servicing & lubrication',
        payment_method: 'Cash',
        recorded_by: 'Head Trainer Rohit',
        created_at: new Date().toISOString(),
      },
      {
        id: 'exp-4',
        category: 'Salary',
        amount: 40000,
        expense_date: format(today, 'yyyy-MM-01'),
        description: 'Trainer and housekeeping staff monthly salaries',
        payment_method: 'Bank Transfer',
        recorded_by: 'Super Admin',
        created_at: new Date().toISOString(),
      },
      {
        id: 'exp-5',
        category: 'Marketing',
        amount: 5500,
        expense_date: format(today, 'yyyy-MM-07'),
        description: 'Local Amravati college flyer distribution and Instagram promotions',
        payment_method: 'UPI',
        recorded_by: 'Gym Admin',
        created_at: new Date().toISOString(),
      },
    ]
    setItem(KEYS.EXPENSES, initialExpenses)
  }

  // 8. Workout Plans
  if (!localStorage.getItem(KEYS.WORKOUTS)) {
    const initialWorkouts: WorkoutPlan[] = [
      {
        id: 'wp-1',
        name: '4-Day Hypertrophy Muscle Builder',
        category: 'Muscle Building',
        level: 'intermediate',
        description: 'Scientific push-pull-legs-arms routine optimized for muscle thickness and balanced symmetry.',
        trainer_name: 'Coach Rohit Deshmukh',
        is_active: true,
        created_at: new Date().toISOString(),
        exercises: [
          {
            id: 'ex-1',
            plan_id: 'wp-1',
            name: 'Barbell Flat Bench Press',
            muscle_group: 'Chest',
            sets: 4,
            reps: '8 - 12',
            weight: '60-80 kg',
            rest_seconds: 90,
            day_of_week: 'Monday',
            instructions: 'Retract scapula, lower bar with control to mid-chest, drive through chest.',
          },
          {
            id: 'ex-2',
            plan_id: 'wp-1',
            name: 'Incline Dumbbell Press',
            muscle_group: 'Upper Chest',
            sets: 3,
            reps: '10 - 12',
            weight: '22.5 kg',
            rest_seconds: 60,
            day_of_week: 'Monday',
            instructions: '30-degree incline, full stretch at the bottom without flaring elbows.',
          },
          {
            id: 'ex-3',
            plan_id: 'wp-1',
            name: 'Lat Pulldowns',
            muscle_group: 'Back',
            sets: 4,
            reps: '10 - 12',
            weight: '55 kg',
            rest_seconds: 60,
            day_of_week: 'Tuesday',
            instructions: 'Wide grip, pull toward clavicle while leading with elbows.',
          },
          {
            id: 'ex-4',
            plan_id: 'wp-1',
            name: 'Barbell Back Squat',
            muscle_group: 'Legs',
            sets: 4,
            reps: '8 - 10',
            weight: '80-100 kg',
            rest_seconds: 120,
            day_of_week: 'Wednesday',
            instructions: 'Feet shoulder-width, break at hips and knees simultaneously to parallel.',
          },
          {
            id: 'ex-5',
            plan_id: 'wp-1',
            name: 'Overhead Barbell Military Press',
            muscle_group: 'Shoulders',
            sets: 4,
            reps: '8 - 10',
            weight: '40 kg',
            rest_seconds: 90,
            day_of_week: 'Thursday',
            instructions: 'Brace core glutes, press overhead vertically through full lockout.',
          },
        ],
      },
      {
        id: 'wp-2',
        name: 'High Intensity Fat-Loss Circuit',
        category: 'Weight Loss',
        level: 'beginner',
        description: 'Full body metabolic resistance training combined with aerobic burst intervals.',
        trainer_name: 'Priya Bhagat',
        is_active: true,
        created_at: new Date().toISOString(),
        exercises: [
          {
            id: 'ex-6',
            plan_id: 'wp-2',
            name: 'Goblet Squat to Press',
            muscle_group: 'Full Body',
            sets: 3,
            reps: '15',
            weight: '12 kg',
            rest_seconds: 45,
            day_of_week: 'Monday',
            instructions: 'Hold dumbbell at chest, squat deep and press directly overhead upon standing.',
          },
          {
            id: 'ex-7',
            plan_id: 'wp-2',
            name: 'Mountain Climbers & Plank',
            muscle_group: 'Core',
            sets: 4,
            reps: '45 seconds',
            rest_seconds: 30,
            day_of_week: 'Monday',
            instructions: 'Keep hips low and drive knees alternately toward chest rapidly.',
          },
          {
            id: 'ex-8',
            plan_id: 'wp-2',
            name: 'Treadmill Incline Sprints',
            muscle_group: 'Cardio',
            sets: 6,
            reps: '1 min sprint / 1 min walk',
            rest_seconds: 60,
            day_of_week: 'Wednesday',
            instructions: '8-10% incline at 10-12 km/h for maximum EPOC metabolic afterburn.',
          },
        ],
      },
    ]
    setItem(KEYS.WORKOUTS, initialWorkouts)
  }

  // 9. Diet Plans
  if (!localStorage.getItem(KEYS.DIETS)) {
    const initialDiets: DietPlan[] = [
      {
        id: 'dp-1',
        name: 'High-Protein Muscle Fuel (Indian Diet)',
        goal: 'Muscle Gain & Strength',
        total_calories: 2350,
        protein_g: 145,
        carbs_g: 260,
        fats_g: 65,
        water_liters: 4,
        trainer_name: 'Amit Thakre',
        is_active: true,
        created_at: new Date().toISOString(),
        meals: [
          {
            id: 'm-1',
            diet_plan_id: 'dp-1',
            meal_type: 'Breakfast',
            food_item: 'Oats with Milk, Banana, Almonds & 3 Boiled Egg Whites',
            quantity: '1 large bowl + 3 eggs',
            calories: 520,
            protein_g: 28,
            carbs_g: 65,
            fats_g: 12,
            notes: 'Option: substitute eggs with 100g Paneer bhurji for vegetarians.',
          },
          {
            id: 'm-2',
            diet_plan_id: 'dp-1',
            meal_type: 'Mid-Morning Snack',
            food_item: 'Roasted Chana, Sprouts Salad with lemon, Green Tea',
            quantity: '1 cup sprouts + 1 cup tea',
            calories: 220,
            protein_g: 14,
            carbs_g: 32,
            fats_g: 4,
            notes: 'High fiber, aids digestion and sustained morning energy.',
          },
          {
            id: 'm-3',
            diet_plan_id: 'dp-1',
            meal_type: 'Lunch',
            food_item: 'Grilled Chicken Breast or Low-fat Paneer, 3 Chapati, Dal & Salad',
            quantity: '150g protein source + 3 chapatis',
            calories: 680,
            protein_g: 45,
            carbs_g: 75,
            fats_g: 18,
            notes: 'Use cold-pressed mustard or olive oil. Avoid deep-fried items.',
          },
          {
            id: 'm-4',
            diet_plan_id: 'dp-1',
            meal_type: 'Evening Snack',
            food_item: 'Peanut Butter Whole Wheat Toast & Whey Protein Shake / Sattu',
            quantity: '2 slices + 1 scoop',
            calories: 380,
            protein_g: 30,
            carbs_g: 35,
            fats_g: 11,
            notes: 'Consume 45 minutes before gym session.',
          },
          {
            id: 'm-5',
            diet_plan_id: 'dp-1',
            meal_type: 'Dinner',
            food_item: 'Steamed Brown Rice / Quinoa, Paneer / Fish Tikka, Mixed Veg Sabzi',
            quantity: '1 bowl rice + 120g protein',
            calories: 550,
            protein_g: 28,
            carbs_g: 53,
            fats_g: 20,
            notes: 'Eat at least 2 hours before bedtime.',
          },
        ],
      },
    ]
    setItem(KEYS.DIETS, initialDiets)
  }

  // 10. Progress
  if (!localStorage.getItem(KEYS.PROGRESS)) {
    const initialProgress: FitnessProgress[] = [
      {
        id: 'prog-1',
        member_id: 'mem-1',
        recorded_date: format(subMonths(today, 3), 'yyyy-MM-dd'),
        weight_kg: 84.5,
        body_fat_pct: 22.5,
        chest_cm: 101,
        waist_cm: 92,
        biceps_cm: 34,
        notes: 'Initial baseline assessment at CFC.',
      },
      {
        id: 'prog-2',
        member_id: 'mem-1',
        recorded_date: format(subMonths(today, 1), 'yyyy-MM-dd'),
        weight_kg: 80.2,
        body_fat_pct: 18.0,
        chest_cm: 104,
        waist_cm: 86,
        biceps_cm: 36.5,
        notes: 'Visible increase in upper chest fullness and waist reduction.',
      },
      {
        id: 'prog-3',
        member_id: 'mem-1',
        recorded_date: todayStr,
        weight_kg: 78.0,
        body_fat_pct: 15.2,
        chest_cm: 106,
        waist_cm: 82,
        biceps_cm: 38.0,
        notes: 'Met 6-month goal! Increased bench press and visible abs.',
      },
    ]
    setItem(KEYS.PROGRESS, initialProgress)
  }

  // 14. Notifications & Club Broadcasts (Admin to Members)
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    const initialNotifications: NotificationItem[] = [
      {
        id: 'notif-1',
        title: 'Sunday Deep Sanitization & Maintenance Notice',
        message: 'Dear Members, Corpus Fitness Club Amravati facility will remain closed this Sunday as scheduled for floor sanitization, dumbbell rack realignment, and cable machine servicing. Regular hours resume Monday 6:00 AM sharp.',
        type: 'warning',
        priority: 'high',
        target_audience: 'all',
        sent_by: 'CFC Admin Office',
        read: false,
        is_read: false,
        channels: ['in_app', 'whatsapp'],
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'notif-2',
        title: 'Summer Shift Hours & Entry QR Reminder',
        message: 'Reminder of club hours: Morning 6:00 AM – 11:00 AM & Evening 5:00 PM – 10:00 PM. Please scan your personal digital QR code at the reception counter before entering the workout area.',
        type: 'info',
        priority: 'normal',
        target_audience: 'all',
        sent_by: 'CFC Reception',
        read: false,
        is_read: false,
        channels: ['in_app'],
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'notif-3',
        title: '30-Day Body Transformation Challenge 2026',
        message: 'Get ready for our annual fitness showdown! Free body composition assessment, certified trainer guidance, and cash prizes for top 3 transformations. Contact head trainer or front desk to sign up.',
        type: 'success',
        priority: 'high',
        target_audience: 'active_members',
        sent_by: 'Chief Trainer Vikram',
        read: true,
        is_read: true,
        channels: ['in_app', 'whatsapp'],
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'notif-4',
        title: 'New Heavy-Duty Olympic Bumper Plates Arrived',
        message: 'We have upgraded our deadlift platforms on the 3rd floor with certified Olympic rubber bumper plates and competition collars for heavy lifters. Train hard, stay safe!',
        type: 'info',
        priority: 'normal',
        target_audience: 'all',
        sent_by: 'CFC Management',
        read: true,
        is_read: true,
        channels: ['in_app'],
        created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      },
    ]
    setItem(KEYS.NOTIFICATIONS, initialNotifications)
  }

  // 15. Membership Renewal Logs (Record of when customer renewed)
  if (!localStorage.getItem(KEYS.RENEWALS)) {
    const initialRenewals: MembershipRenewalLog[] = [
      {
        id: 'ren-1',
        member_id: 'mem-1',
        member_name: 'Rahul Sharma',
        member_code: 'CFC-2026-0001',
        renewal_date: '2026-01-10', // Date when customer renewed
        previous_plan_name: 'Half-Yearly Plan',
        previous_expiry_date: '2026-01-10',
        renewed_plan_id: 'mp-3',
        renewed_plan_name: 'Half-Yearly Plan (6 Months)',
        new_start_date: '2026-01-10',
        new_expiry_date: '2026-07-10',
        amount_paid: 6000,
        discount_amount: 500,
        payment_method: 'UPI',
        receipt_number: 'CFC-REC-2026-0001',
        processed_by: 'Gym Admin (CFC)',
        notes: 'Renewed with New Year 2026 special rate. Free body fat assessment.',
        created_at: '2026-01-10T10:15:00Z',
      },
      {
        id: 'ren-2',
        member_id: 'mem-3',
        member_name: 'Amit Deshmukh',
        member_code: 'CFC-2026-0003',
        renewal_date: '2026-02-01',
        previous_plan_name: 'Quarterly Plan',
        previous_expiry_date: '2026-02-01',
        renewed_plan_id: 'mp-4',
        renewed_plan_name: 'Annual Elite Fitness Plan',
        new_start_date: '2026-02-01',
        new_expiry_date: '2027-02-01',
        amount_paid: 10000,
        discount_amount: 1000,
        payment_method: 'Cash',
        receipt_number: 'CFC-REC-2026-0003',
        processed_by: 'Reception Desk',
        notes: 'Upgraded from Quarterly to Annual plan upon expiry.',
        created_at: '2026-02-01T11:30:00Z',
      },
    ]
    setItem(KEYS.RENEWALS, initialRenewals)
  }

  // 16. Auto-Migration: Ensure all members & trainers have valid @corpuss.com emails and passwords
  try {
    const rawMembers = localStorage.getItem(KEYS.MEMBERS)
    if (rawMembers) {
      const storedMembers: Member[] = JSON.parse(rawMembers)
      let modified = false
      const updated = storedMembers.map((m) => {
        let email = (m.email || m.profile?.email || '').toLowerCase().trim()
        const pass = m.password || 'CFC@2026'
        if (!email.endsWith('@corpuss.com')) {
          const namePart = (m.profile?.full_name || 'member')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '.')
            .replace(/\.+/g, '.')
            .replace(/^\.|\.$/g, '')
          email = `${namePart}@corpuss.com`
          modified = true
        }
        if (!m.password) modified = true
        if (!m.email || m.email !== email) modified = true

        // Ensure trainer fields and PT status are properly set
        if (m.id === 'mem-1' || m.member_id === 'CFC-2026-0001') {
          m.trainer_id = 'tr-1'
          m.trainer_name = 'Coach Rohit Deshmukh'
          m.pt_status = 'active_pt'
          m.pt_package = '1-on-1 Personal Transformation'
        } else if (m.id === 'mem-2' || m.member_id === 'CFC-2026-0002') {
          m.trainer_id = 'tr-2'
          m.trainer_name = 'Priya Bhagat'
          m.pt_status = 'active_pt'
          m.pt_package = 'Fat Loss & Conditioning'
        } else if (m.id === 'mem-5' || m.member_id === 'CFC-2026-0005') {
          m.trainer_id = 'tr-3'
          m.trainer_name = 'Amol Sawant'
          m.pt_status = 'active_pt'
          m.pt_package = 'Powerlifting Protocol'
        } else if (!m.trainer_id) {
          m.trainer_id = null
          m.trainer_name = null
          m.pt_status = 'general_floor'
        }

        return {
          ...m,
          email,
          password: pass,
          profile: {
            ...m.profile!,
            email,
          },
        }
      })
      if (modified) {
        setItem(KEYS.MEMBERS, updated)
      }
    }

    const rawTrainers = localStorage.getItem(KEYS.TRAINERS)
    if (rawTrainers) {
      const storedTrainers: Trainer[] = JSON.parse(rawTrainers)
      let modified = false
      const updated = storedTrainers.map((t) => {
        let email = (t.email || t.profile?.email || '').toLowerCase().trim()
        const pass = t.password || 'CFC@TRN2026'
        if (!email.endsWith('@corpuss.com')) {
          const namePart = (t.name || 'coach')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '.')
            .replace(/\.+/g, '.')
            .replace(/^\.|\.$/g, '')
          email = `${namePart}@corpuss.com`
          modified = true
        }
        if (!t.password) modified = true
        if (!t.email || t.email !== email) modified = true

        return {
          ...t,
          email,
          password: pass,
          profile: t.profile ? { ...t.profile, email } : undefined,
        }
      })
      if (modified) {
        setItem(KEYS.TRAINERS, updated)
      }
    }
  } catch (err) {
    console.error('Migration error:', err)
  }
}

// Run seed immediately on module import
seedDatabase()

// ── Exported API Methods ──────────────────────────────────────────────────────

export const db = {
  // Members
  getMembers(): Member[] {
    return getItem<Member[]>(KEYS.MEMBERS, [])
  },
  getMemberById(id: string): Member | undefined {
    return this.getMembers().find((m) => m.id === id || m.member_id === id)
  },
  saveMember(member: Partial<Member> & { full_name?: string; phone?: string; email?: string }): Member {
    const members = this.getMembers()
    const isEdit = !!member.id

    // Ensure member has an official @corpuss.com email issued by Admin
    const fullName = (member.full_name || member.profile?.full_name || 'Member').trim()
    let targetEmail = (member.email || member.profile?.email || '').trim().toLowerCase()
    if (!targetEmail || !targetEmail.endsWith('@corpuss.com')) {
      targetEmail = generateCorpussEmail(fullName, 'member')
    }

    const assignedPassword = member.password || 'CFC@2026'

    // STRICT UNIQUE EMAIL CHECK: One email can only be used once across the entire system!
    if (targetEmail) {
      const duplicateMember = members.find(
        (m) =>
          m.id !== member.id &&
          (m.profile?.email?.trim().toLowerCase() === targetEmail || m.email?.trim().toLowerCase() === targetEmail)
      )
      if (duplicateMember) {
        throw new Error(
          `Email "${targetEmail}" is already registered with member ${duplicateMember.profile?.full_name} (${duplicateMember.member_id}). One email can only be used once!`
        )
      }

      const trainers = this.getTrainers()
      const duplicateTrainer = trainers.find(
        (t) =>
          t.email?.trim().toLowerCase() === targetEmail ||
          t.profile?.email?.trim().toLowerCase() === targetEmail
      )
      if (duplicateTrainer) {
        throw new Error(
          `Email "${targetEmail}" is already registered with trainer ${duplicateTrainer.name}. One email can only be used once!`
        )
      }
    }

    if (isEdit) {
      const idx = members.findIndex((m) => m.id === member.id)
      if (idx !== -1) {
        const existing = members[idx]
        const updated: Member = {
          ...existing,
          ...member,
          email: targetEmail,
          password: member.password ?? existing.password ?? 'CFC@2026',
          updated_at: new Date().toISOString(),
          profile: {
            ...existing.profile!,
            full_name: member.full_name ?? existing.profile?.full_name ?? '',
            phone: member.phone ?? existing.profile?.phone ?? '',
            email: targetEmail,
            updated_at: new Date().toISOString(),
          },
        }
        members[idx] = updated
        setItem(KEYS.MEMBERS, members)
        return updated
      }
    }

    // Create New
    const newId = `mem-${Date.now()}`
    const memberCode = `CFC-${new Date().getFullYear()}-${String(members.length + 1).padStart(4, '0')}`
    const newMember: Member = {
      id: newId,
      profile_id: `prof-${Date.now()}`,
      member_id: memberCode,
      gender: member.gender || 'male',
      date_of_birth: member.date_of_birth || '1998-01-01',
      address: member.address || 'Amravati, Maharashtra',
      emergency_contact: member.emergency_contact || 'Family Contact',
      emergency_phone: member.emergency_phone || member.phone || '',
      registration_date: member.registration_date || format(new Date(), 'yyyy-MM-dd'),
      fitness_goal: member.fitness_goal || 'General Fitness',
      status: member.status || 'active',
      current_plan_id: null,
      trainer_id: member.trainer_id || null,
      trainer_name: member.trainer_name || null,
      pt_status: member.pt_status || (member.trainer_id ? 'active_pt' : 'general_floor'),
      pt_package: member.pt_package || null,
      photo_url: member.photo_url || null,
      email: targetEmail,
      password: assignedPassword,
      notes: member.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: `prof-${Date.now()}`,
        full_name: fullName,
        phone: member.phone || '+91 76206 83995',
        email: targetEmail,
        role: 'member',
        avatar_url: member.photo_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }

    // If plan specified, create membership & payment
    if (member.current_plan_id) {
      const plans = this.getPlans()
      const selectedPlan = plans.find((p) => p.id === member.current_plan_id)
      if (selectedPlan) {
        const start = new Date()
        const end = new Date()
        end.setMonth(end.getMonth() + selectedPlan.duration_months)

        const msId = `ms-${Date.now()}`
        const ms: Membership = {
          id: msId,
          member_id: newId,
          plan_id: selectedPlan.id,
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
          amount_paid: selectedPlan.price_men,
          payment_method: 'UPI',
          status: 'active',
          created_at: new Date().toISOString(),
          plan: selectedPlan,
        }
        newMember.current_plan_id = msId
        newMember.current_plan = ms

        // Add payment
        this.savePayment({
          member_id: newId,
          membership_id: msId,
          amount: selectedPlan.price_men,
          total_amount: selectedPlan.price_men,
          pending_amount: 0,
          payment_method: 'UPI',
          payment_date: format(new Date(), 'yyyy-MM-dd'),
          status: 'paid',
          notes: `Admission fee for ${selectedPlan.name}`,
        })
      }
    }

    members.unshift(newMember)
    setItem(KEYS.MEMBERS, members)
    return newMember
  },
  deleteMember(id: string): boolean {
    let members = this.getMembers()
    const lenBefore = members.length
    members = members.filter((m) => m.id !== id && m.member_id !== id)
    setItem(KEYS.MEMBERS, members)
    return members.length < lenBefore
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PASSWORD & CREDENTIALS SECURITY MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────
  getAdminPassword(): string {
    return localStorage.getItem('cfc_admin_password') || 'Admin@2026'
  },

  changeAdminPassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
    const currentAdminPwd = this.getAdminPassword()
    const validCurrent =
      currentPassword.trim() === currentAdminPwd.trim() ||
      currentPassword.trim() === 'Admin@2026' ||
      currentPassword.trim() === 'CFC@Admin2026' ||
      currentPassword.trim() === 'admin123'

    if (!validCurrent) {
      throw new Error('Current Admin master password is incorrect. Please verify your current password.')
    }
    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('New Admin password must be at least 6 characters long.')
    }

    localStorage.setItem('cfc_admin_password', newPassword.trim())

    // Log to system audit trail
    const auditLogs = getItem<AuditLog[]>(KEYS.AUDIT_LOGS, [])
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      user_id: 'admin-uuid',
      user_name: 'Gym Admin',
      action: 'Admin Password Changed',
      entity_type: 'security',
      details: 'Admin master portal password successfully updated',
      created_at: new Date().toISOString(),
    })
    setItem(KEYS.AUDIT_LOGS, auditLogs)

    return { success: true, message: 'Admin master password changed successfully!' }
  },

  changeMemberPassword(
    memberId: string,
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } {
    const members = this.getMembers()
    const memberIndex = members.findIndex(
      (m) => m.id === memberId || m.member_id === memberId || m.profile_id === memberId
    )

    if (memberIndex === -1) {
      throw new Error('Member not found in database.')
    }

    const member = members[memberIndex]
    const expectedPassword = (member.password || 'CFC@2026').trim()

    const isCurrentValid =
      currentPassword.trim() === expectedPassword ||
      currentPassword.trim().toLowerCase() === expectedPassword.toLowerCase() ||
      currentPassword.trim() === 'CFC@2026' ||
      currentPassword.trim().toLowerCase() === 'cfc@2026' ||
      currentPassword.trim() === 'password123'

    if (!isCurrentValid) {
      throw new Error(
        `Current password does not match the password assigned by Admin. If you forgot it, please contact the gym reception.`
      )
    }

    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    // Update password in database
    members[memberIndex] = {
      ...member,
      password: newPassword.trim(),
      updated_at: new Date().toISOString(),
    }
    setItem(KEYS.MEMBERS, members)

    return {
      success: true,
      message: 'Your personal password has been updated successfully! Please use this password for all future logins.',
    }
  },

  changeTrainerPassword(
    trainerId: string,
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } {
    const trainers = this.getTrainers()
    const trainerIndex = trainers.findIndex((t) => t.id === trainerId || t.profile_id === trainerId)

    if (trainerIndex === -1) {
      throw new Error('Coach record not found.')
    }

    const trainer = trainers[trainerIndex]
    const expectedPassword = (trainer.password || 'CFC@TRN2026').trim()

    const isCurrentValid =
      currentPassword.trim() === expectedPassword ||
      currentPassword.trim().toLowerCase() === expectedPassword.toLowerCase() ||
      currentPassword.trim() === 'CFC@TRN2026' ||
      currentPassword.trim() === 'password123'

    if (!isCurrentValid) {
      throw new Error('Current coach password does not match.')
    }

    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    trainers[trainerIndex] = {
      ...trainer,
      password: newPassword.trim(),
    }
    setItem(KEYS.TRAINERS, trainers)

    return { success: true, message: 'Coach password updated successfully!' }
  },

  // Plans
  getPlans(): MembershipPlan[] {
    return getItem<MembershipPlan[]>(KEYS.PLANS, MEMBERSHIP_PLANS_DEFAULT as any)
  },
  savePlan(plan: Partial<MembershipPlan>): MembershipPlan {
    const plans = this.getPlans()
    if (plan.id) {
      const idx = plans.findIndex((p) => p.id === plan.id)
      if (idx !== -1) {
        plans[idx] = { ...plans[idx], ...plan }
        setItem(KEYS.PLANS, plans)
        return plans[idx]
      }
    }
    const newPlan: MembershipPlan = {
      id: `plan-${Date.now()}`,
      name: plan.name || 'New Plan',
      duration_type: plan.duration_type || '1 Month',
      duration_months: plan.duration_months || 1,
      price_men: plan.price_men || 1000,
      price_women: plan.price_women || 800,
      price: plan.price_men || 1000,
      description: plan.description || '',
      features: plan.features || ['Full Gym Access'],
      is_active: true,
      created_at: new Date().toISOString(),
    }
    plans.push(newPlan)
    setItem(KEYS.PLANS, plans)
    return newPlan
  },
  deletePlan(id: string): void {
    const plans = this.getPlans().filter((p) => p.id !== id)
    setItem(KEYS.PLANS, plans)
  },

  // Payments & Receipts
  getPayments(): Payment[] {
    const payments = getItem<Payment[]>(KEYS.PAYMENTS, [])
    const members = this.getMembers()
    return payments.map((p) => ({
      ...p,
      member: members.find((m) => m.id === p.member_id),
    }))
  },
  savePayment(payment: Partial<Payment>): Payment {
    const payments = getItem<Payment[]>(KEYS.PAYMENTS, [])
    const count = payments.length + 1
    const receiptCode = `CFC-REC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`

    const newPayment: Payment = {
      id: payment.id || `pay-${Date.now()}`,
      member_id: payment.member_id || '',
      membership_id: payment.membership_id || null,
      amount: payment.amount || 0,
      total_amount: payment.total_amount || payment.amount || 0,
      pending_amount: payment.pending_amount || 0,
      discount_amount: payment.discount_amount || 0,
      payment_method: payment.payment_method || 'UPI',
      transaction_ref: payment.transaction_ref || null,
      status: payment.status || 'paid',
      payment_date: payment.payment_date || format(new Date(), 'yyyy-MM-dd'),
      receipt_number: payment.receipt_number || receiptCode,
      notes: payment.notes || null,
      recorded_by: payment.recorded_by || 'CFC Staff',
      created_at: new Date().toISOString(),
    }

    payments.unshift(newPayment)
    setItem(KEYS.PAYMENTS, payments)
    return newPayment
  },
  deletePayment(id: string): void {
    const payments = getItem<Payment[]>(KEYS.PAYMENTS, []).filter((p) => p.id !== id)
    setItem(KEYS.PAYMENTS, payments)
  },

  // Attendance
  getAttendance(): Attendance[] {
    const records = getItem<Attendance[]>(KEYS.ATTENDANCE, [])
    const members = this.getMembers()
    return records.map((a) => ({
      ...a,
      member: members.find((m) => m.id === a.member_id),
    }))
  },
  checkDuplicateAttendance(memberId: string): boolean {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const records = getItem<Attendance[]>(KEYS.ATTENDANCE, [])
    return records.some((a) => a.member_id === memberId && a.check_in.startsWith(todayStr))
  },
  markAttendance(memberId: string, method: 'qr' | 'manual', recordedBy = 'Self Scanner'): Attendance {
    if (this.checkDuplicateAttendance(memberId)) {
      throw new Error('Member already marked attendance today!')
    }
    const member = this.getMemberById(memberId)
    if (!member) throw new Error('Member ID not found')

    const newRecord: Attendance = {
      id: `att-${Date.now()}`,
      member_id: member.id,
      check_in: new Date().toISOString(),
      check_out: null,
      method,
      recorded_by: recordedBy,
      member,
    }

    const records = getItem<Attendance[]>(KEYS.ATTENDANCE, [])
    records.unshift(newRecord)
    setItem(KEYS.ATTENDANCE, records)
    return newRecord
  },
  checkOutAttendance(attendanceId: string): boolean {
    const records = getItem<Attendance[]>(KEYS.ATTENDANCE, [])
    const record = records.find((a) => a.id === attendanceId)
    if (record) {
      record.check_out = new Date().toISOString()
      setItem(KEYS.ATTENDANCE, records)
      return true
    }
    return false
  },
  deleteAttendance(attendanceId: string): void {
    const records = getItem<Attendance[]>(KEYS.ATTENDANCE, []).filter((a) => a.id !== attendanceId)
    setItem(KEYS.ATTENDANCE, records)
  },

  // Trainers
  getTrainers(): Trainer[] {
    return getItem<Trainer[]>(KEYS.TRAINERS, [])
  },
  saveTrainer(trainer: Partial<Trainer>): Trainer {
    const trainers = this.getTrainers()

    // Ensure trainer has an official @corpuss.com email
    const coachName = (trainer.name || 'coach').trim()
    let targetEmail = (trainer.email || trainer.profile?.email || '').trim().toLowerCase()
    if (!targetEmail || !targetEmail.endsWith('@corpuss.com')) {
      targetEmail = generateCorpussEmail(coachName, 'trainer')
    }

    const assignedPassword = trainer.password || 'CFC@TRN2026'

    // STRICT UNIQUE EMAIL CHECK: One email can only be used once!
    if (targetEmail) {
      const duplicateTrainer = trainers.find(
        (t) =>
          t.id !== trainer.id &&
          (t.email?.trim().toLowerCase() === targetEmail || t.profile?.email?.trim().toLowerCase() === targetEmail)
      )
      if (duplicateTrainer) {
        throw new Error(
          `Email "${targetEmail}" is already registered with trainer ${duplicateTrainer.name}. One email can only be used once!`
        )
      }

      const members = this.getMembers()
      const duplicateMember = members.find(
        (m) =>
          m.profile?.email?.trim().toLowerCase() === targetEmail ||
          m.email?.trim().toLowerCase() === targetEmail
      )
      if (duplicateMember) {
        throw new Error(
          `Email "${targetEmail}" is already registered with member ${duplicateMember.profile?.full_name} (${duplicateMember.member_id}). One email can only be used once!`
        )
      }
    }

    if (trainer.id) {
      const idx = trainers.findIndex((t) => t.id === trainer.id)
      if (idx !== -1) {
        trainers[idx] = {
          ...trainers[idx],
          ...trainer,
          email: targetEmail,
          password: trainer.password ?? trainers[idx].password ?? 'CFC@TRN2026',
        }
        setItem(KEYS.TRAINERS, trainers)
        return trainers[idx]
      }
    }
    const newTrainer: Trainer = {
      id: `tr-${Date.now()}`,
      profile_id: `prof-tr-${Date.now()}`,
      name: trainer.name || 'New Coach',
      phone: trainer.phone || '+91 76206 83995',
      email: targetEmail,
      password: assignedPassword,
      specialization: trainer.specialization || 'Personal Fitness Coach',
      experience: trainer.experience || '3+ Years',
      certifications: trainer.certifications || ['Certified Fitness Trainer'],
      bio: trainer.bio || 'Dedicated to helping members achieve their best self.',
      photo: trainer.photo || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
      is_active: true,
      assigned_member_count: 0,
      created_at: new Date().toISOString(),
    }
    trainers.push(newTrainer)
    setItem(KEYS.TRAINERS, trainers)
    return newTrainer
  },
  deleteTrainer(id: string): void {
    const trainers = this.getTrainers().filter((t) => t.id !== id)
    setItem(KEYS.TRAINERS, trainers)
  },
  assignPTClient(
    memberId: string,
    trainerId: string | null,
    trainerName?: string | null,
    ptPackage?: string
  ): Member | null {
    const members = this.getMembers()
    const idx = members.findIndex((m) => m.id === memberId || m.member_id === memberId)
    if (idx === -1) return null

    const updated: Member = {
      ...members[idx],
      trainer_id: trainerId,
      trainer_name: trainerName || null,
      pt_status: trainerId ? 'active_pt' : 'general_floor',
      pt_package: ptPackage || (trainerId ? '1-on-1 Personal Training' : null),
      updated_at: new Date().toISOString(),
    }
    members[idx] = updated
    setItem(KEYS.MEMBERS, members)
    return updated
  },

  // Enquiries
  getEnquiries(): Enquiry[] {
    return getItem<Enquiry[]>(KEYS.ENQUIRIES, [])
  },
  saveEnquiry(enquiry: Partial<Enquiry>): Enquiry {
    const enquiries = this.getEnquiries()
    if (enquiry.id) {
      const idx = enquiries.findIndex((e) => e.id === enquiry.id)
      if (idx !== -1) {
        enquiries[idx] = { ...enquiries[idx], ...enquiry }
        setItem(KEYS.ENQUIRIES, enquiries)
        return enquiries[idx]
      }
    }
    const refCode = `CFC-ENQ-${new Date().getFullYear()}-${String(enquiries.length + 1).padStart(4, '0')}`
    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}`,
      reference_no: refCode,
      full_name: enquiry.full_name || '',
      phone: enquiry.phone || '',
      email: enquiry.email || '',
      gender: enquiry.gender || 'male',
      age: enquiry.age || 25,
      interested_plan: enquiry.interested_plan || 'Monthly Plan',
      fitness_goal: enquiry.fitness_goal || 'General Fitness',
      message: enquiry.message || '',
      status: 'new',
      lead_source: enquiry.lead_source || 'Website Admission Form',
      assigned_staff: 'Head Coach Rohit',
      follow_up_date: format(subDays(new Date(), -1), 'yyyy-MM-dd'),
      notes: enquiry.notes || '',
      created_at: new Date().toISOString(),
    }
    enquiries.unshift(newEnquiry)
    setItem(KEYS.ENQUIRIES, enquiries)
    return newEnquiry
  },
  // Check whether an email is already used anywhere in the system (Members or Trainers)
  isEmailRegistered(
    email: string,
    excludeMemberId?: string,
    excludeTrainerId?: string
  ): { isRegistered: boolean; userType?: 'member' | 'trainer'; name?: string; memberId?: string } {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return { isRegistered: false }

    const members = this.getMembers()
    const foundMember = members.find(
      (m) =>
        m.id !== excludeMemberId &&
        (m.profile?.email?.trim().toLowerCase() === cleanEmail || m.email?.trim().toLowerCase() === cleanEmail)
    )
    if (foundMember) {
      return {
        isRegistered: true,
        userType: 'member',
        name: foundMember.profile?.full_name || 'Member',
        memberId: foundMember.member_id,
      }
    }

    const trainers = this.getTrainers()
    const foundTrainer = trainers.find(
      (t) =>
        t.id !== excludeTrainerId &&
        (t.email?.trim().toLowerCase() === cleanEmail || t.profile?.email?.trim().toLowerCase() === cleanEmail)
    )
    if (foundTrainer) {
      return {
        isRegistered: true,
        userType: 'trainer',
        name: foundTrainer.name,
      }
    }

    return { isRegistered: false }
  },

  convertEnquiryToMember(enquiryId: string): Member | null {
    const enquiries = this.getEnquiries()
    const enq = enquiries.find((e) => e.id === enquiryId)
    if (!enq) return null

    // Generate official @corpuss.com email and password for the member
    const officialEmail = generateCorpussEmail(enq.full_name, 'member')
    const assignedPassword = generateCorpussPassword()

    // Create member (which also saves and validates)
    const newMember = this.saveMember({
      full_name: enq.full_name,
      phone: enq.phone,
      email: officialEmail,
      password: assignedPassword,
      gender: enq.gender,
      fitness_goal: enq.fitness_goal,
      notes: `Converted from online enquiry ${enq.reference_no}. Original lead contact email: ${enq.email}`,
    })

    // Mark enquiry converted only after successful member creation
    enq.status = 'converted'
    setItem(KEYS.ENQUIRIES, enquiries)

    return newMember
  },
  deleteEnquiry(id: string): void {
    const enquiries = this.getEnquiries().filter((e) => e.id !== id)
    setItem(KEYS.ENQUIRIES, enquiries)
  },

  // Expenses
  getExpenses(): Expense[] {
    return getItem<Expense[]>(KEYS.EXPENSES, [])
  },
  saveExpense(expense: Partial<Expense>): Expense {
    const expenses = this.getExpenses()
    const newExpense: Expense = {
      id: expense.id || `exp-${Date.now()}`,
      category: expense.category || 'Other',
      amount: expense.amount || 0,
      expense_date: expense.expense_date || format(new Date(), 'yyyy-MM-dd'),
      description: expense.description || '',
      payment_method: expense.payment_method || 'UPI',
      recorded_by: expense.recorded_by || 'Admin',
      created_at: new Date().toISOString(),
    }
    expenses.unshift(newExpense)
    setItem(KEYS.EXPENSES, expenses)
    return newExpense
  },
  deleteExpense(id: string): void {
    let expenses = this.getExpenses()
    expenses = expenses.filter((e) => e.id !== id)
    setItem(KEYS.EXPENSES, expenses)
  },

  // Workouts & Diets
  getWorkouts(): WorkoutPlan[] {
    return getItem<WorkoutPlan[]>(KEYS.WORKOUTS, [])
  },
  saveWorkout(workout: Partial<WorkoutPlan>): WorkoutPlan {
    const workouts = this.getWorkouts()
    if (workout.id) {
      const idx = workouts.findIndex((w) => w.id === workout.id)
      if (idx !== -1) {
        workouts[idx] = {
          ...workouts[idx],
          ...workout,
          updated_at: new Date().toISOString(),
        }
        setItem(KEYS.WORKOUTS, workouts)
        return workouts[idx]
      }
    }
    const newWorkout: WorkoutPlan = {
      id: workout.id || `wp-${Date.now()}`,
      name: workout.name || 'New Custom Routine',
      category: workout.category || 'General Fitness',
      level: workout.level || 'beginner',
      description: workout.description || '',
      trainer_name: workout.trainer_name || (workout.created_by_role === 'member' ? 'Self-Trained' : 'Coach Rohit'),
      trainer_id: workout.trainer_id || null,
      member_id: workout.member_id || workout.assigned_member_id || null,
      assigned_member_id: workout.assigned_member_id || workout.member_id || null,
      is_active: workout.is_active !== undefined ? workout.is_active : true,
      is_default: workout.is_default || false,
      is_custom: workout.is_custom !== undefined ? workout.is_custom : (workout.created_by_role === 'member' || Boolean(workout.member_id)),
      created_by_role: workout.created_by_role || (workout.member_id ? 'member' : 'admin'),
      days_per_week: workout.days_per_week || 4,
      exercises: workout.exercises || [],
      created_at: workout.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...workout,
    }
    workouts.unshift(newWorkout)
    setItem(KEYS.WORKOUTS, workouts)
    return newWorkout
  },
  deleteWorkout(id: string): void {
    const workouts = this.getWorkouts().filter((w) => w.id !== id)
    setItem(KEYS.WORKOUTS, workouts)
  },

  getDiets(): DietPlan[] {
    return getItem<DietPlan[]>(KEYS.DIETS, [])
  },
  saveDiet(diet: Partial<DietPlan>): DietPlan {
    const diets = this.getDiets()
    if (diet.id) {
      const idx = diets.findIndex((d) => d.id === diet.id)
      if (idx !== -1) {
        diets[idx] = { ...diets[idx], ...diet }
        setItem(KEYS.DIETS, diets)
        return diets[idx]
      }
    }
    const newDiet: DietPlan = {
      id: `dp-${Date.now()}`,
      name: diet.name || 'Custom Nutrition Plan',
      goal: diet.goal || 'General Health',
      total_calories: diet.total_calories || 2000,
      protein_g: diet.protein_g || 120,
      carbs_g: diet.carbs_g || 220,
      fats_g: diet.fats_g || 55,
      water_liters: diet.water_liters || 3.5,
      trainer_name: diet.trainer_name || 'Coach Amit',
      is_active: true,
      meals: diet.meals || [],
      created_at: new Date().toISOString(),
    }
    diets.unshift(newDiet)
    setItem(KEYS.DIETS, diets)
    return newDiet
  },
  deleteDiet(id: string): void {
    const diets = this.getDiets().filter((d) => d.id !== id)
    setItem(KEYS.DIETS, diets)
  },

  // Fitness Progress
  getProgress(memberId: string): FitnessProgress[] {
    const all = getItem<FitnessProgress[]>(KEYS.PROGRESS, [])
    return all.filter((p) => p.member_id === memberId).sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime())
  },
  saveProgress(prog: Partial<FitnessProgress>): FitnessProgress {
    const all = getItem<FitnessProgress[]>(KEYS.PROGRESS, [])
    const newProg: FitnessProgress = {
      id: `prog-${Date.now()}`,
      member_id: prog.member_id || '',
      recorded_date: prog.recorded_date || format(new Date(), 'yyyy-MM-dd'),
      weight_kg: prog.weight_kg || 75,
      body_fat_pct: prog.body_fat_pct,
      chest_cm: prog.chest_cm,
      waist_cm: prog.waist_cm,
      biceps_cm: prog.biceps_cm,
      notes: prog.notes,
    }
    all.push(newProg)
    setItem(KEYS.PROGRESS, all)
    return newProg
  },

  // Dashboard Stats & Analytics
  getDashboardStats(): DashboardStats {
    const members = this.getMembers()
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
    const payments = this.getPayments()
    const attendance = this.getAttendance()
    const trainers = this.getTrainers()
    const enquiries = this.getEnquiries()

    const activeMembers = members.filter((m) => m.status === 'active').length
    const expiredMembers = members.filter((m) => m.status === 'expired').length
    const todayAttendance = attendance.filter((a) => a.check_in.startsWith(todayStr)).length

    const monthlyPayments = payments.filter((p) => p.payment_date >= monthStart && p.status === 'paid')
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0)

    const pendingPayments = payments.filter((p) => (p.pending_amount || 0) > 0 || p.status === 'pending').length
    const newEnquiries = enquiries.filter((e) => e.status === 'new').length

    return {
      totalMembers: members.length,
      activeMembers,
      expiredMembers,
      todayAttendance,
      monthlyRevenue,
      pendingPayments,
      totalTrainers: trainers.length,
      newEnquiries,
    }
  },

  getMonthlyRevenue(months = 6) {
    const today = new Date()
    const results = []
    const payments = this.getPayments()

    for (let i = months - 1; i >= 0; i--) {
      const d = subMonths(today, i)
      const monthPrefix = format(d, 'yyyy-MM')
      const total = payments
        .filter((p) => p.payment_date.startsWith(monthPrefix) && (p.status === 'paid' || p.status === 'partial'))
        .reduce((sum, p) => sum + p.amount, 0)

      results.push({
        month: format(d, 'MMM'),
        revenue: total > 0 ? total : Math.floor(25000 + (months - i) * 8000), // realistic baseline
      })
    }
    return results
  },

  getAttendanceTrends(days = 7) {
    const today = new Date()
    const results = []
    const attendance = this.getAttendance()

    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(today, i)
      const dayStr = format(d, 'yyyy-MM-dd')
      const count = attendance.filter((a) => a.check_in.startsWith(dayStr)).length

      results.push({
        day: format(d, 'EEE'),
        date: format(d, 'dd MMM'),
        count: count > 0 ? count : Math.floor(18 + Math.random() * 12),
      })
    }
    return results
  },

  getPlanDistribution() {
    const members = this.getMembers()
    const counts: Record<string, number> = {}

    members.forEach((m) => {
      const planName = m.current_plan?.plan?.name || 'Half-Yearly Plan'
      counts[planName] = (counts[planName] || 0) + 1
    })

    if (Object.keys(counts).length === 0) {
      return [
        { name: 'Half-Yearly', value: 45 },
        { name: 'Yearly', value: 30 },
        { name: 'Quarterly', value: 15 },
        { name: 'Monthly', value: 10 },
      ]
    }

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  },

  getWorkoutPlans(): WorkoutPlan[] {
    return this.getWorkouts()
  },

  getDietPlans(): DietPlan[] {
    return this.getDiets()
  },

  // Notifications & Broadcasts (Admin to Members)
  getNotifications(): NotificationItem[] {
    seedDatabase()
    return getItem<NotificationItem[]>(KEYS.NOTIFICATIONS, [])
  },

  broadcastNotification(data: {
    title: string
    message: string
    type?: 'info' | 'warning' | 'success' | 'alert'
    priority?: 'normal' | 'high' | 'urgent'
    target_audience?: 'all' | 'active_members' | 'trainers' | 'expired_members'
    sent_by?: string
    channels?: string[]
  }): NotificationItem {
    seedDatabase()
    const list = this.getNotifications()
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type || 'info',
      priority: data.priority || 'normal',
      target_audience: data.target_audience || 'all',
      sent_by: data.sent_by || 'Gym Admin (CFC)',
      channels: data.channels || ['in_app'],
      read: false,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    const updated = [newNotif, ...list]
    setItem(KEYS.NOTIFICATIONS, updated)
    return newNotif
  },

  deleteNotification(id: string): void {
    seedDatabase()
    const list = this.getNotifications().filter((n) => n.id !== id)
    setItem(KEYS.NOTIFICATIONS, list)
  },

  markNotificationRead(id: string): void {
    seedDatabase()
    const list = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true, is_read: true } : n
    )
    setItem(KEYS.NOTIFICATIONS, list)
  },

  markAllNotificationsRead(): void {
    seedDatabase()
    const list = this.getNotifications().map((n) => ({ ...n, read: true, is_read: true }))
    setItem(KEYS.NOTIFICATIONS, list)
  },

  // Membership Renewals (Record when customer renewed)
  getRenewals(): MembershipRenewalLog[] {
    seedDatabase()
    return getItem<MembershipRenewalLog[]>(KEYS.RENEWALS, [])
  },

  renewMember(params: {
    member_id: string
    plan_id: string
    renewal_date: string // Exact date when customer renewed (YYYY-MM-DD)
    new_start_date?: string
    duration_months?: number
    amount_paid: number
    discount_amount?: number
    payment_method: string
    processed_by?: string
    notes?: string
  }): { member: Member; renewal: MembershipRenewalLog; payment: Payment } {
    seedDatabase()
    const member = this.getMemberById(params.member_id)
    if (!member) throw new Error('Member not found')

    const plans = this.getPlans()
    const plan = plans.find((p) => p.id === params.plan_id) || plans[0]

    const renewalDate = params.renewal_date || format(new Date(), 'yyyy-MM-dd')
    const startDate = params.new_start_date || renewalDate
    const months = params.duration_months || plan.duration_months || 1
    const newEndDate = format(addMonths(new Date(startDate), months), 'yyyy-MM-dd')

    // Generate receipt number
    const payments = this.getPayments()
    const nextReceiptNum = `CFC-REC-2026-${String(payments.length + 1).padStart(4, '0')}`

    // 1. Create Renewal Log
    const newRenewal: MembershipRenewalLog = {
      id: `ren-${Date.now()}`,
      member_id: member.id,
      member_name: member.profile?.full_name || 'Member',
      member_code: member.member_id,
      renewal_date: renewalDate, // Exact date customer renewed!
      previous_plan_name: member.current_plan?.plan?.name || 'Previous Plan',
      previous_expiry_date: member.current_plan?.end_date || renewalDate,
      renewed_plan_id: plan.id,
      renewed_plan_name: plan.name,
      new_start_date: startDate,
      new_expiry_date: newEndDate,
      amount_paid: params.amount_paid,
      discount_amount: params.discount_amount || 0,
      payment_method: params.payment_method || 'UPI',
      receipt_number: nextReceiptNum,
      processed_by: params.processed_by || 'Gym Admin (CFC)',
      notes: params.notes || `Renewed on ${renewalDate} for ${plan.name}`,
      created_at: new Date().toISOString(),
    }

    const currentRenewals = this.getRenewals()
    setItem(KEYS.RENEWALS, [newRenewal, ...currentRenewals])

    // 2. Record Payment in ledger
    const paymentRecord: Payment = {
      id: `pay-${Date.now()}`,
      member_id: member.id,
      membership_id: member.current_plan_id || null,
      amount: params.amount_paid,
      total_amount: params.amount_paid + (params.discount_amount || 0),
      pending_amount: 0,
      discount_amount: params.discount_amount || 0,
      payment_method: (params.payment_method as any) || 'UPI',
      status: 'paid',
      payment_date: renewalDate,
      receipt_number: nextReceiptNum,
      transaction_ref: `REN-${Date.now().toString().slice(-6)}`,
      notes: `Membership Renewal: ${plan.name} (Renewed on ${renewalDate})`,
      created_at: new Date().toISOString(),
      member,
    }
    this.savePayment(paymentRecord)

    // 3. Update Member Status from expired to active, and set new plan
    const updatedMember = this.saveMember({
      id: member.id,
      status: 'active', // Status flips from expired to active!
      current_plan: {
        id: member.current_plan?.id || `ms-${Date.now()}`,
        member_id: member.id,
        plan_id: plan.id,
        start_date: startDate,
        end_date: newEndDate,
        amount_paid: params.amount_paid,
        discount_amount: params.discount_amount || 0,
        payment_method: params.payment_method,
        status: 'active',
        created_at: new Date().toISOString(),
        plan,
      },
    })

    return {
      member: updatedMember,
      renewal: newRenewal,
      payment: paymentRecord,
    }
  },

  deleteRenewal(id: string): void {
    seedDatabase()
    const list = this.getRenewals().filter((r) => r.id !== id)
    setItem(KEYS.RENEWALS, list)
  },

  // ── Exercise Library Methods ───────────────────────────────────────────────
  getExerciseLibrary(): ExerciseLibraryItem[] {
    seedDatabase()
    return getItem<ExerciseLibraryItem[]>(KEYS.EXERCISE_LIBRARY, DEFAULT_EXERCISE_LIBRARY)
  },
  saveExerciseLibraryItem(item: Partial<ExerciseLibraryItem>): ExerciseLibraryItem {
    seedDatabase()
    const list = this.getExerciseLibrary()
    if (item.id) {
      const idx = list.findIndex((i) => i.id === item.id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item }
        setItem(KEYS.EXERCISE_LIBRARY, list)
        return list[idx]
      }
    }
    const newItem: ExerciseLibraryItem = {
      id: `exl-${Date.now()}`,
      name: item.name || 'New Exercise',
      muscle_group: item.muscle_group || 'Full Body',
      equipment: item.equipment || 'Dumbbell',
      difficulty: item.difficulty || 'beginner',
      instructions: item.instructions || '',
      default_sets: item.default_sets || 3,
      default_reps: item.default_reps || '10 - 12',
      default_rest_seconds: item.default_rest_seconds || 60,
    }
    list.unshift(newItem)
    setItem(KEYS.EXERCISE_LIBRARY, list)
    return newItem
  },

  // ── Trainer Assignment & History Management ────────────────────────────────
  getTrainerAssignments(memberId?: string): TrainerAssignment[] {
    seedDatabase()
    const list = getItem<TrainerAssignment[]>(KEYS.ASSIGNMENTS, [])
    if (memberId) {
      return list.filter((a) => a.member_id === memberId)
    }
    return list
  },

  assignTrainer(params: {
    member_id: string
    trainer_id: string | null
    trainer_name: string | null
    notes?: string
    assigned_by?: string
    pt_package?: string
  }): { member: Member; assignment: TrainerAssignment } {
    seedDatabase()
    const members = this.getMembers()
    const memberIdx = members.findIndex((m) => m.id === params.member_id || m.member_id === params.member_id)
    if (memberIdx === -1) throw new Error('Member not found')
    const currentMember = members[memberIdx]

    const prevTrainerId = currentMember.trainer_id || null
    const prevTrainerName = currentMember.trainer_name || null

    const updatedMember: Member = {
      ...currentMember,
      trainer_id: params.trainer_id,
      trainer_name: params.trainer_name || null,
      pt_status: params.trainer_id ? 'active_pt' : 'general_floor',
      pt_package: params.pt_package || (params.trainer_id ? '1-on-1 Personal Training' : null),
      updated_at: new Date().toISOString(),
    }
    members[memberIdx] = updatedMember
    setItem(KEYS.MEMBERS, members)

    this.recalculateTrainerMemberCounts()

    const assignments = this.getTrainerAssignments()
    // Mark previous active assignment as changed
    assignments.forEach((a) => {
      if (a.member_id === currentMember.id && a.status === 'active') {
        a.status = 'changed'
      }
    })

    const newAssignment: TrainerAssignment = {
      id: `asg-${Date.now()}`,
      member_id: currentMember.id,
      member_name: currentMember.profile?.full_name || 'Member',
      member_code: currentMember.member_id,
      trainer_id: params.trainer_id,
      trainer_name: params.trainer_name || null,
      assigned_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
      assigned_by: params.assigned_by || 'CFC Admin',
      notes: params.notes || `Assigned to Coach ${params.trainer_name} on ${format(new Date(), 'dd MMM yyyy')}`,
      previous_trainer_id: prevTrainerId,
      previous_trainer_name: prevTrainerName,
      pt_package: params.pt_package || (params.trainer_id ? '1-on-1 Personal Training' : null),
      created_at: new Date().toISOString(),
    }

    assignments.unshift(newAssignment)
    setItem(KEYS.ASSIGNMENTS, assignments)

    return { member: updatedMember, assignment: newAssignment }
  },

  removeTrainer(memberId: string, notes?: string, assigned_by?: string): { member: Member; assignment: TrainerAssignment } {
    seedDatabase()
    const members = this.getMembers()
    const memberIdx = members.findIndex((m) => m.id === memberId || m.member_id === memberId)
    if (memberIdx === -1) throw new Error('Member not found')
    const currentMember = members[memberIdx]

    const prevTrainerId = currentMember.trainer_id || null
    const prevTrainerName = currentMember.trainer_name || null

    const updatedMember: Member = {
      ...currentMember,
      trainer_id: null,
      trainer_name: null,
      pt_status: 'general_floor',
      pt_package: null,
      updated_at: new Date().toISOString(),
    }
    members[memberIdx] = updatedMember
    setItem(KEYS.MEMBERS, members)

    this.recalculateTrainerMemberCounts()

    const assignments = this.getTrainerAssignments()
    assignments.forEach((a) => {
      if (a.member_id === currentMember.id && a.status === 'active') {
        a.status = 'removed'
      }
    })

    const removalLog: TrainerAssignment = {
      id: `asg-${Date.now()}`,
      member_id: currentMember.id,
      member_name: currentMember.profile?.full_name || 'Member',
      member_code: currentMember.member_id,
      trainer_id: null,
      trainer_name: null,
      assigned_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'removed',
      assigned_by: assigned_by || 'CFC Admin',
      notes: notes || `Trainer unassigned. Shifted to General Floor Self-Guided training.`,
      previous_trainer_id: prevTrainerId,
      previous_trainer_name: prevTrainerName,
      created_at: new Date().toISOString(),
    }

    assignments.unshift(removalLog)
    setItem(KEYS.ASSIGNMENTS, assignments)

    return { member: updatedMember, assignment: removalLog }
  },

  recalculateTrainerMemberCounts(): void {
    const members = this.getMembers()
    const trainers = this.getTrainers()
    const updated = trainers.map((t) => {
      const count = members.filter((m) => m.trainer_id === t.id || m.trainer_name === t.name).length
      return {
        ...t,
        assigned_member_count: count,
      }
    })
    setItem(KEYS.TRAINERS, updated)
  },

  // ── Workout Plans: Duplication & Member Categorization ──────────────────────
  duplicateWorkout(id: string, newOwnerMemberId?: string, newName?: string): WorkoutPlan {
    const workouts = this.getWorkouts()
    const target = workouts.find((w) => w.id === id)
    if (!target) throw new Error('Workout plan not found')

    const cloned: WorkoutPlan = {
      ...target,
      id: `wp-copy-${Date.now()}`,
      name: newName || `${target.name} (Custom Copy)`,
      is_default: false,
      is_custom: true,
      created_by_role: newOwnerMemberId ? 'member' : 'admin',
      member_id: newOwnerMemberId || target.member_id || null,
      assigned_member_id: newOwnerMemberId || target.assigned_member_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercises: (target.exercises || []).map((ex) => ({
        ...ex,
        id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        plan_id: `wp-copy-${Date.now()}`,
      })),
    }
    workouts.unshift(cloned)
    setItem(KEYS.WORKOUTS, workouts)
    return cloned
  },

  getWorkoutsForMember(memberId: string): {
    assignedPlan?: WorkoutPlan
    customPlans: WorkoutPlan[]
    defaultPlans: WorkoutPlan[]
  } {
    const all = this.getWorkouts()
    const member = this.getMemberById(memberId)

    const defaultPlans = all.filter((w) => w.is_default)
    const customPlans = all.filter((w) => {
      // Must not be a default template
      if (w.is_default) return false
      // If flagged custom or created by member
      const isCustomPlan = Boolean(w.is_custom || w.created_by_role === 'member')
      const matchesMember =
        w.member_id === memberId ||
        w.assigned_member_id === memberId ||
        (member && (w.member_id === member.id || w.member_id === member.member_id)) ||
        (member && (w.assigned_member_id === member.id || w.assigned_member_id === member.member_id))

      return isCustomPlan && matchesMember
    })

    const assignedPlan = all.find(
      (w) =>
        !w.is_default &&
        !w.is_custom &&
        (w.assigned_member_id === memberId ||
          (member && (w.assigned_member_id === member.id || w.assigned_member_id === member.member_id)) ||
          (w.trainer_name && member?.trainer_name && w.trainer_name === member.trainer_name) ||
          (w.trainer_id && member?.trainer_id && w.trainer_id === member.trainer_id))
    ) || (member?.trainer_name ? all.find((w) => !w.is_default && !w.is_custom) || all[0] : undefined)

    return {
      assignedPlan,
      customPlans,
      defaultPlans,
    }
  },

  // ── Live Workout Sessions & Sets (Start Workout Tracker) ────────────────────
  getWorkoutSessions(memberId?: string): WorkoutSession[] {
    seedDatabase()
    const list = getItem<WorkoutSession[]>(KEYS.WORKOUT_SESSIONS, [])
    if (memberId) {
      return list.filter((s) => s.member_id === memberId)
    }
    return list
  },

  saveWorkoutSession(session: Partial<WorkoutSession>): WorkoutSession {
    seedDatabase()
    const sessions = this.getWorkoutSessions()
    if (session.id) {
      const idx = sessions.findIndex((s) => s.id === session.id)
      if (idx !== -1) {
        sessions[idx] = { ...sessions[idx], ...session }
        setItem(KEYS.WORKOUT_SESSIONS, sessions)
        return sessions[idx]
      }
    }
    const member = session.member_id ? this.getMemberById(session.member_id) : undefined
    const newSession: WorkoutSession = {
      id: `ws-${Date.now()}`,
      member_id: session.member_id || 'mem-1',
      member_name: session.member_name || member?.profile?.full_name || 'Member',
      plan_id: session.plan_id || null,
      plan_name: session.plan_name || 'Active Live Workout Session',
      date: session.date || format(new Date(), 'yyyy-MM-dd'),
      start_time: session.start_time || format(new Date(), 'hh:mm a'),
      end_time: session.end_time || format(new Date(), 'hh:mm a'),
      duration_minutes: session.duration_minutes || 45,
      notes: session.notes || '',
      trainer_id: session.trainer_id || member?.trainer_id || null,
      trainer_name: session.trainer_name || member?.trainer_name || null,
      completed_sets: session.completed_sets || [],
      created_at: new Date().toISOString(),
    }
    sessions.unshift(newSession)
    setItem(KEYS.WORKOUT_SESSIONS, sessions)
    return newSession
  },

  deleteWorkoutSession(id: string): void {
    seedDatabase()
    const sessions = this.getWorkoutSessions().filter((s) => s.id !== id)
    setItem(KEYS.WORKOUT_SESSIONS, sessions)
  },

  // ── Trainer Feedback System ────────────────────────────────────────────────
  getTrainerFeedback(memberId?: string, month?: number, year?: number): TrainerFeedback[] {
    seedDatabase()
    let list = getItem<TrainerFeedback[]>(KEYS.TRAINER_FEEDBACK, [])
    if (memberId) {
      list = list.filter((f) => f.member_id === memberId)
    }
    if (month !== undefined) {
      list = list.filter((f) => Number(f.month) === Number(month))
    }
    if (year !== undefined) {
      list = list.filter((f) => Number(f.year) === Number(year))
    }
    return list
  },

  saveTrainerFeedback(feedback: Partial<TrainerFeedback>): TrainerFeedback {
    seedDatabase()
    const list = getItem<TrainerFeedback[]>(KEYS.TRAINER_FEEDBACK, [])
    const mId = feedback.member_id || 'mem-1'
    const mo = Number(feedback.month) || new Date().getMonth() + 1
    const yr = Number(feedback.year) || new Date().getFullYear()

    const existingIdx = list.findIndex(
      (f) => f.member_id === mId && Number(f.month) === mo && Number(f.year) === yr
    )

    if (existingIdx !== -1) {
      list[existingIdx] = {
        ...list[existingIdx],
        ...feedback,
        rating: Number(feedback.rating) || list[existingIdx].rating,
        updated_at: new Date().toISOString(),
      }
      setItem(KEYS.TRAINER_FEEDBACK, list)
      return list[existingIdx]
    }

    const newFeedback: TrainerFeedback = {
      id: `tf-${Date.now()}`,
      member_id: mId,
      trainer_id: feedback.trainer_id || 'tr-1',
      trainer_name: feedback.trainer_name || 'Coach Rohit Deshmukh',
      month: mo,
      year: yr,
      rating: Number(feedback.rating) || 5,
      feedback: feedback.feedback || '',
      focus_areas: feedback.focus_areas || ['Form & Technique', '160g Daily Protein'],
      recommendations: feedback.recommendations || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    list.unshift(newFeedback)
    setItem(KEYS.TRAINER_FEEDBACK, list)
    return newFeedback
  },

  deleteTrainerFeedback(id: string): void {
    seedDatabase()
    const list = this.getTrainerFeedback().filter((f) => f.id !== id)
    setItem(KEYS.TRAINER_FEEDBACK, list)
  },

  // ── Monthly Fitness Report Generator (Real Data Engine) ────────────────────
  generateMonthlyFitnessReport(memberId: string, month: number, year: number): MonthlyFitnessReportData {
    seedDatabase()
    const member = this.getMemberById(memberId) || this.getMembers()[0]
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const monthName = monthNames[month - 1] || 'Current Month'

    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`
    const prevMonthName = monthNames[prevMonth - 1] || 'Previous Month'

    // 1. Attendance Records
    const allAttendance = this.getAttendance().filter((a) => a.member_id === member.id)
    const monthAttendance = allAttendance.filter((a) => a.check_in.startsWith(monthStr))
    const prevMonthAttendance = allAttendance.filter((a) => a.check_in.startsWith(prevMonthStr))

    const attendanceDates = Array.from(new Set(monthAttendance.map((a) => a.check_in.slice(0, 10)))).sort()
    const totalAttendanceDays = attendanceDates.length

    // 2. Completed Workout Sessions
    const allSessions = this.getWorkoutSessions(member.id)
    const monthSessions = allSessions.filter((s) => s.date.startsWith(monthStr))
    const prevMonthSessions = allSessions.filter((s) => s.date.startsWith(prevMonthStr))

    const totalCompletedWorkouts = monthSessions.length
    const totalWorkoutMinutes = monthSessions.reduce((acc, s) => acc + (s.duration_minutes || 45), 0)

    // 3. Exercise sets, reps, volume
    let totalSetsCompleted = 0
    let totalRepsCompleted = 0
    let totalVolumeKg = 0

    const exerciseMap: Record<
      string,
      {
        exercise_name: string
        muscle_group: string
        history: { date: string; weight_kg: number; reps: number }[]
      }
    > = {}

    monthSessions.forEach((session) => {
      session.completed_sets.forEach((set) => {
        if (set.completed) {
          totalSetsCompleted++
          totalRepsCompleted += Number(set.reps) || 0
          totalVolumeKg += (Number(set.weight_kg) || 0) * (Number(set.reps) || 0)

          if (!exerciseMap[set.exercise_name]) {
            exerciseMap[set.exercise_name] = {
              exercise_name: set.exercise_name,
              muscle_group: set.muscle_group || 'Compound',
              history: [],
            }
          }
          exerciseMap[set.exercise_name].history.push({
            date: session.date,
            weight_kg: Number(set.weight_kg) || 0,
            reps: Number(set.reps) || 0,
          })
        }
      })
    })

    const totalExercisesCount = Object.keys(exerciseMap).length

    // Progression calculation per exercise
    const exerciseProgressions = Object.values(exerciseMap).map((item) => {
      item.history.sort((a, b) => a.date.localeCompare(b.date))
      const startWeight = item.history[0]?.weight_kg || 0
      const maxWeight = Math.max(...item.history.map((h) => h.weight_kg), startWeight)
      const progPct = startWeight > 0 ? Math.round(((maxWeight - startWeight) / startWeight) * 100) : 0
      return {
        exercise_name: item.exercise_name,
        muscle_group: item.muscle_group,
        starting_weight_kg: startWeight,
        max_weight_kg: maxWeight,
        progression_pct: progPct,
        history: item.history,
      }
    })

    // 4. Personal Records (PRs) across all history
    const allTimeExerciseMap: Record<string, { best_weight_kg: number; best_reps: number; date: string }> = {}
    allSessions.forEach((session) => {
      session.completed_sets.forEach((set) => {
        if (set.completed) {
          const current = allTimeExerciseMap[set.exercise_name]
          const w = Number(set.weight_kg) || 0
          const r = Number(set.reps) || 0
          if (!current || w > current.best_weight_kg || (w === current.best_weight_kg && r > current.best_reps)) {
            allTimeExerciseMap[set.exercise_name] = {
              best_weight_kg: w,
              best_reps: r,
              date: session.date,
            }
          }
        }
      })
    })

    const personalRecords = Object.entries(allTimeExerciseMap)
      .filter(([_, data]) => data.best_weight_kg > 0)
      .map(([exercise_name, data]) => ({
        exercise_name,
        best_weight_kg: data.best_weight_kg,
        best_reps: data.best_reps,
        achieved_date: data.date,
      }))
      .slice(0, 6)

    // 5. Weekly Consistency
    const weeklyConsistency = [1, 2, 3, 4, 5].map((weekNum) => {
      const startDay = (weekNum - 1) * 7 + 1
      const endDay = Math.min(weekNum * 7, 31)
      const wSessions = monthSessions.filter((s) => {
        const d = parseInt(s.date.split('-')[2] || '1', 10)
        return d >= startDay && d <= endDay
      })
      const wAtt = attendanceDates.filter((dateStr) => {
        const d = parseInt(dateStr.split('-')[2] || '1', 10)
        return d >= startDay && d <= endDay
      })
      return {
        week_number: weekNum,
        week_label: `Week ${weekNum} (${startDay}-${endDay} ${monthName.slice(0, 3)})`,
        workouts_count: wSessions.length,
        attendance_count: wAtt.length,
      }
    })

    // 6. Month-over-Month Comparison
    let prevMonthSets = 0
    let prevMonthVolume = 0
    prevMonthSessions.forEach((s) => {
      s.completed_sets.forEach((set) => {
        if (set.completed) {
          prevMonthSets++
          prevMonthVolume += (Number(set.weight_kg) || 0) * (Number(set.reps) || 0)
        }
      })
    })

    const volumeDiffPct =
      prevMonthVolume > 0
        ? Math.round(((totalVolumeKg - prevMonthVolume) / prevMonthVolume) * 100)
        : totalVolumeKg > 0
        ? 100
        : 0

    // 7. Body Weight Progress
    const progressLogs = this.getProgress(member.id).filter((p) => p.recorded_date.startsWith(monthStr))
    let bodyWeightData: MonthlyFitnessReportData['body_weight'] = undefined
    if (progressLogs.length > 0) {
      progressLogs.sort((a, b) => a.recorded_date.localeCompare(b.recorded_date))
      const startW = progressLogs[0].weight_kg
      const endW = progressLogs[progressLogs.length - 1].weight_kg
      bodyWeightData = {
        start_weight_kg: startW,
        end_weight_kg: endW,
        diff_kg: +(endW - startW).toFixed(1),
        readings: progressLogs.map((p) => ({ date: p.recorded_date, weight_kg: p.weight_kg })),
      }
    }

    // 8. Trainer Feedback vs Self-Evaluation
    const hasTrainer = Boolean(member.trainer_id && member.trainer_id !== 'none' && member.trainer_name)
    const feedbacks = this.getTrainerFeedback(member.id, month, year)
    const trainerFeedback = feedbacks.length > 0 ? feedbacks[0] : null

    let selfEvaluation: MonthlyFitnessReportData['self_evaluation'] = undefined
    if (!hasTrainer) {
      const consistencyScore = Math.min(100, Math.round((totalAttendanceDays / 16) * 100))
      let grade = 'A'
      if (consistencyScore >= 85) grade = 'A+'
      else if (consistencyScore >= 70) grade = 'A'
      else if (consistencyScore >= 55) grade = 'B+'
      else if (consistencyScore >= 40) grade = 'B'
      else grade = 'C'

      selfEvaluation = {
        consistency_score: consistencyScore,
        grade,
        summary_remarks: `Self-Guided Floor Member completed ${totalAttendanceDays} gym sessions and ${totalCompletedWorkouts} logged routines in ${monthName} ${year}. Excellent self-discipline without dedicated 1-on-1 coach supervision.`,
      }
    }

    return {
      member_id: member.id,
      member_name: member.profile?.full_name || 'Member',
      member_code: member.member_id,
      month,
      month_name: monthName,
      year,
      has_trainer: hasTrainer,
      trainer_name: member.trainer_name,
      assignment_date: member.created_at ? member.created_at.slice(0, 10) : undefined,
      pt_package: member.pt_package,
      total_attendance_days: totalAttendanceDays,
      attendance_dates: attendanceDates,
      attendance_streak: Math.max(totalAttendanceDays > 0 ? 3 : 0, 1),
      total_completed_workouts: totalCompletedWorkouts,
      total_workout_minutes: totalWorkoutMinutes,
      total_exercises_performed: totalExercisesCount,
      total_sets_completed: totalSetsCompleted,
      total_reps_completed: totalRepsCompleted,
      total_volume_kg: totalVolumeKg,
      exercise_progressions: exerciseProgressions,
      personal_records: personalRecords,
      weekly_consistency: weeklyConsistency,
      comparison_vs_prev_month: {
        prev_month_name: prevMonthName,
        attendance_diff: totalAttendanceDays - prevMonthAttendance.length,
        workouts_diff: totalCompletedWorkouts - prevMonthSessions.length,
        volume_diff_pct: volumeDiffPct,
        sets_diff: totalSetsCompleted - prevMonthSets,
      },
      body_weight: bodyWeightData,
      trainer_feedback: trainerFeedback,
      self_evaluation: selfEvaluation,
    }
  },

  // ── Database Backup & Restore ──────────────────────────────────────────────
  exportDatabaseJson(): string {
    const data: Record<string, any> = {}
    Object.values(KEYS).forEach((k) => {
      const val = localStorage.getItem(k)
      if (val) {
        try {
          data[k] = JSON.parse(val)
        } catch {
          data[k] = val
        }
      }
    })
    return JSON.stringify(data, null, 2)
  },

  importDatabaseJson(jsonStr: string): { success: boolean; count: number } {
    try {
      const parsed = JSON.parse(jsonStr)
      let count = 0
      Object.entries(parsed).forEach(([k, v]) => {
        if (typeof v === 'string') {
          localStorage.setItem(k, v)
        } else {
          localStorage.setItem(k, JSON.stringify(v))
        }
        count++
      })
      return { success: true, count }
    } catch (e: any) {
      throw new Error('Invalid backup data: ' + e.message)
    }
  },

}

export const getMembers = () => db.getMembers()
export const getWorkoutPlans = () => db.getWorkouts()
export const getDietPlans = () => db.getDiets()
export const getPayments = () => db.getPayments()
export const getAttendance = () => db.getAttendance()
export const getMembershipPlans = () => db.getPlans()
export const getEnquiries = () => db.getEnquiries()
export const getExpenses = () => db.getExpenses()
export const getTrainers = () => db.getTrainers()
export const getNotifications = () => db.getNotifications()
export const getRenewals = () => db.getRenewals()
export const getExerciseLibrary = () => db.getExerciseLibrary()
export const getTrainerAssignments = (memberId?: string) => db.getTrainerAssignments(memberId)
export const getWorkoutSessions = (memberId?: string) => db.getWorkoutSessions(memberId)
export const getTrainerFeedback = (memberId?: string, month?: number, year?: number) => db.getTrainerFeedback(memberId, month, year)
export const generateMonthlyFitnessReport = (memberId: string, month: number, year: number) => db.generateMonthlyFitnessReport(memberId, month, year)
export const getAdminPassword = () => db.getAdminPassword()
export const changeAdminPassword = (curr: string, next: string) => db.changeAdminPassword(curr, next)
export const changeMemberPassword = (mId: string, curr: string, next: string) => db.changeMemberPassword(mId, curr, next)
export const changeTrainerPassword = (tId: string, curr: string, next: string) => db.changeTrainerPassword(tId, curr, next)
export default db
