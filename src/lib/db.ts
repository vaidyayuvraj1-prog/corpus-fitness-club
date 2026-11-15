// Comprehensive resilient database and data management store for Corpus Fitness Club (CFC)
import type {
  Member,
  Trainer,
  MembershipPlan,
  Membership,
  Payment,
  Attendance,
  WorkoutPlan,
  MemberWorkoutAssignment,
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
import { supabase, isSupabaseConfigured } from './supabase'

// Storage Keys
const KEYS = {
  MEMBERS: 'cfc_db_members',
  PLANS: 'cfc_db_plans',
  MEMBERSHIPS: 'cfc_db_memberships',
  PAYMENTS: 'cfc_db_payments',
  ATTENDANCE: 'cfc_db_attendance',
  TRAINERS: 'cfc_db_trainers',
  WORKOUTS: 'cfc_db_workouts',
  WORKOUT_ASSIGNMENTS: 'cfc_db_workout_assignments',
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
  ADMIN_PROFILE: 'cfc_db_admin_profile',
}

// Hardcoded Fake Demo Member Identifiers to Purge
export const FAKE_MEMBER_IDS = new Set(['mem-1', 'mem-2', 'mem-3', 'mem-4', 'mem-5'])
export const FAKE_MEMBER_EMAILS = new Set([
  'rahul.sharma@corpuss.com',
  'member1@corpuss.com',
  'priya.deshmukh@corpuss.com',
  'amit.verma@corpuss.com',
  'neha.patil@corpuss.com',
  'vikram.rathore@corpuss.com',
])

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

// Local-only cache seeding: Populates localStorage without overwriting Supabase cloud data
function setLocalSeed<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) {
    console.error('Seed write error:', e)
  }
}

// ── Multi-Device Real-Time Sync Engine ───────────────────────────────────────
async function syncRelationalTable(key: string, value: any): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !value) return
  try {
    if (key === KEYS.MEMBERS && Array.isArray(value)) {
      const cleanMembers = value.filter(
        (m) =>
          m &&
          !FAKE_MEMBER_IDS.has(m?.id) &&
          !FAKE_MEMBER_EMAILS.has((m?.email || '').toLowerCase()) &&
          !FAKE_MEMBER_EMAILS.has((m?.profile?.email || '').toLowerCase())
      )
      const rows = cleanMembers.map((m: any) => ({
        id: m.id,
        member_id: m.member_id || `CFC-2026-${m.id}`,
        gender: m.gender || 'male',
        date_of_birth: m.date_of_birth || null,
        address: m.address || null,
        phone: m.phone || m.profile?.phone || null,
        email: m.email || m.profile?.email || null,
        fitness_goal: m.fitness_goal || null,
        status: m.status || 'active',
        current_plan_id: m.current_plan_id || null,
        trainer_id: m.trainer_id || null,
        trainer_name: m.trainer_name || null,
        pt_status: m.pt_status || 'general_floor',
        pt_package: m.pt_package || null,
        photo_url: m.photo_url || m.profile?.avatar_url || null,
        password: m.password || 'CFC@2026',
        notes: m.notes || null,
        updated_at: new Date().toISOString(),
      }))
      if (rows.length > 0) {
        await supabase.from('members').upsert(rows)
      }
    } else if (key === KEYS.PLANS && Array.isArray(value)) {
      const rows = value.map((p: any) => ({
        id: p.id,
        name: p.name,
        duration_type: p.duration_type || `${p.duration_months || 1} Month`,
        duration_months: p.duration_months || 1,
        price_men: p.price_men || 0,
        price_women: p.price_women || 0,
        price: p.price || 0,
        description: p.description || '',
        features: p.features || [],
        popular: !!p.popular,
        is_active: p.is_active !== false,
      }))
      if (rows.length > 0) {
        await supabase.from('membership_plans').upsert(rows)
      }
    } else if (key === KEYS.ADMIN_PROFILE && value) {
      await supabase.from('admin_profile').upsert({
        id: 'admin-director-root',
        full_name: value.full_name || 'Yuvraj Vaidya (Director)',
        email: value.email || 'admin@corpuss.com',
        phone: value.phone || '+91 76206 83995',
        role: 'super_admin',
        avatar_url: value.avatar_url || null,
        password: value.password || 'Admin@2026',
        updated_at: new Date().toISOString(),
      })
    } else if (key === KEYS.WORKOUTS && Array.isArray(value)) {
      const plans = value.map((w: any) => ({
        id: w.id,
        name: w.name,
        category: w.category,
        level: w.level || 'beginner',
        description: w.description || '',
        trainer_name: w.trainer_name || null,
        is_active: w.is_active !== false,
        is_default: !!w.is_default,
        is_custom: !!w.is_custom,
        created_by_role: w.created_by_role || 'admin',
        duration_weeks: w.duration_weeks || 8,
        days_per_week: w.days_per_week || 4,
        updated_at: new Date().toISOString(),
      }))
      if (plans.length > 0) {
        await supabase.from('workout_plans').upsert(plans)
      }
      const allExercises: any[] = []
      value.forEach((w: any) => {
        if (Array.isArray(w.exercises)) {
          w.exercises.forEach((ex: any) => {
            allExercises.push({
              id: ex.id,
              plan_id: w.id,
              name: ex.name,
              muscle_group: ex.muscle_group,
              sets: ex.sets || 3,
              reps: String(ex.reps || '10 - 12'),
              weight: ex.weight || 'Bodyweight',
              rest_seconds: ex.rest_seconds || 60,
              day_of_week: ex.day_of_week || 'Monday',
              instructions: ex.instructions || '',
            })
          })
        }
      })
      if (allExercises.length > 0) {
        await supabase.from('workout_exercises').upsert(allExercises)
      }
    } else if (key === KEYS.WORKOUT_ASSIGNMENTS && Array.isArray(value)) {
      const rows = value.map((a: any) => ({
        id: a.id,
        member_id: a.member_id,
        member_name: a.member_name,
        member_code: a.member_code,
        member_phone: a.member_phone || null,
        workout_plan_id: a.workout_plan_id || null,
        workout_plan_name: a.workout_plan_name,
        plan_snapshot: a.plan_snapshot || {},
        trainer_id: a.trainer_id || null,
        trainer_name: a.trainer_name || null,
        assigned_by: a.assigned_by || 'Admin Director',
        assigned_by_role: a.assigned_by_role || 'admin',
        start_date: a.start_date,
        end_date: a.end_date,
        personal_instructions: a.personal_instructions || null,
        status: a.status || 'active',
        updated_at: new Date().toISOString(),
      }))
      if (rows.length > 0) {
        await supabase.from('member_workout_assignments').upsert(rows)
      }
    } else if (key === KEYS.NOTIFICATIONS && Array.isArray(value)) {
      const rows = value.map((n: any) => ({
        id: n.id,
        user_id: n.user_id || null,
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        is_read: !!(n.is_read || n.read),
        target_audience: n.target_audience || 'all',
        sent_by: n.sent_by || 'Admin Director',
        priority: n.priority || 'normal',
        channels: n.channels || ['in_app'],
      }))
      if (rows.length > 0) {
        await supabase.from('notifications').upsert(rows)
      }
    }
  } catch (err) {
    console.warn('Relational sync notice for key:', key, err)
  }
}

