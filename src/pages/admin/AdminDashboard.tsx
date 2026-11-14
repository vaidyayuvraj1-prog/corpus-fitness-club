import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  DollarSign,
  Clock,
  Dumbbell,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  CalendarCheck,
  CheckCircle2,
  Bell,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { Link } from 'react-router-dom'
import { db } from '@/lib/db'
import type { DashboardStats, Member, Payment, Enquiry } from '@/types/database'
import { format } from 'date-fns'

const PIE_COLORS = ['#E50914', '#111111', '#3B82F6', '#10B981', '#F59E0B']

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([])
  const [attendanceData, setAttendanceData] = useState<{ day: string; date: string; count: number }[]>([])
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number }[]>([])
  const [recentMembers, setRecentMembers] = useState<Member[]>([])
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([])
  const [expiringMembers, setExpiringMembers] = useState<{ name: string; id: string; expiry: string; plan: string }[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  function loadDashboardData() {
    const s = db.getDashboardStats()
    setStats(s)
    setRevenueData(db.getMonthlyRevenue(6))
    setAttendanceData(db.getAttendanceTrends(7))
    setPlanDistribution(db.getPlanDistribution())

    const members = db.getMembers()
    setRecentMembers(members.slice(0, 5))

    const payments = db.getPayments()
    setRecentPayments(payments.slice(0, 5))

    const enquiries = db.getEnquiries()
    setRecentEnquiries(enquiries.slice(0, 5))

    // Upcoming renewals (within next 30 days)
    const today = new Date()
    const expiring = members
      .filter((m) => {
        if (!m.current_plan?.end_date) return false
        const end = new Date(m.current_plan.end_date)
        const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays >= -3 && diffDays <= 30
      })
      .map((m) => ({
        id: m.id,
        name: m.profile?.full_name || 'Member',
        expiry: m.current_plan?.end_date ? format(new Date(m.current_plan.end_date), 'dd MMM yyyy') : 'N/A',
        plan: m.current_plan?.plan?.name || 'Membership',
      }))
    setExpiringMembers(expiring)
  }

  const statCards = [
    { label: 'Total Members', value: stats?.totalMembers || 0, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100', link: '/admin/members' },
    { label: 'Active Members', value: stats?.activeMembers || 0, icon: UserCheck, color: 'text-green-600 bg-green-50 border-green-100', link: '/admin/members' },
    { label: 'Expired Members', value: stats?.expiredMembers || 0, icon: UserX, color: 'text-red-600 bg-red-50 border-red-100', link: '/admin/members' },
    { label: "Today's Attendance", value: stats?.todayAttendance || 0, icon: CalendarCheck, color: 'text-purple-600 bg-purple-50 border-purple-100', link: '/admin/attendance' },
    { label: 'Monthly Revenue', value: `₹${(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', link: '/admin/payments' },
    { label: 'Pending Dues', value: stats?.pendingPayments || 0, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-100', link: '/admin/payments' },
    { label: 'Active Trainers', value: stats?.totalTrainers || 0, icon: Dumbbell, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', link: '/admin/trainers' },
    { label: 'New Enquiries', value: stats?.newEnquiries || 0, icon: MessageSquare, color: 'text-[#E50914] bg-red-50 border-red-100', link: '/admin/enquiries' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#E50914] uppercase tracking-widest">
            CORPUS FITNESS CLUB · AMRAVATI
          </span>
          <h2 className="text-2xl sm:text-3xl font-display tracking-wider text-[#111111] mt-1">
            EXECUTIVE ERP DASHBOARD
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Real-time club metrics, revenue tracking, QR attendance logs, and renewal alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/notifications"
            className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-800 text-xs font-bold px-3.5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Bell className="h-4 w-4 text-[#E50914]" /> Broadcast Notice
          </Link>
          <Link
            to="/admin/attendance"
            className="inline-flex items-center gap-2 bg-[#E50914] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#B91C1C] transition-colors shadow-sm"
          >
            <CalendarCheck className="h-4 w-4" /> Scanner Check-In
          </Link>
          <Link
            to="/admin/members"
            className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-black transition-colors"
          >
            <Users className="h-4 w-4" /> Manage Members
          </Link>
        </div>
      </div>

      {/* 8 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((c, i) => {
          const Icon = c.icon
          return (
            <Link
              key={i}
              to={c.link}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#E50914]/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 truncate">{c.label}</span>
                <div className={`p-2 rounded-xl border ${c.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{c.value}</div>
            </Link>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-[#111111]">Monthly Revenue (₹)</h3>
              <p className="text-xs text-gray-500">Last 6 Months Collection Trend</p>
            </div>
            <Link to="/admin/payments" className="text-xs font-bold text-[#E50914] hover:underline">
              View All Payments →
            </Link>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E50914"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#E50914' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Plan Distribution */}
        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#111111]">Membership Distribution</h3>
            <p className="text-xs text-gray-500 mb-4">Active Plan Breakdown</p>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [val, 'Members']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-gray-100 text-xs">
            {planDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="font-bold text-[#111111]">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Trend Bar Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base text-[#111111]">Daily Attendance Volume</h3>
            <p className="text-xs text-gray-500">Check-in frequency over the past 7 days</p>
          </div>
          <Link to="/admin/attendance" className="text-xs font-bold text-[#E50914] hover:underline">
            Open Attendance Log →
          </Link>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val} Members`, 'Checked In']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="count" fill="#111111" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities & Renewals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Members */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">Recent Members</h3>
            <Link to="/admin/members" className="text-xs font-bold text-[#E50914] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-[#E50914] font-bold flex items-center justify-center shrink-0">
                    {m.profile?.full_name ? m.profile.full_name[0] : 'M'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{m.profile?.full_name}</p>
                    <p className="text-gray-400 font-mono text-[10px]">{m.member_id}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    m.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">Recent Payments</h3>
            <Link to="/admin/payments" className="text-xs font-bold text-[#E50914] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{p.receipt_number}</p>
                  <p className="text-gray-500 text-[10px]">
                    {p.member?.profile?.full_name || 'Member'} · {p.payment_method}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-gray-400">{p.payment_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">Upcoming Renewals</h3>
            <Link to="/admin/memberships" className="text-xs font-bold text-[#E50914] hover:underline">
              Memberships
            </Link>
          </div>
          <div className="space-y-3">
            {expiringMembers.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-[#F8FAFC] p-2.5 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">{m.name}</p>
                  <p className="text-[10px] text-gray-500">Expires: {m.expiry}</p>
                </div>
                <Link
                  to="/admin/memberships"
                  className="px-2.5 py-1 rounded bg-[#E50914] text-white font-bold text-[10px] hover:bg-[#B91C1C] transition-colors shadow-xs"
                >
                  Renew
                </Link>
              </div>
            ))}
            {expiringMembers.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No immediate expiring memberships.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
