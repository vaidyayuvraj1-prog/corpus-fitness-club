import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Apple,
  Plus,
  Flame,
  Droplets,
  Clock,
  Trash2,
  X,
  CheckCircle2,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { DietPlan, MealItem, Member } from '@/types/database'

export default function DietPlansPage() {
  const [diets, setDiets] = useState<DietPlan[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [showModal, setShowModal] = useState(false)
  const [assignModal, setAssignModal] = useState<DietPlan | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<DietPlan | null>(null)

  const [form, setForm] = useState({
    name: '',
    goal: 'Muscle Gain & Strength',
    total_calories: 2200,
    protein_g: 140,
    carbs_g: 240,
    fats_g: 60,
    water_liters: 4,
    trainer_name: 'Coach Amit Thakre',
    meals: [
      {
        id: 'm-1',
        diet_plan_id: '',
        meal_type: 'Breakfast' as const,
        food_item: 'Oats with Milk, Banana, Almonds & 3 Egg Whites',
        quantity: '1 large bowl + 3 eggs',
        calories: 520,
        protein_g: 28,
        carbs_g: 65,
        fats_g: 12,
        notes: 'Substitute eggs with paneer for vegetarians.',
      },
    ] as MealItem[],
  })

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setDiets(db.getDiets())
    setMembers(db.getMembers())
  }

  const handleAddMealRow = () => {
    setForm((prev) => ({
      ...prev,
      meals: [
        ...prev.meals,
        {
          id: `m-${Date.now()}`,
          diet_plan_id: '',
          meal_type: 'Lunch',
          food_item: '',
          quantity: '1 serving',
          calories: 400,
          protein_g: 25,
          carbs_g: 45,
          fats_g: 10,
          notes: '',
        },
      ],
    }))
  }

  const handleRemoveMealRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }))
  }

  const handleSaveDiet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Diet plan name is required')
      return
    }

    try {
      db.saveDiet({
        name: form.name,
        goal: form.goal,
        total_calories: Number(form.total_calories),
        protein_g: Number(form.protein_g),
        carbs_g: Number(form.carbs_g),
        fats_g: Number(form.fats_g),
        water_liters: Number(form.water_liters),
        trainer_name: form.trainer_name,
        meals: form.meals,
      })
      toast.success('Diet plan created successfully!')
      setShowModal(false)
      loadData()
    } catch {
      toast.error('Failed to save diet plan')
    }
  }

  const handleAssignToMember = () => {
    if (!assignModal || !selectedMemberId) return
    const mem = members.find((m) => m.id === selectedMemberId)
    toast.success(`Diet plan "${assignModal.name}" assigned to ${mem?.profile?.full_name}!`)
    setAssignModal(null)
  }

  const handleDeleteDiet = () => {
    if (!deleteConfirm) return
    try {
      db.deleteDiet(deleteConfirm.id)
      toast.success(`Diet plan "${deleteConfirm.name}" deleted successfully!`)
      setDeleteConfirm(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete diet plan')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            DIET & NUTRITION MANAGEMENT
          </h2>
          <p className="text-xs text-gray-500">
            Build customized Indian nutrition schedules, calculate macro splits, and assign meal charts to members
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              name: '',
              goal: 'Weight Loss & Fat Reduction',
              total_calories: 1800,
              protein_g: 130,
              carbs_g: 180,
              fats_g: 50,
              water_liters: 3.5,
              trainer_name: 'Coach Amit Thakre',
              meals: [
                {
                  id: 'm-1',
                  diet_plan_id: '',
                  meal_type: 'Breakfast',
                  food_item: 'Oats with Milk, Banana, Almonds & 3 Egg Whites',
                  quantity: '1 large bowl + 3 eggs',
                  calories: 520,
                  protein_g: 28,
                  carbs_g: 65,
                  fats_g: 12,
                  notes: 'Substitute eggs with paneer for vegetarians.',
                },
              ],
            })
            setShowModal(true)
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Diet Chart
        </button>
      </div>

      {/* Diets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diets.map((dp) => (
          <div
            key={dp.id}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-2xl tracking-wider text-[#111111]">{dp.name}</h3>
                  <span className="bg-red-50 text-[#E50914] text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block">
                    {dp.goal}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    By {dp.trainer_name || 'Nutritionist'}
                  </span>
                  <button
                    onClick={() => setDeleteConfirm(dp)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Diet Plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Macro Badges */}
              <div className="grid grid-cols-4 gap-2 my-4 text-center">
                <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Calories</span>
                  <span className="font-extrabold text-sm text-[#E50914]">{dp.total_calories} kcal</span>
                </div>
                <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Protein</span>
                  <span className="font-extrabold text-sm text-blue-700">{dp.protein_g}g</span>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Carbs</span>
                  <span className="font-extrabold text-sm text-amber-700">{dp.carbs_g}g</span>
                </div>
                <div className="bg-green-50 p-2 rounded-xl border border-green-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Water</span>
                  <span className="font-extrabold text-sm text-green-700">{dp.water_liters}L</span>
                </div>
              </div>

              {/* Meal Items */}
              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Prescribed Daily Meals ({dp.meals?.length || dp.meal_items?.length || 0})
                </span>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                  {(dp.meals || dp.meal_items || []).map((m, i) => (
                    <div key={i} className="p-3 bg-[#F8FAFC]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#E50914] text-[11px] uppercase tracking-wider">
                          {m.meal_type}
                        </span>
                        <span className="font-mono text-gray-500 text-[10px]">{m.calories} kcal · {m.protein_g}g P</span>
                      </div>
                      <p className="font-bold text-gray-900">{m.food_item}</p>
                      {m.notes && <p className="text-[10px] text-gray-500 mt-0.5">{m.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-green-600 font-bold">✓ Active Diet Schedule</span>
              <button
                onClick={() => {
                  setAssignModal(dp)
                  setSelectedMemberId(members[0]?.id || '')
                }}
                className="px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Assign to Member
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── CREATE DIET MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                  Diet Plan Builder
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDiet} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Plan Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2400 kcal Vegetarian Bulking"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Fitness Target Goal</label>
                    <input
                      type="text"
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Daily Calories (kcal)</label>
                    <input
                      type="number"
                      value={form.total_calories}
                      onChange={(e) => setForm({ ...form, total_calories: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Protein Target (g)</label>
                    <input
                      type="number"
                      value={form.protein_g}
                      onChange={(e) => setForm({ ...form, protein_g: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Carbs Target (g)</label>
                    <input
                      type="number"
                      value={form.carbs_g}
                      onChange={(e) => setForm({ ...form, carbs_g: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Water Target (Liters)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.water_liters}
                      onChange={(e) => setForm({ ...form, water_liters: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Meals Builder */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-700 uppercase">Prescribed Meals</span>
                    <button
                      type="button"
                      onClick={handleAddMealRow}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E50914] hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Meal
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.meals.map((m, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-700">Meal #{idx + 1}</span>
                          {form.meals.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMealRow(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div>
                            <select
                              value={m.meal_type}
                              onChange={(e) => {
                                const arr = [...form.meals]
                                arr[idx].meal_type = e.target.value as any
                                setForm({ ...form, meals: arr })
                              }}
                              className="input-field"
                            >
                              <option value="Breakfast">Breakfast</option>
                              <option value="Mid-Morning Snack">Mid-Morning Snack</option>
                              <option value="Lunch">Lunch</option>
                              <option value="Evening Snack">Evening Snack</option>
                              <option value="Dinner">Dinner</option>
                              <option value="Post-Workout">Post-Workout</option>
                            </select>
                          </div>

                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Food Items (e.g. 3 Roti, 150g Paneer, Salad)"
                              required
                              value={m.food_item}
                              onChange={(e) => {
                                const arr = [...form.meals]
                                arr[idx].food_item = e.target.value
                                setForm({ ...form, meals: arr })
                              }}
                              className="input-field"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <input
                              type="number"
                              placeholder="Calories"
                              value={m.calories}
                              onChange={(e) => {
                                const arr = [...form.meals]
                                arr[idx].calories = Number(e.target.value)
                                setForm({ ...form, meals: arr })
                              }}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Protein (g)"
                              value={m.protein_g}
                              onChange={(e) => {
                                const arr = [...form.meals]
                                arr[idx].protein_g = Number(e.target.value)
                                setForm({ ...form, meals: arr })
                              }}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Notes (Optional)"
                              value={m.notes || ''}
                              onChange={(e) => {
                                const arr = [...form.meals]
                                arr[idx].notes = e.target.value
                                setForm({ ...form, meals: arr })
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
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold">
                    Save Diet Schedule
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ASSIGN DIET MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
              <h3 className="font-bold text-base text-gray-900 mb-1">Assign Diet Schedule</h3>
              <p className="text-xs text-gray-500 mb-4">
                Assigning <strong>"{assignModal.name}"</strong> directly to member portal.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="input-field text-xs"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.profile?.full_name} ({m.member_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setAssignModal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToMember}
                  className="px-4 py-2 rounded-lg bg-[#E50914] text-white font-bold"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE DIET PLAN CONFIRMATION MODAL ────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Delete Diet Plan?</h3>
              <p className="text-xs text-gray-600 mb-6">
                Are you sure you want to delete <strong className="text-gray-900 font-bold">"{deleteConfirm.name}"</strong>?
                This diet chart will be removed permanently.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDiet}
                  className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Yes, Delete Diet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
