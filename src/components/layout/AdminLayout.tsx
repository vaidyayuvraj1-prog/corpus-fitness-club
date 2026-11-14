import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, User, LogOut, ExternalLink, Dumbbell } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '@/hooks/useAuth'

function getPageTitle(pathname: string): string {
  const segments = pathname.replace('/admin', '').split('/').filter(Boolean)
  if (!segments.length) return 'Executive Dashboard'
  return segments
    .map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' › ')
}

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, role, logout } = useAuth()

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  const pageTitle = getPageTitle(location.pathname)

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#171717] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar collapsed={sidebarCollapsed} onCollapseChange={setSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              key="mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl border-r border-gray-200"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white">
                    <Dumbbell className="h-5 w-5 transform -rotate-45" />
                  </div>
                  <span className="font-display text-xl tracking-wider text-[#111111]">
                    CFC <span className="text-[#E50914]">ERP</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[calc(100vh-65px)] overflow-y-auto">
                <AdminSidebar collapsed={false} isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#111111] truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#E50914] px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span>Public Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-100 text-[#E50914] font-bold text-xs flex items-center justify-center">
                {profile?.full_name ? profile.full_name[0] : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#111111] leading-none">
                  {profile?.full_name || 'CFC Administrator'}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">
                  {role?.replace('_', ' ') || 'Admin'}
                </p>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
