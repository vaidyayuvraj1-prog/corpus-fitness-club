import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Camera,
  LogOut,
  X,
  Sparkles,
  Printer,
  Dumbbell,
  Trash2,
} from 'lucide-react'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import { OFFICIAL_GYM_GATE_QR } from '@/lib/constants'
import type { Attendance, Member } from '@/types/database'
import { format } from 'date-fns'

export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [searchMemberId, setSearchMemberId] = useState('')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [showGateQrModal, setShowGateQrModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Attendance | null>(null)
  const [lastScannedMember, setLastScannedMember] = useState<{
    member: Member
    attendance: Attendance
    status: 'success' | 'expired_warning'
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setAttendanceList(db.getAttendance())
    setMembers(db.getMembers())
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayAttendance = attendanceList.filter((a) => a.check_in.startsWith(todayStr))

  // Handle Mark Attendance
  const handleCheckIn = (memberIdentifier: string, method: 'qr' | 'manual' = 'manual') => {
    const trimmed = memberIdentifier.trim()
    if (!trimmed) {
      toast.error('Please enter a Member ID or Name')
      return
    }

    const member = members.find(
      (m) =>
        m.member_id.toLowerCase() === trimmed.toLowerCase() ||
        m.id === trimmed ||
        m.profile?.full_name?.toLowerCase() === trimmed.toLowerCase() ||
        m.profile?.phone === trimmed
    )

    if (!member) {
      toast.error(`Member "${trimmed}" not found in database!`)
      return
    }

    // Check duplicate
    if (db.checkDuplicateAttendance(member.id)) {
      toast.error(`Member ${member.profile?.full_name} has ALREADY checked in today!`)
      return
    }

    // Verification check on membership status
    const isExpired = member.status === 'expired'

    try {
      const rec = db.markAttendance(member.id, method, 'CFC Gate Scanner')
      loadData()
      setSearchMemberId('')

      if (isExpired) {
        toast((t) => (
          <span className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Checked in, but membership is <strong>EXPIRED</strong>!</span>
          </span>
        ))
        setLastScannedMember({ member, attendance: rec, status: 'expired_warning' })
      } else {
        toast.success(`Check-in verified: ${member.profile?.full_name}`)
        setLastScannedMember({ member, attendance: rec, status: 'success' })
      }
    } catch (e: any) {
      toast.error(e.message || 'Check-in failed')
    }
  }

  // Handle Check-Out
  const handleCheckOut = (attId: string) => {
    db.checkOutAttendance(attId)
    toast.success('Member checked out successfully')
    loadData()
  }

  // Handle Delete Attendance Record
  const handleDeleteAttendance = () => {
    if (!deleteConfirm) return
    try {
      db.deleteAttendance(deleteConfirm.id)
      toast.success('Attendance record deleted successfully!')
      setDeleteConfirm(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete attendance record')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            QR CODE ATTENDANCE SYSTEM
          </h2>
          <p className="text-xs text-gray-500">
            Real-time biometric/QR scanner verification, duplicate check-in blocking, and daily entry logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowGateQrModal(true)}
            className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Printer className="h-4 w-4 text-[#E50914]" />
            <span>Print Gym Entrance QR Standee</span>
          </button>
          <span className="bg-red-50 text-[#E50914] text-xs font-bold px-3 py-2 rounded-xl border border-red-200">
            Today: {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </span>
        </div>
      </div>

      {/* Verification / Scanner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Check-in Terminal */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111111]">Attendance Scanner Terminal</h3>
                <p className="text-xs text-gray-400">Scan member card QR or search Member ID</p>
              </div>
            </div>

            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                isCameraActive
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>{isCameraActive ? 'Close Camera' : 'Open Camera'}</span>
            </button>
          </div>

          {/* Camera View Area */}
          {isCameraActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black rounded-xl p-6 text-center text-white relative overflow-hidden"
            >
              <div className="w-48 h-48 mx-auto border-2 border-dashed border-[#E50914] rounded-xl flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-[#E50914] animate-pulse" />
                <QrCode className="h-16 w-16 text-gray-500 mb-2" />
                <span className="text-[10px] text-gray-300">Point member QR card inside this box</span>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Camera feed simulated. You can also click any registered member below for 1-click test scan:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {members.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleCheckIn(m.member_id, 'qr')}
                    className="bg-white/10 hover:bg-[#E50914] text-white text-[11px] font-bold px-2.5 py-1 rounded"
                  >
                    Simulate: {m.profile?.full_name?.split(' ')[0]} ({m.member_id})
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Manual Entry Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCheckIn(searchMemberId, 'manual')
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Member ID (e.g. CFC-2026-0001), Phone, or Name..."
                value={searchMemberId}
                onChange={(e) => setSearchMemberId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E50914]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E50914] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#B91C1C] transition-colors shadow-sm"
            >
              Check-In
            </button>
          </form>

          {/* Quick Member Quick-Buttons */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Quick Test Check-In:
            </span>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const isCheckedToday = todayAttendance.some((a) => a.member_id === m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => handleCheckIn(m.member_id, 'manual')}
                    disabled={isCheckedToday}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isCheckedToday
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-[#E50914] hover:bg-red-50'
                    }`}
                  >
                    {m.profile?.full_name} ({m.member_id}) {isCheckedToday ? '✓ Present' : '+ Check-in'}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Scan Verification Card */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#111111] mb-1">Live Entry Verification</h3>
            <p className="text-xs text-gray-400 mb-6">Details of last verified check-in</p>

            {lastScannedMember ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl border ${
                  lastScannedMember.status === 'success'
                    ? 'bg-green-50/50 border-green-200'
                    : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={lastScannedMember.member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt="Member"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#E50914] shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 leading-tight">
                      {lastScannedMember.member.profile?.full_name}
                    </h4>
                    <p className="font-mono text-xs font-bold text-[#E50914]">
                      {lastScannedMember.member.member_id}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 uppercase ${
                        lastScannedMember.member.status === 'active'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      Membership: {lastScannedMember.member.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-bold text-gray-900">
                      {lastScannedMember.member.current_plan?.plan?.name || 'Active Plan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-in Timestamp:</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {format(new Date(lastScannedMember.attendance.check_in), 'hh:mm:ss a')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scan Method:</span>
                    <span className="font-bold capitalize">{lastScannedMember.attendance.method}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-16 text-center text-gray-400">
                <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">Awaiting card scan or search...</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Today's Total Check-Ins:</span>
            <span className="font-extrabold text-base text-[#111111]">{todayAttendance.length}</span>
          </div>
        </div>
      </div>

      {/* Daily Attendance Log Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#E50914]" />
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Today's Gate Check-In Log ({todayAttendance.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-gray-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Check-Out Time</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Terminal / Gate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todayAttendance.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/80">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {a.member?.profile?.full_name || 'Member'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#E50914]">{a.member?.member_id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    {format(new Date(a.check_in), 'hh:mm a')}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {a.check_out ? (
                      format(new Date(a.check_out), 'hh:mm a')
                    ) : (
                      <span className="text-green-600 font-bold">Currently Training</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        a.method === 'qr' ? 'bg-red-50 text-[#E50914]' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {a.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{a.recorded_by || 'Entrance Gate'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!a.check_out && (
                        <button
                          onClick={() => handleCheckOut(a.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 hover:bg-[#E50914] hover:text-white text-[10px] font-bold text-gray-700 transition-colors"
                        >
                          <LogOut className="h-3 w-3" /> Check-Out
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(a)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Attendance Record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {todayAttendance.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No members have checked in yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Gym Entrance Gate Standee Modal */}
      <AnimatePresence>
        {showGateQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-200 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-base font-black text-gray-900 uppercase">Official Gym Entrance QR Standee</h3>
                  <p className="text-xs text-gray-500">Print and paste at 3rd floor reception gate / entrance wall</p>
                </div>
                <button
                  onClick={() => setShowGateQrModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Standee Preview Area */}
              <div
                id="printable-standee"
                className="my-5 p-6 rounded-2xl border-4 border-[#111111] bg-white text-center space-y-4 shadow-sm"
              >
                {/* Brand Header */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E50914] text-white flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 transform -rotate-45" />
                  </div>
                  <span className="font-display text-2xl tracking-wider text-[#111111]">
                    CORPUS <span className="text-[#E50914]">FITNESS CLUB</span>
                  </span>
                </div>

                <div className="bg-[#111111] text-white py-1.5 px-4 rounded-full text-xs font-black tracking-widest uppercase inline-block">
                  SCAN HERE TO CHECK IN
                </div>

                {/* Big Crisp QR Code */}
                <div className="p-4 bg-white rounded-2xl inline-block border-2 border-gray-300 shadow-inner">
                  <QRCode value={OFFICIAL_GYM_GATE_QR} size={200} />
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Open CFC Member App → Tap "Scan Gym QR"
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Your attendance will be logged instantly with exact time stamp.
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200 text-[10px] text-gray-500 space-y-1">
                  <p className="font-bold text-gray-800">
                    Shift Timings: Mon–Sat 6:00 AM – 11:00 AM | 5:00 PM – 10:00 PM (Sunday Closed)
                  </p>
                  <p>3rd Floor, Above SBI, Harshraj Colony – Vidyut Nagar Square, VMV Road, Amravati</p>
                  <p className="font-mono text-[#E50914] font-bold">Helpline / Reception: +91 76206 83995</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGateQrModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Standee Poster</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE ATTENDANCE CONFIRMATION MODAL ───────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Delete Attendance Entry?</h3>
              <p className="text-xs text-gray-600 mb-6">
                Are you sure you want to remove check-in record for{' '}
                <strong className="text-gray-900 font-bold">
                  {deleteConfirm.member?.profile?.full_name || 'Member'}
                </strong>{' '}
                ({format(new Date(deleteConfirm.check_in), 'hh:mm a')})?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAttendance}
                  className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Yes, Delete Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
