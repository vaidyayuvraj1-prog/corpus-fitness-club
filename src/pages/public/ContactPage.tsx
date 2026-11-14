import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, MessageCircle, Mail, Send, CheckCircle2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { GYM_INFO, FITNESS_GOALS } from '@/lib/constants'
import { db } from '@/lib/db'
import type { Enquiry } from '@/types/database'

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const planParam = searchParams.get('plan') || 'Half-Yearly Plan'
  const programParam = searchParams.get('program')

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'male',
    age: '',
    interested_plan: planParam,
    fitness_goal: programParam || 'Weight Loss & Bulking',
    message: '',
  })

  const [submitted, setSubmitted] = useState<Enquiry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (planParam) {
      setForm((prev) => ({ ...prev, interested_plan: planParam }))
    }
    if (programParam) {
      setForm((prev) => ({ ...prev, fitness_goal: programParam }))
    }
  }, [planParam, programParam])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.full_name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!form.phone.trim() || form.phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!form.age || Number(form.age) < 14 || Number(form.age) > 80) {
      toast.error('Please enter a valid age between 14 and 80')
      return
    }

    setIsSubmitting(true)
    try {
      const saved = db.saveEnquiry({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        gender: form.gender as any,
        age: Number(form.age),
        interested_plan: form.interested_plan,
        fitness_goal: form.fitness_goal,
        message: form.message,
      })

      setSubmitted(saved)
      toast.success(`Enquiry submitted! Reference ID: ${saved.reference_no}`)
    } catch {
      toast.error('Failed to submit enquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            GET IN TOUCH WITH CFC
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            CONTACT & ADMISSION ENQUIRY
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Visit our 3rd-floor club in Amravati or submit the admission form below for personalized batch guidance.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Contact Cards & Hours */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-7 shadow-sm">
                <h3 className="font-display text-xl tracking-wider text-[#111111] mb-6 uppercase">
                  Club Location & Details
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111111]">Address</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {GYM_INFO.address.full}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111111]">Call & WhatsApp</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        <a href={`tel:${GYM_INFO.phone}`} className="font-bold text-[#E50914] hover:underline">
                          {GYM_INFO.phone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111111]">Email Address</h4>
                      <p className="text-xs text-gray-600 mt-1">{GYM_INFO.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111111]">Operating Hours (Mon – Sat)</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Morning Shift: 6:00 AM – 11:00 AM<br />
                        Evening Shift: 5:00 PM – 10:00 PM<br />
                        <span className="text-red-500 font-bold">Sunday: Closed for sanitization</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                  <a
                    href={GYM_INFO.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-xs py-3 px-5 rounded-lg hover:bg-[#1ebd5a] transition-all shadow-sm"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp Us
                  </a>
                  <a
                    href={`tel:${GYM_INFO.phone}`}
                    className="inline-flex items-center justify-center gap-2 bg-[#111111] text-white font-bold text-xs py-3 px-5 rounded-lg hover:bg-black transition-all"
                  >
                    <Phone className="h-4 w-4" /> Call Now
                  </a>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-64">
                <iframe
                  title="Corpus Fitness Club Google Maps"
                  src={GYM_INFO.googleMapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column: Admission & Enquiry Form */}
            <div className="lg:col-span-7 bg-white border-2 border-[#E50914] rounded-2xl p-8 sm:p-10 shadow-xl">
              <div className="mb-8">
                <span className="text-[#E50914] text-xs font-bold tracking-widest uppercase">
                  ONLINE APPLICATION
                </span>
                <h3 className="font-display text-2xl sm:text-3xl tracking-wider text-[#111111] mt-1">
                  ADMISSION & ENQUIRY FORM
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Fill in your details to receive an instant reference number and prompt follow-up from our head coach.
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-green-900 mb-1">Enquiry Registered!</h4>
                  <p className="text-xs text-green-800 mb-4">
                    Your enquiry reference ID for Corpus Fitness Club is:
                  </p>
                  <div className="inline-block bg-white border border-green-300 font-mono font-bold text-green-800 text-lg px-6 py-2 rounded-lg mb-6 shadow-sm">
                    {submitted.reference_no}
                  </div>
                  <p className="text-xs text-gray-600 mb-6">
                    Our reception staff has been notified. You can now visit the gym or directly ping us on WhatsApp!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={`https://wa.me/${GYM_INFO.whatsappNumber}?text=Hi%20CFC!%20My%20admission%20reference%20is%20${submitted.reference_no}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-xs px-6 py-3 rounded-lg hover:bg-[#1ebd5a]"
                    >
                      <MessageCircle className="h-4 w-4" /> Open in WhatsApp
                    </a>
                    <button
                      onClick={() => setSubmitted(null)}
                      className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100"
                    >
                      Fill Another Form
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98220 12345"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@gmail.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gender *</label>
                        <select
                          value={form.gender}
                          onChange={(e) => setForm({ ...form, gender: e.target.value })}
                          className="input-field"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Age *</label>
                        <input
                          type="number"
                          min="14"
                          max="80"
                          required
                          placeholder="e.g. 24"
                          value={form.age}
                          onChange={(e) => setForm({ ...form, age: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Interested Plan *</label>
                      <select
                        value={form.interested_plan}
                        onChange={(e) => setForm({ ...form, interested_plan: e.target.value })}
                        className="input-field"
                      >
                        <option value="Monthly Plan">Monthly Plan</option>
                        <option value="Quarterly Plan">Quarterly Plan</option>
                        <option value="Half-Yearly Plan">Half-Yearly Plan</option>
                        <option value="Yearly Plan">Yearly Plan</option>
                        <option value="Personal Training Package">Personal Training Package</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Fitness Goal *</label>
                      <select
                        value={form.fitness_goal}
                        onChange={(e) => setForm({ ...form, fitness_goal: e.target.value })}
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

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Message / Preferred Shift Timings
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any health conditions, preferred morning (6-11 AM) or evening (5-10 PM) shifts, or specific goals..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#E50914] text-white font-bold text-sm py-4 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md shadow-red-500/20 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? 'Registering...' : 'Submit Admission Enquiry'}</span>
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-2">
                      🔒 Your details are stored safely in our club management CRM. No spam.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
