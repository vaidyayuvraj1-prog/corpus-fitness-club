import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Dumbbell, Apple, Clock, LogOut, Menu, X, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const TRAINER_LINKS = [
  { label: 'Trainer Overview', to: '/trainer', icon: LayoutDashboard, end: true },
  { label: 'Assigned Trainees', to: '/trainer/members', icon: Users, end: false },
  { label: 'Workout Plans', to: '/trainer/workout-plans', icon: Dumbbell, end: false },
  { label: 'Diet Schedules', to: '/trainer/diet-plans', icon: Apple, end: false },
  { label: 'Training Timings', to: '/trainer/schedule', icon: Clock, end: false },
]

export default function TrainerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { profile, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/trainer" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[#E50914] flex items-center justify-center text-white shadow-sm">
                <Dumbbell className="h-5 w-5 transform -rotate-45" />
              </div>
              <span className="font-display text-2xl tracking-wider text-[#111111]">
                CFC <span className="text-[#E50914]">COACH PORTAL</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {TRAINER_LINKS.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'text-[#E50914] bg-red-50'
                        : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#E50914] mr-2"
            >
              <span>Public Website</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-red-100 text-[#E50914] font-bold text-xs flex items-center justify-center">
                {profile?.full_name ? profile.full_name[0] : 'T'}
              </div>
              <span className="hidden sm:inline-block text-xs font-bold text-[#111111]">
                {profile?.full_name || 'Coach Rohit'}
              </span>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 ml-1"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-1 shadow-lg">
            {TRAINER_LINKS.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? 'text-[#E50914] bg-red-50 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
