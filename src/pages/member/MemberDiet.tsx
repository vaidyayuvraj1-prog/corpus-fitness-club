import { useState, useEffect } from 'react'
import { Apple, Flame, Droplets, Clock, CheckCircle2 } from 'lucide-react'
import { db } from '@/lib/db'
import type { DietPlan } from '@/types/database'

export default function MemberDiet() {
  const [diet, setDiet] = useState<DietPlan | null>(null)

  useEffect(() => {
    const list = db.getDiets()
    setDiet(list[0] || null)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
          MY ASSIGNED DIET & NUTRITION CHART
        </h2>
        <p className="text-xs text-gray-500">
          Personalized Indian macro targets and meal timing prescribed by your trainer
        </p>
      </div>

      {diet && (
        <div className="space-y-6">
          {/* Top Macro Banner */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="bg-red-50 text-[#E50914] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {diet.goal}
                </span>
                <h3 className="font-display text-2xl tracking-wider text-[#111111] mt-1">
                  {diet.name}
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-semibold">
                Coach: {diet.trainer_name || 'Nutrition Specialist'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Daily Target</span>
                <p className="text-2xl font-extrabold text-[#E50914] mt-1">{diet.total_calories}</p>
                <span className="text-[10px] text-gray-500 font-semibold">Calories (kcal)</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Protein Goal</span>
                <p className="text-2xl font-extrabold text-blue-700 mt-1">{diet.protein_g}g</p>
                <span className="text-[10px] text-gray-500 font-semibold">High Bioavailability</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Complex Carbs</span>
                <p className="text-2xl font-extrabold text-amber-700 mt-1">{diet.carbs_g}g</p>
                <span className="text-[10px] text-gray-500 font-semibold">Slow Digesting</span>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Hydration Goal</span>
                <p className="text-2xl font-extrabold text-green-700 mt-1">{diet.water_liters}L</p>
                <span className="text-[10px] text-gray-500 font-semibold">Pure Water / Day</span>
              </div>
            </div>
          </div>

          {/* Meals Schedule */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-bold text-base text-[#111111] mb-6 flex items-center gap-2">
              <Apple className="h-5 w-5 text-[#E50914]" /> Daily Meal Timing Schedule
            </h3>

            <div className="space-y-4">
              {(diet.meals || diet.meal_items || []).map((m, idx) => (
                <div key={idx} className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-[#E50914] text-xs uppercase tracking-wider">
                      {m.meal_type}
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-700">
                      {m.calories} kcal · {m.protein_g}g Protein
                    </span>
                  </div>

                  <p className="text-sm font-bold text-gray-900 mb-1">{m.food_item}</p>
                  <p className="text-xs text-gray-500 mb-2">Portion: {m.quantity}</p>

                  {m.notes && (
                    <p className="text-[11px] text-gray-500 italic bg-white p-2.5 rounded-lg border border-gray-200/60">
                      💡 {m.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
