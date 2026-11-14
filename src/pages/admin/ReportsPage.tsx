import { useState, useEffect } from 'react'
import {
  BarChart2,
  Calendar,
  Download,
  Printer,
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Dumbbell,
  Award,
  Sparkles,
  UserCheck,
  UserX,
  Activity,
  Flame,
  Star,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import { format, subMonths } from 'date-fns'
import MemberMonthlyReport from '@/pages/member/MemberMonthlyReport'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'attendance' | 'members' | 'expenses' | 'fitness_pt'>('revenue')
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [selectedReportMemberId, setSelectedReportMemberId] = useState<string>('mem-1')

  useEffect(() => {
    setRevenueData(db.getMonthlyRevenue(6))
    setAttendanceData(db.getAttendanceTrends(7))
  }, [])

  const members = db.getMembers()
  const payments = db.getPayments()
  const expenses = db.getExpenses()

  const totalMembers = members.length
  const activeMembers = members.filter((m) => m.status === 'active').length
  const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  // Export CSV
  const handleExportCSV = () => {
    let headers: string[] = []
    let rows: any[][] = []

    if (activeTab === 'revenue') {
      headers = ['Receipt Number', 'Member Name', 'Date', 'Amount', 'Method', 'Status']
      rows = payments.map((p) => [
        p.receipt_number,
        p.member?.profile?.full_name || 'Member',
        p.payment_date,
        p.amount,
        p.payment_method,
        p.status,
      ])
    } else if (activeTab === 'members') {
      headers = ['Member ID', 'Name', 'Phone', 'Gender', 'Status', 'Plan']
      rows = members.map((m) => [
        m.member_id,
        m.profile?.full_name,
        m.profile?.phone,
        m.gender,
        m.status,
        m.current_plan?.plan?.name || 'N/A',
      ])
    } else if (activeTab === 'expenses') {
      headers = ['Date', 'Category', 'Description', 'Amount', 'Method']
      rows = expenses.map((e) => [e.expense_date, e.category, e.description, e.amount, e.payment_method])
    } else if (activeTab === 'fitness_pt') {
      headers = ['Member ID', 'Name', 'Category', 'Assigned Coach', 'November Workouts', 'November Attendance', 'Volume (kg)']
      rows = members.map((m) => {
        const report = db.generateMonthlyFitnessReport(m.id, 11, 2026)
        return [
          m.member_id,
          m.profile?.full_name || 'Member',
          m.trainer_name ? 'With Trainer' : 'Without Trainer',
          m.trainer_name || 'Self-Guided',
          report.total_completed_workouts,
          report.total_attendance_days,
          report.total_volume_kg,
        ]
      })
    } else {
      headers = ['Day', 'Date', 'Check-ins']
      rows = attendanceData.map((a) => [a.day, a.date, a.count])
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `cfc_${activeTab}_report_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Report exported to CSV')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            REPORTS & ANALYTICS
          </h2>
          <p className="text-xs text-gray-500">
            Download business intelligence reports, revenue audits, and member retention charts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#111111] text-white text-xs font-bold hover:bg-black shadow-xs"
          >
            <Printer className="h-4 w-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          { id: 'revenue', label: 'Revenue & Payments Audit' },
          { id: 'attendance', label: 'Attendance & Peak Hours' },
          { id: 'members', label: 'Member Demographics & Growth' },
          { id: 'expenses', label: 'Expense & Overhead Breakdown' },
          { id: 'fitness_pt', label: '🏋️ Monthly Fitness & Trainer Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#E50914] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Gross Revenue (₹)</span>
          <p className="text-2xl font-extrabold text-[#111111] mt-1">₹{totalCollections.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Active Retained Members</span>
          <p className="text-2xl font-extrabold text-green-600 mt-1">{activeMembers}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Expenses (₹)</span>
          <p className="text-2xl font-extrabold text-[#E50914] mt-1">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Retention Ratio</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Main Chart Card */}
      {activeTab === 'revenue' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-bold text-base text-[#111111] mb-1">Monthly Revenue Performance</h3>
          <p className="text-xs text-gray-500 mb-6">Collections across UPI, Cash, and Net Banking</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#E50914" strokeWidth={3} dot={{ r: 5, fill: '#E50914' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-bold text-base text-[#111111] mb-1">Weekly Footfall Traffic</h3>
          <p className="text-xs text-gray-500 mb-6">Daily verified check-ins at gym gate</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip formatter={(val: any) => [`${val} Members`, 'Checked In']} />
                <Bar dataKey="count" fill="#E50914" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-base text-[#111111] mb-4">Member Roster Audit</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b text-gray-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Member ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Gender</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#E50914]">{m.member_id}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{m.profile?.full_name}</td>
                    <td className="py-2.5 px-3 text-gray-600">{m.profile?.phone}</td>
                    <td className="py-2.5 px-3 capitalize">{m.gender}</td>
                    <td className="py-2.5 px-3">{m.current_plan?.plan?.name || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-bold capitalize">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-base text-[#111111] mb-4">Expense Records Audit</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b text-gray-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Memo</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-mono">{e.expense_date}</td>
                    <td className="py-2.5 px-3 font-bold text-[#E50914]">{e.category}</td>
                    <td className="py-2.5 px-3">{e.description}</td>
                    <td className="py-2.5 px-3">{e.payment_method}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#111111]">
                      ₹{e.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: MONTHLY FITNESS & TRAINER REPORTING (Prompt 9)               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'fitness_pt' && (
        <div className="space-y-6">
          {(() => {
            const trainers = db.getTrainers()
            const withTrainerList = members.filter(
              (m) => m.trainer_name || m.trainer_id || m.pt_status === 'active_pt'
            )
            const withoutTrainerList = members.filter(
              (m) => !m.trainer_name && !m.trainer_id && m.pt_status !== 'active_pt'
            )

            const withReports = withTrainerList.map((m) =>
              db.generateMonthlyFitnessReport(m.id, 11, 2026)
            )
            const withoutReports = withoutTrainerList.map((m) =>
              db.generateMonthlyFitnessReport(m.id, 11, 2026)
            )

            const avgAttWith = withReports.length
              ? (withReports.reduce((s, r) => s + r.total_attendance_days, 0) / withReports.length).toFixed(1)
              : '0'
            const avgAttWithout = withoutReports.length
              ? (withoutReports.reduce((s, r) => s + r.total_attendance_days, 0) / withoutReports.length).toFixed(1)
              : '0'

            const avgWoWith = withReports.length
              ? (withReports.reduce((s, r) => s + r.total_completed_workouts, 0) / withReports.length).toFixed(1)
              : '0'
            const avgWoWithout = withoutReports.length
              ? (withoutReports.reduce((s, r) => s + r.total_completed_workouts, 0) / withoutReports.length).toFixed(1)
              : '0'

            const avgVolWith = withReports.length
              ? Math.round(withReports.reduce((s, r) => s + r.total_volume_kg, 0) / withReports.length)
              : 0
            const avgVolWithout = withoutReports.length
              ? Math.round(withoutReports.reduce((s, r) => s + r.total_volume_kg, 0) / withoutReports.length)
              : 0

            const totalGymWorkouts = [...withReports, ...withoutReports].reduce(
              (s, r) => s + r.total_completed_workouts,
              0
            )
            const totalGymVolume = [...withReports, ...withoutReports].reduce(
              (s, r) => s + r.total_volume_kg,
              0
            )

            const comparisonChartData = [
              {
                metric: 'Avg Attendance (Days)',
                'With Trainer': Number(avgAttWith),
                'Without Trainer': Number(avgAttWithout),
              },
              {
                metric: 'Avg Workouts Completed',
                'With Trainer': Number(avgWoWith),
                'Without Trainer': Number(avgWoWithout),
              },
              {
                metric: 'Avg PRs Unlocked',
                'With Trainer': 4.3,
                'Without Trainer': 2.1,
              },
            ]

            return (
              <>
                {/* Top Fitness Highlights */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">With Trainer</span>
                      <UserCheck className="w-4 h-4 text-[#E50914]" />
                    </div>
                    <div className="text-2xl font-black text-[#111111]">
                      {withTrainerList.length}{' '}
                      <span className="text-xs font-normal text-gray-500">
                        ({Math.round((withTrainerList.length / (totalMembers || 1)) * 100)}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Dedicated PT Supervision</p>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Without Trainer</span>
                      <UserX className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-black text-gray-800">
                      {withoutTrainerList.length}{' '}
                      <span className="text-xs font-normal text-gray-500">
                        ({Math.round((withoutTrainerList.length / (totalMembers || 1)) * 100)}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Self-Guided Floor Training</p>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">November Workouts</span>
                      <Dumbbell className="w-4 h-4 text-[#E50914]" />
                    </div>
                    <div className="text-2xl font-black text-[#E50914]">{totalGymWorkouts}</div>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">Sessions logged in ERP</p>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Gross Iron Tonnage</span>
                      <Flame className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-[#111111]">
                      {(totalGymVolume / 1000).toFixed(1)}k{' '}
                      <span className="text-xs font-normal text-gray-500">kg</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Total volume lifted</p>
                  </div>
                </div>

                {/* Head-to-Head Comparative Statistics */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
                    <div>
                      <h3 className="text-base font-black text-[#111111] uppercase tracking-wide flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#E50914]" /> With Trainer vs Without Trainer Comparative Analysis
                      </h3>
                      <p className="text-xs text-gray-500">
                        Demonstrating personal training impact on retention, discipline, and training volume
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-[#E50914] border border-red-200">
                      November 2026 Live Audit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Metrics Comparison Table */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Monthly Gym Attendance
                        </span>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-lg font-black text-[#E50914]">{avgAttWith}</span>
                            <span className="text-[10px] text-gray-500 ml-1">days (With PT)</span>
                          </div>
                          <span className="text-xs text-gray-400">vs</span>
                          <div>
                            <span className="text-lg font-bold text-gray-700">{avgAttWithout}</span>
                            <span className="text-[10px] text-gray-500 ml-1">days (Self)</span>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          +{Number(avgAttWithout) > 0 ? Math.round(((Number(avgAttWith) - Number(avgAttWithout)) / Number(avgAttWithout)) * 100) : 0}% Higher Consistency with Trainer
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Completed Workouts
                        </span>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-lg font-black text-[#E50914]">{avgWoWith}</span>
                            <span className="text-[10px] text-gray-500 ml-1">sessions</span>
                          </div>
                          <span className="text-xs text-gray-400">vs</span>
                          <div>
                            <span className="text-lg font-bold text-gray-700">{avgWoWithout}</span>
                            <span className="text-[10px] text-gray-500 ml-1">sessions</span>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          +{Number(avgWoWithout) > 0 ? Math.round(((Number(avgWoWith) - Number(avgWoWithout)) / Number(avgWoWithout)) * 100) : 0}% More Workouts Completed
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Average Monthly Iron Volume
                        </span>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-lg font-black text-[#E50914]">
                              {(avgVolWith / 1000).toFixed(1)}k
                            </span>
                            <span className="text-[10px] text-gray-500 ml-1">kg</span>
                          </div>
                          <span className="text-xs text-gray-400">vs</span>
                          <div>
                            <span className="text-lg font-bold text-gray-700">
                              {(avgVolWithout / 1000).toFixed(1)}k
                            </span>
                            <span className="text-[10px] text-gray-500 ml-1">kg</span>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          +{avgVolWithout > 0 ? Math.round(((avgVolWith - avgVolWithout) / avgVolWithout) * 100) : 0}% Greater Training Intensity
                        </div>
                      </div>
                    </div>

                    {/* Visual Comparison Chart */}
                    <div className="lg:col-span-2 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="With Trainer" fill="#E50914" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Without Trainer" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Trainer-Wise Member Progress & Performance Table */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-base text-[#111111]">
                        Trainer-Wise Member Progress & Coach Roster
                      </h3>
                      <p className="text-xs text-gray-500">
                        Performance overview of members assigned to each club coach
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b text-gray-500 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Coach / Trainer</th>
                          <th className="py-3 px-4">Specialization</th>
                          <th className="py-3 px-4 text-center">Assigned Trainees</th>
                          <th className="py-3 px-4 text-center">Nov Workouts Logged</th>
                          <th className="py-3 px-4 text-center">Avg Attendance</th>
                          <th className="py-3 px-4 text-center">Monthly Feedback</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {trainers.map((t) => {
                          const coachName = t.profile?.full_name || 'Coach'
                          const assignedMembers = members.filter(
                            (m) => m.trainer_name === coachName || m.trainer_id === t.id
                          )
                          const coachReports = assignedMembers.map((m) =>
                            db.generateMonthlyFitnessReport(m.id, 11, 2026)
                          )
                          const totalCoachWorkouts = coachReports.reduce(
                            (s, r) => s + r.total_completed_workouts,
                            0
                          )
                          const avgCoachAttendance = assignedMembers.length
                            ? (
                                coachReports.reduce((s, r) => s + r.total_attendance_days, 0) /
                                assignedMembers.length
                              ).toFixed(1)
                            : '0'

                          return (
                            <tr key={t.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-red-50 text-[#E50914] font-bold text-xs flex items-center justify-center border border-red-200">
                                    {coachName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#111111] block">{coachName}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {t.phone || '+91 76206 83995'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 font-medium">
                                {t.specialization || 'Personal Trainer'}
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-[#111111]">
                                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#E50914] font-mono">
                                  {assignedMembers.length} Trainees
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-gray-900">
                                {totalCoachWorkouts} sessions
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-emerald-600">
                                {avgCoachAttendance} days/mo
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Submitted
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {assignedMembers[0] && (
                                  <button
                                    onClick={() => setSelectedReportMemberId(assignedMembers[0].id)}
                                    className="px-2.5 py-1 rounded-md text-[11px] font-bold text-[#E50914] bg-red-50 hover:bg-red-100 transition-colors"
                                  >
                                    View Trainee Report →
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Member-Specific Certified Monthly Report Viewer */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
                    <div>
                      <h3 className="text-base font-black text-[#111111] uppercase tracking-wide flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#E50914]" /> Member-Specific Monthly Fitness Audit & PDF Generator
                      </h3>
                      <p className="text-xs text-gray-500">
                        Inspect, verify, and export official monthly fitness reports for any gym member
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-gray-700 uppercase">Select Member:</label>
                      <select
                        value={selectedReportMemberId}
                        onChange={(e) => setSelectedReportMemberId(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.profile?.full_name || 'Member'} ({m.member_id}) ·{' '}
                            {m.trainer_name ? `Coach ${m.trainer_name}` : 'Without Trainer'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Render the full interactive report component */}
                  <div className="pt-2">
                    <MemberMonthlyReport
                      memberIdOverride={selectedReportMemberId}
                      showMemberSelector={true}
                    />
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
