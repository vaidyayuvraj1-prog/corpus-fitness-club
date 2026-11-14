import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Flame, Dumbbell, Zap, Users, Heart, Activity } from 'lucide-react'
import { PROGRAMS } from '@/lib/constants'

export default function ProgramsPage() {
  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            GOAL-BASED TRAINING
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            WORKOUT & FITNESS PROGRAMS
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Structured fitness programming designed by certified coaches to help you reach your peak physical shape.
          </p>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROGRAMS.map((prog) => (
              <div
                key={prog.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#E50914] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={prog.image}
                      alt={prog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#E50914] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {prog.tag}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-[#111111] group-hover:text-[#E50914] transition-colors mb-2">
                      {prog.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed mb-4">{prog.desc}</p>

                    <div className="space-y-1.5 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#E50914]" />
                        <span>Available in Morning & Evening Shifts</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#E50914]" />
                        <span>Included in Half-Yearly & Annual Plans</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/contact?program=${encodeURIComponent(prog.title)}`}
                    className="w-full py-2.5 rounded-lg border border-gray-300 group-hover:bg-[#E50914] group-hover:text-white group-hover:border-[#E50914] text-center font-bold text-xs transition-colors block"
                  >
                    Enroll in Program
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
