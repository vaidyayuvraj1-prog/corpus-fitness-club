import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock, Dumbbell, MessageCircle, Mail } from 'lucide-react'
import { GYM_INFO, PROGRAMS } from '@/lib/constants'

const InstagramIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Corpus Fitness', to: '/about' },
  { label: 'Facilities & Equipment', to: '/facilities' },
  { label: 'Membership Packages', to: '/membership' },
  { label: 'Our Certified Trainers', to: '/trainers' },
  { label: 'Workout Programs', to: '/programs' },
  { label: 'Gym Gallery', to: '/gallery' },
  { label: 'Timetable & Batches', to: '/timetable' },
  { label: 'BMI & Fitness Calculator', to: '/bmi' },
  { label: 'Contact & Location', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
]

export default function PublicFooter() {
  return (
    <footer className="bg-[#111111] text-white border-t-4 border-[#E50914]">
      {/* Top Banner */}
      <div className="bg-[#E50914] text-white py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold tracking-wide uppercase">
            ⚡ Ready to start your fitness journey? Visit us at VMV Road, Amravati today!
          </div>
          <a
            href={GYM_INFO.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#111111] px-5 py-2 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors shadow-sm"
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#E50914] flex items-center justify-center text-white">
                <Dumbbell className="h-5 w-5 transform -rotate-45" />
              </div>
              <span className="font-display text-2xl tracking-wider text-white">
                CORPUS <span className="text-[#E50914]">FITNESS</span>
              </span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed">
              Established in 2019, CORPUS FITNESS CLUB (CFC) is Amravati’s premier fitness destination.
              We provide state-of-the-art strength equipment, cardio training, certified personal coaches,
              and energizing Zumba sessions.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={GYM_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E50914] flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={GYM_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E50914] flex items-center justify-center text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={`tel:${GYM_INFO.phone}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E50914] flex items-center justify-center text-white transition-colors"
                aria-label="Phone"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-display text-lg tracking-wider text-white mb-5 uppercase border-b border-white/10 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.slice(0, 6).map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-transform duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Programs */}
          <div>
            <h3 className="font-display text-lg tracking-wider text-white mb-5 uppercase border-b border-white/10 pb-2">
              Training Programs
            </h3>
            <ul className="space-y-2.5 text-sm">
              {PROGRAMS.slice(0, 6).map((prog) => (
                <li key={prog.id}>
                  <Link
                    to="/programs"
                    className="text-gray-400 hover:text-[#E50914] inline-block transition-colors"
                  >
                    {prog.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Timings */}
          <div className="space-y-4">
            <h3 className="font-display text-lg tracking-wider text-white mb-5 uppercase border-b border-white/10 pb-2">
              Club Information
            </h3>

            <div className="flex items-start gap-3 text-sm text-gray-400">
              <MapPin className="h-5 w-5 text-[#E50914] shrink-0 mt-0.5" />
              <span>{GYM_INFO.address.full}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Phone className="h-4 w-4 text-[#E50914] shrink-0" />
              <a href={`tel:${GYM_INFO.phone}`} className="hover:text-white transition-colors">
                {GYM_INFO.phone}
              </a>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Mail className="h-4 w-4 text-[#E50914] shrink-0" />
              <span>{GYM_INFO.email}</span>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="flex items-start gap-2.5 text-xs text-gray-400">
                <Clock className="h-4 w-4 text-[#E50914] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Mon – Sat Working Hours:</p>
                  <p>Morning: 6:00 AM – 11:00 AM</p>
                  <p>Evening: 5:00 PM – 10:00 PM</p>
                  <p className="text-red-400 font-semibold mt-1">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div>
            © {new Date().getFullYear()} {GYM_INFO.name}. All Rights Reserved. Amravati, Maharashtra.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/auth/login" className="hover:text-white transition-colors">
              Staff & Member Login
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Admission Enquiry
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
