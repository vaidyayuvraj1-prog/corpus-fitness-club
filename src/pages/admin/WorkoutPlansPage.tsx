import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Clock,
  CheckCircle2,
  X,
  Search,
  Copy,
  BookOpen,
  Eye,
  Calendar,
  Flame,
  Trophy,
  Sparkles,
  Layers,
  Filter,
  User,
  Check,
  ChevronRight,
  Info,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type {
  WorkoutPlan,
  Exercise,
  Member,
  Trainer,
  ExerciseLibraryItem,
  MemberWorkoutAssignment,
} from '@/types/database'
import { format, addDays } from 'date-fns'

const CORE_CATEGORIES = [
  'All',
  'Beginner Workout',
  'Weight Loss',
  'Muscle Building',
  'Strength Training',
  'Full Body Workout',
  'Push Pull Legs',
  'Home Workout',
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function WorkoutPlansPage() {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibraryItem[]>([])
  const [assignments, setAssignments] = useState<MemberWorkoutAssignment[]>([])

  // Filtering & Search
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'default' | 'custom'>('all')

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null)
  const [previewPlan, setPreviewPlan] = useState<WorkoutPlan | null>(null)
  const [previewDayFilter, setPreviewDayFilter] = useState<string>('All')
  const [assignModal, setAssignModal] = useState<WorkoutPlan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<WorkoutPlan | null>(null)

  // Assignment Modal Form State
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [assignStartDate, setAssignStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [assignEndDate, setAssignEndDate] = useState('')
  const [assignTrainerName, setAssignTrainerName] = useState('Coach Rohit Deshmukh')
  const [assignPersonalNotes, setAssignPersonalNotes] = useState('')

  // Plan Builder Form State
  const [form, setForm] = useState({
    name: '',
    category: 'Muscle Building',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    description: '',
    trainer_name: 'Coach Rohit Deshmukh',
    duration_weeks: 8,
    days_per_week: 4,
    is_default: false,
    exercises: [
      {
        id: 'ex-1',
        plan_id: '',
        name: 'Barbell Flat Bench Press',
        muscle_group: 'Chest',
        sets: 4,
        reps: '8 - 12',
        weight: '60-80 kg',
        rest_seconds: 90,
        day_of_week: 'Monday',
        instructions: 'Retract scapulae, touch lower sternum, drive through chest.',
      },
    ] as Exercise[],
  })

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setWorkouts(db.getWorkouts())
    setMembers(db.getMembers())
    setTrainers(db.getTrainers())
    setExerciseLibrary(db.getExerciseLibrary())
    setAssignments(db.getWorkoutAssignments())
  }

  // ── Open Add Modal ─────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingPlan(null)
    setForm({
      name: '',
      category: 'Muscle Building',
      level: 'intermediate',
      description: '',
      trainer_name: 'Coach Rohit Deshmukh',
      duration_weeks: 8,
      days_per_week: 4,
      is_default: false,
      exercises: [
        {
          id: `ex-${Date.now()}`,
          plan_id: '',
          name: 'Barbell Flat Bench Press',
          muscle_group: 'Chest',
          sets: 4,
          reps: '8 - 12',
          weight: '60-80 kg',
          rest_seconds: 90,
          day_of_week: 'Monday',
          instructions: 'Retract scapulae, touch lower sternum, drive up powerfully.',
        },
      ],
    })
    setShowModal(true)
  }

  // ── Open Edit Modal ────────────────────────────────────────────────────────
  const handleOpenEdit = (wp: WorkoutPlan) => {
    setEditingPlan(wp)
    setForm({
      name: wp.name,
      category: wp.category,
      level: wp.level,
      description: wp.description || '',
      trainer_name: wp.trainer_name || 'Coach Rohit Deshmukh',
      duration_weeks: wp.duration_weeks || 8,
      days_per_week: wp.days_per_week || 4,
      is_default: Boolean(wp.is_default),
      exercises:
        wp.exercises && wp.exercises.length > 0
          ? JSON.parse(JSON.stringify(wp.exercises))
          : [
              {
                id: `ex-${Date.now()}`,
                plan_id: wp.id,
                name: 'Barbell Flat Bench Press',
                muscle_group: 'Chest',
                sets: 4,
                reps: '8 - 12',
                weight: '60-80 kg',
                rest_seconds: 90,
                day_of_week: 'Monday',
                instructions: '',
              },
            ],
    })
    setShowModal(true)
  }

  // ── Exercise Row Operations ────────────────────────────────────────────────
  const handleAddExerciseRow = () => {
    setForm((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          plan_id: editingPlan?.id || '',
          name: '',
          muscle_group: 'Chest',
          sets: 3,
          reps: '10 - 12',
          weight: 'Moderate / Dumbbells',
          rest_seconds: 60,
          day_of_week: DAYS_OF_WEEK[prev.exercises.length % 7],
          instructions: '',
        },
      ],
    }))
  }

  const handleSelectFromLibrary = (index: number, libItemId: string) => {
    const item = exerciseLibrary.find((i) => i.id === libItemId)
    if (!item) return

    setForm((prev) => {
      const updated = [...prev.exercises]
      updated[index] = {
        ...updated[index],
        name: item.name,
        muscle_group: item.muscle_group,
        sets: item.default_sets,
        reps: item.default_reps,
        rest_seconds: item.default_rest_seconds,
        instructions: item.instructions,
      }
      return { ...prev, exercises: updated }
    })
  }

  const handleRemoveExerciseRow = (index: number) => {
    if (form.exercises.length <= 1) {
      toast.error('Workout routine must contain at least 1 exercise')
      return
    }
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }))
  }

  // ── Save Workout Handler ───────────────────────────────────────────────────
  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Workout routine title is required')
      return
    }

    try {
      db.saveWorkout({
        id: editingPlan?.id,
        name: form.name.trim(),
        category: form.category,
        level: form.level,
        description: form.description.trim(),
        trainer_name: form.trainer_name,
        duration_weeks: Number(form.duration_weeks) || 8,
        days_per_week: Number(form.days_per_week) || 4,
        is_default: form.is_default,
        exercises: form.exercises,
      })
      toast.success(
        editingPlan ? `Updated routine "${form.name}"!` : `New routine "${form.name}" created!`
      )
      setShowModal(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save workout routine')
    }
  }

  // ── Duplicate Workout Handler ──────────────────────────────────────────────
  const handleDuplicatePlan = (wp: WorkoutPlan) => {
    try {
      const cloned = db.duplicateWorkout(wp.id, undefined, `${wp.name} (Custom Copy)`)
      toast.success(`Duplicated "${wp.name}" as "${cloned.name}"!`)
      loadData()
    } catch {
      toast.error('Failed to duplicate plan')
    }
  }

  // ── Delete Workout Handler ─────────────────────────────────────────────────
  const handleDeleteWorkout = () => {
    if (!deleteConfirm) return
    try {
      db.deleteWorkout(deleteConfirm.id)
      toast.success(`Workout routine "${deleteConfirm.name}" deleted successfully!`)
      setDeleteConfirm(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete routine')
    }
  }

  // ── Open Assign Modal ──────────────────────────────────────────────────────
  const handleOpenAssignModal = (wp: WorkoutPlan) => {
    setAssignModal(wp)
    const firstMember = members[0]
    setSelectedMemberId(firstMember ? firstMember.id : '')
    setMemberSearchQuery('')
    const start = format(new Date(), 'yyyy-MM-dd')
    setAssignStartDate(start)
    const duration = wp.duration_weeks || 8
    setAssignEndDate(format(addDays(new Date(start), duration * 7), 'yyyy-MM-dd'))
    setAssignTrainerName(wp.trainer_name || 'Coach Rohit Deshmukh')
    setAssignPersonalNotes('')
  }

  // Recalculate end date whenever start date or assigned plan changes
  const handleStartDateChange = (newDate: string) => {
    setAssignStartDate(newDate)
    if (assignModal) {
      const duration = assignModal.duration_weeks || 8
      try {
        setAssignEndDate(format(addDays(new Date(newDate), duration * 7), 'yyyy-MM-dd'))
      } catch {
        // Fallback
      }
    }
  }

  // ── Confirm Member Assignment ──────────────────────────────────────────────
  const handleConfirmAssignment = () => {
    if (!assignModal) return
    if (!selectedMemberId) {
      toast.error('Please select a member to assign this routine to')
      return
    }

    const mem = members.find((m) => m.id === selectedMemberId)
    if (!mem) {
      toast.error('Member not found')
      return
    }

    try {
      db.assignWorkoutToMember({
        member_id: mem.id,
        workout_plan_id: assignModal.id,
        trainer_name: assignTrainerName,
        assigned_by: 'Gym Admin',
        assigned_by_role: 'admin',
        start_date: assignStartDate,
        end_date: assignEndDate,
        personal_instructions: assignPersonalNotes,
      })

      toast.success(
        `Successfully assigned "${assignModal.name}" to ${mem.profile?.full_name || 'Member'}!`
      )
      setAssignModal(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign workout routine')
    }
  }

  // ── Filtered Members for Assignment ────────────────────────────────────────
  const filteredAssignmentMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) return members
    const q = memberSearchQuery.toLowerCase()
    return members.filter((m) => {
      const name = (m.profile?.full_name || '').toLowerCase()
      const code = (m.member_id || '').toLowerCase()
      const phone = (m.phone || m.profile?.phone || '').toLowerCase()
      const email = (m.profile?.email || m.email || '').toLowerCase()
      return name.includes(q) || code.includes(q) || phone.includes(q) || email.includes(q)
    })
  }, [members, memberSearchQuery])

  // ── Filtered Routines List ─────────────────────────────────────────────────
  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      // Type Tab filter
      if (planTypeFilter === 'default' && !w.is_default) return false
      if (planTypeFilter === 'custom' && w.is_default) return false

      // Category filter
      if (selectedCategory !== 'All' && w.category !== selectedCategory) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All' && w.level !== selectedDifficulty) {
        return false
      }

      // Search query (title, category, exercise name, or description)
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = (w.name || '').toLowerCase().includes(q)
        const matchDesc = (w.description || '').toLowerCase().includes(q)
        const matchCat = (w.category || '').toLowerCase().includes(q)
        const matchEx = (w.exercises || []).some((e) =>
          (e.name || '').toLowerCase().includes(q) || (e.muscle_group || '').toLowerCase().includes(q)
        )
        if (!matchName && !matchDesc && !matchCat && !matchEx) return false
      }

      return true
    })
  }, [workouts, planTypeFilter, selectedCategory, selectedDifficulty, search])

  // Metric counts
  const totalRoutinesCount = workouts.length
  const defaultRoutinesCount = workouts.filter((w) => w.is_default).length
  const customRoutinesCount = workouts.filter((w) => !w.is_default).length
  const activeAssignmentsCount = assignments.filter((a) => a.status === 'active').length

  return (
    <div className="space-y-6">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E50914]/10 text-[#E50914]">
              <Dumbbell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
                WORKOUT PLAN BUILDER & ROUTINES
              </h2>
              <p className="text-xs text-gray-500">
                Manage Admin default templates, design custom routines, and assign structured programs to members
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Build New Routine
        </button>
      </div>

      {/* ── Quick KPI Metric Badges ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Routines
          </span>
          <p className="text-2xl font-bold font-display text-gray-900 mt-1">{totalRoutinesCount}</p>
          <span className="text-[10px] text-gray-500 font-medium">All club programs</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Default Templates
          </span>
          <p className="text-2xl font-bold font-display text-[#E50914] mt-1">{defaultRoutinesCount}</p>
          <span className="text-[10px] text-gray-500 font-medium">Permanent core protocols</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Custom Routines
          </span>
          <p className="text-2xl font-bold font-display text-gray-900 mt-1">{customRoutinesCount}</p>
          <span className="text-[10px] text-gray-500 font-medium">Tailored gym programs</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Active Member Plans
          </span>
          <p className="text-2xl font-bold font-display text-emerald-600 mt-1">{activeAssignmentsCount}</p>
          <span className="text-[10px] text-gray-500 font-medium">Currently assigned</span>
        </div>
      </div>

      {/* ── Filter & Search Section ─────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-3">
        {/* Type Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setPlanTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planTypeFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Plans ({totalRoutinesCount})
            </button>
            <button
              onClick={() => setPlanTypeFilter('default')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planTypeFilter === 'default'
                  ? 'bg-[#E50914] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Default Templates ({defaultRoutinesCount})
            </button>
            <button
              onClick={() => setPlanTypeFilter('custom')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planTypeFilter === 'custom'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Custom Plans ({customRoutinesCount})
            </button>
          </div>

          {/* Difficulty Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700"
            >
              <option value="All">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CORE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-100">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by routine title, category, or exercise name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white transition-colors"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredWorkouts.length}</strong> of {totalRoutinesCount} routines
          </div>
        </div>
      </div>

      {/* ── Routine Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWorkouts.map((wp) => {
          const daysCount = wp.days_per_week || 4
          const durationWeeks = wp.duration_weeks || 8
          const exercisesCount = wp.exercises?.length || 0

          // Unique muscle groups
          const muscleGroups = Array.from(new Set((wp.exercises || []).map((e) => e.muscle_group)))

          return (
            <div
              key={wp.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                wp.is_default
                  ? 'border-[#E50914]/30 ring-1 ring-[#E50914]/10 bg-gradient-to-b from-white to-red-50/10'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <div>
                {/* Card Header & Badges */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {wp.is_default && (
                        <span className="bg-[#E50914] text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> Default Plan
                        </span>
                      )}
                      <span className="bg-red-50 text-[#E50914] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {wp.category}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                        {wp.level}
                      </span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {durationWeeks} Weeks
                      </span>
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {daysCount} Days/Wk
                      </span>
                    </div>
                    <h3 className="font-display text-2xl tracking-wider text-[#111111]">{wp.name}</h3>
                  </div>

                  {/* Actions Menu */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setPreviewPlan(wp)
                        setPreviewDayFilter('All')
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Preview Full Workout Schedule"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicatePlan(wp)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Duplicate / Copy Routine"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(wp)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Routine"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(wp)}
                      disabled={Boolean(wp.is_default)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        wp.is_default
                          ? 'text-gray-300 cursor-not-allowed opacity-50'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={
                        wp.is_default
                          ? 'Default core templates are protected from deletion'
                          : 'Delete Routine'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-4 leading-relaxed line-clamp-2">
                  {wp.description || 'Structured strength and athletic routine for progressive overload.'}
                </p>

                {/* Target Muscle Groups Badges */}
                {muscleGroups.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mb-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Focus:</span>
                    {muscleGroups.map((mg) => (
                      <span
                        key={mg}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"
                      >
                        {mg}
                      </span>
                    ))}
                  </div>
                )}

                {/* Prescribed Exercises Preview List */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Prescribed Exercises ({exercisesCount})
                    </span>
                    <button
                      onClick={() => {
                        setPreviewPlan(wp)
                        setPreviewDayFilter('All')
                      }}
                      className="text-[10px] font-bold text-[#E50914] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      View All <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs max-h-52 overflow-y-auto">
                    {(wp.exercises || []).slice(0, 4).map((ex, i) => (
                      <div key={i} className="p-2.5 bg-[#F8FAFC] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{ex.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {ex.day_of_week} · {ex.muscle_group}
                          </p>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-[#E50914]">
                            {ex.sets} sets × {ex.reps}
                          </span>
                          <p className="text-[10px] text-gray-400">
                            {ex.weight || 'Moderate'} · {ex.rest_seconds}s rest
                          </p>
                        </div>
                      </div>
                    ))}
                    {(wp.exercises || []).length > 4 && (
                      <div
                        onClick={() => {
                          setPreviewPlan(wp)
                          setPreviewDayFilter('All')
                        }}
                        className="p-2 text-center text-[10px] font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      >
                        + {(wp.exercises || []).length - 4} more exercises (click to preview)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 font-medium truncate">
                  Trainer: <strong>{wp.trainer_name || 'Coach Rohit'}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPreviewPlan(wp)
                      setPreviewDayFilter('All')
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleOpenAssignModal(wp)}
                    className="px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>Assign to Member</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredWorkouts.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs space-y-2">
            <Dumbbell className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-bold text-gray-600">No workout routines found</p>
            <p className="text-gray-400">
              No plans matched your filter criteria. Try selecting another category or clear search.
            </p>
          </div>
        )}
      </div>

      {/* ── 1. PREVIEW WORKOUT MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {previewPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 my-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {previewPlan.is_default && (
                      <span className="bg-[#E50914] text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                        Default Plan
                      </span>
                    )}
                    <span className="bg-red-50 text-[#E50914] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {previewPlan.category}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                      {previewPlan.level}
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      {previewPlan.duration_weeks || 8} Weeks Duration
                    </span>
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      {previewPlan.days_per_week || 4} Days / Week
                    </span>
                  </div>
                  <h3 className="font-display text-2xl tracking-wider text-[#111111]">
                    {previewPlan.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Coach: <strong>{previewPlan.trainer_name || 'Coach Rohit'}</strong> · {previewPlan.description}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewPlan(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-black cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Day Filter Tabs */}
              <div className="py-4 border-b border-gray-100 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Filter by Day of the Week:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...DAYS_OF_WEEK].map((day) => {
                    const countForDay =
                      day === 'All'
                        ? previewPlan.exercises?.length || 0
                        : (previewPlan.exercises || []).filter((e) => e.day_of_week === day).length

                    return (
                      <button
                        key={day}
                        onClick={() => setPreviewDayFilter(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          previewDayFilter === day
                            ? 'bg-[#E50914] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>{day}</span>
                        <span className="text-[10px] opacity-80">({countForDay})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Exercises List */}
              <div className="py-4 max-h-96 overflow-y-auto space-y-3">
                {(() => {
                  const filtered = (previewPlan.exercises || []).filter((e) => {
                    if (previewDayFilter === 'All') return true
                    return e.day_of_week === previewDayFilter
                  })

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl space-y-1">
                        <Flame className="w-6 h-6 text-amber-500 mx-auto" />
                        <p className="text-xs font-bold text-gray-700">Scheduled Rest Day ({previewDayFilter})</p>
                        <p className="text-[11px] text-gray-400">
                          No exercises prescribed for this day. Rest, hydrate, and allow muscles to recover.
                        </p>
                      </div>
                    )
                  }

                  return filtered.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-gray-400">#{idx + 1}</span>
                            <h4 className="font-bold text-sm text-gray-900">{ex.name}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                              {ex.muscle_group}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100/60 text-[#E50914]">
                              {ex.day_of_week}
                            </span>
                          </div>
                          {ex.instructions && (
                            <p className="text-xs text-gray-500 leading-relaxed italic">
                              "{ex.instructions}"
                            </p>
                          )}
                        </div>

                        <div className="text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-[#E50914] text-xs">
                            {ex.sets} Sets × {ex.reps} Reps
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            Load: <strong>{ex.weight || 'Moderate'}</strong>
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Rest: {ex.rest_seconds}s
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewPlan(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Close Preview
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const target = previewPlan
                      setPreviewPlan(null)
                      handleOpenEdit(target)
                    }}
                    className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer"
                  >
                    Edit Routine
                  </button>
                  <button
                    onClick={() => {
                      const target = previewPlan
                      setPreviewPlan(null)
                      handleOpenAssignModal(target)
                    }}
                    className="px-5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Assign This Routine to Member</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. BUILD / EDIT WORKOUT MODAL ────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                    {editingPlan ? 'Edit Workout Routine' : 'Build Custom Workout Routine'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Define exercises, muscle groups, sets, reps, target weights, and weekday split
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-black cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveWorkout} className="space-y-4 text-xs">
                {/* Row 1: Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Routine Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Strength Training – Power Protocol"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="Beginner Workout">Beginner Workout</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Building">Muscle Building</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="Full Body Workout">Full Body Workout</option>
                      <option value="Push Pull Legs">Push Pull Legs</option>
                      <option value="Home Workout">Home Workout</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Difficulty, Duration, Days Per Week, Trainer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Difficulty</label>
                    <select
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Duration (Weeks)
                    </label>
                    <select
                      value={form.duration_weeks}
                      onChange={(e) =>
                        setForm({ ...form, duration_weeks: parseInt(e.target.value) || 8 })
                      }
                      className="input-field"
                    >
                      <option value={4}>4 Weeks</option>
                      <option value={6}>6 Weeks</option>
                      <option value={8}>8 Weeks</option>
                      <option value={12}>12 Weeks</option>
                      <option value={16}>16 Weeks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Days Per Week
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={form.days_per_week}
                      onChange={(e) =>
                        setForm({ ...form, days_per_week: parseInt(e.target.value) || 4 })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Lead Coach</label>
                    <input
                      type="text"
                      value={form.trainer_name}
                      onChange={(e) => setForm({ ...form, trainer_name: e.target.value })}
                      placeholder="e.g. Coach Rohit"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Mark as Default Template toggle */}
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#E50914]" />
                    <div>
                      <span className="font-bold text-gray-800 text-xs block">
                        Mark as Admin Default Template
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Default templates are permanent core gym programs available to all members.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    className="w-4 h-4 text-[#E50914] rounded focus:ring-[#E50914] cursor-pointer"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Description & Strategy
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe program goals, rest intervals, progression rules..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>

                {/* Exercises Builder */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#E50914]" /> Exercises in Routine (
                        {form.exercises.length})
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Assign each exercise to a weekday to build a complete training schedule.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExerciseRow}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-[#E50914] font-bold hover:bg-red-100 transition-colors cursor-pointer text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Exercise
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {form.exercises.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-gray-400 text-[10px]">#{idx + 1}</span>

                          {/* Pick from catalog */}
                          <select
                            onChange={(e) => handleSelectFromLibrary(idx, e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-[11px] flex-1 max-w-sm font-medium text-gray-700"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              -- Autofill from Exercise Library Catalog --
                            </option>
                            {exerciseLibrary.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.muscle_group})
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemoveExerciseRow(idx)}
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Remove Exercise"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                              Exercise Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Barbell Squat"
                              value={ex.name}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].name = e.target.value
                                setForm({ ...form, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                              Muscle Group
                            </label>
                            <select
                              value={ex.muscle_group}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].muscle_group = e.target.value
                                setForm({ ...form, exercises: updated })
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
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                              Workout Day
                            </label>
                            <select
                              value={ex.day_of_week}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].day_of_week = e.target.value
                                setForm({ ...form, exercises: updated })
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

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                              Sets
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={ex.sets}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].sets = parseInt(e.target.value) || 3
                                setForm({ ...form, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                              Reps Target
                            </label>
                            <input
                              type="text"
                              placeholder="8-12 or 5x5"
                              value={ex.reps}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].reps = e.target.value
                                setForm({ ...form, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                              Rest Seconds
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={300}
                              step={15}
                              value={ex.rest_seconds}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].rest_seconds = parseInt(e.target.value) || 60
                                setForm({ ...form, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                              Prescribed Weight / Load
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 60-80 kg or Bodyweight"
                              value={ex.weight || ''}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].weight = e.target.value
                                setForm({ ...form, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                              Form Instructions / Cues
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Keep chest up, pause 1s at bottom"
                              value={ex.instructions || ''}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].instructions = e.target.value
                                setForm({ ...form, exercises: updated })
                              }}
                              className="input-field"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Footer */}
                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-xl hover:bg-gray-50 cursor-pointer font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-md"
                  >
                    {editingPlan ? 'Update Routine' : 'Save Routine'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. ASSIGN TO MEMBER MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#E50914]" />
                    Assign Workout Routine to Member
                  </h3>
                  <p className="text-xs text-gray-500">
                    Assigns an immutable routine snapshot directly to the member's workout dashboard
                  </p>
                </div>
                <button
                  onClick={() => setAssignModal(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-black cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Selected Routine Overview */}
              <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider block">
                    Assigned Routine:
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">{assignModal.name}</h4>
                  <p className="text-[10px] text-gray-500">
                    {assignModal.category} · {assignModal.level} · {assignModal.duration_weeks || 8} weeks ·{' '}
                    {assignModal.days_per_week || 4} days/week · {assignModal.exercises?.length || 0} exercises
                  </p>
                </div>
                <span className="bg-[#111111] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {assignModal.duration_weeks || 8} Wks
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Search and Select Member */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Select Member *
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search member by name, CFC ID (e.g. CFC-2026-0006), or phone..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl">
                    {filteredAssignmentMembers.map((m) => {
                      const isSelected = selectedMemberId === m.id
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMemberId(m.id)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-red-50/80 font-bold' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[10px]">
                              {m.profile?.full_name?.charAt(0) || 'M'}
                            </div>
                            <div>
                              <p className="text-xs text-gray-900 font-bold">{m.profile?.full_name}</p>
                              <p className="text-[10px] text-gray-500 font-normal">
                                {m.member_id} · {m.phone || m.profile?.phone || 'No phone'} · Goal: {m.fitness_goal}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#E50914]" />}
                        </div>
                      )
                    })}
                    {filteredAssignmentMembers.length === 0 && (
                      <div className="p-4 text-center text-gray-400 text-xs">
                        No members found matching your search.
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates & Trainer Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={assignStartDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      End Date (Auto) *
                    </label>
                    <input
                      type="date"
                      value={assignEndDate}
                      onChange={(e) => setAssignEndDate(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Assign Trainer
                    </label>
                    <select
                      value={assignTrainerName}
                      onChange={(e) => setAssignTrainerName(e.target.value)}
                      className="input-field"
                    >
                      <option value="Coach Rohit Deshmukh">Coach Rohit Deshmukh (Head Coach)</option>
                      <option value="Priya Bhagat">Priya Bhagat (Senior Trainer)</option>
                      <option value="Amol Sawant">Amol Sawant (Strength Specialist)</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.specialization})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Personal Instructions */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Personal Instructions / Trainer Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Focus on deep squat mobility, maintain 60s rest strictly, 10 min warm-up..."
                    value={assignPersonalNotes}
                    onChange={(e) => setAssignPersonalNotes(e.target.value)}
                    className="input-field resize-none"
                  />
                </div>

                {/* Info Note on Immutability */}
                <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2 text-blue-900 text-[11px]">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Decoupled Snapshot:</strong> This creates an immutable snapshot of the
                    routine. Future modifications or deletions of the master template will not
                    affect this member's routine.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 cursor-pointer font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssignment}
                  className="px-6 py-2 rounded-xl bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. DELETE CONFIRM MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Delete Workout Routine?</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              </p>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-left text-[11px] text-gray-500 mb-4">
                <p>
                  • Historical member workout logs and previous assignments will <strong>not</strong>{' '}
                  be affected.
                </p>
                {deleteConfirm.is_default && (
                  <p className="text-[#E50914] font-bold mt-1">
                    • Warning: Default core templates cannot be deleted.
                  </p>
                )}
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border rounded-xl font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkout}
                  disabled={Boolean(deleteConfirm.is_default)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors cursor-pointer ${
                    deleteConfirm.is_default
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#E50914] hover:bg-[#B91C1C]'
                  }`}
                >
                  Delete Routine
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
