import { useState, useEffect } from 'react'
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
  ListPlus,
  Copy,
  BookOpen,
  Sparkles,
  Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { WorkoutPlan, Exercise, Member, ExerciseLibraryItem } from '@/types/database'

const CORE_CATEGORIES = [
  'All',
  'Default Plans',
  'Beginner Workout',
  'Weight Loss',
  'Muscle Building',
  'Strength Training',
  'Full Body Workout',
  'Push Pull Legs',
  'Home Workout',
]

export default function WorkoutPlansPage() {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibraryItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null)
  const [assignModal, setAssignModal] = useState<WorkoutPlan | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<WorkoutPlan | null>(null)

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: 'Muscle Building',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    description: '',
    trainer_name: 'Coach Rohit Deshmukh',
    is_default: false,
    days_per_week: 4,
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
        instructions: 'Retract scapula, lower bar with control to mid-chest.',
      },
    ] as Exercise[],
  })

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setWorkouts(db.getWorkouts())
    setMembers(db.getMembers())
    setExerciseLibrary(db.getExerciseLibrary())
  }

  const handleOpenAdd = () => {
    setEditingPlan(null)
    setForm({
      name: '',
      category: 'Muscle Building',
      level: 'intermediate',
      description: '',
      trainer_name: 'Coach Rohit Deshmukh',
      is_default: false,
      days_per_week: 4,
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
          instructions: 'Retract scapulae, touch lower sternum, drive through chest.',
        },
      ],
    })
    setShowModal(true)
  }

  const handleOpenEdit = (wp: WorkoutPlan) => {
    setEditingPlan(wp)
    setForm({
      name: wp.name,
      category: wp.category,
      level: wp.level,
      description: wp.description,
      trainer_name: wp.trainer_name || 'Coach Rohit Deshmukh',
      is_default: Boolean(wp.is_default),
      days_per_week: wp.days_per_week || 4,
      exercises: wp.exercises && wp.exercises.length > 0 ? wp.exercises : [
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
          day_of_week: 'Monday',
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
      toast.error('Workout plan must contain at least 1 exercise')
      return
    }
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }))
  }

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Workout plan name is required')
      return
    }

    try {
      db.saveWorkout({
        id: editingPlan?.id,
        name: form.name,
        category: form.category,
        level: form.level,
        description: form.description,
        trainer_name: form.trainer_name,
        is_default: form.is_default,
        days_per_week: Number(form.days_per_week) || 4,
        exercises: form.exercises,
      })
      toast.success(
        editingPlan ? `Updated "${form.name}"!` : `Workout routine "${form.name}" saved!`
      )
      setShowModal(false)
      loadData()
    } catch {
      toast.error('Failed to save workout routine')
    }
  }

  const handleDuplicatePlan = (wp: WorkoutPlan) => {
    try {
      const cloned = db.duplicateWorkout(wp.id, undefined, `${wp.name} (Custom Copy)`)
      toast.success(`Duplicated "${wp.name}" as "${cloned.name}"!`)
      loadData()
    } catch {
      toast.error('Failed to duplicate plan')
    }
  }

  const handleAssignToMember = () => {
    if (!assignModal || !selectedMemberId) {
      toast.error('Select a member to assign')
      return
    }

    const mem = members.find((m) => m.id === selectedMemberId)
    // Clone or assign plan to member
    db.saveWorkout({
      id: assignModal.id,
      assigned_member_id: mem?.id,
    })
    toast.success(`Assigned "${assignModal.name}" to ${mem?.profile?.full_name || 'Member'}!`)
    setAssignModal(null)
    loadData()
  }

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

  // Filtered workouts
  const filteredWorkouts = workouts.filter((w) => {
    if (selectedCategory === 'Default Plans' && !w.is_default) return false
    if (selectedCategory !== 'All' && selectedCategory !== 'Default Plans' && w.category !== selectedCategory) {
      return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchName = w.name.toLowerCase().includes(q)
      const matchDesc = (w.description || '').toLowerCase().includes(q)
      const matchCat = w.category.toLowerCase().includes(q)
      const matchEx = (w.exercises || []).some((e) => e.name.toLowerCase().includes(q))
      if (!matchName && !matchDesc && !matchCat && !matchEx) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            WORKOUT PLAN BUILDER & ROUTINES
          </h2>
          <p className="text-xs text-gray-500">
            Manage Admin default templates, custom splits, and assign routines to members
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Build New Routine
        </button>
      </div>

      {/* Filter Pills & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {CORE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plan by title, category, or exercise name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredWorkouts.length}</strong> routines
          </div>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWorkouts.map((wp) => (
          <div
            key={wp.id}
            className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
              wp.is_default ? 'border-[#E50914]/30 ring-1 ring-[#E50914]/10' : 'border-[#E5E7EB]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {wp.is_default && (
                      <span className="bg-[#E50914] text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                        Default Plan
                      </span>
                    )}
                    <span className="bg-red-50 text-[#E50914] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {wp.category}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                      {wp.level}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl tracking-wider text-[#111111]">{wp.name}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicatePlan(wp)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Duplicate / Copy Routine"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(wp)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Edit Routine"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(wp)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Routine"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-4 leading-relaxed">{wp.description}</p>

              {/* Prescribed Exercises List */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Prescribed Exercises ({wp.exercises?.length || 0})
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    {wp.days_per_week || 4} days / week
                  </span>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs max-h-56 overflow-y-auto">
                  {(wp.exercises || []).map((ex, i) => (
                    <div key={i} className="p-3 bg-[#F8FAFC] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{ex.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {ex.day_of_week} · {ex.muscle_group}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-[#E50914]">{ex.sets} sets × {ex.reps}</span>
                        <p className="text-[10px] text-gray-400">{ex.weight || 'Moderate'} · {ex.rest_seconds}s rest</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Trainer: <strong>{wp.trainer_name || 'Coach Rohit'}</strong>
              </span>
              <button
                onClick={() => {
                  setAssignModal(wp)
                  setSelectedMemberId(members[0]?.id || '')
                }}
                className="px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Assign to Member
              </button>
            </div>
          </div>
        ))}

        {filteredWorkouts.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
            No workout plans found for the selected category or search filter.
          </div>
        )}
      </div>

      {/* ── BUILD / EDIT WORKOUT MODAL ───────────────────────────── */}
      <AnimatePresence>
        {showModal && (
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
                    {editingPlan ? 'Edit Workout Routine' : 'Build Custom Workout Routine'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Define exercises, target muscle groups, sets, reps, and target weights
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveWorkout} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Routine Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5x5 Power Protocol"
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
                      <option value="General Fitness">General Fitness</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Experience Level</label>
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
                    <label className="block font-bold text-gray-700 uppercase mb-1">Days Per Week</label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={form.days_per_week}
                      onChange={(e) => setForm({ ...form, days_per_week: parseInt(e.target.value) || 4 })}
                      className="input-field"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={form.is_default}
                        onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                        className="rounded text-[#E50914] focus:ring-[#E50914] w-4 h-4"
                      />
                      <span>Mark as Admin Default Plan</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Description & Strategy</label>
                  <textarea
                    rows={2}
                    placeholder="Goal, rest periods, progressive overload instructions..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>

                {/* Exercises Builder */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#E50914]" /> Exercises in Routine ({form.exercises.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddExerciseRow}
                      className="text-[#E50914] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Exercise
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {form.exercises.map((ex, idx) => (
                      <div key={ex.id || idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-gray-400 text-[10px]">#{idx + 1}</span>

                          {/* Quick Select From Exercise Library */}
                          <select
                            onChange={(e) => handleSelectFromLibrary(idx, e.target.value)}
                            className="bg-white border border-gray-300 rounded px-2 py-1 text-[11px] flex-1 max-w-xs font-medium text-gray-700"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              -- Or Pick from Exercise Library Catalog --
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
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Exercise Name (e.g. Barbell Squat)"
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...form.exercises]
                              updated[idx].name = e.target.value
                              setForm({ ...form, exercises: updated })
                            }}
                            className="input-field"
                          />

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

                          <select
                            value={ex.day_of_week}
                            onChange={(e) => {
                              const updated = [...form.exercises]
                              updated[idx].day_of_week = e.target.value
                              setForm({ ...form, exercises: updated })
                            }}
                            className="input-field"
                          >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold block">Sets</label>
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
                            <label className="text-[10px] text-gray-500 font-bold block">Reps</label>
                            <input
                              type="text"
                              placeholder="8-12"
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
                            <label className="text-[10px] text-gray-500 font-bold block">Weight / Load</label>
                            <input
                              type="text"
                              placeholder="e.g. 60-80 kg"
                              value={ex.weight || ''}
                              onChange={(e) => {
                                const updated = [...form.exercises]
                                updated[idx].weight = e.target.value
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

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
                  >
                    {editingPlan ? 'Update Routine' : 'Save Routine'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ASSIGN MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
              <h3 className="font-bold text-lg text-[#111111] mb-2">Assign Routine to Member</h3>
              <p className="text-xs text-gray-500 mb-4">
                Assign <strong>{assignModal.name}</strong> to:
              </p>

              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="input-field mb-4"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.profile?.full_name} ({m.member_id}) - {m.fitness_goal}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setAssignModal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToMember}
                  className="px-4 py-2 rounded-lg bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
                >
                  Confirm Assign
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────────── */}
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
              <p className="text-xs text-gray-500 mt-1 mb-5">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              </p>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkout}
                  className="flex-1 py-2.5 rounded-lg bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
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
