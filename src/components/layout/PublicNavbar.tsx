import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, ChevronDown, Dumbbell, Phone } from 'lucide-react'
import { GYM_INFO } from '@/lib/constants'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Membership', to: '/membership' },
  { label: 'Programs', to: '/programs' },
  { label: 'Trainers', to: '/trainers' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Calculators', to: '/bmi' },
  { label: 'Contact', to: '/contact' },
]

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [calcDropdown, setCalcDropdown] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setCalcDropdown(false)
  }, [location.pathname])

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-white/90 backdrop-blur-sm border-b border-gray-100/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 rounded-lg bg-[#E50914] flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <Dumbbell className="h-6 w-6 transform -rotate-45" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-2xl tracking-wider text-[#111111]">CORPUS</span>
                  <span className="font-display text-2xl tracking-wider text-[#E50914]">FITNESS</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase -mt-1">
                  Amravati · Est. 2019
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {NAV_LINKS.map((link) => {
                if (link.label === 'Calculators') {
                  return (
                    <div
                      key="calc"
                      className="relative"
                      onMouseEnter={() => setCalcDropdown(true)}
                      onMouseLeave={() => setCalcDropdown(false)}
                    >
                      <button
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          location.pathname.includes('/bmi') || location.pathname.includes('/calorie')
                            ? 'text-[#E50914]'
                            : 'text-gray-700 hover:text-[#E50914]'
                        }`}
                      >
                        Calculators <ChevronDown className="h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {calcDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute top-full left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex flex-col gap-1 z-50"
                          >
                            <Link
                              to="/bmi"
                              className="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-[#E50914] hover:bg-red-50 rounded-lg transition-colors"
                            >
                              BMI Calculator
                            </Link>
                            <Link
                              to="/calorie"
                              className="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-[#E50914] hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Calorie & TDEE Calculator
                            </Link>
                            <Link
                              to="/nutrition"
                              className="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-[#E50914] hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Nutrition Guidance
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }

                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-[#E50914] bg-red-50 font-bold'
                        : 'text-gray-700 hover:text-[#E50914] hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <a
                href={`tel:${GYM_INFO.phone}`}
                className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#E50914] mr-2"
              >
                <Phone className="h-3.5 w-3.5 text-[#E50914]" />
                <span>+91 76206 83995</span>
              </a>

              <Link
                to="/auth/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-800 hover:text-[#E50914] px-3.5 py-2 rounded-lg border border-gray-200 hover:border-[#E50914]/40 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>

              <Link
                to="/membership"
                className="inline-flex items-center justify-center bg-[#E50914] text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#B91C1C] transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Join Now
              </Link>

              {/* Hamburger Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-[#E50914] hover:bg-gray-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-gray-200 px-6 py-6 overflow-hidden shadow-xl"
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                      location.pathname === link.to
                        ? 'text-[#E50914] bg-red-50 font-bold'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <Link
                    to="/auth/login"
                    className="flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 font-bold text-gray-800 hover:border-[#E50914]"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Member & Admin Login</span>
                  </Link>
                  <Link
                    to="/membership"
                    className="flex items-center justify-center py-3 rounded-lg bg-[#E50914] text-white font-bold shadow-md"
                  >
                    Join Now — Explore Plans
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  )
}
