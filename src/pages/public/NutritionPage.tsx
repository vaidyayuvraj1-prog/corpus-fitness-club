import { Link } from 'react-router-dom'
import { Apple, Flame, Dumbbell, Droplets, CheckCircle2, ArrowRight } from 'lucide-react'

export default function NutritionPage() {
  const mealExamples = [
    {
      meal: 'Breakfast (Morning Fuel)',
      desc: 'Oats with milk, sliced bananas, soaked almonds, plus boiled eggs or paneer bhurji.',
      macros: 'Calories: 500 kcal · Protein: 28g · Carbs: 65g · Fats: 12g',
    },
    {
      meal: 'Mid-Morning Snack',
      desc: 'Sprouts salad with tomatoes, cucumber, lemon juice, roasted chana, green tea.',
      macros: 'Calories: 220 kcal · Protein: 14g · Carbs: 32g · Fats: 4g',
    },
    {
      meal: 'Lunch (Main Energy Boost)',
      desc: '3 Multigrain Rotis, 1 bowl dal/lentils, grilled chicken breast or paneer, green vegetable sabzi & curd.',
      macros: 'Calories: 680 kcal · Protein: 45g · Carbs: 75g · Fats: 18g',
    },
    {
      meal: 'Pre-Workout Snack',
      desc: '2 Whole wheat bread slices with peanut butter or 1 banana with black coffee 45 mins prior to training.',
      macros: 'Calories: 280 kcal · Protein: 10g · Carbs: 45g · Fats: 8g',
    },
    {
      meal: 'Dinner (Recovery & Repair)',
      desc: 'Brown rice or 2 rotis, soya chunks / grilled fish / tofu, steamed vegetables & warm soup.',
      macros: 'Calories: 520 kcal · Protein: 35g · Carbs: 55g · Fats: 14g',
    },
  ]

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            SCIENTIFIC NUTRITION GUIDANCE
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            INDIAN DIET & MACRO PLANNING
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Abs are built in the kitchen. Combine your hard workouts at CFC with our practical, sustainable Indian meal plans.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center font-bold mb-5">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-[#111111] mb-2">High-Protein Foundation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Aim for 1.4g to 2.0g protein per kg bodyweight. Sources: Eggs, Paneer, Chicken, Soya, Chana, Dal, Greek Curd, and Whey.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center font-bold mb-5">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-[#111111] mb-2">Smart Caloric Balance</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                300-500 kcal deficit for fat reduction without muscle loss. 300-400 kcal surplus for clean muscle building.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center font-bold mb-5">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-[#111111] mb-2">Hydration & Electrolytes</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Drink 3.5 to 4.5 Liters of water daily to support digestion, energy, and muscle pump during heavy sets.
              </p>
            </div>
          </div>

          {/* Sample Daily Indian Plan */}
          <div className="max-w-4xl mx-auto bg-white border-2 border-gray-200 rounded-2xl p-8 sm:p-10 shadow-lg">
            <h3 className="font-display text-2xl tracking-wider text-[#111111] uppercase mb-6 flex items-center gap-2">
              <Apple className="h-6 w-6 text-[#E50914]" /> Sample Indian Transformation Meal Plan
            </h3>

            <div className="space-y-4">
              {mealExamples.map((item, idx) => (
                <div key={idx} className="bg-[#F8FAFC] p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-sm text-[#111111] mb-1">{item.meal}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">{item.desc}</p>
                  <p className="text-[11px] font-bold text-[#E50914]">{item.macros}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center pt-4 border-t border-gray-100">
              <Link
                to="/bmi"
                className="inline-flex items-center gap-2 bg-[#E50914] text-white font-bold text-xs py-3 px-6 rounded-lg hover:bg-[#B91C1C] transition-all shadow-sm"
              >
                Calculate Your Daily Calories & Macros <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
