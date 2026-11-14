import { Link } from 'react-router-dom'
import { Star, ArrowRight, Quote, CheckCircle2 } from 'lucide-react'

export default function SuccessStoriesPage() {
  const stories = [
    {
      name: 'Sanket Deshmukh',
      duration: '6 Months',
      achievement: 'Lost 16 kg & Built 6-Pack Core',
      stats: '88 kg ➔ 72 kg',
      story:
        'I joined Corpus Fitness Club with high visceral fat, constant fatigue, and poor stamina. Coach Rohit sat down with me on day one, set realistic calorie targets, and put me on a consistent 4-day resistance split. The environment kept me motivated every single morning.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Kavita Joshi',
      duration: '4 Months',
      achievement: 'Toned 8 kg Post-Pregnancy',
      stats: '68 kg ➔ 60 kg',
      story:
        'Finding a safe, women-friendly gym in Amravati with supportive trainers was tough until I discovered CFC. The separate shifting timings and high-energy morning Zumba batches transformed not just my weight, but my mental energy and confidence!',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Akash Wankhade',
      duration: '1 Year',
      achievement: 'Powerlifting PR: 160kg Squat, 180kg Deadlift',
      stats: 'Strength & Muscle Hypertrophy',
      story:
        'Most gyms in town do not have proper Olympic bars, bumper plates, or heavy dumbbells. CFC has heavy-duty gear and zero ego lifting culture. The coaches care about your knee and back health above everything.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  ]

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            PROVEN RESULTS
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            MEMBER SUCCESS STORIES
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Real people across Amravati who took the first step, showed up consistently, and transformed their lives at CFC.
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {stories.map((s, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-2xl font-bold text-[#111111]">{s.name}</h3>
                      <p className="text-xs font-bold text-[#E50914] uppercase tracking-wider">{s.achievement}</p>
                    </div>
                    <span className="bg-white border border-gray-300 font-mono text-xs font-bold text-gray-700 px-3 py-1 rounded-full shadow-sm">
                      {s.stats} · {s.duration}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{s.story}"
                  </p>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                    <span className="text-xs text-gray-500 font-bold ml-2">Verified Amravati Member</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#E50914] text-white font-bold text-sm px-8 py-4 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md"
            >
              Start Your Own Success Story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
