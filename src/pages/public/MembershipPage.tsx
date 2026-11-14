import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, ShieldCheck, HelpCircle, Phone, MessageCircle } from 'lucide-react'
import { GYM_INFO } from '@/lib/constants'
import { db } from '@/lib/db'
import type { MembershipPlan } from '@/types/database'

export default function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [gender, setGender] = useState<'men' | 'women'>('men')

  useEffect(() => {
    setPlans(db.getPlans())
  }, [])

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            FLEXIBLE & AFFORDABLE PACKAGES
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            MEMBERSHIP PLANS & PRICING
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            No registration fees, no surprise charges. Select the plan that fits your personal fitness roadmap.
          </p>

          {/* Gender Selector */}
          <div className="inline-flex items-center bg-white p-1.5 rounded-xl mt-8 border border-gray-200 shadow-sm">
            <button
              onClick={() => setGender('men')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                gender === 'men'
                  ? 'bg-[#E50914] text-white shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Men's Plans
            </button>
            <button
              onClick={() => setGender('women')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                gender === 'women'
                  ? 'bg-[#E50914] text-white shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Women's Plans (Discounted)
            </button>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => {
              const activePrice = gender === 'women' ? plan.price_women : plan.price_men

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 relative ${
                    plan.popular
                      ? 'border-[#E50914] shadow-xl ring-2 ring-[#E50914]/20'
                      : 'border-[#E5E7EB] shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E50914] text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      RECOMMENDED PLAN
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-2xl tracking-wider text-[#111111] mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">{plan.description}</p>

                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-[#111111]">
                          ₹{activePrice?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">
                          / {plan.duration_type || `${plan.duration_months} Months`}
                        </span>
                      </div>
                      <p className="text-[11px] text-green-600 font-semibold mt-1">
                        ✓ All Gym & Cardio Zone Shifts Included
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {(plan.features || [
                        'Full Gym & Cardio Floor Access',
                        'Dedicated Locker & Shower Access',
                        'Floor Trainer Form Correction',
                        'Body Composition & BMI Check',
                      ]).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-[#E50914] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={`/contact?plan=${encodeURIComponent(plan.name)}`}
                    className={`w-full py-3.5 rounded-lg text-center font-bold text-sm transition-all duration-200 block ${
                      plan.popular
                        ? 'bg-[#E50914] text-white hover:bg-[#B91C1C] shadow-md shadow-red-500/20'
                        : 'bg-[#111111] text-white hover:bg-black'
                    }`}
                  >
                    Join Now — Select Plan
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Guarantee banner */}
          <div className="mt-16 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#111111]">Transparent Pricing Guarantee</h4>
                <p className="text-xs text-gray-600">
                  No hidden admission charges. Student discounts available on producing valid college ID.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${GYM_INFO.whatsappNumber}?text=Hi%20CFC!%20I%20have%20a%20question%20regarding%20membership%20plans.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-6 py-3 rounded-lg hover:bg-[#1ebd5a] transition-colors shrink-0 shadow-sm"
            >
              <MessageCircle className="h-4 w-4" /> Enquire via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
