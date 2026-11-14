import { Link } from 'react-router-dom'
import { Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react'
import { GYM_INFO } from '@/lib/constants'

export default function TimetablePage() {
  const batches = [
    { time: '06:00 AM – 07:00 AM', batch: 'Early Bird Strength & Powerlifting', trainer: 'Coach Rohit Deshmukh', days: 'Mon – Sat' },
    { time: '07:00 AM – 08:00 AM', batch: 'Morning Zumba & Dance Fitness (Women Exclusive)', trainer: 'Sneha More', days: 'Mon – Sat' },
    { time: '08:00 AM – 09:00 AM', batch: 'Aerobics & Calisthenics Conditioning', trainer: 'Priya Bhagat', days: 'Mon – Sat' },
    { time: '09:00 AM – 11:00 AM', batch: 'Open Floor Strength & Cardio Training', trainer: 'Floor Trainer Support', days: 'Mon – Sat' },
    { time: '11:00 AM – 05:00 PM', batch: 'Sanitization & Equipment Maintenance Break', trainer: '—', days: 'Mon – Sat (Gym Closed)' },
    { time: '05:00 PM – 06:30 PM', batch: 'Evening Fat-Loss & HIIT Circuit', trainer: 'Priya Bhagat', days: 'Mon – Sat' },
    { time: '06:30 PM – 07:30 PM', batch: 'Evening Zumba Fitness Batch', trainer: 'Sneha More', days: 'Mon – Sat' },
    { time: '07:30 PM – 09:00 PM', batch: 'Hypertrophy & Muscle Building Split', trainer: 'Coach Rohit & Amit', days: 'Mon – Sat' },
    { time: '09:00 PM – 10:00 PM', batch: 'Late Shift Strength & Free Weights', trainer: 'Coach Amit Thakre', days: 'Mon – Sat' },
  ]

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            DAILY OPERATING SCHEDULE
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            GYM TIMINGS & BATCH TIMETABLE
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Flexible morning and evening shifts structured around your busy work and study hours.
          </p>
        </div>
      </section>

      {/* Timetable Table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-[#111111] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-[#E50914]" />
                <h3 className="font-display text-xl tracking-wider uppercase">Weekly Shift Schedule (Mon – Sat)</h3>
              </div>
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                Sunday: Closed
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {batches.map((b, i) => (
                <div
                  key={i}
                  className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    b.batch.includes('Closed') ? 'bg-red-50/50 text-gray-400' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg shrink-0">
                      {b.time}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#111111]">{b.batch}</h4>
                      <p className="text-xs text-gray-500">Instructor: {b.trainer}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-500 shrink-0">{b.days}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#E50914] text-white font-bold text-sm px-8 py-4 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md"
            >
              Book a Trial Session in Your Preferred Batch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
