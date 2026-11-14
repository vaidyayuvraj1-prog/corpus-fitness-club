import { Link } from 'react-router-dom'
import { Dumbbell, Zap, Activity, Award, Flame, Heart, Maximize, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { FACILITIES } from '@/lib/constants'

export default function FacilitiesPage() {
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

  const additionalAmenities = [
    { title: 'Separate Changing & Locker Rooms', desc: 'Secure digital lockers and hygienic changing areas for both men and women.' },
    { title: 'Air-Conditioned & High Ventilation', desc: 'Powerful exhaust ventilation systems keeping indoor oxygen fresh during peak workout hours.' },
    { title: 'Purified RO Drinking Water Station', desc: 'Chilled and ambient RO-filtered water dispensers available at all times.' },
    { title: 'High-Impact Rubber Flooring', desc: 'Anti-slip shock-absorbing rubber tiles protecting joints and equipment during heavy compound lifts.' },
    { title: 'High-Speed Wi-Fi & Sound System', desc: 'Motivating workout tracks and seamless connectivity for workout logging apps.' },
    { title: 'Convenient 2-Wheeler & 4-Wheeler Parking', desc: 'Dedicated parking space at Vidyut Nagar Square building premises.' },
  ]

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            EQUIPMENT & INFRASTRUCTURE
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            WORLD-CLASS GYM FACILITIES
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Spacious, hygienic, and fully equipped 3rd-floor training arena on VMV Road, Amravati.
          </p>
        </div>
      </section>

      {/* Main Facilities Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FACILITIES.map((facility) => (
              <div
                key={facility.id}
                className="bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#E50914]/40 transition-all flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                    {getFacilityIcon(facility.icon)}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#111111] mb-2">{facility.title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">{facility.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Amenities */}
      <section className="py-20 bg-[#F8FAFC] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase">
              ADDED COMFORTS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wider text-[#111111] mt-2">
              MORE CLUB AMENITIES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalAmenities.map((amenity, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-xl border border-[#E5E7EB] shadow-sm flex items-start gap-4"
              >
                <CheckCircle2 className="h-6 w-6 text-[#E50914] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base text-[#111111] mb-1">{amenity.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{amenity.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 bg-[#E50914] text-white font-bold text-sm px-8 py-4 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md"
            >
              Join Corpus Fitness Club <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
