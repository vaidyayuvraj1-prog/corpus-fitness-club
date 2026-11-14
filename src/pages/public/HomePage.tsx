import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Zap,
  Activity,
  Award,
  Flame,
  Heart,
  Maximize,
  Users,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Star,
  ShieldCheck,
  Calendar,
  Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  GYM_INFO,
  FACILITIES,
  PROGRAMS,
  WHY_CHOOSE_US,
  FAQ_LIST,
  FITNESS_GOALS,
} from '@/lib/constants'
import { db } from '@/lib/db'
import type { MembershipPlan, Trainer, Enquiry } from '@/types/database'

export default function HomePage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [galleryCategory, setGalleryCategory] = useState('All')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [genderToggle, setGenderToggle] = useState<'men' | 'women'>('men')

  // Admission Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'male',
    age: '',
    interested_plan: 'Half-Yearly Plan',
    fitness_goal: 'Weight Loss & Fat Reduction',
    message: '',
  })
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setPlans(db.getPlans())
    setTrainers(db.getTrainers())
  }, [])

  const galleryItems = [
    {
      id: '1',
      category: 'Gym Interior',
      title: 'Spacious 3rd Floor Training Zone',
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '2',
      category: 'Equipment',
      title: 'Heavy Free Weights & Olympic Barbells',
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '3',
      category: 'Training',
      title: 'Strength & Hypertrophy Training',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '4',
      category: 'Equipment',
      title: 'Pin & Plate-Loaded Resistance Machines',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '5',
      category: 'Activities',
      title: 'High-Energy Zumba Cardio Batch',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '6',
      category: 'Events',
      title: 'Annual Amravati Fitness Challenge',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    },
  ]

  const filteredGallery =
    galleryCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === galleryCategory)

  // Facility icon map
  const getFacilityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell':
        return <Dumbbell className="h-6 w-6 text-[#E50914]" />
      case 'Zap':
        return <Zap className="h-6 w-6 text-[#E50914]" />
      case 'Activity':
        return <Activity className="h-6 w-6 text-[#E50914]" />
      case 'Award':
        return <Award className="h-6 w-6 text-[#E50914]" />
      case 'Flame':
        return <Flame className="h-6 w-6 text-[#E50914]" />
      case 'Heart':
        return <Heart className="h-6 w-6 text-[#E50914]" />
      case 'Maximize':
        return <Maximize className="h-6 w-6 text-[#E50914]" />
      default:
        return <Users className="h-6 w-6 text-[#E50914]" />
    }
  }

  // Handle Enquiry Submit
  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!enquiryForm.full_name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!enquiryForm.phone.trim() || enquiryForm.phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    if (!enquiryForm.email.trim() || !enquiryForm.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!enquiryForm.age || Number(enquiryForm.age) < 14 || Number(enquiryForm.age) > 80) {
      toast.error('Please enter a valid age between 14 and 80')
      return
    }

    setIsSubmitting(true)
    try {
      const saved = db.saveEnquiry({
        full_name: enquiryForm.full_name,
        phone: enquiryForm.phone,
        email: enquiryForm.email,
        gender: enquiryForm.gender as any,
        age: Number(enquiryForm.age),
        interested_plan: enquiryForm.interested_plan,
        fitness_goal: enquiryForm.fitness_goal,
        message: enquiryForm.message,
      })

      setSubmittedEnquiry(saved)
      toast.success(`Enquiry submitted successfully! Ref: ${saved.reference_no}`)
    } catch {
      toast.error('Failed to submit enquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center bg-gray-900 overflow-hidden">
        {/* Background Gym Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=85"
            alt="Corpus Fitness Club Gym Workout"
            className="w-full h-full object-cover object-center brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl text-white">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#E50914] text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-md"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>AMRAVATI'S PREMIER FITNESS DESTINATION · EST. 2019</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-wider text-white leading-tight mb-6"
            >
              TRANSFORM YOUR BODY.{' '}
              <span className="text-[#E50914] block">TRANSFORM YOUR LIFE.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed font-normal"
            >
              Your Fitness Journey Starts at <strong className="text-white">CORPUS FITNESS CLUB</strong>.
              State-of-the-art strength & cardio equipment, certified trainers, and energizing workout batches
              above SBI, VMV Road, Amravati.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
            >
              <a
                href="#enquiry-section"
                className="inline-flex items-center justify-center bg-[#E50914] text-white font-bold text-base px-8 py-4 rounded-lg hover:bg-[#B91C1C] transition-all shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5"
              >
                Join Now <ArrowRight className="ml-2 h-5 w-5" />
              </a>

              <Link
                to="/membership"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-[#111111] font-bold text-base px-8 py-4 rounded-lg border border-white/30 backdrop-blur-sm transition-all"
              >
                Explore Membership
              </Link>
            </motion.div>

            {/* Quick Stat Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 pt-8 border-t border-white/20 grid grid-cols-3 gap-6"
            >
              <div>
                <p className="text-3xl font-display text-white">500+</p>
                <p className="text-xs text-gray-300 font-medium uppercase tracking-wider">Active Members</p>
              </div>
              <div>
                <p className="text-3xl font-display text-[#E50914]">4.8 ★</p>
                <p className="text-xs text-gray-300 font-medium uppercase tracking-wider">Google Rating</p>
              </div>
              <div>
                <p className="text-3xl font-display text-white">6+ YRS</p>
                <p className="text-xs text-gray-300 font-medium uppercase tracking-wider">Excellence</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. ABOUT SECTION ───────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Grid */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80"
                  alt="Corpus Fitness Club Amravati Interior"
                  className="w-full h-[460px] object-cover"
                />
              </div>
              {/* Float Card */}
              <div className="absolute -bottom-6 -right-6 sm:bottom-6 sm:right-6 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#E50914] text-white flex items-center justify-center font-bold text-xl">
                    CFC
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111111] text-base">Established in 2019</h4>
                    <p className="text-xs text-gray-500">Amravati's Trusted Fitness Club</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Text Content */}
            <div className="space-y-6">
              <div>
                <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
                  ABOUT OUR CLUB
                </span>
                <h2 className="text-3xl sm:text-4xl font-display tracking-wider text-[#111111] mt-2">
                  Welcome to CORPUS FITNESS CLUB
                </h2>
              </div>

              <p className="text-gray-600 text-base leading-relaxed">
                Founded in 2019 at Vidyut Nagar Square, VMV Road, Amravati, <strong>CORPUS FITNESS CLUB</strong>{' '}
                was established with a singular vision: to bring world-class fitness training, modern biomechanical
                equipment, and scientific coaching to everyone at honest, transparent prices.
              </p>

              {/* Bullet Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Our Fitness Philosophy</h4>
                    <p className="text-xs text-gray-500">Consistency, progressive overload, and safe form over heavy ego lifting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Our Mission</h4>
                    <p className="text-xs text-gray-500">Empowering every individual in Amravati to achieve lifelong health & vitality.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Professional Environment</h4>
                    <p className="text-xs text-gray-500">Hygienic, well-ventilated 3rd floor space with natural light & motivating beats.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Supportive Certified Trainers</h4>
                    <p className="text-xs text-gray-500">Always available on the gym floor for spotting, form tips, and motivation.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center text-[#E50914] font-bold text-sm hover:underline"
                >
                  Read More About Our Story <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FACILITIES SECTION ──────────────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              WORLD-CLASS AMENITIES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              OUR PREMIUM FACILITIES
            </h2>
            <p className="text-gray-600 text-base mt-4">
              Everything you need under one roof for complete body transformation and healthy living.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FACILITIES.map((facility) => (
              <motion.div
                key={facility.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#E50914]/40 transition-all duration-300 flex flex-col"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                    {getFacilityIcon(facility.icon)}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#111111] mb-2">{facility.title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">{facility.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. PROGRAMS SECTION ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              GOAL-ORIENTED COACHING
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              SPECIALIZED FITNESS PROGRAMS
            </h2>
            <p className="text-gray-600 text-base mt-4">
              Whether your goal is dropping body fat, building massive muscle, or increasing daily energy, we have a targeted roadmap for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROGRAMS.map((prog) => (
              <div
                key={prog.id}
                className="group bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#E50914] transition-all duration-300 flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={prog.image}
                    alt={prog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#E50914] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {prog.tag}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#111111] group-hover:text-[#E50914] transition-colors mb-2">
                      {prog.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed">{prog.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">6 Shifts / Week</span>
                    <a
                      href="#enquiry-section"
                      className="text-xs font-bold text-[#E50914] hover:underline inline-flex items-center"
                    >
                      Enquire Now <ArrowRight className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WHY CHOOSE US ───────────────────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              THE CFC ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              WHY CHOOSE CORPUS FITNESS CLUB
            </h2>
            <p className="text-gray-600 text-base mt-4">
              Here is what makes us Amravati’s most recommended gym since 2019.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {WHY_CHOOSE_US.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#E50914]/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center font-bold mb-5">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-[#111111] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. MEMBERSHIP SECTION (DYNAMIC DB DATA) ───────────────── */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              HONEST & TRANSPARENT PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              CHOOSE YOUR MEMBERSHIP PLAN
            </h2>
            <p className="text-gray-600 text-base mt-4">
              Configurable plans designed for every commitment level. No hidden registration fees.
            </p>

            {/* Gender Toggle */}
            <div className="inline-flex items-center bg-gray-100 p-1.5 rounded-xl mt-6 border border-gray-200">
              <button
                onClick={() => setGenderToggle('men')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  genderToggle === 'men'
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Men's Rates
              </button>
              <button
                onClick={() => setGenderToggle('women')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  genderToggle === 'women'
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Women's Rates (Special Discount)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const activePrice = genderToggle === 'women' ? plan.price_women : plan.price_men

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border p-7 flex flex-col justify-between transition-all duration-300 relative ${
                    plan.popular
                      ? 'border-[#E50914] shadow-xl ring-2 ring-[#E50914]/20'
                      : 'border-[#E5E7EB] shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E50914] text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      MOST POPULAR
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
                    </div>

                    <ul className="space-y-3 mb-8">
                      {(plan.features || [
                        'Full Gym & Cardio Access',
                        'Locker Room Access',
                        'Trainer Support on Floor',
                        'Fitness & Diet Assessment',
                      ]).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-[#E50914] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#enquiry-section"
                    onClick={() =>
                      setEnquiryForm((prev) => ({
                        ...prev,
                        interested_plan: plan.name,
                      }))
                    }
                    className={`w-full py-3 rounded-lg text-center font-bold text-sm transition-all duration-200 ${
                      plan.popular
                        ? 'bg-[#E50914] text-white hover:bg-[#B91C1C] shadow-md shadow-red-500/20'
                        : 'bg-gray-100 text-[#111111] hover:bg-[#E50914] hover:text-white'
                    }`}
                  >
                    Join Now
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 7. TRAINERS SECTION ────────────────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              EXPERT COACHING TEAM
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              MEET OUR CERTIFIED TRAINERS
            </h2>
            <p className="text-gray-600 text-base mt-4">
              Passionate professionals dedicated to your injury-free progress and sustainable health.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((tr) => (
              <div
                key={tr.id}
                className="bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={tr.photo || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80'}
                    alt={tr.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold bg-[#E50914] px-2.5 py-0.5 rounded">
                      {tr.experience}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#111111]">{tr.name}</h3>
                    <p className="text-xs font-semibold text-[#E50914] mb-2">{tr.specialization}</p>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{tr.bio}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Floor Coach</span>
                    <a
                      href={`tel:${tr.phone}`}
                      className="font-bold text-[#111111] hover:text-[#E50914] flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3 text-[#E50914]" /> Contact
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. GALLERY SECTION ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              REAL PHOTOS · REAL GYM
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              CORPUS FITNESS CLUB GALLERY
            </h2>
            <p className="text-gray-600 text-base mt-4">
              Explore our facility, advanced equipment, high-energy classes, and transformation events.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['All', 'Gym Interior', 'Equipment', 'Training', 'Activities', 'Events'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    galleryCategory === cat
                      ? 'bg-[#E50914] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((img) => (
              <div
                key={img.id}
                className="group relative h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
              >
                <img
                  src={img.image}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider mb-1">
                    {img.category}
                  </span>
                  <h4 className="font-bold text-base text-white">{img.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. TESTIMONIALS SECTION ────────────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              MEMBER EXPERIENCES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              WHAT OUR MEMBERS SAY
            </h2>
            <p className="text-gray-600 text-base mt-4">
              Real stories from real people across Amravati who transformed their health at CFC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sanket Deshmukh',
                time: 'Member since 2022',
                quote:
                  'Joined Corpus Fitness Club at 88 kg with low stamina. Coach Rohit crafted my push-pull-legs routine and balanced diet. Lost 16 kg in 6 months! Best gym on VMV Road.',
                rating: 5,
              },
              {
                name: 'Kavita Joshi',
                time: 'Member since 2023',
                quote:
                  'The women-friendly environment, dedicated trainers, and separate shifting times make CFC the safest and most comfortable gym in Amravati. Zumba classes are super energetic!',
                rating: 5,
              },
              {
                name: 'Akash Wankhade',
                time: 'Member since 2021',
                quote:
                  'Equipment is top notch, heavy weights up to 50kg, and great ventilation. The QR attendance and mobile portal make tracking workouts very easy.',
                rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white p-7 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-[#E50914] font-bold flex items-center justify-center">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. ADMISSION & ENQUIRY SECTION ───────────────────────── */}
      <section id="enquiry-section" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFFFFF] border-2 border-[#E50914] rounded-2xl p-8 sm:p-12 shadow-xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
                ADMISSION & ENQUIRY
              </span>
              <h2 className="text-3xl sm:text-4xl font-display tracking-wider text-[#111111] mt-2">
                START YOUR FITNESS JOURNEY TODAY
              </h2>
              <p className="text-gray-600 text-sm mt-3">
                Fill out the quick admission enquiry form below. Our head coach will get in touch with your
                personalized fitness assessment and batch timings.
              </p>
            </div>

            {submittedEnquiry ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Enquiry Received Successfully!</h3>
                <p className="text-green-800 text-sm mb-4">
                  Thank you, <strong>{submittedEnquiry.full_name}</strong>. Your reference ID is:
                </p>
                <div className="inline-block bg-white border border-green-300 font-mono font-bold text-green-800 text-lg px-6 py-2 rounded-lg mb-6 shadow-sm">
                  {submittedEnquiry.reference_no}
                </div>
                <p className="text-xs text-gray-600 max-w-md mx-auto mb-6">
                  Our staff at VMV Road, Amravati has recorded your inquiry in our CRM system and will contact you shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://wa.me/${GYM_INFO.whatsappNumber}?text=Hi%20CFC!%20My%20enquiry%20reference%20is%20${submittedEnquiry.reference_no}.%20I%20am%20interested%20in%20joining.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#1ebd5a] transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" /> Chat on WhatsApp Now
                  </a>
                  <button
                    onClick={() => {
                      setSubmittedEnquiry(null)
                      setEnquiryForm({
                        full_name: '',
                        phone: '',
                        email: '',
                        gender: 'male',
                        age: '',
                        interested_plan: 'Half-Yearly Plan',
                        fitness_goal: 'Weight Loss & Fat Reduction',
                        message: '',
                      })
                    }}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={enquiryForm.full_name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, full_name: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Mobile Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98220 12345"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@gmail.com"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  {/* Gender & Age */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                        Gender *
                      </label>
                      <select
                        value={enquiryForm.gender}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, gender: e.target.value })}
                        className="input-field"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                        Age *
                      </label>
                      <input
                        type="number"
                        min="14"
                        max="80"
                        required
                        placeholder="e.g. 24"
                        value={enquiryForm.age}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, age: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Interested Plan */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Interested Membership Plan *
                    </label>
                    <select
                      value={enquiryForm.interested_plan}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, interested_plan: e.target.value })}
                      className="input-field"
                    >
                      <option value="Monthly Plan">Monthly Plan</option>
                      <option value="Quarterly Plan">Quarterly Plan</option>
                      <option value="Half-Yearly Plan">Half-Yearly Plan</option>
                      <option value="Yearly Plan">Yearly Plan</option>
                      <option value="Personal Training Package">Personal Training Package</option>
                    </select>
                  </div>

                  {/* Fitness Goal */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Primary Fitness Goal *
                    </label>
                    <select
                      value={enquiryForm.fitness_goal}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, fitness_goal: e.target.value })}
                      className="input-field"
                    >
                      {FITNESS_GOALS.map((goal) => (
                        <option key={goal} value={goal}>
                          {goal}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Message / Preferred Shift Timings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your fitness background, preferred shift (Morning 6-11 AM or Evening 5-10 PM), or specific questions..."
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="text-center pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E50914] text-white font-bold text-base px-10 py-4 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md hover:shadow-red-500/20 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Submitting Enquiry...' : 'Submit Admission Enquiry'}</span>
                  </button>
                  <p className="text-[11px] text-gray-500 mt-2">
                    🔒 We protect your privacy. No spam. You will receive an instant enquiry reference number.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── 11. FAQ SECTION ────────────────────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC] border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              GOT QUESTIONS?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-gray-600 text-base mt-4">
              Everything you need to know about joining Corpus Fitness Club in Amravati.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_LIST.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left font-bold text-base text-[#111111] flex items-center justify-between gap-4 hover:text-[#E50914] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#E50914] shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. CONTACT & LOCATION SECTION ─────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Info */}
            <div className="space-y-8">
              <div>
                <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
                  GET IN TOUCH
                </span>
                <h2 className="text-3xl sm:text-4xl font-display tracking-wider text-[#111111] mt-2">
                  VISIT CORPUS FITNESS CLUB
                </h2>
                <p className="text-gray-600 text-sm mt-3">
                  Located conveniently on VMV Road above State Bank of India with dedicated parking and easy access.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Club Address</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {GYM_INFO.address.full}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Phone & WhatsApp</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      <a href={`tel:${GYM_INFO.phone}`} className="hover:text-[#E50914] font-semibold">
                        {GYM_INFO.phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Daily Shifts (Mon – Sat)</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Morning Shift: 6:00 AM – 11:00 AM<br />
                      Evening Shift: 5:00 PM – 10:00 PM<br />
                      <span className="text-red-500 font-bold">Sunday: Closed</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href={GYM_INFO.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-[#1ebd5a] transition-all shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                </a>
                <a
                  href={`tel:${GYM_INFO.phone}`}
                  className="inline-flex items-center gap-2 bg-[#111111] text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-black transition-all"
                >
                  <Phone className="h-4 w-4" /> Call Front Desk
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-[420px]">
              <iframe
                title="Corpus Fitness Club Google Maps Location"
                src={GYM_INFO.googleMapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
