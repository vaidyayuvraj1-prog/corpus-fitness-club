import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Award, Phone, Mail, CheckCircle2, ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'
import type { Trainer } from '@/types/database'

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])

  useEffect(() => {
    setTrainers(db.getTrainers())
  }, [])

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            CERTIFIED FITNESS COACHES
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            MEET OUR EXPERT TRAINERS
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Passionate coaching professionals with years of competitive sports, powerlifting, and body transformation experience.
          </p>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trainers.map((tr) => (
              <div
                key={tr.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-72 overflow-hidden relative">
                    <img
                      src={tr.photo || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80'}
                      alt={tr.name}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-[#E50914] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {tr.experience}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-[#111111]">{tr.name}</h3>
                    <p className="text-xs font-bold text-[#E50914] mt-0.5 mb-3">{tr.specialization}</p>
                    <p className="text-gray-600 text-xs leading-relaxed mb-4">{tr.bio}</p>

                    <div className="space-y-1.5 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                      {(tr.certifications || ['Certified Fitness Trainer (CPT)', 'Sports Nutritionist']).map((cert, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#E50914] shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-gray-100 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${tr.phone}`}
                    className="inline-flex items-center gap-1.5 font-bold text-gray-800 hover:text-[#E50914]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#E50914]" /> {tr.phone}
                  </a>

                  <Link
                    to={`/contact?trainer=${encodeURIComponent(tr.name)}`}
                    className="text-[#E50914] font-bold hover:underline"
                  >
                    Book Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
