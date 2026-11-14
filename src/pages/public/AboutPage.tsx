import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, Users, Heart, Zap, Shield, TrendingUp, CheckCircle, Clock, MapPin, ArrowRight } from 'lucide-react'
import { GYM_INFO, WHY_CHOOSE_US } from '@/lib/constants'

export default function AboutPage() {
  const values = [
    { icon: Shield, title: 'Integrity & Safety', desc: 'No false promises or dangerous quick fixes. We teach safe form, biomechanics, and sustainable lifestyle habits.' },
    { icon: Users, title: 'Inclusive Community', desc: 'A supportive, zero-ego fitness family where newcomers, students, women, and elite athletes train with mutual respect.' },
    { icon: TrendingUp, title: 'Consistent Progression', desc: 'Measured strength gains and gradual fat reduction tracked with modern digital logs and body composition assessments.' },
    { icon: Heart, title: 'Passion for Health', desc: 'Dedicated to helping Amravati live stronger, stress-free, and healthier lives through daily physical activity.' },
    { icon: Award, title: 'Equipment Excellence', desc: 'Heavy-duty pin-loaded and plate-loaded resistance gear engineered for maximum muscle recruitment.' },
    { icon: Zap, title: 'Energizing Environment', desc: 'A spacious 3rd-floor facility with natural airflow, uplifting music, and motivating training partners.' },
  ]

  const milestones = [
    { year: '2019', title: 'Grand Opening at VMV Road', desc: 'Established above State Bank of India at Vidyut Nagar Square with top imported equipment and certified coaching staff.' },
    { year: '2021', title: 'Cardio & Aerobics Expansion', desc: 'Expanded the dedicated cardio deck and introduced specialized high-intensity Zumba & Aerobics batches for ladies and beginners.' },
    { year: '2023', title: '500+ Active Members Milestone', desc: 'Crossed over 500 active fitness transformations across Amravati with an exceptional 4.8-star community rating.' },
    { year: '2026', title: 'Digital ERP & QR Check-In Launch', desc: 'Introduced contactless QR code attendance, personal workout plan builders, and online diet monitoring portals for members.' },
  ]

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Hero Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            ESTABLISHED IN 2019 · AMRAVATI, MAHARASHTRA
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            ABOUT CORPUS FITNESS CLUB
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Amravati’s premier fitness destination combining scientific strength programming, modern equipment, and dedicated personal coaching.
          </p>
        </div>
      </section>

      {/* Philosophy & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
                OUR PHILOSOPHY & MISSION
              </span>
              <h2 className="text-3xl sm:text-4xl font-display tracking-wider text-[#111111] mt-2 mb-6">
                Fitness Built on Science, Form & Community
              </h2>
              <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>
                  At <strong>CORPUS FITNESS CLUB (CFC)</strong>, we believe fitness is not a seasonal trend or a quick 30-day crash diet. It is a lifelong commitment to strength, mobility, mental resilience, and disease prevention.
                </p>
                <p>
                  Established in 2019, CFC was founded to provide Amravati with a clean, respectful, and fully equipped gym environment where people of all ages—from college students and working professionals to homemakers and seniors—can exercise safely and effectively.
                </p>
                <p>
                  Our floor trainers are present at all times to spot your lifts, correct exercise form, and provide nutritional recommendations suited for Indian dietary preferences.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-display text-[#111111]">500+</p>
                  <p className="text-xs text-gray-500 font-medium uppercase mt-1">Transformations</p>
                </div>
                <div>
                  <p className="text-3xl font-display text-[#E50914]">4.8 ★</p>
                  <p className="text-xs text-gray-500 font-medium uppercase mt-1">140+ Reviews</p>
                </div>
                <div>
                  <p className="text-3xl font-display text-[#111111]">6 Yrs</p>
                  <p className="text-xs text-gray-500 font-medium uppercase mt-1">In Amravati</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80"
                  alt="Corpus Fitness Club Gym Floor"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#111111] text-white p-6 rounded-xl shadow-xl max-w-xs hidden sm:block border-l-4 border-[#E50914]">
                <p className="font-bold text-sm">3rd Floor, Above SBI</p>
                <p className="text-xs text-gray-400 mt-1">Vidyut Nagar Square, VMV Road, Amravati 444604</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-[#F8FAFC] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              WHAT DRIVES US
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              OUR CORE VALUES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div
                  key={i}
                  className="bg-white p-7 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#E50914]/40 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-[#111111] mb-2">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Journey Milestones */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              GROWTH & EVOLUTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-display tracking-wider text-[#111111] mt-2">
              OUR JOURNEY SINCE 2019
            </h2>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-gray-200">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative flex items-start gap-6 ml-2 sm:ml-0">
                <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md ring-4 ring-white z-10">
                  {m.year.slice(-2)}
                </div>
                <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-6 flex-1 shadow-sm">
                  <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider">{m.year}</span>
                  <h3 className="text-lg font-bold text-[#111111] mt-1 mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 bg-[#E50914] text-white font-bold text-sm px-8 py-4 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md"
            >
              Explore Membership Plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
