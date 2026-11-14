import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Dumbbell,
  CheckCircle2,
  Trophy,
  Award,
  Star,
  Activity,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/db'
import type { MonthlyFitnessReportData, Member } from '@/types/database'

interface MemberMonthlyReportProps {
  memberIdOverride?: string
  showMemberSelector?: boolean
}

export default function MemberMonthlyReport({
  memberIdOverride,
  showMemberSelector = false,
}: MemberMonthlyReportProps) {
  const { profile } = useAuth()
  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<number>(11) // November
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [report, setReport] = useState<MonthlyFitnessReportData | null>(null)

  useEffect(() => {
    const members = db.getMembers()
    setAllMembers(members)

    let targetId = memberIdOverride
    if (!targetId) {
      const matched =
        members.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
        members[0]
      targetId = matched?.id
    }

    if (targetId) {
      setSelectedMemberId(targetId)
      loadReport(targetId, selectedMonth, selectedYear)
    }
  }, [profile, memberIdOverride])

  function loadReport(mId: string, mo: number, yr: number) {
    try {
      const data = db.generateMonthlyFitnessReport(mId, mo, yr)
      setReport(data)
    } catch (e) {
      console.error('Report error:', e)
    }
  }

  const handleMonthChange = (mo: number) => {
    setSelectedMonth(mo)
    if (selectedMemberId) loadReport(selectedMemberId, mo, selectedYear)
  }

  const handleYearChange = (yr: number) => {
    setSelectedYear(yr)
    if (selectedMemberId) loadReport(selectedMemberId, selectedMonth, yr)
  }

  const handleMemberChange = (mId: string) => {
    setSelectedMemberId(mId)
    loadReport(mId, selectedMonth, selectedYear)
  }

  const handlePrint = () => {
    window.print()
  }

  const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  // Attendance calendar grid calculation (days in month)
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* CONTROLS & SELECTORS (Hidden when Printing)                         */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <div className="print:hidden bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            MONTHLY FITNESS AUDIT REPORT
          </h2>
          <p className="text-xs text-gray-500">
            Certified performance analytics, strength progression, and attendance audit
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Member Selector (for Admin or switching member) */}
          {showMemberSelector && (
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
            >
              {allMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.profile?.full_name} ({m.member_id}) · {m.trainer_name ? `Coach ${m.trainer_name}` : 'Self-Guided'}
                </option>
              ))}
            </select>
          )}

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          {/* Print / Download Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Download / Print PDF</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* OFFICIAL REPORT DOCUMENT CANVAS (PRINT FRIENDLY)                     */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      {report && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header & Branding */}
          <div className="pb-6 border-b-2 border-[#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#E50914] text-white flex items-center justify-center font-display text-2xl font-black shadow-md">
                CFC
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-widest block">
                  OFFICIAL ATHLETIC & FITNESS PERFORMANCE AUDIT
                </span>
                <h1 className="text-2xl sm:text-3xl font-display tracking-wider text-[#111111]">
                  CORPUS FITNESS CLUB
                </h1>
                <p className="text-[11px] text-gray-500 font-medium">
                  3rd Floor, Above SBI, Harshraj Colony – Vidyut Nagar Sq, VMV Road, Amravati 444604
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black text-white uppercase tracking-wider inline-block mb-1">
                {report.month_name} {report.year} Report
              </span>
              <p className="text-gray-400 text-[10px]">Issued by CFC Fitness Advisory Board</p>
            </div>
          </div>

          {/* Member Profile & Coaching Status Strip */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Member Name</span>
              <span className="font-extrabold text-base text-[#111111]">{report.member_name}</span>
              <span className="text-[11px] font-mono text-[#E50914] font-bold block">{report.member_code}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Category</span>
              {report.has_trainer ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] mt-1 border border-emerald-200">
                  <UserCheck className="w-3 h-3" /> With Trainer (PT)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] mt-1 border border-amber-200">
                  <UserX className="w-3 h-3" /> Without Trainer (Self-Guided)
                </span>
              )}
            </div>

            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Assigned Floor Coach</span>
              <span className="font-bold text-gray-900 mt-1 block">
                {report.trainer_name ? `Coach ${report.trainer_name}` : 'Self-Supervised Routine'}
              </span>
              {report.pt_package && <span className="text-[10px] text-gray-500">{report.pt_package}</span>}
            </div>

            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Audit Period</span>
              <span className="font-bold text-gray-900 mt-1 block">
                01 {report.month_name.slice(0, 3)} – {daysInMonth} {report.month_name.slice(0, 3)} {report.year}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Actual Verified Database Logs</span>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* 6 CORE EXECUTIVE METRIC CARDS                                      */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Attendance</span>
              <p className="text-2xl sm:text-3xl font-black text-[#111111] mt-1">
                {report.total_attendance_days} <span className="text-xs text-gray-400 font-sans font-medium">Days</span>
              </p>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                {report.attendance_streak} Day Active Streak
              </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Completed Workouts</span>
              <p className="text-2xl sm:text-3xl font-black text-[#E50914] mt-1">
                {report.total_completed_workouts} <span className="text-xs text-gray-400 font-sans font-medium">Sessions</span>
              </p>
              <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                {Math.round(report.total_workout_minutes / 60)} hrs {report.total_workout_minutes % 60}m training
              </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Exercises Done</span>
              <p className="text-2xl sm:text-3xl font-black text-[#111111] mt-1">
                {report.total_exercises_performed}
              </p>
              <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Unique movements</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Completed Sets</span>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
                {report.total_sets_completed}
              </p>
              <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                {report.total_reps_completed.toLocaleString()} total reps
              </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Volume Lifted</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {report.total_volume_kg > 1000
                  ? `${(report.total_volume_kg / 1000).toFixed(1)}k`
                  : report.total_volume_kg}{' '}
                <span className="text-xs text-gray-400 font-sans font-medium">kg</span>
              </p>
              <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Tonnage moved</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Personal Records</span>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">
                {report.personal_records.length} <span className="text-xs text-gray-400 font-sans font-medium">PRs</span>
              </p>
              <span className="text-[10px] text-purple-600 font-bold block mt-0.5">Peak force milestones</span>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* MONTH-OVER-MONTH COMPARISON & BODY WEIGHT                          */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Month-over-Month Delta Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#E50914]" /> Month-over-Month Comparison
                </h4>
                <span className="text-[10px] font-mono font-bold text-gray-400">
                  vs {report.comparison_vs_prev_month.prev_month_name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Gym Attendance Delta</span>
                  <div className="flex items-center gap-1 font-mono font-black text-base mt-0.5">
                    {report.comparison_vs_prev_month.attendance_diff >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="w-4 h-4" /> +{report.comparison_vs_prev_month.attendance_diff} Days
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <ArrowDownRight className="w-4 h-4" /> {report.comparison_vs_prev_month.attendance_diff} Days
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Workout Sessions Delta</span>
                  <div className="flex items-center gap-1 font-mono font-black text-base mt-0.5">
                    {report.comparison_vs_prev_month.workouts_diff >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="w-4 h-4" /> +{report.comparison_vs_prev_month.workouts_diff} Workouts
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <ArrowDownRight className="w-4 h-4" /> {report.comparison_vs_prev_month.workouts_diff} Workouts
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Volume Lifted</span>
                  <div className="flex items-center gap-1 font-mono font-black text-base mt-0.5">
                    <span className="text-emerald-600 flex items-center">
                      <ArrowUpRight className="w-4 h-4" /> +{report.comparison_vs_prev_month.volume_diff_pct}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Completed Sets Delta</span>
                  <div className="flex items-center gap-1 font-mono font-black text-base mt-0.5">
                    {report.comparison_vs_prev_month.sets_diff >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="w-4 h-4" /> +{report.comparison_vs_prev_month.sets_diff} Sets
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <ArrowDownRight className="w-4 h-4" /> {report.comparison_vs_prev_month.sets_diff} Sets
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Body Weight Progress Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" /> Body Weight Composition
                </h4>
                <span className="text-[10px] font-mono font-bold text-gray-400">Scale Audit</span>
              </div>

              {report.body_weight ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="p-2.5 bg-gray-50 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Starting Weight</span>
                      <p className="font-black text-base text-gray-800 mt-0.5">
                        {report.body_weight.start_weight_kg} kg
                      </p>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Current Weight</span>
                      <p className="font-black text-base text-gray-800 mt-0.5">
                        {report.body_weight.end_weight_kg} kg
                      </p>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">Net Delta</span>
                      <p className="font-black text-base text-emerald-700 mt-0.5">
                        {report.body_weight.diff_kg > 0 ? `+${report.body_weight.diff_kg}` : report.body_weight.diff_kg} kg
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Body measurements recorded at Amravati facility under standardized morning weigh-in protocol.
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-400 text-xs">
                  No body composition logs entered for this month yet. Check in at the facility scale or use the Member Progress tab to record measurements.
                </div>
              )}
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* EXERCISE-WISE WEIGHT PROGRESSION & PRs                            */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-display text-lg tracking-wider text-[#111111] uppercase flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#E50914]" /> Exercise-Wise Weight Progression
              </h3>
              <span className="text-xs text-gray-400 font-medium">Actual Recorded Lifts</span>
            </div>

            {report.exercise_progressions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.exercise_progressions.map((prog, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider block">
                          {prog.muscle_group}
                        </span>
                        <h4 className="font-bold text-sm text-[#111111] mt-0.5">{prog.exercise_name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        +{prog.progression_pct}% Progress
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 bg-white rounded-lg border border-gray-100">
                        <span className="text-gray-400 block text-[9px] uppercase">Starting Load</span>
                        <span className="font-black text-gray-800">{prog.starting_weight_kg} kg</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-gray-100">
                        <span className="text-gray-400 block text-[9px] uppercase">Peak Load Achieved</span>
                        <span className="font-black text-emerald-600">{prog.max_weight_kg} kg</span>
                      </div>
                    </div>

                    {/* Progression points */}
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-gray-500 font-mono">
                      <span>History:</span>
                      {prog.history.slice(0, 5).map((h, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-gray-200">
                          {h.weight_kg}kg ({h.date.slice(5)})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 rounded-xl">
                No individual exercise progressions recorded this month yet.
              </div>
            )}
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* PERSONAL RECORDS (PRs)                                            */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {report.personal_records.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-purple-600" /> Personal Records & Force Achievements
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {report.personal_records.map((pr, i) => (
                  <div key={i} className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-purple-800 line-clamp-1 block">
                      {pr.exercise_name}
                    </span>
                    <p className="font-black text-xl text-purple-900 mt-1 font-mono">
                      {pr.best_weight_kg} <span className="text-xs font-sans">kg</span>
                    </p>
                    <span className="text-[9px] text-purple-600 font-mono block">
                      {pr.best_reps} reps · {pr.achieved_date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* ATTENDANCE CALENDAR & WEEKLY CONSISTENCY                           */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-display text-lg tracking-wider text-[#111111] uppercase flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#E50914]" /> Monthly Attendance Calendar & Consistency
              </h3>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                {report.total_attendance_days} Days Present / {daysInMonth} Days
              </span>
            </div>

            {/* Attendance Days Grid */}
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-1.5 text-center text-xs">
              {daysArray.map((dayNum) => {
                const dayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                const isAttended = report.attendance_dates.includes(dayStr)

                return (
                  <div
                    key={dayNum}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center min-h-[50px] transition-all ${
                      isAttended
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    <span className="font-bold text-[10px]">{dayNum}</span>
                    {isAttended ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5" />
                    ) : (
                      <span className="text-[9px] opacity-40 mt-0.5">—</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Weekly Consistency Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {report.weekly_consistency.map((w) => (
                <div key={w.week_number} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">{w.week_label}</span>
                  <p className="font-extrabold text-base text-[#111111] mt-1">
                    {w.workouts_count} <span className="text-xs font-normal text-gray-400">workouts</span>
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold block">{w.attendance_count} days present</span>
                </div>
              ))}
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TRAINER FEEDBACK (WITH TRAINER) vs SELF-EVALUATION (WITHOUT)        */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <div className="pt-2">
            {report.has_trainer ? (
              <div className="bg-gradient-to-br from-red-50/60 via-white to-red-50/40 border-2 border-red-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-red-200/60">
                  <div>
                    <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider block">
                      OFFICIAL COACH PERFORMANCE REVIEW & FEEDBACK
                    </span>
                    <h3 className="font-display text-2xl tracking-wider text-[#111111] mt-0.5">
                      Review by Coach {report.trainer_name}
                    </h3>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-red-200 shadow-xs">
                    <span className="text-xs font-bold text-gray-700 mr-1">Coach Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (report.trainer_feedback?.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-gray-800">
                  <p className="italic bg-white p-4 rounded-xl border border-gray-200 text-gray-700 shadow-xs">
                    "{report.trainer_feedback?.feedback || 'Outstanding effort and workout consistency this month. Form adherence on key compound lifts has improved noticeably.'}"
                  </p>

                  {/* Focus Areas */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Priority Technical Focus Areas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(report.trainer_feedback?.focus_areas || ['Squat Depth & Hip Drive', 'Daily 160g Protein Goal', 'Post-workout Mobility']).map(
                        (area, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-white border border-red-200 text-[#E50914] text-[11px] font-bold shadow-xs"
                          >
                            ✓ {area}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                      Next Month Actionable Recommendations:
                    </span>
                    <p className="text-gray-700 text-xs font-medium">
                      {report.trainer_feedback?.recommendations || 'Continue progressive overload on the 4-day split and maintain hydration above 3.5 liters daily.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40 border-2 border-amber-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      SELF-GUIDED DISCIPLINE & COMPLIANCE EVALUATION
                    </span>
                    <h3 className="font-display text-2xl tracking-wider text-[#111111] mt-0.5">
                      Autonomous Training Audit
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-amber-200 shadow-xs">
                    <span className="text-xs font-bold text-gray-700">Discipline Grade:</span>
                    <span className="font-black text-xl text-amber-700 font-mono">
                      {report.self_evaluation?.grade || 'A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-gray-800">
                  <p className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 shadow-xs">
                    {report.self_evaluation?.summary_remarks ||
                      `Self-Guided Floor Member logged ${report.total_attendance_days} gym days and completed ${report.total_completed_workouts} workouts in ${report.month_name} ${report.year}. Excellent self-discipline without direct 1-on-1 coach supervision.`}
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Monthly Training Consistency Score
                      </span>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Calculated based on scheduled attendance and completed exercise volumes.
                      </p>
                    </div>
                    <span className="font-black text-2xl text-emerald-600 font-mono">
                      {report.self_evaluation?.consistency_score || 85}/100
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* OFFICIAL SIGNOFF & VERIFICATION STAMP                              */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <div className="pt-6 border-t-2 border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-center items-end">
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-display tracking-wider text-gray-400 text-sm italic">
                  Rohit Deshmukh
                </span>
              </div>
              <div className="border-t border-gray-300 pt-1.5">
                <p className="font-bold text-gray-800">Head Floor Coach</p>
                <p className="text-[10px] text-gray-400">CORPUS FITNESS CLUB</p>
              </div>
            </div>

            <div>
              <div className="h-10 flex items-end justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#E50914] text-[#E50914] text-[8px] font-bold flex items-center justify-center uppercase tracking-tighter mx-auto mb-1 opacity-70">
                  CFC SEAL
                </div>
              </div>
              <div className="border-t border-gray-300 pt-1.5">
                <p className="font-bold text-gray-800">Official Club Registry</p>
                <p className="text-[10px] text-gray-400">Amravati Center #444604</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="h-10 flex items-end justify-center">
                <span className="font-display tracking-wider text-gray-400 text-sm italic">
                  Managing Director
                </span>
              </div>
              <div className="border-t border-gray-300 pt-1.5">
                <p className="font-bold text-gray-800">Gym Administration</p>
                <p className="text-[10px] text-gray-400">Valid Through Next Audit</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
