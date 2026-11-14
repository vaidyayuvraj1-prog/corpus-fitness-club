import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, ArrowRight, Activity, RotateCcw, Dumbbell, Flame, Droplets, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'

type CalculatorTab = 'bmi' | 'bmr' | 'calorie' | 'water' | 'ideal-weight'

export default function BMICalculatorPage() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('bmi')

  // Common inputs
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState<string>('25')
  const [heightCm, setHeightCm] = useState<string>('175')
  const [weightKg, setWeightKg] = useState<string>('72')
  const [activityLevel, setActivityLevel] = useState<string>('1.55') // Moderately active
  const [fitnessGoal, setFitnessGoal] = useState<'lose' | 'maintain' | 'gain'>('lose')

  // Results
  const [bmiResult, setBmiResult] = useState<{
    bmi: number
    category: string
    color: string
    advice: string
  } | null>(null)

  const [bmrResult, setBmrResult] = useState<number | null>(null)
  const [calorieResult, setCalorieResult] = useState<{
    tdee: number
    targetCalories: number
    protein: number
    carbs: number
    fats: number
  } | null>(null)

  const [waterResult, setWaterResult] = useState<number | null>(null)
  const [idealWeightResult, setIdealWeightResult] = useState<{ min: number; max: number; ideal: number } | null>(null)

  // Calculations
  const calcBMI = () => {
    const hM = parseFloat(heightCm) / 100
    const w = parseFloat(weightKg)
    if (!hM || !w || hM <= 0 || w <= 0) return

    const bmi = +(w / (hM * hM)).toFixed(1)
    let category = 'Normal weight'
    let color = 'text-green-600 bg-green-50 border-green-200'
    let advice = 'Great job! Maintain your balanced training and balanced nutrition at CFC.'

    if (bmi < 18.5) {
      category = 'Underweight'
      color = 'text-blue-600 bg-blue-50 border-blue-200'
      advice = 'Focus on progressive overload strength training and caloric surplus high-protein diet.'
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'Overweight'
      color = 'text-amber-600 bg-amber-50 border-amber-200'
      advice = 'Incorporate 30 mins cardio + strength training with a slight 300-500 kcal deficit.'
    } else if (bmi >= 30) {
      category = 'Obesity'
      color = 'text-red-600 bg-red-50 border-red-200'
      advice = 'Work with our certified coaches for a structured low-impact fat loss and metabolic recovery program.'
    }

    setBmiResult({ bmi, category, color, advice })
  }

  const calcBMR = () => {
    const w = parseFloat(weightKg)
    const h = parseFloat(heightCm)
    const a = parseFloat(age)
    if (!w || !h || !a) return

    // Mifflin-St Jeor Equation
    let bmr = 10 * w + 6.25 * h - 5 * a
    bmr += gender === 'male' ? 5 : -161
    setBmrResult(Math.round(bmr))
  }

  const calcCalorie = () => {
    const w = parseFloat(weightKg)
    const h = parseFloat(heightCm)
    const a = parseFloat(age)
    const act = parseFloat(activityLevel)
    if (!w || !h || !a) return

    let bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161)
    const tdee = Math.round(bmr * act)

    let target = tdee
    if (fitnessGoal === 'lose') target = tdee - 500
    if (fitnessGoal === 'gain') target = tdee + 400

    // Macro breakdown
    const protein = Math.round((target * 0.3) / 4)
    const carbs = Math.round((target * 0.45) / 4)
    const fats = Math.round((target * 0.25) / 9)

    setCalorieResult({ tdee, targetCalories: target, protein, carbs, fats })
  }

  const calcWater = () => {
    const w = parseFloat(weightKg)
    if (!w) return
    // Baseline: 35ml per kg + workout hydration bonus
    const liters = +((w * 35) / 1000 + 0.6).toFixed(1)
    setWaterResult(liters)
  }

  const calcIdealWeight = () => {
    const h = parseFloat(heightCm)
    if (!h) return

    // Devine formula for ideal body weight
    const inchesOver5Ft = Math.max(0, (h - 152.4) / 2.54)
    let ideal = gender === 'male' ? 50 + 2.3 * inchesOver5Ft : 45.5 + 2.3 * inchesOver5Ft
    ideal = +ideal.toFixed(1)

    // Range (BMI 18.5 - 24.9)
    const hM = h / 100
    const min = +(18.5 * hM * hM).toFixed(1)
    const max = +(24.9 * hM * hM).toFixed(1)

    setIdealWeightResult({ min, max, ideal })
  }

  // Calculate whenever active tab or input changes
  React.useEffect(() => {
    calcBMI()
    calcBMR()
    calcCalorie()
    calcWater()
    calcIdealWeight()
  }, [gender, age, heightCm, weightKg, activityLevel, fitnessGoal])

  return (
    <div className="min-h-screen bg-white text-[#171717] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#E50914] text-xs font-bold uppercase tracking-widest mb-4">
            <Activity className="w-4 h-4" /> SCIENTIFIC FITNESS CALCULATORS
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wider text-[#111111] mb-4">
            FITNESS & BODY COMPOSITION <span className="text-[#E50914]">CALCULATORS</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Accurately measure your BMI, basal metabolic rate, daily caloric expenditure, hydration requirements,
            and ideal weight target according to international sports science formulas.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-gray-200 pb-4">
          {[
            { id: 'bmi', label: 'BMI Calculator', icon: Activity },
            { id: 'bmr', label: 'BMR Calculator', icon: Flame },
            { id: 'calorie', label: 'Calorie & TDEE', icon: Dumbbell },
            { id: 'water', label: 'Water Intake', icon: Droplets },
            { id: 'ideal-weight', label: 'Ideal Weight', icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CalculatorTab)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'bg-[#E50914] text-white shadow-md shadow-red-500/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Main Grid: Inputs Left, Result Card Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Column */}
          <div className="lg:col-span-7 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-display text-xl tracking-wider text-[#111111] mb-6 uppercase flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#E50914]" /> Enter Your Body Measurements
            </h3>

            <div className="space-y-5">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2.5 rounded-lg font-bold text-sm border transition-all ${
                      gender === 'male'
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2.5 rounded-lg font-bold text-sm border transition-all ${
                      gender === 'female'
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Age & Height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Activity Level (Shown for Calorie) */}
              {(activeTab === 'calorie' || activeTab === 'bmr') && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="input-field"
                  >
                    <option value="1.2">Sedentary (Little or no workout)</option>
                    <option value="1.375">Lightly Active (Workout 1-3 days/week)</option>
                    <option value="1.55">Moderately Active (Workout 3-5 days/week)</option>
                    <option value="1.725">Very Active (Hard workout 6-7 days/week)</option>
                    <option value="1.9">Extremely Active (Athletic training twice daily)</option>
                  </select>
                </div>
              )}

              {/* Fitness Goal (Shown for Calorie) */}
              {activeTab === 'calorie' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fitness Target</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFitnessGoal('lose')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold border ${
                        fitnessGoal === 'lose' ? 'bg-[#E50914] text-white border-[#E50914]' : 'bg-white border-gray-300'
                      }`}
                    >
                      Weight Loss (-500)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitnessGoal('maintain')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold border ${
                        fitnessGoal === 'maintain' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white border-gray-300'
                      }`}
                    >
                      Maintain
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitnessGoal('gain')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold border ${
                        fitnessGoal === 'gain' ? 'bg-[#E50914] text-white border-[#E50914]' : 'bg-white border-gray-300'
                      }`}
                    >
                      Muscle Bulk (+400)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 bg-white border-2 border-[#E50914] rounded-2xl p-6 sm:p-8 shadow-xl">
            {activeTab === 'bmi' && bmiResult && (
              <div className="text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  YOUR BODY MASS INDEX (BMI)
                </span>
                <div className="text-6xl font-display text-[#111111] my-3">{bmiResult.bmi}</div>

                <div className={`inline-block px-4 py-1.5 rounded-full font-bold text-xs uppercase border mb-6 ${bmiResult.color}`}>
                  {bmiResult.category}
                </div>

                <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 text-left mb-6">
                  <h4 className="font-bold text-xs text-gray-700 uppercase mb-1">Coach Recommendation:</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{bmiResult.advice}</p>
                </div>

                <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-4 text-left">
                  <div className="flex justify-between"><span>Underweight</span><span className="font-bold">&lt; 18.5</span></div>
                  <div className="flex justify-between"><span>Normal Weight</span><span className="font-bold text-green-600">18.5 – 24.9</span></div>
                  <div className="flex justify-between"><span>Overweight</span><span className="font-bold text-amber-600">25.0 – 29.9</span></div>
                  <div className="flex justify-between"><span>Obese Class</span><span className="font-bold text-red-600">≥ 30.0</span></div>
                </div>
              </div>
            )}

            {activeTab === 'bmr' && bmrResult && (
              <div className="text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  BASAL METABOLIC RATE (BMR)
                </span>
                <div className="text-5xl font-display text-[#111111] my-3">{bmrResult} <span className="text-xl text-gray-500 font-sans">kcal/day</span></div>
                <p className="text-xs text-gray-600 mb-6">
                  This is the exact number of calories your body burns at complete rest just to keep organs functioning.
                </p>

                <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 text-left">
                  <h4 className="font-bold text-xs text-gray-700 uppercase mb-2">Daily Burn by Activity:</h4>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between"><span>Sedentary:</span><span className="font-bold">{Math.round(bmrResult * 1.2)} kcal</span></div>
                    <div className="flex justify-between"><span>Moderate Gym (CFC):</span><span className="font-bold text-[#E50914]">{Math.round(bmrResult * 1.55)} kcal</span></div>
                    <div className="flex justify-between"><span>Heavy Athlete:</span><span className="font-bold">{Math.round(bmrResult * 1.725)} kcal</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calorie' && calorieResult && (
              <div className="text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  TARGET DAILY CALORIES
                </span>
                <div className="text-5xl font-display text-[#E50914] my-3">
                  {calorieResult.targetCalories} <span className="text-xl text-[#111111] font-sans">kcal</span>
                </div>
                <p className="text-xs text-gray-600 mb-6">
                  Maintenance TDEE: <strong>{calorieResult.tdee} kcal</strong>. Target adjusted for {fitnessGoal}.
                </p>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-100">
                  <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                    <p className="text-xs font-bold text-[#E50914]">Protein</p>
                    <p className="text-base font-bold text-[#111111] mt-1">{calorieResult.protein}g</p>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    <p className="text-xs font-bold text-amber-700">Carbs</p>
                    <p className="text-base font-bold text-[#111111] mt-1">{calorieResult.carbs}g</p>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-700">Healthy Fats</p>
                    <p className="text-base font-bold text-[#111111] mt-1">{calorieResult.fats}g</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'water' && waterResult && (
              <div className="text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  RECOMMENDED DAILY WATER INTAKE
                </span>
                <div className="text-6xl font-display text-blue-600 my-3">
                  {waterResult} <span className="text-2xl text-gray-700 font-sans">Liters</span>
                </div>
                <p className="text-xs text-gray-600 mb-6">
                  Approximately <strong>{Math.round(waterResult * 4)} glasses</strong> (250ml each) of pure water per day
                  including workout hydration.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-xs text-blue-900 space-y-1">
                  <p>💧 Drink 500ml upon waking up to jumpstart metabolism.</p>
                  <p>💧 Sip 200ml every 20 minutes during heavy lifting or Zumba.</p>
                </div>
              </div>
            )}

            {activeTab === 'ideal-weight' && idealWeightResult && (
              <div className="text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  IDEAL BODY WEIGHT ESTIMATE
                </span>
                <div className="text-5xl font-display text-[#111111] my-3">
                  {idealWeightResult.ideal} <span className="text-xl text-gray-500 font-sans">kg</span>
                </div>
                <p className="text-xs text-gray-600 mb-6">
                  Based on Devine & Robinson clinical sports formulas for {gender} at {heightCm} cm.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left text-xs text-green-900">
                  <span className="font-bold block mb-1">Healthy BMI Range:</span>
                  <p>
                    Your healthy weight window is between <strong>{idealWeightResult.min} kg</strong> and{' '}
                    <strong>{idealWeightResult.max} kg</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                to="/membership"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#E50914] text-white font-bold text-sm py-3 rounded-lg hover:bg-[#B91C1C] transition-all shadow-sm"
              >
                Join CFC & Meet a Coach <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
