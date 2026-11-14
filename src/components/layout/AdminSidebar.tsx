import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  DollarSign,
  Dumbbell,
  Apple,
  MessageSquare,
  BarChart2,
  Image,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCheck,
  Bell,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface AdminSidebarProps {
  collapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
  isMobile?: boolean
}

const NAV_SECTIONS = [
  {
    group: 'OVERVIEW',
    items: [
      { label: 'Executive Dashboard', to: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    group: 'MEMBERS & ACCESS',
    items: [
      { label: 'Member Management', to: '/admin/members', icon: Users },
      { label: 'Membership Plans', to: '/admin/memberships', icon: CreditCard },
      { label: 'Payments & Receipts', to: '/admin/payments', icon: DollarSign },
      { label: 'QR Attendance', to: '/admin/attendance', icon: CalendarCheck },
    ],
  },
  {
    group: 'TRAINING & FITNESS',
    items: [
      { label: 'Trainer Management', to: '/admin/trainers', icon: UserCheck },
      { label: 'Workout Plan Builder', to: '/admin/workout-plans', icon: Dumbbell },
      { label: 'Diet & Meal Plans', to: '/admin/diet-plans', icon: Apple },
    ],
  },
  {
    group: 'COMMUNICATIONS',
    items: [
      { label: 'Broadcast Notices', to: '/admin/notifications', icon: Bell },
      { label: 'Enquiry CRM Leads', to: '/admin/enquiries', icon: MessageSquare },
    ],
  },
  {
    group: 'FINANCE & REPORTS',
    items: [
      { label: 'Expense Management', to: '/admin/expenses', icon: DollarSign },
      { label: 'Reports & Analytics', to: '/admin/reports', icon: BarChart2 },
    ],
  },
  {
    group: 'SETTINGS & MEDIA',
    items: [
      { label: 'Gallery Management', to: '/admin/gallery', icon: Image },
      { label: 'System Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]

export default function AdminSidebar({
  collapsed = false,
  onCollapseChange,
  isMobile = false,
}: AdminSidebarProps) {
  const navigate = useNavigate()
  const { logout, profile, role } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <aside
      className={`bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-all duration-300 h-full ${
        collapsed && !isMobile ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        {!isMobile && (
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
            {!collapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white shadow-sm">
                  <Dumbbell className="h-5 w-5 transform -rotate-45" />
                </div>
                <div>
                  <span className="font-display text-lg tracking-wider text-[#111111]">
                    CFC <span className="text-[#E50914]">ERP</span>
                  </span>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold -mt-1">
                    Amravati · 2019
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white">
                <Dumbbell className="h-5 w-5 transform -rotate-45" />
              </div>
            )}

            {onCollapseChange && (
              <button
                onClick={() => onCollapseChange(!collapsed)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {NAV_SECTIONS.map((sec, idx) => (
            <div key={idx}>
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {sec.group}
                </p>
              )}
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-red-50 text-[#E50914] font-bold shadow-xs'
                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                        } ${collapsed && !isMobile ? 'justify-center px-0' : ''}`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#E5E7EB]">
        {(!collapsed || isMobile) ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#E50914] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {profile?.full_name ? profile.full_name[0] : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#111111] truncate">
                  {profile?.full_name || 'CFC Staff'}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">
                  {role?.replace('_', ' ') || 'Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  )
}
