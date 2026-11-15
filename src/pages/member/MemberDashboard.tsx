import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import {
  User,
  CalendarCheck,
  Dumbbell,
  Apple,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowRight,
  Printer,
  CheckCircle2,
  Bell,
  Camera,
  Award,
  Play,
  UserCheck,
  UserX,
  Phone,
  MessageCircle,
  Sparkles,
  Trophy,
  History,
  FileText,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/db'
import type {
  Member,
  Attendance,
  WorkoutPlan,
  DietPlan,
  NotificationItem,
  WorkoutSession,
  MonthlyFitnessReportData,
  Trainer,
} from '@/types/database'
import { format, differenceInDays } from 'date-fns'

export default function MemberDashboard() {
  const { profile } = useAuth()
  const [member, setMember] = useState<Member | null>(null)
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null)
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [assignedWorkout, setAssignedWorkout] = useState<WorkoutPlan | null>(null)
  const [customPlansCount, setCustomPlansCount] = useState(0)
  const [assignedDiet, setAssignedDiet] = useState<DietPlan | null>(null)
  const [latestNotice, setLatestNotice] = useState<NotificationItem | null>(null)
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([])
  const [monthlyReport, setMonthlyReport] = useState<MonthlyFitnessReportData | null>(null)
  const [assignedTrainer, setAssignedTrainer] = useState<Trainer | null>(null)

  const loadDashboardData = () => {
    // Look up member record
    const allMembers = db.getMembers()
    const matched =
      allMembers.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
      allMembers[0]

    setMember(matched)

    // Load latest broadcast
    const notifs = db.getNotifications()
    if (notifs.length > 0) {
      setLatestNotice(notifs[0])
    }

    if (matched) {
      const att = db.getAttendance().filter((a) => a.member_id === matched.id)
      setAttendanceCount(att.length)

      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const todayRecord = att.find((a) => a.check_in.startsWith(todayStr))
      setTodayAttendance(todayRecord || null)

      // Workout data
      const workoutsInfo = db.getWorkoutsForMember(matched.id)
      setAssignedWorkout(workoutsInfo.assignedPlan || workoutsInfo.defaultPlans[0] || null)
      setCustomPlansCount(workoutsInfo.customPlans.length)

      // Recent sessions
      const sessions = db.getWorkoutSessions(matched.id)
      setRecentSessions(sessions.slice(0, 3))

      // Monthly Report
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const rep = db.generateMonthlyFitnessReport(matched.id, currentMonth, currentYear)
      setMonthlyReport(rep)

      // Assigned Trainer details
      if (matched.trainer_id) {
        const trainers = db.getTrainers()
        const tr = trainers.find((t) => t.id === matched.trainer_id || t.name === matched.trainer_name)
        setAssignedTrainer(tr || null)
      } else {
        setAssignedTrainer(null)
      }

      const diets = db.getDiets()
      setAssignedDiet(diets[0] || null)
    }
  }

  useEffect(() => {
    loadDashboardData()
    const handleSync = () => loadDashboardData()
    window.addEventListener('cfc_db_synced', handleSync)
    return () => window.removeEventListener('cfc_db_synced', handleSync)
  }, [profile])

  const hasTrainer = Boolean(member?.trainer_id && member.trainer_id !== 'none' && member?.trainer_name)

  const daysRemaining = member?.current_plan?.end_date
    ? differenceInDays(new Date(member.current_plan.end_date), new Date())
    : 0

  return (
    <div className="space-y-8">
      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* WELCOME BANNER                                                       */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              member?.photo_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            }
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-[#E50914] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-widest block">
                CORPUS FITNESS CLUB MEMBER PORTAL
              </span>
              {hasTrainer ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <UserCheck className="w-3 h-3" /> With Trainer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <UserX className="w-3 h-3" /> Self-Guided Floor Training
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-display tracking-wider text-[#111111] mt-0.5">
              Welcome back, {member?.profile?.full_name || 'Member'}!
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              ID: <strong>{member?.member_id}</strong> · {member?.fitness_goal || 'General Fitness'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/member/workout"
            className="inline-flex items-center gap-2 bg-[#E50914] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#B91C1C] transition-all shadow-md"
          >
            <Play className="h-4 w-4 fill-white" /> Start Workout
          </Link>
          <Link
            to="/member/monthly-report"
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-black transition-colors shadow-xs"
          >
            <Award className="h-4 w-4 text-amber-400" /> Monthly Report
          </Link>
          <Link
            to="/member/attendance"
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
          >
            <Camera className="h-4 w-4 text-[#E50914]" /> Check In
          </Link>
          <Link
            to="/member/settings"
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
            title="Update Your Password & Security Settings"
          >
            <Lock className="h-4 w-4 text-gray-500" /> Change Password
          </Link>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 1. TRAINER ASSIGNMENT STATUS & DETAILS CARD                          */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          hasTrainer
            ? 'bg-gradient-to-r from-emerald-50/60 via-white to-emerald-50/30 border-emerald-200'
            : 'bg-gradient-to-r from-amber-50/60 via-white to-amber-50/30 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-4">
          {hasTrainer ? (
            <img
              src={
                assignedTrainer?.photo ||
                'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80'
              }
              alt={member?.trainer_name || 'Coach'}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Dumbbell className="w-7 h-7 text-amber-700" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  hasTrainer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {hasTrainer ? 'Assigned Floor Coach' : 'Floor Training Mode'}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                {hasTrainer ? '1-on-1 Guidance Active' : 'Self-Guided & Default Routines'}
              </span>
            </div>

            {hasTrainer ? (
              <div>
                <h3 className="font-bold text-base text-[#111111] mt-0.5">
                  Coach {member?.trainer_name}
                  {assignedTrainer?.specialization && (
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      ({assignedTrainer.specialization})
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Package: <strong>{member?.pt_package || '1-on-1 Personal Transformation'}</strong> · Follow your assigned workout plan or message your coach.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-base text-[#111111] mt-0.5">
                  Autonomous Self-Guided Floor Training
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  You are following our <strong>7 Admin Default Workout Plans</strong>. You can also build, customize, and save your own routines in "My Custom Workout Plans".
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasTrainer && (
            <a
              href="https://wa.me/917620683995?text=Hello%20Coach,%20I%20have%20a%20question%20regarding%20my%20workout."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Coach</span>
            </a>
          )}
          <Link
            to="/member/workout"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition-colors shadow-xs"
          >
            <span>Explore Routines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Latest Club Broadcast Alert */}
      {latestNotice && (
        <div className="bg-gradient-to-r from-red-50/80 via-white to-red-50/40 border border-red-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E50914] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider bg-red-100 px-2 py-0.5 rounded">
                  Notice from Management
                </span>
                <span className="text-[11px] text-gray-500 font-semibold">{latestNotice.sent_by || 'CFC Admin'}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#111111] mt-1">{latestNotice.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-1 mt-0.5 max-w-2xl">{latestNotice.message}</p>
            </div>
          </div>

          <Link
            to="/member/notifications"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E50914] hover:text-[#B91C1C] bg-white hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl shadow-xs shrink-0 transition-colors"
          >
            <span>View All Announcements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Grid: Digital Pass Left, Routine & Report Summaries Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Digital QR Member Pass */}
        <div className="lg:col-span-5 bg-white border-2 border-[#E50914] rounded-2xl p-6 sm:p-7 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 bg-[#111111] text-white py-1.5 text-[10px] font-bold tracking-widest uppercase">
            CORPUS FITNESS CLUB · AMRAVATI
          </div>

          <div className="mt-5 mb-3 flex flex-col items-center">
            <h3 className="font-bold text-xl text-[#111111]">{member?.profile?.full_name}</h3>
            <p className="font-mono text-sm font-bold text-[#E50914]">{member?.member_id}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center my-4">
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <QRCode value={member?.member_id || 'CFC-2026-0001'} size={140} />
            </div>
          </div>

          <div className="my-4 py-3 border-y border-gray-100 grid grid-cols-2 gap-2 text-xs text-left">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Plan</span>
              <span className="font-bold text-gray-800">{member?.current_plan?.plan?.name || 'Annual Plan'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Valid Until</span>
              <span className="font-bold text-gray-800">{member?.current_plan?.end_date || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-700 bg-green-50 py-2 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span>Membership Active ({daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Active'})</span>
          </div>

          <Link
            to="/member/attendance"
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Scan Gym Wall QR for Self Check-In →</span>
          </Link>
        </div>

        {/* Right Columns: Metrics & Routine Summaries */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3 KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Link
              to="/member/attendance"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:border-[#E50914]/40 transition-colors"
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Attendance</span>
              <p className="text-3xl font-extrabold text-[#111111] mt-1">{attendanceCount}</p>
              <span className="text-[10px] text-gray-500 font-medium">Days checked in</span>
            </Link>

            <Link
              to="/member/workout"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:border-[#E50914]/40 transition-colors"
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">My Routine</span>
              <p className="text-base font-bold text-[#E50914] truncate mt-1">
                {assignedWorkout?.name?.split(' ')[0] || 'Hypertrophy'}
              </p>
              <span className="text-[10px] text-gray-500 font-medium">
                {customPlansCount > 0 ? `${customPlansCount} Custom Plans` : 'Active Split'}
              </span>
            </Link>

            <Link
              to="/member/monthly-report"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:border-[#E50914]/40 transition-colors"
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Monthly Volume</span>
              <p className="text-xl font-extrabold text-blue-600 mt-1">
                {monthlyReport?.total_volume_kg ? `${Math.round(monthlyReport.total_volume_kg / 1000)}k kg` : '18k kg'}
              </p>
              <span className="text-[10px] text-gray-500 font-medium">
                {monthlyReport?.total_completed_workouts || 0} workouts logged
              </span>
            </Link>
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* MONTHLY FITNESS REPORT PREVIEW CARD (REQUIREMENT 8)                */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-red-50/50 via-white to-white border-2 border-red-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E50914] text-white flex items-center justify-center shadow-xs">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111111]">
                    {monthlyReport?.month_name || 'November'} Fitness Performance Audit
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Official certified report with PRs, attendance heatmap, and progression
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/member/monthly-report"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View & Download PDF</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Gym Days</span>
                <span className="font-black text-gray-900 text-sm">{monthlyReport?.total_attendance_days || 0}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Workouts</span>
                <span className="font-black text-[#E50914] text-sm">
                  {monthlyReport?.total_completed_workouts || 0}
                </span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Sets Done</span>
                <span className="font-black text-blue-600 text-sm">{monthlyReport?.total_sets_completed || 0}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Records (PRs)</span>
                <span className="font-black text-purple-600 text-sm">
                  {monthlyReport?.personal_records.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Workout Plan Preview */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="h-5 w-5 text-[#E50914]" />
                <div>
                  <h3 className="font-bold text-base text-[#111111]">
                    {assignedWorkout?.name || 'Workout Split'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {hasTrainer ? `Prescribed by Coach ${member?.trainer_name}` : 'Admin Core Routine'}
                  </p>
                </div>
              </div>
              <Link
                to="/member/workout"
                className="text-xs font-bold text-[#E50914] hover:underline flex items-center"
              >
                Open Workout Hub <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {(assignedWorkout?.exercises || []).slice(0, 3).map((ex, i) => (
                <div key={i} className="p-3 bg-[#F8FAFC] rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{ex.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {ex.day_of_week} · {ex.muscle_group}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[#E50914]">
                    {ex.sets} sets × {ex.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Workout History Strip */}
          {recentSessions.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" /> Recent Completed Workouts
                </h4>
                <Link to="/member/workout" className="text-[11px] font-bold text-[#E50914] hover:underline">
                  Full Log →
                </Link>
              </div>

              <div className="space-y-2">
                {recentSessions.map((ws) => (
                  <div key={ws.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{ws.plan_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {ws.date} · {ws.duration_minutes} mins · {ws.completed_sets.length} sets completed
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-600">✓ Logged</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links Row */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/member/payments"
              className="p-5 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:border-[#E50914]/40 transition-colors flex items-center gap-3"
            >
              <CreditCard className="h-6 w-6 text-[#E50914]" />
              <div>
                <h4 className="font-bold text-xs text-[#111111]">Fee Payments & Receipts</h4>
                <p className="text-[10px] text-gray-400">Download GST invoice receipts</p>
              </div>
            </Link>

            <Link
              to="/member/progress"
              className="p-5 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:border-[#E50914]/40 transition-colors flex items-center gap-3"
            >
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-bold text-xs text-[#111111]">Body Measurements Log</h4>
                <p className="text-[10px] text-gray-400">Track weight & bicep progress</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