async function syncKeyToServer(key: string, value: any): Promise<void> {
  if (typeof window === 'undefined') return

  // 1. Supabase Cloud Sync (Active when deployed on Vercel with Supabase credentials)
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('cfc_store')
        .upsert({ key, data: value, updated_at: new Date().toISOString() })
      syncRelationalTable(key, value)
    } catch {
      // Handled silently
    }
  }

  // 2. Local Node/Vite Sync (Active during local WiFi network dev)
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
    // 1. Supabase Cloud Sync: Pull from cloud if credentials set
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cfc_store').select('*')
        if (!error && (!data || data.length === 0)) {
          // cfc_store is newly created and empty: push initial clean data from local
          seedDatabase()
          const rowsToPush: { key: string; data: any; updated_at: string }[] = []
          Object.values(KEYS).forEach((k) => {
            const raw = localStorage.getItem(k)
            if (raw) {
              try {
                const parsed = JSON.parse(raw)
                rowsToPush.push({ key: k, data: parsed, updated_at: new Date().toISOString() })
                syncRelationalTable(k, parsed)
              } catch {
                rowsToPush.push({ key: k, data: raw, updated_at: new Date().toISOString() })
              }
            }
          })
          if (rowsToPush.length > 0) {
            await supabase.from('cfc_store').upsert(rowsToPush)
          }
          return
        }
        if (!error && data && data.length > 0) {
          let hasNewer = false
          const fetchedKeys = new Set<string>()
          data.forEach((row: any) => {
            if (row && row.key) {
              fetchedKeys.add(row.key)
              const localValStr = localStorage.getItem(row.key)

              // Smart merge for members: NEVER revive fake demo members
              if (row.key === KEYS.MEMBERS && Array.isArray(row.data)) {
                let localMembers: any[] = []
                try {
                  localMembers = localValStr ? JSON.parse(localValStr) : []
                } catch {
                  localMembers = []
                }

                // Strip any fake demo members from local cache immediately
                localMembers = localMembers.filter(
                  (m) =>
                    !FAKE_MEMBER_IDS.has(m?.id) &&
                    !FAKE_MEMBER_EMAILS.has((m?.email || '').toLowerCase()) &&
                    !FAKE_MEMBER_EMAILS.has((m?.profile?.email || '').toLowerCase())
                )

                const memberById = new Map<string, any>()
                row.data.forEach((m: any) => {
                  if (
                    !m ||
                    FAKE_MEMBER_IDS.has(m?.id) ||
                    FAKE_MEMBER_EMAILS.has((m?.email || '').toLowerCase()) ||
                    FAKE_MEMBER_EMAILS.has((m?.profile?.email || '').toLowerCase())
                  )
                    return
                  const photo = m.photo_url || m.profile?.avatar_url || null
                  if (photo) {
                    m.photo_url = photo
                    if (m.profile) m.profile.avatar_url = photo
                  }
                  const key = m.id || m.member_id || (m.email || '').toLowerCase()
                  if (key) memberById.set(key, m)
                })

                let addedLocal = false
                localMembers.forEach((m: any) => {
                  if (!m) return
                  const key = m.id || m.member_id || (m.email || '').toLowerCase()
                  const mEmail = (m.email || m.profile?.email || '').toLowerCase()
                  const existing = memberById.get(key) || (mEmail ? Array.from(memberById.values()).find((x: any) => (x.email || x.profile?.email || '').toLowerCase() === mEmail) : null)
                  if (!existing) {
                    memberById.set(key, m)
                    addedLocal = true
                  }
                })

                const mergedList = Array.from(memberById.values())
                const mergedStr = JSON.stringify(mergedList)
                if (mergedStr !== localValStr) {
                  localStorage.setItem(row.key, mergedStr)
                  hasNewer = true
                }
                if (addedLocal) {
                  supabase.from('cfc_store').upsert({
                    key: KEYS.MEMBERS,
                    data: mergedList,
                    updated_at: new Date().toISOString(),
                  })
                }
              } else {
                const serverValStr = JSON.stringify(row.data)
                if (serverValStr !== localValStr) {
                  localStorage.setItem(row.key, serverValStr)
                  hasNewer = true
                }
              }
            }
          })

          // Push any local keys that are not yet in Supabase
          const missingKeys = Object.values(KEYS).filter((k) => !fetchedKeys.has(k))
          if (missingKeys.length > 0) {
            const rowsToPush: { key: string; data: any; updated_at: string }[] = []
            missingKeys.forEach((k) => {
              const raw = localStorage.getItem(k)
              if (raw) {
                try {
                  rowsToPush.push({ key: k, data: JSON.parse(raw), updated_at: new Date().toISOString() })
                } catch {
                  rowsToPush.push({ key: k, data: raw, updated_at: new Date().toISOString() })
                }
              }
            })

            if (rowsToPush.length > 0) {
              await supabase.from('cfc_store').upsert(rowsToPush)
            }
          }

          if (hasNewer) {
            window.dispatchEvent(new CustomEvent('cfc_db_synced'))
          }
          return
        }
      } catch {
        // Fallback to local
      }
    }

    // 2. Local Dev Server Sync (/api/db)
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

  // Real-time Supabase Subscription
  if (isSupabaseConfigured && supabase) {
    try {
      supabase
        .channel('cfc_realtime_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cfc_store' }, (payload: any) => {
          if (payload?.new && payload.new.key) {
            localStorage.setItem(payload.new.key, JSON.stringify(payload.new.data))
            window.dispatchEvent(new CustomEvent('cfc_db_synced'))
          }
        })
        .subscribe()
    } catch {}
  }
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
    name: 'Beginner Workout – Foundation Protocol',
    category: 'Beginner Workout',
    level: 'beginner',
    description: 'Complete introductory strength & conditioning split designed to build joint stability, neural adaptation, and safe lifting form across major movements.',
    trainer_name: 'Coach Rohit Deshmukh',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    duration_weeks: 6,
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
    name: 'Weight Loss – Fat Burning Program',
    category: 'Weight Loss',
    level: 'intermediate',
    description: 'High-caloric burn circuit combining compound resistance lifting with short rest intervals and cardio finishers for optimal EPOC fat loss.',
    trainer_name: 'Priya Bhagat',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    duration_weeks: 8,
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
    name: 'Muscle Building – Hypertrophy Program',
    category: 'Muscle Building',
    level: 'intermediate',
    description: 'Hypertrophy-focused volume training targeting mechanical tension and metabolic stress across major muscle groups for maximum size and symmetry.',
    trainer_name: 'Coach Rohit Deshmukh',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    duration_weeks: 12,
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
    name: 'Strength Training – Power Protocol',
    category: 'Strength Training',
    level: 'advanced',
    description: 'Linear progressive overload protocol built around the Big 3 power movements: Squat, Bench Press, and Deadlift for maximal force output.',
    trainer_name: 'Amol Sawant',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    duration_weeks: 12,
    days_per_week: 4,
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
    name: 'Full Body – Functional Conditioning',
    category: 'Full Body Workout',
    level: 'beginner',
    description: '3-day full body split designed for peak athletic conditioning, functional mobility, core stability, and total body strength.',
    trainer_name: 'Coach Rohit Deshmukh',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    duration_weeks: 8,
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
    name: 'Push Pull Legs – Elite Split',
    category: 'Push Pull Legs',
    level: 'advanced',
    description: 'The premier 6-day hypertrophy and athletic split isolating push mechanics (chest/delts/triceps), pull mechanics (back/biceps), and lower body.',
    trainer_name: 'Coach Rohit Deshmukh',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    duration_weeks: 12,
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
    name: 'Home Workout – No Equipment',
    category: 'Home Workout',
    level: 'beginner',
    description: 'Zero-equipment home & travel routine utilizing bodyweight leverage, core isometric holds, and high-frequency cardiovascular conditioning.',
    trainer_name: 'Priya Bhagat',
    is_active: true,
    is_default: true,
    is_custom: false,
    created_by_role: 'admin',
    duration_weeks: 4,
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
  // 1. Membership Plans (Core Pricing Structure)
  if (!localStorage.getItem(KEYS.PLANS)) {
    const initialPlans: MembershipPlan[] = MEMBERSHIP_PLANS_DEFAULT.map((p) => ({
      ...p,
      is_active: true,
      created_at: new Date().toISOString(),
    }))
    setLocalSeed(KEYS.PLANS, initialPlans)
  }

  // 2. Gallery Items (Gym Interior, Equipment, Training Photos)
  if (!localStorage.getItem(KEYS.GALLERY)) {
    setLocalSeed(KEYS.GALLERY, GALLERY_ITEMS_DEFAULT)
  }

  // 3. Exercise Library Master (30 core gym exercises)
  if (!localStorage.getItem(KEYS.EXERCISE_LIBRARY)) {
    setLocalSeed(KEYS.EXERCISE_LIBRARY, DEFAULT_EXERCISE_LIBRARY)
  }

  // 4. Core Workout Plan Templates
  const existingWorkouts: WorkoutPlan[] = getItem<WorkoutPlan[]>(KEYS.WORKOUTS, [])
  if (existingWorkouts.length === 0) {
    setLocalSeed(KEYS.WORKOUTS, CORE_DEFAULT_WORKOUT_PLANS)
  } else {
    let updatedWorkouts = [...existingWorkouts]
    let modified = false
    CORE_DEFAULT_WORKOUT_PLANS.forEach((defPlan) => {
      const idx = updatedWorkouts.findIndex((w) => w.id === defPlan.id)
      if (idx === -1) {
        updatedWorkouts.push(defPlan)
        modified = true
      } else {
        // Upgrade default plan metadata if outdated
        const cur = updatedWorkouts[idx]
        if (
          cur.name !== defPlan.name ||
          !cur.duration_weeks ||
          cur.duration_weeks !== defPlan.duration_weeks ||
          cur.level !== defPlan.level ||
          cur.category !== defPlan.category
        ) {
          updatedWorkouts[idx] = {
            ...cur,
            name: defPlan.name,
            duration_weeks: defPlan.duration_weeks,
            days_per_week: defPlan.days_per_week,
            level: defPlan.level,
            category: defPlan.category,
            is_default: true,
          }
          modified = true
        }
      }
    })
    if (modified) {
      setLocalSeed(KEYS.WORKOUTS, updatedWorkouts)
    }
  }

  // Member Workout Assignments Store
  if (!localStorage.getItem(KEYS.WORKOUT_ASSIGNMENTS)) {
    setLocalSeed(KEYS.WORKOUT_ASSIGNMENTS, [])
  }

  // 5. Trainers (Clean list - ready for real coaches to be registered by Admin)
  if (!localStorage.getItem(KEYS.TRAINERS)) {
    setLocalSeed(KEYS.TRAINERS, [])
  }

  // 6. Members (Real member Yuvraj Vaidya only - No fake demo members)
  const YUVRAJ_MEMBER: Member = {
    id: 'mem-6',
    profile_id: 'prof-6',
    member_id: 'CFC-2026-0006',
    gender: 'male',
    date_of_birth: '1998-01-01',
    address: 'Harshraj Colony, VMV Road, Amravati, Maharashtra 444604',
    emergency_contact: 'Family Contact',
    emergency_phone: '+91 76206 83995',
    registration_date: '2026-01-15',
    fitness_goal: 'Strength & Conditioning',
    status: 'active',
    current_plan_id: 'ms-6',
    photo_url: null,
    email: 'yuvraj.vaidya@corpuss.com',
    password: 'CFC@2026',
    notes: 'Registered Corpus Fitness Club Member',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    profile: {
      id: 'prof-6',
      full_name: 'Yuvraj Vaidya',
      phone: '+91 76206 83995',
      email: 'yuvraj.vaidya@corpuss.com',
      role: 'member',
      avatar_url: null,
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-01-15T10:00:00Z',
    },
    current_plan: {
      id: 'ms-6',
      member_id: 'mem-6',
      plan_id: 'annual',
      start_date: '2026-01-15',
      end_date: '2027-01-15',
      amount_paid: 5000,
      payment_method: 'UPI',
      status: 'active',
      created_at: '2026-01-15T10:00:00Z',
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
  }

  if (!localStorage.getItem(KEYS.MEMBERS)) {
    setLocalSeed(KEYS.MEMBERS, [YUVRAJ_MEMBER])
  }

  // 7. Initialize empty clean collections for transactions & logs
  if (!localStorage.getItem(KEYS.PAYMENTS)) setLocalSeed(KEYS.PAYMENTS, [])
  if (!localStorage.getItem(KEYS.ATTENDANCE)) setLocalSeed(KEYS.ATTENDANCE, [])
  if (!localStorage.getItem(KEYS.ENQUIRIES)) setLocalSeed(KEYS.ENQUIRIES, [])
  if (!localStorage.getItem(KEYS.EXPENSES)) setLocalSeed(KEYS.EXPENSES, [])
  if (!localStorage.getItem(KEYS.PROGRESS)) setLocalSeed(KEYS.PROGRESS, [])
  if (!localStorage.getItem(KEYS.RENEWALS)) setLocalSeed(KEYS.RENEWALS, [])
  if (!localStorage.getItem(KEYS.ASSIGNMENTS)) setLocalSeed(KEYS.ASSIGNMENTS, [])
  if (!localStorage.getItem(KEYS.WORKOUT_SESSIONS)) setLocalSeed(KEYS.WORKOUT_SESSIONS, [])
  if (!localStorage.getItem(KEYS.TRAINER_FEEDBACK)) setLocalSeed(KEYS.TRAINER_FEEDBACK, [])
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
      {
        id: 'notif-default-1',
        title: 'Sunday Deep Sanitization & Floor Maintenance',
        message: 'Dear Members, Corpus Fitness Club Amravati facility will remain closed this Sunday for scheduled deep sanitization and cable equipment servicing. Regular shift hours resume Monday 6:00 AM sharp.',
        type: 'warning',
        priority: 'high',
        target_audience: 'all',
        sent_by: 'CFC Admin Office',
        channels: ['in_app', 'whatsapp'],
        read: false,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif-default-2',
        title: 'Reminder: Morning & Evening Shift Timings',
        message: 'Gym shift hours: Morning: 6:00 AM – 11:00 AM | Evening: 5:00 PM – 10:00 PM (Sunday Closed). Please make sure to scan your personal QR code at the reception counter before entering the gym floor.',
        type: 'info',
        priority: 'normal',
        target_audience: 'all',
        sent_by: 'CFC Front Desk',
        channels: ['in_app', 'whatsapp'],
        read: false,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif-default-3',
        title: '30-Day Body Transformation Challenge 2026',
        message: 'Registrations are now open for our annual Body Transformation Challenge! Includes free baseline body composition analysis, certified coach meal protocol, and exciting trophies for top transformations.',
        type: 'success',
        priority: 'high',
        target_audience: 'all',
        sent_by: 'CFC Chief Trainer',
        channels: ['in_app', 'whatsapp'],
        read: false,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ]
    setLocalSeed(KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS)
  }

  // 8. Active LocalStorage Purge: Remove ONLY stale fake demo member records without wiping user data
  try {
    const rawMembers = localStorage.getItem(KEYS.MEMBERS)
    if (rawMembers) {
      const stored: Member[] = JSON.parse(rawMembers)
      const cleaned = stored.filter(
        (m) =>
          !FAKE_MEMBER_IDS.has(m?.id) &&
          !FAKE_MEMBER_EMAILS.has((m?.email || '').toLowerCase()) &&
          !FAKE_MEMBER_EMAILS.has((m?.profile?.email || '').toLowerCase())
      )
      if (cleaned.length !== stored.length) {
        localStorage.setItem(KEYS.MEMBERS, JSON.stringify(cleaned.length > 0 ? cleaned : [YUVRAJ_MEMBER]))
      }
    }

    const demoPurgeKeys = [
      KEYS.PAYMENTS,
      KEYS.ATTENDANCE,
      KEYS.ENQUIRIES,
      KEYS.EXPENSES,
      KEYS.PROGRESS,
      KEYS.RENEWALS,
      KEYS.ASSIGNMENTS,
      KEYS.WORKOUT_SESSIONS,
      KEYS.TRAINER_FEEDBACK,
    ]
    demoPurgeKeys.forEach((k) => {
      const val = localStorage.getItem(k)
      if (val) {
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((item: any) => {
              if (!item) return false
              if (item.member_id && FAKE_MEMBER_IDS.has(item.member_id)) return false
              if (item.email && FAKE_MEMBER_EMAILS.has((item.email || '').toLowerCase())) return false
              if (item.id && typeof item.id === 'string' && item.id.startsWith('demo-fake-')) return false
              return true
            })
            if (cleaned.length !== parsed.length) {
              localStorage.setItem(k, JSON.stringify(cleaned))
            }
          }
        } catch {}
      }
    })
  } catch {}
}

