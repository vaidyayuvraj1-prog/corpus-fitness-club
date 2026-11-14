import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Clock,
  CheckCircle2,
  ChevronRight,
  Activity,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Flame,
  Trophy,
  Copy,
  Edit2,
  Trash2,
  ArrowRight,
  UserCheck,
  UserX,
  Phone,
  MessageCircle,
  AlertCircle,
  Save,
  Check,
  Sparkles,
  BookOpen,
  History,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/db'
import type {
  WorkoutPlan,
  Exercise,
  Member,
  ExerciseLibraryItem,
  WorkoutSession,
  WorkoutSetRecord,
} from '@/types/database'
import { format } from 'date-fns'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function MemberWorkout() {
  const { profile } = useAuth()
  const [member, setMember] = useState<Member | null>(null)
  const [activeTab, setActiveTab] = useState<'routines' | 'custom' | 'live_workout' | 'history'>('routines')

  // Plans data
  const [defaultPlans, setDefaultPlans] = useState<WorkoutPlan[]>([])
  const [customPlans, setCustomPlans] = useState<WorkoutPlan[]>([])
  const [assignedPlan, setAssignedPlan] = useState<WorkoutPlan | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)
  const [selectedDayFilter, setSelectedDayFilter] = useState('All')

  // Exercise Library
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibraryItem[]>([])

  // Workout History
  const [pastSessions, setPastSessions] = useState<WorkoutSession[]>([])

  // Custom Plan Builder Modal
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [editingCustomPlan, setEditingCustomPlan] = useState<WorkoutPlan | null>(null)
  const [customForm, setCustomForm] = useState({
    name: '',
    category: 'Muscle Building',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    description: '',
    days_per_week: 4,
    exercises: [] as Exercise[],
  })

  // ── Live Active Workout Session Tracker State ──────────────────────────────
  const [isLiveActive, setIsLiveActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerIntervalRef = useRef<any>(null)

  const [activeSessionPlan, setActiveSessionPlan] = useState<WorkoutPlan | null>(null)
  const [liveSets, setLiveSets] = useState<{
    exercise_name: string
    muscle_group: string
    sets: {
      set_number: number
      target_reps: string
      target_weight: string
      actual_reps: number
      actual_weight: number
      completed: boolean
    }[]
  }[]>([])
  const [sessionNotes, setSessionNotes] = useState('')

  useEffect(() => {
    loadData()
    const handleSync = () => loadData()
    window.addEventListener('cfc_db_synced', handleSync)
    return () => window.removeEventListener('cfc_db_synced', handleSync)
  }, [profile])

  // Timer tick effect
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [timerRunning])

  function loadData() {
    const allMembers = db.getMembers()
    const matched =
      allMembers.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
      allMembers[0]

    setMember(matched)
    const exLib = db.getExerciseLibrary()
    setExerciseLibrary(exLib)

    if (matched) {
      const { assignedPlan: assigned, customPlans: custom, defaultPlans: defaults } =
        db.getWorkoutsForMember(matched.id)

      setDefaultPlans(defaults)
      setCustomPlans(custom)
      setAssignedPlan(assigned || defaults[0] || null)
      setSelectedPlan(assigned || defaults[0] || null)

      const history = db.getWorkoutSessions(matched.id)
      setPastSessions(history)
    }
  }

  const hasTrainer = Boolean(member?.trainer_id && member.trainer_id !== 'none' && member?.trainer_name)

  // ── Live Session Helpers ───────────────────────────────────────────────────
  const startLiveWorkout = (planToStart?: WorkoutPlan) => {
    const plan = planToStart || selectedPlan || defaultPlans[0]
    if (!plan) {
      toast.error('Please select a routine to start')
      return
    }

    setActiveSessionPlan(plan)
    // Build live sets grid from plan's exercises
    const grouped: {
      exercise_name: string
      muscle_group: string
      sets: {
        set_number: number
        target_reps: string
        target_weight: string
        actual_reps: number
        actual_weight: number
        completed: boolean
      }[]
    }[] = []

    const exercises =
      plan.exercises && plan.exercises.length > 0
        ? plan.exercises
        : db
            .getExerciseLibrary()
            .slice(0, 5)
            .map((item, idx) => ({
              id: `ex-${idx}`,
              plan_id: plan.id,
              name: item.name,
              muscle_group: item.muscle_group,
              sets: item.default_sets || 3,
              reps: item.default_reps || '10-12',
              weight: '25 kg',
              rest_seconds: item.default_rest_seconds || 60,
              day_of_week: 'General',
              instructions: item.instructions,
            }))

    exercises.forEach((ex) => {
      const numSets = Number(ex.sets) || 3

      // Safe numeric weight extraction (handles "60-80 kg" -> 60, "25 kg" -> 25)
      const weightMatch = String(ex.weight || '20').match(/\d+(?:\.\d+)?/)
      const defaultWeightNum = weightMatch ? parseFloat(weightMatch[0]) : 20

      // Safe numeric reps extraction:
      // Handles ranges like "8-10", "8 - 10", "10-12", "12-15" cleanly WITHOUT concatenating into 810 or 1012!
      const defaultRepsNum = (() => {
        const str = String(ex.reps || '10').trim()
        const nums = str.match(/\d+/g)
        if (!nums || nums.length === 0) return 10
        if (nums.length === 1) return parseInt(nums[0], 10) || 10
        // For range like "8-10", default to upper target (10) or lower target (8)
        // Taking upper target e.g. 10 gives realistic single set rep count instead of 810!
        return parseInt(nums[1] || nums[0], 10) || 10
      })()

      const setsArr = []
      for (let s = 1; s <= numSets; s++) {
        setsArr.push({
          set_number: s,
          target_reps: ex.reps || '10',
          target_weight: ex.weight || '20 kg',
          actual_reps: defaultRepsNum,
          actual_weight: defaultWeightNum,
          completed: false,
        })
      }

      grouped.push({
        exercise_name: ex.name,
        muscle_group: ex.muscle_group || 'Compound',
        sets: setsArr,
      })
    })

    setLiveSets(grouped)
    setIsLiveActive(true)
    setTimerSeconds(0)
    setTimerRunning(true)
    setSessionNotes('')
    setActiveTab('live_workout')
    toast.success(`Live workout started: ${plan.name}`)
  }

  // 100% Immutable toggle for React state reconciliation
  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    setLiveSets((prev) =>
      prev.map((group, gIdx) => {
        if (gIdx !== exIdx) return group
        return {
          ...group,
          sets: group.sets.map((set, sIdx) => {
            if (sIdx !== setIdx) return set
            return {
              ...set,
              completed: !set.completed,
            }
          }),
        }
      })
    )
  }

  const toggleAllSetsForExercise = (exIdx: number) => {
    setLiveSets((prev) =>
      prev.map((group, gIdx) => {
        if (gIdx !== exIdx) return group
        const allCompleted = group.sets.every((s) => s.completed)
        return {
          ...group,
          sets: group.sets.map((set) => ({
            ...set,
            completed: !allCompleted,
          })),
        }
      })
    )
  }

  const markAllWorkoutSetsDone = () => {
    setLiveSets((prev) =>
      prev.map((group) => ({
        ...group,
        sets: group.sets.map((set) => ({
          ...set,
          completed: true,
        })),
      }))
    )
    toast.success('All sets checked off!')
  }

  const updateSetWeight = (exIdx: number, setIdx: number, val: number) => {
    setLiveSets((prev) =>
      prev.map((group, gIdx) => {
        if (gIdx !== exIdx) return group
        return {
          ...group,
          sets: group.sets.map((set, sIdx) => {
            if (sIdx !== setIdx) return set
            return {
              ...set,
              actual_weight: val,
            }
          }),
        }
      })
    )
  }

  const updateSetReps = (exIdx: number, setIdx: number, val: number) => {
    setLiveSets((prev) =>
      prev.map((group, gIdx) => {
        if (gIdx !== exIdx) return group
        return {
          ...group,
          sets: group.sets.map((set, sIdx) => {
            if (sIdx !== setIdx) return set
            return {
              ...set,
              actual_reps: val,
            }
          }),
        }
      })
    )
  }

  const finishWorkoutSession = () => {
    if (!member) {
      toast.error('Member profile not loaded')
      return
    }

    // Collect all completed sets
    let recordedSets: WorkoutSetRecord[] = []
    let totalVolume = 0

    liveSets.forEach((group) => {
      group.sets.forEach((s) => {
        if (s.completed) {
          const safeReps = s.actual_reps === 810 ? 10 : (s.actual_reps === 1012 ? 12 : (s.actual_reps === 812 ? 12 : s.actual_reps))
          recordedSets.push({
            id: `set-${Date.now()}-${Math.random()}`,
            exercise_name: group.exercise_name,
            muscle_group: group.muscle_group,
            set_number: s.set_number,
            reps: safeReps,
            weight_kg: s.actual_weight,
            completed: true,
            target_reps: s.target_reps,
            target_weight: s.target_weight,
          })
          totalVolume += s.actual_weight * safeReps
        }
      })
    })

    // If user clicked Finish without manually checking, auto-complete all sets so they are not blocked!
    if (recordedSets.length === 0) {
      liveSets.forEach((group) => {
        group.sets.forEach((s) => {
          const safeReps = s.actual_reps === 810 ? 10 : (s.actual_reps === 1012 ? 12 : (s.actual_reps === 812 ? 12 : s.actual_reps))
          recordedSets.push({
            id: `set-${Date.now()}-${Math.random()}`,
            exercise_name: group.exercise_name,
            muscle_group: group.muscle_group,
            set_number: s.set_number,
            reps: safeReps,
            weight_kg: s.actual_weight,
            completed: true,
            target_reps: s.target_reps,
            target_weight: s.target_weight,
          })
          totalVolume += s.actual_weight * safeReps
        })
      })
      toast.success('Auto-completed all sets for your logged session!')
    }

    const durationMins = Math.max(1, Math.round(timerSeconds / 60))

    try {
      db.saveWorkoutSession({
        member_id: member.id,
        member_name: member.profile?.full_name || 'Member',
        plan_id: activeSessionPlan?.id || null,
        plan_name: activeSessionPlan?.name || 'Custom Live Workout',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: format(new Date(Date.now() - timerSeconds * 1000), 'hh:mm a'),
        end_time: format(new Date(), 'hh:mm a'),
        duration_minutes: durationMins,
        notes: sessionNotes || 'Live session completed on gym floor.',
        trainer_id: member.trainer_id || null,
        trainer_name: member.trainer_name || null,
        completed_sets: recordedSets,
      })

      // Also ensure gym check-in is logged for today if not already
      try {
        if (!db.checkDuplicateAttendance(member.id)) {
          db.markAttendance(member.id, 'qr', 'Active Workout Session')
        }
      } catch (attErr) {
        console.warn('Attendance auto-log skipped:', attErr)
      }

      setTimerRunning(false)
      setIsLiveActive(false)
      toast.success(
        `🏆 Workout logged! ${recordedSets.length} sets completed · ${totalVolume.toLocaleString()} kg total volume!`
      )
      loadData()
      setActiveTab('history')
    } catch {
      toast.error('Failed to save workout session')
    }
  }

  // ── Custom Plan Builder Helpers ───────────────────────────────────────────
  const handleOpenNewCustomPlan = () => {
    setEditingCustomPlan(null)
    setCustomForm({
      name: '',
      category: 'Muscle Building',
      level: 'intermediate',
      description: '',
      days_per_week: 4,
      exercises: [
        {
          id: `ex-${Date.now()}`,
          plan_id: '',
          name: 'Barbell Flat Bench Press',
          muscle_group: 'Chest',
          sets: 4,
          reps: '8 - 12',
          weight: '60 kg',
          rest_seconds: 90,
          day_of_week: 'Monday',
          instructions: 'Retract scapulae and press upward in control.',
        },
      ],
    })
    setShowCustomModal(true)
  }

  const handleOpenEditCustomPlan = (wp: WorkoutPlan) => {
    setEditingCustomPlan(wp)
    setCustomForm({
      name: wp.name,
      category: wp.category,
      level: wp.level,
      description: wp.description,
      days_per_week: wp.days_per_week || 4,
      exercises: wp.exercises && wp.exercises.length > 0 ? wp.exercises : [],
    })
    setShowCustomModal(true)
  }

  const handleAddCustomExerciseRow = () => {
    const fallbackEx = exerciseLibrary[customForm.exercises.length % (exerciseLibrary.length || 1)]
    setCustomForm((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          plan_id: editingCustomPlan?.id || '',
          name: fallbackEx?.name || 'Incline Dumbbell Press',
          muscle_group: fallbackEx?.muscle_group || 'Chest',
          sets: fallbackEx?.default_sets || 3,
          reps: fallbackEx?.default_reps || '10 - 12',
          weight: '20 kg',
          rest_seconds: fallbackEx?.default_rest_seconds || 60,
          day_of_week: 'Monday',
          instructions: fallbackEx?.instructions || '',
        },
      ],
    }))
  }

  const handleApplyPresetTemplate = (templateKey: 'ppl' | 'upper_lower' | 'fat_loss') => {
    if (templateKey === 'ppl') {
      setEditingCustomPlan(null)
      setCustomForm({
        name: 'My 3-Day Push Pull Legs Split',
        category: 'Push Pull Legs',
        level: 'intermediate',
        description: 'Comprehensive 3-day split prioritizing progressive overload and compound strength movements.',
        days_per_week: 3,
        exercises: [
          {
            id: `ex-${Date.now()}-1`,
            plan_id: '',
            name: 'Barbell Flat Bench Press',
            muscle_group: 'Chest',
            sets: 4,
            reps: '8 - 10',
            weight: '60 kg',
            rest_seconds: 90,
            day_of_week: 'Monday',
            instructions: 'Retract scapulae and drive through chest to lockout.',
          },
          {
            id: `ex-${Date.now()}-2`,
            plan_id: '',
            name: 'Lat Pulldown (Wide Grip)',
            muscle_group: 'Back',
            sets: 4,
            reps: '10 - 12',
            weight: '55 kg',
            rest_seconds: 75,
            day_of_week: 'Wednesday',
            instructions: 'Pull bar to upper sternum squeezing lats downwards.',
          },
          {
            id: `ex-${Date.now()}-3`,
            plan_id: '',
            name: 'Barbell Back Squat',
            muscle_group: 'Legs',
            sets: 4,
            reps: '8 - 10',
            weight: '80 kg',
            rest_seconds: 120,
            day_of_week: 'Friday',
            instructions: 'Break at hips and knees, descend to parallel and drive back up.',
          },
          {
            id: `ex-${Date.now()}-4`,
            plan_id: '',
            name: 'Dumbbell Shoulder Press',
            muscle_group: 'Shoulders',
            sets: 3,
            reps: '10 - 12',
            weight: '20 kg',
            rest_seconds: 60,
            day_of_week: 'Monday',
            instructions: 'Press dumbbells overhead without arching lower back.',
          },
          {
            id: `ex-${Date.now()}-5`,
            plan_id: '',
            name: 'Barbell Bicep Curl',
            muscle_group: 'Arms',
            sets: 3,
            reps: '12',
            weight: '25 kg',
            rest_seconds: 60,
            day_of_week: 'Wednesday',
            instructions: 'Keep elbows tucked and curl under strict control.',
          },
        ],
      })
      setShowCustomModal(true)
    } else if (templateKey === 'upper_lower') {
      setEditingCustomPlan(null)
      setCustomForm({
        name: 'My 4-Day Upper / Lower Power Split',
        category: 'Muscle Building',
        level: 'intermediate',
        description: 'Balanced 4-day split for maximizing muscle hypertrophy and functional strength.',
        days_per_week: 4,
        exercises: [
          {
            id: `ex-${Date.now()}-1`,
            plan_id: '',
            name: 'Incline Dumbbell Press',
            muscle_group: 'Chest',
            sets: 4,
            reps: '10 - 12',
            weight: '26 kg',
            rest_seconds: 75,
            day_of_week: 'Monday',
            instructions: 'Set bench to 30 degrees, full stretch at bottom.',
          },
          {
            id: `ex-${Date.now()}-2`,
            plan_id: '',
            name: 'Seated Cable Row',
            muscle_group: 'Back',
            sets: 4,
            reps: '10 - 12',
            weight: '60 kg',
            rest_seconds: 75,
            day_of_week: 'Monday',
            instructions: 'Pull handle into lower abdomen with tall spine.',
          },
          {
            id: `ex-${Date.now()}-3`,
            plan_id: '',
            name: 'Leg Press 45°',
            muscle_group: 'Legs',
            sets: 4,
            reps: '12 - 15',
            weight: '140 kg',
            rest_seconds: 90,
            day_of_week: 'Tuesday',
            instructions: 'Lower sled until knees reach 90 degrees, press through mid-foot.',
          },
          {
            id: `ex-${Date.now()}-4`,
            plan_id: '',
            name: 'Romanian Deadlift (Dumbbell)',
            muscle_group: 'Legs',
            sets: 3,
            reps: '10 - 12',
            weight: '24 kg',
            rest_seconds: 75,
            day_of_week: 'Tuesday',
            instructions: 'Hinge hips backwards feeling deep hamstring stretch.',
          },
        ],
      })
      setShowCustomModal(true)
    } else {
      setEditingCustomPlan(null)
      setCustomForm({
        name: 'My Fat Loss & Conditioning Circuit',
        category: 'Weight Loss',
        level: 'beginner',
        description: 'High-intensity conditioning circuit designed to maximize calorie burn and metabolic conditioning.',
        days_per_week: 4,
        exercises: [
          {
            id: `ex-${Date.now()}-1`,
            plan_id: '',
            name: 'Push-Ups (Standard / Incline)',
            muscle_group: 'Chest',
            sets: 3,
            reps: '15',
            weight: 'Bodyweight',
            rest_seconds: 45,
            day_of_week: 'Monday',
            instructions: 'Maintain rigid core plank throughout movement.',
          },
          {
            id: `ex-${Date.now()}-2`,
            plan_id: '',
            name: 'Goblet Squats',
            muscle_group: 'Legs',
            sets: 3,
            reps: '15',
            weight: '16 kg',
            rest_seconds: 45,
            day_of_week: 'Monday',
            instructions: 'Hold dumbbell vertically at chest height, squat deep.',
          },
          {
            id: `ex-${Date.now()}-3`,
            plan_id: '',
            name: 'Kettlebell Swings',
            muscle_group: 'Full Body',
            sets: 4,
            reps: '20',
            weight: '16 kg',
            rest_seconds: 45,
            day_of_week: 'Wednesday',
            instructions: 'Powerful hip hinge snapping hips forward at top.',
          },
          {
            id: `ex-${Date.now()}-4`,
            plan_id: '',
            name: 'Plank Hold (Core)',
            muscle_group: 'Core',
            sets: 3,
            reps: '45 sec',
            weight: 'Bodyweight',
            rest_seconds: 30,
            day_of_week: 'Wednesday',
            instructions: 'Engage glutes and brace core tightly.',
          },
        ],
      })
      setShowCustomModal(true)
    }
  }

  const handleSelectFromLibraryForCustom = (index: number, libItemId: string) => {
    const item = exerciseLibrary.find((i) => i.id === libItemId)
    if (!item) return

    setCustomForm((prev) => {
      const updated = [...prev.exercises]
      updated[index] = {
        ...updated[index],
        name: item.name,
        muscle_group: item.muscle_group,
        sets: item.default_sets || 3,
        reps: item.default_reps || '10 - 12',
        rest_seconds: item.default_rest_seconds || 60,
        instructions: item.instructions || '',
      }
      return { ...prev, exercises: updated }
    })
  }

  const handleRemoveCustomExerciseRow = (index: number) => {
    if (customForm.exercises.length <= 1) {
      toast.error('Must include at least 1 exercise in the plan')
      return
    }
    setCustomForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }))
  }

  const handleSaveCustomPlan = (e: React.FormEvent) => {
    e.preventDefault()

    const allMembers = db.getMembers()
    const targetMember =
      member ||
      allMembers.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
      allMembers[0]

    if (!targetMember) {
      toast.error('Member profile not loaded. Please refresh.')
      return
    }

    if (!customForm.name.trim()) {
      toast.error('Please enter a routine title (e.g. "My 4-Day Hypertrophy Split")')
      return
    }

    if (!customForm.exercises || customForm.exercises.length === 0) {
      toast.error('Please add at least 1 exercise')
      return
    }

    try {
      const sanitizedExercises = customForm.exercises.map((ex, i) => ({
        ...ex,
        id: ex.id || `ex-${Date.now()}-${i}`,
        name: ex.name.trim() || `Exercise ${i + 1}`,
        muscle_group: ex.muscle_group || 'Compound',
        sets: Number(ex.sets) || 3,
        reps: ex.reps || '10 - 12',
        weight: ex.weight || '20 kg',
        rest_seconds: Number(ex.rest_seconds) || 60,
        day_of_week: ex.day_of_week || 'Monday',
      }))

      const saved = db.saveWorkout({
        id: editingCustomPlan?.id,
        member_id: targetMember.id,
        assigned_member_id: targetMember.id,
        name: customForm.name.trim(),
        category: customForm.category,
        level: customForm.level,
        description: customForm.description.trim(),
        is_custom: true,
        is_default: false,
        created_by_role: 'member',
        days_per_week: Number(customForm.days_per_week) || 4,
        exercises: sanitizedExercises,
      })

      toast.success(
        editingCustomPlan
          ? `Updated "${saved.name}"!`
          : `Custom plan "${saved.name}" created successfully!`
      )
      setShowCustomModal(false)
      loadData()
      setActiveTab('custom')
    } catch (err: any) {
      console.error('Save custom plan error:', err)
      toast.error('Failed to save custom plan: ' + (err?.message || 'Check inputs'))
    }
  }

  const handleDuplicateToMyPlans = (wp: WorkoutPlan) => {
    const allMembers = db.getMembers()
    const targetMember =
      member ||
      allMembers.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
      allMembers[0]

    if (!targetMember) {
      toast.error('Member profile not found')
      return
    }

    try {
      const cloned = db.duplicateWorkout(wp.id, targetMember.id, `${wp.name} (My Custom Split)`)
      toast.success(`Copied "${wp.name}" to My Custom Plans!`)
      loadData()
      setActiveTab('custom')
    } catch {
      toast.error('Failed to duplicate plan')
    }
  }

  const handleDeleteCustomPlan = (id: string, name: string) => {
    if (!window.confirm(`Delete custom routine "${name}"?`)) return
    try {
      db.deleteWorkout(id)
      toast.success(`Deleted "${name}"`)
      loadData()
    } catch {
      toast.error('Failed to delete plan')
    }
  }

  // Format stopwatch seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 1. TRAINER ASSIGNMENT STATUS BANNER                                  */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              hasTrainer ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {hasTrainer ? <UserCheck className="w-7 h-7" /> : <Dumbbell className="w-7 h-7 text-[#E50914]" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  hasTrainer
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {hasTrainer ? 'Dedicated Floor Coach Assigned' : 'Self-Guided Floor Training'}
              </span>
              <span className="text-xs text-gray-400 font-mono">Member ID: {member?.member_id}</span>
            </div>

            {hasTrainer ? (
              <div className="mt-1">
                <h3 className="font-display text-2xl tracking-wider text-[#111111]">
                  Assigned Coach: <span className="text-[#E50914]">{member?.trainer_name}</span>
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Package: <strong>{member?.pt_package || '1-on-1 Personal Transformation'}</strong> · Follow your coach-prescribed routine below or log live sessions.
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <h3 className="font-display text-2xl tracking-wider text-[#111111]">
                  Self-Guided Floor Member (No Personal Coach)
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  You have full unlimited access to <strong>7 Admin Default Workout Plans</strong> and can create,
                  duplicate, and customize your own workout splits from the Exercise Library!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!isLiveActive ? (
            <button
              onClick={() => startLiveWorkout()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-all shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Workout Now</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('live_workout')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md animate-pulse cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Workout In Progress ({formatTime(timerSeconds)})</span>
            </button>
          )}

          {hasTrainer && (
            <a
              href="https://wa.me/917620683995?text=Hi%20Coach,%20I%20have%20a%20question%20regarding%20today's%20workout%20routine."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Message Coach</span>
            </a>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 2. TAB NAVIGATION                                                    */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('routines')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'routines'
              ? 'border-[#E50914] text-[#E50914]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{hasTrainer ? 'Assigned & Club Routines' : 'Admin Default Plans (7)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'custom'
              ? 'border-[#E50914] text-[#E50914]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>My Custom Workout Plans ({customPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('live_workout')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'live_workout'
              ? 'border-[#E50914] text-[#E50914]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Activity className="w-4 h-4 text-[#E50914]" />
          <span>
            Start Workout Tracker{' '}
            {isLiveActive && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-[#E50914] text-[#E50914]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Workout History ({pastSessions.length})</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: ASSIGNED & CLUB ROUTINES                                      */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      {activeTab === 'routines' && (
        <div className="space-y-6">
          {/* Plan Selector Pills */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Select Workout Routine to Follow:
            </span>
            <div className="flex flex-wrap gap-2">
              {/* Assigned Plan First */}
              {assignedPlan && (
                <button
                  onClick={() => setSelectedPlan(assignedPlan)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                    selectedPlan?.id === assignedPlan.id
                      ? 'bg-[#E50914] text-white border-[#E50914] shadow-sm'
                      : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{assignedPlan.name} (Assigned)</span>
                </button>
              )}

              {/* Default Plans */}
              {defaultPlans.map((dp) => (
                <button
                  key={dp.id}
                  onClick={() => setSelectedPlan(dp)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                    selectedPlan?.id === dp.id && selectedPlan?.id !== assignedPlan?.id
                      ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{dp.name.split('(')[0]}</span>
                  <span className="text-[10px] opacity-70">({dp.category})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Routine Detail Card */}
          {selectedPlan && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-50 text-[#E50914] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {selectedPlan.category}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                      {selectedPlan.level}
                    </span>
                    {selectedPlan.is_default && (
                      <span className="bg-[#111111] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Admin Core Template
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl tracking-wider text-[#111111] mt-1">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Prescribed by <strong>{selectedPlan.trainer_name || 'Coach'}</strong> · {selectedPlan.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicateToMyPlans(selectedPlan)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    title="Copy this plan to your own customizable routines"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate & Customize</span>
                  </button>

                  <button
                    onClick={() => startLiveWorkout(selectedPlan)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start This Workout</span>
                  </button>
                </div>
              </div>

              {/* Day of Week Filter */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Filter by Day:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...DAYS_OF_WEEK].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDayFilter(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDayFilter === d
                          ? 'bg-[#E50914] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedPlan.exercises || [])
                  .filter((ex) => selectedDayFilter === 'All' || ex.day_of_week === selectedDayFilter)
                  .map((ex, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-5 hover:border-[#E50914]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider">
                            {ex.day_of_week} · {ex.muscle_group}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#111111]">
                            {ex.sets} sets × {ex.reps}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-[#111111] mb-2">{ex.name}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">{ex.instructions}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                        <span>Target: <strong>{ex.weight || 'Moderate'}</strong></span>
                        <span>Rest: <strong>{ex.rest_seconds}s</strong></span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: MY CUSTOM WORKOUT PLANS (REQUIREMENT 3)                       */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                My Custom Workout Plans
              </h3>
              <p className="text-xs text-gray-500">
                Design custom splits, configure exercises, sets, reps, target weights, and rest times
              </p>
            </div>

            <button
              onClick={handleOpenNewCustomPlan}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Routine</span>
            </button>
          </div>

          {customPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customPlans.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="bg-red-50 text-[#E50914] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {cp.category}
                        </span>
                        <h4 className="font-display text-2xl tracking-wider text-[#111111] mt-1">{cp.name}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicateToMyPlans(cp)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Duplicate Routine"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditCustomPlan(cp)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Custom Routine"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomPlan(cp.id, cp.name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Custom Routine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-4">{cp.description || 'Custom tailored workout plan.'}</p>

                    {/* Exercises preview */}
                    <div className="space-y-1.5 mb-6">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Exercises ({cp.exercises?.length || 0}) · {cp.days_per_week || 4} days/week
                      </span>
                      <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs max-h-48 overflow-y-auto">
                        {(cp.exercises || []).map((ex, idx) => (
                          <div key={idx} className="p-2.5 bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-900">{ex.name}</p>
                              <p className="text-[10px] text-gray-500">
                                {ex.day_of_week} · {ex.muscle_group} · {ex.weight || 'Target wt'} · Rest {ex.rest_seconds || 60}s
                              </p>
                            </div>
                            <span className="font-mono font-bold text-[#E50914]">
                              {ex.sets} sets × {ex.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400 font-medium">Created by you</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDuplicateToMyPlans(cp)}
                        className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => startLiveWorkout(cp)}
                        className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Workout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center mx-auto">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-gray-900">No Custom Workout Plans Yet</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  You can build your own customized workout routine from scratch, pick exercises from the Exercise Library,
                  or start immediately with one of our proven split presets below:
                </p>
              </div>

              {/* 1-Click Split Preset Starters */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-lg mx-auto">
                <button
                  onClick={() => handleApplyPresetTemplate('ppl')}
                  className="px-3 py-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/60 text-[#E50914] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>3-Day Push Pull Legs</span>
                </button>
                <button
                  onClick={() => handleApplyPresetTemplate('upper_lower')}
                  className="px-3 py-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/60 text-[#E50914] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>4-Day Upper / Lower</span>
                </button>
                <button
                  onClick={() => handleApplyPresetTemplate('fat_loss')}
                  className="px-3 py-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/60 text-[#E50914] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Weight Loss Circuit</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleOpenNewCustomPlan}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Build Custom Routine From Scratch</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: START LIVE WORKOUT (ACTIVE SESSION TRACKER)                    */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      {activeTab === 'live_workout' && (
        <div className="space-y-6">
          {!isLiveActive ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display text-2xl tracking-wider text-[#111111]">
                  Live Workout Session Tracker
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                  Ready to train? Pick your workout split to start tracking active sets, reps, weights, and live session duration.
                </p>
              </div>

              <div className="max-w-md mx-auto text-left">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Select Routine to Train Today:
                </label>
                <select
                  value={selectedPlan?.id || ''}
                  onChange={(e) => {
                    const match = [...defaultPlans, ...customPlans].find((p) => p.id === e.target.value)
                    if (match) setSelectedPlan(match)
                  }}
                  className="input-field mb-4"
                >
                  {assignedPlan && <option value={assignedPlan.id}>⭐ Assigned: {assignedPlan.name}</option>}
                  <optgroup label="Admin Default Templates">
                    {defaultPlans.map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.name} ({dp.category})
                      </option>
                    ))}
                  </optgroup>
                  {customPlans.length > 0 && (
                    <optgroup label="My Custom Plans">
                      {customPlans.map((cp) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <button
                  onClick={() => startLiveWorkout(selectedPlan || undefined)}
                  className="w-full py-3.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Live Workout Session</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Stopwatch & Session Header Bar */}
              <div className="bg-[#111111] text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-widest block">
                    ACTIVE LIVE SESSION
                  </span>
                  <h3 className="font-display text-2xl tracking-wider mt-0.5">
                    {activeSessionPlan?.name || 'Workout Session'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Check off each completed set and adjust weights lifted in real time.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Stopwatch */}
                  <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl">
                    <Clock className="w-5 h-5 text-[#E50914]" />
                    <span className="font-mono text-2xl font-black">{formatTime(timerSeconds)}</span>
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer"
                      title={timerRunning ? 'Pause Stopwatch' : 'Resume Stopwatch'}
                    >
                      {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                  </div>

                  <button
                    onClick={markAllWorkoutSetsDone}
                    className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-white/20"
                    title="Mark all sets as completed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Check All Sets</span>
                  </button>

                  <button
                    onClick={finishWorkoutSession}
                    className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Finish Workout</span>
                  </button>
                </div>
              </div>

              {/* Exercises Sets Checklist */}
              <div className="space-y-4">
                {liveSets.map((exGroup, exIdx) => (
                  <div key={exIdx} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider">
                          Exercise #{exIdx + 1} · {exGroup.muscle_group}
                        </span>
                        <h4 className="font-bold text-lg text-[#111111]">{exGroup.exercise_name}</h4>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-gray-500">
                          {exGroup.sets.filter((s) => s.completed).length} / {exGroup.sets.length} sets completed
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAllSetsForExercise(exIdx)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-[#E50914] bg-red-50 hover:bg-red-100 transition-colors cursor-pointer border border-red-200"
                        >
                          {exGroup.sets.every((s) => s.completed) ? 'Uncheck All' : '✓ Check All Sets'}
                        </button>
                      </div>
                    </div>

                    {/* Sets Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-gray-400 font-bold uppercase text-[10px] border-b border-gray-100">
                            <th className="py-2 px-3">Set</th>
                            <th className="py-2 px-3">Target</th>
                            <th className="py-2 px-3">Weight (KG)</th>
                            <th className="py-2 px-3">Reps</th>
                            <th className="py-2 px-3 text-right">Done?</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {exGroup.sets.map((s, setIdx) => (
                            <tr
                              key={setIdx}
                              className={`transition-colors ${
                                s.completed ? 'bg-emerald-50/70 border-l-4 border-l-emerald-500' : 'hover:bg-gray-50/60'
                              }`}
                            >
                              <td className="py-3 px-3 font-bold text-gray-800">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={s.completed}
                                    onChange={() => toggleSetComplete(exIdx, setIdx)}
                                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                                    title="Check to mark set completed"
                                  />
                                  <span>Set {s.set_number}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-gray-500 font-mono">
                                {s.target_weight} × {s.target_reps}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={s.actual_weight}
                                    onChange={(e) =>
                                      updateSetWeight(exIdx, setIdx, parseFloat(e.target.value) || 0)
                                    }
                                    className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-gray-400 font-bold">kg</span>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    value={s.actual_reps}
                                    onChange={(e) =>
                                      updateSetReps(exIdx, setIdx, parseInt(e.target.value) || 0)
                                    }
                                    className="w-16 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-gray-400 font-bold">reps</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => toggleSetComplete(exIdx, setIdx)}
                                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 font-bold text-xs select-none shadow-xs ${
                                    s.completed
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                                      : 'bg-white hover:bg-emerald-50 text-gray-700 border-2 border-gray-300 hover:border-emerald-500'
                                  }`}
                                  title={s.completed ? 'Click to uncheck' : 'Click to check set done'}
                                >
                                  <CheckCircle2
                                    className={`w-4 h-4 ${
                                      s.completed ? 'text-white fill-white' : 'text-gray-400'
                                    }`}
                                  />
                                  <span>{s.completed ? 'Done' : 'Check'}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              {/* Session Notes */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Session Notes & How You Felt Today
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bench press felt lighter, hit 75kg for 8 clean reps. Great energy."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="input-field resize-none text-xs"
                />
              </div>

              {/* Finish Workout Floating Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    if (window.confirm('Cancel active workout session? Logged data will be discarded.')) {
                      setIsLiveActive(false)
                      setTimerRunning(false)
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Discard Workout
                </button>

                <button
                  onClick={finishWorkoutSession}
                  className="px-6 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Finish & Save to Log</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: WORKOUT HISTORY LOG                                           */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                Completed Workout History
              </h3>
              <p className="text-xs text-gray-500">
                Log of all past workouts, completed sets, reps, and tonnage lifted
              </p>
            </div>
            <span className="text-xs font-bold text-gray-600 font-mono">
              Total Sessions: {pastSessions.length}
            </span>
          </div>

          {pastSessions.length > 0 ? (
            <div className="space-y-4">
              {pastSessions.map((ws) => {
                const totalVolume = ws.completed_sets.reduce(
                  (sum, s) => sum + (s.completed ? s.weight_kg * s.reps : 0),
                  0
                )
                const totalCompletedSets = ws.completed_sets.filter((s) => s.completed).length

                return (
                  <div
                    key={ws.id}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:border-[#E50914]/30 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#E50914] bg-red-50 px-2 py-0.5 rounded">
                            {ws.date}
                          </span>
                          <span className="text-xs text-gray-500">
                            {ws.start_time} - {ws.end_time || 'Done'} ({ws.duration_minutes} mins)
                          </span>
                        </div>
                        <h4 className="font-bold text-lg text-[#111111] mt-1">{ws.plan_name}</h4>
                        {ws.notes && <p className="text-xs text-gray-600 italic mt-0.5">"{ws.notes}"</p>}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Volume</span>
                          <span className="font-extrabold text-[#111111]">{totalVolume.toLocaleString()} kg</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Sets Done</span>
                          <span className="font-extrabold text-emerald-600">{totalCompletedSets} sets</span>
                        </div>
                      </div>
                    </div>

                    {/* Sets Preview Pills */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {ws.completed_sets.map((s, idx) => {
                        const displayReps = s.reps === 810 ? 10 : (s.reps === 1012 ? 12 : (s.reps === 812 ? 12 : s.reps))
                        return (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-mono"
                          >
                            <strong>{s.exercise_name}:</strong> {s.weight_kg}kg × {displayReps} reps
                            {s.target_reps && s.target_reps !== String(displayReps) && (
                              <span className="text-gray-400 font-sans text-[10px] ml-1">
                                (Target: {s.target_reps})
                              </span>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-xs">
              No completed workout sessions logged yet. Hit <strong>"Start Workout Now"</strong> to record your first workout!
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* CUSTOM PLAN BUILDER MODAL                                            */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                    {editingCustomPlan ? 'Edit Custom Workout Plan' : 'Build Custom Workout Plan'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Configure your personalized routine by selecting exercises from the library, configuring sets, reps, weights & rest periods
                  </p>
                </div>
                <button onClick={() => setShowCustomModal(false)} className="text-gray-400 hover:text-black cursor-pointer p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Split Presets bar in modal */}
              {!editingCustomPlan && (
                <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#E50914] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Split Templates:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate('ppl')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-[#E50914] font-semibold hover:bg-[#E50914] hover:text-white transition-colors cursor-pointer text-[11px]"
                    >
                      3-Day PPL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate('upper_lower')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-[#E50914] font-semibold hover:bg-[#E50914] hover:text-white transition-colors cursor-pointer text-[11px]"
                    >
                      4-Day Upper/Lower
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate('fat_loss')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-[#E50914] font-semibold hover:bg-[#E50914] hover:text-white transition-colors cursor-pointer text-[11px]"
                    >
                      Weight Loss Circuit
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveCustomPlan} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Plan Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. My 4-Day Strength & Size Routine"
                      value={customForm.name}
                      onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                    <select
                      value={customForm.category}
                      onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="Muscle Building">Muscle Building</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Full Body Workout">Full Body Workout</option>
                      <option value="Push Pull Legs">Push Pull Legs</option>
                      <option value="Home Workout">Home Workout</option>
                      <option value="General Fitness">General Fitness</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Experience Level</label>
                    <select
                      value={customForm.level}
                      onChange={(e) => setCustomForm({ ...customForm, level: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Days Per Week</label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={customForm.days_per_week}
                      onChange={(e) =>
                        setCustomForm({ ...customForm, days_per_week: parseInt(e.target.value) || 4 })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Personal Notes / Strategy</label>
                  <textarea
                    rows={2}
                    placeholder="Focus points, target weights, warm up sets..."
                    value={customForm.description}
                    onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>

                {/* Exercises Builder */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#E50914]" /> Exercises in Plan ({customForm.exercises.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddCustomExerciseRow}
                      className="text-[#E50914] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Exercise
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {customForm.exercises.map((ex, idx) => (
                      <div key={ex.id || idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-gray-500 text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200">
                            Exercise #{idx + 1}
                          </span>

                          {/* Exercise Library Picker */}
                          <div className="flex-1 max-w-xs flex items-center gap-1">
                            <select
                              onChange={(e) => handleSelectFromLibraryForCustom(idx, e.target.value)}
                              className="bg-white border border-gray-300 rounded px-2 py-1 text-[11px] w-full font-medium text-gray-700 focus:outline-none focus:border-[#E50914]"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                -- Pick from Exercise Library Catalog --
                              </option>
                              {exerciseLibrary.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.muscle_group})
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCustomExerciseRow(idx)}
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer rounded hover:bg-red-50"
                            title="Remove Exercise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Name</label>
                            <input
                              type="text"
                              placeholder="Exercise Name"
                              value={ex.name}
                              onChange={(e) => {
                                const updated = [...customForm.exercises]
                                updated[idx].name = e.target.value
                                setCustomForm({ ...customForm, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Target Muscle</label>
                            <select
                              value={ex.muscle_group}
                              onChange={(e) => {
                                const updated = [...customForm.exercises]
                                updated[idx].muscle_group = e.target.value
                                setCustomForm({ ...customForm, exercises: updated })
                              }}
                              className="input-field"
                            >
                              <option value="Chest">Chest</option>
                              <option value="Back">Back</option>
                              <option value="Legs">Legs</option>
                              <option value="Shoulders">Shoulders</option>
                              <option value="Arms">Arms</option>
                              <option value="Core">Core</option>
                              <option value="Cardio">Cardio</option>
                              <option value="Full Body">Full Body</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Workout Day</label>
                            <select
                              value={ex.day_of_week}
                              onChange={(e) => {
                                const updated = [...customForm.exercises]
                                updated[idx].day_of_week = e.target.value
                                setCustomForm({ ...customForm, exercises: updated })
                              }}
                              className="input-field"
                            >
                              {DAYS_OF_WEEK.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Sets</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={ex.sets}
                              onChange={(e) => {
                                const updated = [...customForm.exercises]
                                updated[idx].sets = parseInt(e.target.value) || 3
                                setCustomForm({ ...customForm, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Reps</label>
                            <input
                              type="text"
                              placeholder="8-12"
                              value={ex.reps}
                              onChange={(e) => {
                                const updated = [...customForm.exercises]
                                updated[idx].reps = e.target.value
                                setCustomForm({ ...customForm, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Target Weight</label>
                            <input
                              type="text"
                              placeholder="e.g. 50 kg"
                              value={ex.weight || ''}
                              onChange={(e) => {
                                const updated = [...customForm.exercises]
                                updated[idx].weight = e.target.value
                                setCustomForm({ ...customForm, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Rest Time (sec)</label>
                            <input
                              type="number"
                              min={15}
                              max={300}
                              step={15}
                              placeholder="60"
                              value={ex.rest_seconds || 60}
                              onChange={(e) => {
                                const updated = [...customForm.exercises]
                                updated[idx].rest_seconds = parseInt(e.target.value) || 60
                                setCustomForm({ ...customForm, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400">
                    {customForm.exercises.length} exercise{customForm.exercises.length !== 1 ? 's' : ''} configured
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomModal(false)}
                      className="px-4 py-2 border rounded-xl hover:bg-gray-50 cursor-pointer font-medium text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-sm"
                    >
                      {editingCustomPlan ? 'Update Custom Plan' : 'Save Custom Plan'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
