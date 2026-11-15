import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  User,
  CalendarCheck,
  Dumbbell,
  Apple,
  TrendingUp,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Award,
  Settings,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/db'

const NAV_LINKS = [
  { label: 'My Membership', to: '/member', icon: User, end: true },
  { label: 'QR & Attendance', to: '/member/attendance', icon: CalendarCheck, end: false },
  { label: 'Workout Routine', to: '/member/workout', icon: Dumbbell, end: false },
  { label: 'Monthly Report', to: '/member/monthly-report', icon: Award, end: false },
  { label: 'Diet Chart', to: '/member/diet', icon: Apple, end: false },
  { label: 'Body Progress', to: '/member/progress', icon: TrendingUp, end: false },
  { label: 'Payments & Receipts', to: '/member/payments', icon: CreditCard, end: false },
  { label: 'Notifications', to: '/member/notifications', icon: Bell, end: false },
  { label: 'Settings & Security', to: '/member/settings', icon: Settings, end: false },
]

export default function MemberLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const navigate = useNavigate()
  const { profile, logout } = useAuth()

  useEffect(() => {
    const updateCount = () => {
      const notifs = db.getNotifications()
      setUnreadNotifs(notifs.filter((n) => !n.is_read && !n.read).length)
    }
    updateCount()
    window.addEventListener('cfc_db_synced', updateCount)
    return () => window.removeEventListener('cfc_db_synced', updateCount)
  }, [])

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
            <Link to="/member" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[#E50914] flex items-center justify-center text-white shadow-sm">
                <Dumbbell className="h-5 w-5 transform -rotate-45" />
              </div>
              <span className="font-display text-2xl tracking-wider text-[#111111]">
                CORPUS <span className="text-[#E50914]">MEMBER</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all relative ${
                      isActive
                        ? 'text-[#E50914] bg-red-50'
                        : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`
                  }
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {label === 'Notifications' && unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E50914]" />
                    )}
                  </div>
                  <span>{label}</span>
                  {label === 'Notifications' && unreadNotifs > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#E50914] text-white font-bold leading-none">
                      {unreadNotifs}
                    </span>
                  )}
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
              <span>Gym Website</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <Link
                to="/member/settings"
                className="flex items-center gap-2 group p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="Account Profile & Password Settings"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 text-[#E50914] font-bold text-xs flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden border border-red-200">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="DP" className="w-full h-full object-cover" />
                  ) : profile?.full_name ? (
                    profile.full_name[0].toUpperCase()
                  ) : (
                    'M'
                  )}
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-[#111111] group-hover:text-[#E50914] transition-colors">
                  {profile?.full_name || 'Member'}
                </span>
              </Link>

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
            {NAV_LINKS.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? 'text-[#E50914] bg-red-50 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
                {label === 'Notifications' && unreadNotifs > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#E50914] text-white font-bold">
                    {unreadNotifs} New
                  </span>
                )}
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