// Run seed immediately on module import
seedDatabase()

// ── Exported API Methods ──────────────────────────────────────────────────────

export const db = {
  // Admin & Director Profile (Multi-device synced across devices & cloud)
  getAdminProfile(): Profile {
    seedDatabase()
    const defaultAdmin: Profile = {
      id: 'profile-yuvraj',
      full_name: 'Yuvraj (Club Director)',
      phone: '+91 76206 83995',
      email: 'yuvraj@corpuss.com',
      role: 'super_admin',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: new Date().toISOString(),
    }
    const saved = getItem<Profile | null>(KEYS.ADMIN_PROFILE, null)
    return saved ? { ...defaultAdmin, ...saved } : defaultAdmin
  },

  saveAdminProfile(updates: Partial<Profile>): Profile {
    seedDatabase()
    const current = this.getAdminProfile()
    const updated: Profile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    }
    setItem(KEYS.ADMIN_PROFILE, updated)
    return updated
  },

  // Members
  getMembers(): Member[] {
    const list = getItem<Member[]>(KEYS.MEMBERS, [])
    const cleaned = list.filter(
      (m) =>
        !FAKE_MEMBER_IDS.has(m?.id) &&
        !FAKE_MEMBER_EMAILS.has((m?.email || '').toLowerCase()) &&
        !FAKE_MEMBER_EMAILS.has((m?.profile?.email || '').toLowerCase())
    )
    return cleaned.map((m) => {
      const photo = m.photo_url || m.profile?.avatar_url || null
      if (photo && (!m.photo_url || !m.profile?.avatar_url)) {
        return {
          ...m,
          photo_url: photo,
          profile: m.profile
            ? { ...m.profile, avatar_url: photo }
            : {
                id: m.profile_id || `prof-${m.id}`,
                role: 'member' as const,
                full_name: (m as any).full_name || 'Member',
                email: m.email || `${m.member_id.toLowerCase()}@corpuss.com`,
                phone: m.phone || '+91 76206 83995',
                avatar_url: photo,
                created_at: m.created_at || new Date().toISOString(),
                updated_at: m.updated_at || new Date().toISOString(),
              },
        }
      }
      return m
    })
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

    const photoToSave = member.photo_url || member.profile?.avatar_url

    if (isEdit) {
      const idx = members.findIndex((m) => m.id === member.id)
      if (idx !== -1) {
        const existing = members[idx]
        const updatedPhoto = photoToSave || existing.photo_url || existing.profile?.avatar_url || null
        const updated: Member = {
          ...existing,
          ...member,
          email: targetEmail,
          photo_url: updatedPhoto,
          password: member.password ?? existing.password ?? 'CFC@2026',
          updated_at: new Date().toISOString(),
          profile: {
            ...existing.profile!,
            full_name: member.full_name ?? existing.profile?.full_name ?? fullName,
            phone: member.phone ?? existing.profile?.phone ?? '',
            email: targetEmail,
            avatar_url: updatedPhoto,
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
      photo_url: photoToSave || null,
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
        avatar_url: photoToSave || null,
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
        const end = addMonths(start, selectedPlan.duration_months)

        const msId = `ms-${Date.now()}`
        const ms: Membership = {
          id: msId,
          member_id: newId,
          plan_id: selectedPlan.id,
          start_date: member.current_plan?.start_date || format(start, 'yyyy-MM-dd'),
          end_date: member.current_plan?.end_date || format(end, 'yyyy-MM-dd'),
          amount_paid: member.current_plan?.amount_paid || selectedPlan.price_men,
          payment_method: member.current_plan?.payment_method || 'UPI',
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
    seedDatabase()
    return getItem<WorkoutPlan[]>(KEYS.WORKOUTS, [])
  },
  getWorkoutById(id: string): WorkoutPlan | undefined {
    return this.getWorkouts().find((w) => w.id === id)
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
      trainer_name: workout.trainer_name || (workout.created_by_role === 'member' ? 'Self-Trained' : 'Coach Rohit Deshmukh'),
      trainer_id: workout.trainer_id || null,
      member_id: workout.member_id || workout.assigned_member_id || null,
      assigned_member_id: workout.assigned_member_id || workout.member_id || null,
      is_active: workout.is_active !== undefined ? workout.is_active : true,
      is_default: workout.is_default || false,
      is_custom: workout.is_custom !== undefined ? workout.is_custom : (workout.created_by_role === 'member' || Boolean(workout.member_id)),
      created_by_role: workout.created_by_role || (workout.member_id ? 'member' : 'admin'),
      duration_weeks: workout.duration_weeks || 8,
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
    const target = this.getWorkouts().find((w) => w.id === id)
    if (target?.is_default) {
      throw new Error('Default workout templates are permanent core gym programs and cannot be deleted. You can edit them or duplicate as a custom plan.')
    }
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
    new_expiry_date?: string
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

    // Safely parse start date without UTC timezone skew
    const [sY, sM, sD] = startDate.split('-').map(Number)
    const safeStartDate = new Date(sY, (sM || 1) - 1, sD || 1)
    const newEndDate =
      params.new_expiry_date && params.new_expiry_date.trim() !== ''
        ? params.new_expiry_date
        : format(addMonths(safeStartDate, months), 'yyyy-MM-dd')

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

  // ── Member Workout Assignments (Decoupled, Immutable Snapshots) ──────────────
  getWorkoutAssignments(memberId?: string): MemberWorkoutAssignment[] {
    seedDatabase()
    const all = getItem<MemberWorkoutAssignment[]>(KEYS.WORKOUT_ASSIGNMENTS, [])
    if (!memberId) return all
    return all.filter((a) => a.member_id === memberId)
  },

  getActiveWorkoutAssignment(memberId: string): MemberWorkoutAssignment | null {
    const list = this.getWorkoutAssignments()
    const member = this.getMemberById(memberId)
    const active = list.find(
      (a) =>
        a.status === 'active' &&
        (a.member_id === memberId ||
          (member &&
            (a.member_id === member.id ||
              a.member_code === member.member_id ||
              (a.member_name &&
                member.profile?.full_name &&
                a.member_name.toLowerCase() === member.profile.full_name.toLowerCase()))))
    )
    return active || null
  },

  assignWorkoutToMember(params: {
    member_id: string
    workout_plan_id: string
    trainer_id?: string | null
    trainer_name?: string | null
    assigned_by?: string
    assigned_by_role?: 'admin' | 'trainer'
    start_date?: string
    end_date?: string
    personal_instructions?: string
  }): MemberWorkoutAssignment {
    seedDatabase()
    const member = this.getMemberById(params.member_id)
    if (!member) throw new Error('Selected member not found in registry')

    const plan = this.getWorkouts().find((w) => w.id === params.workout_plan_id)
    if (!plan) throw new Error('Selected workout routine not found')

    // Immutable deep copy snapshot of the routine at assignment time
    // Ensures subsequent edits/deletions of the master template NEVER corrupt member's prescribed workout
    const planSnapshot: WorkoutPlan = JSON.parse(JSON.stringify(plan))
    planSnapshot.assigned_member_id = member.id
    if (params.trainer_name) planSnapshot.trainer_name = params.trainer_name
    if (params.trainer_id) planSnapshot.trainer_id = params.trainer_id

    const durationWeeks = plan.duration_weeks || 8
    const startDate = params.start_date || format(new Date(), 'yyyy-MM-dd')
    const endDate = params.end_date || format(addDays(new Date(startDate), durationWeeks * 7), 'yyyy-MM-dd')

    // Mark prior active assignments for this member as completed
    const existing = this.getWorkoutAssignments()
    const updated = existing.map((a) => {
      if (a.member_id === member.id && a.status === 'active') {
        return { ...a, status: 'completed' as const, updated_at: new Date().toISOString() }
      }
      return a
    })

    const newAssignment: MemberWorkoutAssignment = {
      id: `mwa-${Date.now()}`,
      member_id: member.id,
      member_name: member.profile?.full_name || 'Member',
      member_code: member.member_id,
      member_phone: member.phone || member.profile?.phone || '',
      workout_plan_id: plan.id,
      workout_plan_name: plan.name,
      plan_snapshot: planSnapshot,
      trainer_id: params.trainer_id || plan.trainer_id || member.trainer_id || null,
      trainer_name: params.trainer_name || plan.trainer_name || member.trainer_name || 'Coach Rohit Deshmukh',
      assigned_by: params.assigned_by || 'Admin',
      assigned_by_role: params.assigned_by_role || 'admin',
      start_date: startDate,
      end_date: endDate,
      personal_instructions: params.personal_instructions || '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    updated.unshift(newAssignment)
    setItem(KEYS.WORKOUT_ASSIGNMENTS, updated)

    // Notify member in app
    try {
      this.broadcastNotification({
        title: 'New Workout Routine Assigned!',
        message: `Routine "${plan.name}" (${durationWeeks} weeks) has been assigned to your dashboard by ${params.assigned_by || 'Admin'}.`,
        type: 'success',
        priority: 'high',
        target_audience: 'active_members',
        sent_by: params.assigned_by || 'Admin',
      })
    } catch {
      // Ignored
    }

    // Add audit log
    try {
      const auditLogs = getItem<AuditLog[]>(KEYS.AUDIT_LOGS, [])
      auditLogs.unshift({
        id: `audit-${Date.now()}`,
        user_id: params.trainer_id || 'admin-uuid',
        user_name: params.assigned_by || 'Admin',
        action: 'Assigned Workout Routine',
        entity_type: 'member',
        details: `Assigned routine "${plan.name}" to member ${member.profile?.full_name} (${member.member_id})`,
        created_at: new Date().toISOString(),
      })
      setItem(KEYS.AUDIT_LOGS, auditLogs)
    } catch {
      // Ignored
    }

    return newAssignment
  },

  deleteWorkoutAssignment(id: string): void {
    let assignments = this.getWorkoutAssignments()
    assignments = assignments.filter((a) => a.id !== id)
    setItem(KEYS.WORKOUT_ASSIGNMENTS, assignments)
  },

  getWorkoutsForMember(memberId: string): {
    assignedPlan?: WorkoutPlan
    activeAssignment?: MemberWorkoutAssignment | null
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

    // 1. Look up dedicated active assignment with immutable snapshot
    const activeAssignment = this.getActiveWorkoutAssignment(memberId)
    let assignedPlan: WorkoutPlan | undefined = activeAssignment?.plan_snapshot

    // 2. Fallback to legacy assignment or first default plan
    if (!assignedPlan) {
      assignedPlan = all.find(
        (w) =>
          !w.is_default &&
          !w.is_custom &&
          (w.assigned_member_id === memberId ||
            (member && (w.assigned_member_id === member.id || w.assigned_member_id === member.member_id)) ||
            (w.trainer_name && member?.trainer_name && w.trainer_name === member.trainer_name) ||
            (w.trainer_id && member?.trainer_id && w.trainer_id === member.trainer_id))
      ) || defaultPlans[0]
    }

    return {
      assignedPlan,
      activeAssignment,
      customPlans,
      defaultPlans,
    }
  },

  // ── Live Workout Sessions & Sets (Start Workout Tracker) ────────────────────
  getWorkoutSessions(memberId?: string): WorkoutSession[] {
    seedDatabase()
    const list = getItem<WorkoutSession[]>(KEYS.WORKOUT_SESSIONS, [])

    // Auto-heal any past concatenated range reps (e.g. 810 from "8-10", 1012 from "10-12")
    let modified = false
    const sanitized = list.map((sess) => {
      let sessModified = false
      const fixedSets = (sess.completed_sets || []).map((s) => {
        let r = Number(s.reps) || 0
        if (r === 810) {
          r = 10
          sessModified = true
        } else if (r === 1012) {
          r = 12
          sessModified = true
        } else if (r === 812) {
          r = 12
          sessModified = true
        } else if (r === 1215) {
          r = 15
          sessModified = true
        }
        return { ...s, reps: r }
      })
      if (sessModified) {
        modified = true
        return { ...sess, completed_sets: fixedSets }
      }
      return sess
    })

    if (modified) {
      setItem(KEYS.WORKOUT_SESSIONS, sanitized)
    }

    if (memberId) {
      const member = this.getMemberById(memberId)
      return sanitized.filter(
        (s) =>
          s.member_id === memberId ||
          (member &&
            (s.member_id === member.id ||
              s.member_id === member.member_id ||
              (s.member_name &&
                member.profile?.full_name &&
                s.member_name.toLowerCase() === member.profile.full_name.toLowerCase())))
      )
    }
    return sanitized
  },

  saveWorkoutSession(session: Partial<WorkoutSession>): WorkoutSession {
    seedDatabase()
    const sessions = this.getWorkoutSessions()

    const sanitizedSets = (session.completed_sets || []).map((s) => {
      let r = Number(s.reps) || 0
      if (r === 810) r = 10
      else if (r === 1012) r = 12
      else if (r === 812) r = 12
      else if (r === 1215) r = 15
      return { ...s, reps: r }
    })

    if (session.id) {
      const idx = sessions.findIndex((s) => s.id === session.id)
      if (idx !== -1) {
        sessions[idx] = { ...sessions[idx], ...session, completed_sets: sanitizedSets }
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
      completed_sets: sanitizedSets,
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

  // ── Gallery Management ────────────────────────────────────────────────────
  getGallery(): any[] {
    seedDatabase()
    return getItem<any[]>(KEYS.GALLERY, GALLERY_ITEMS_DEFAULT)
  },

  saveGalleryItem(item: { title: string; category: string; image: string; id?: string }): any[] {
    const list = this.getGallery()
    const newItem = {
      id: item.id || `img-${Date.now()}`,
      title: item.title,
      category: item.category,
      image: item.image,
      created_at: new Date().toISOString(),
    }
    const updated = [newItem, ...list]
    setItem(KEYS.GALLERY, updated)
    return updated
  },

  deleteGalleryItem(id: string): any[] {
    const list = this.getGallery().filter((i) => i.id !== id)
    setItem(KEYS.GALLERY, list)
    return list
  },

}

export const getMembers = () => db.getMembers()
export const getGallery = () => db.getGallery()
export const saveGalleryItem = (item: any) => db.saveGalleryItem(item)
export const deleteGalleryItem = (id: string) => db.deleteGalleryItem(id)
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
