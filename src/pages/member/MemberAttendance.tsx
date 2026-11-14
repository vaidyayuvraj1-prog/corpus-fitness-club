import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck,
  QrCode,
  Clock,
  CheckCircle2,
  Camera,
  AlertTriangle,
  Sparkles,
  Dumbbell,
  RefreshCw,
  X,
  Flame,
  Calendar,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { Html5Qrcode } from 'html5-qrcode'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/db'
import { OFFICIAL_GYM_GATE_QR } from '@/lib/constants'
import type { Member, Attendance } from '@/types/database'
import { format } from 'date-fns'

export default function MemberAttendance() {
  const { profile } = useAuth()
  const [member, setMember] = useState<Member | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [activeTab, setActiveTab] = useState<'scan_gym_qr' | 'my_qr_pass'>('scan_gym_qr')
  const [isCameraScanning, setIsCameraScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null)
  const [checkInSuccess, setCheckInSuccess] = useState<Attendance | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    loadMemberData()
    return () => {
      stopCameraScanner()
    }
  }, [profile])

  function loadMemberData() {
    const allMembers = db.getMembers()
    const matched =
      allMembers.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
      allMembers[0]

    setMember(matched)
    if (matched) {
      const records = db.getAttendance().filter((a) => a.member_id === matched.id)
      setAttendance(records)

      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const today = records.find((a) => a.check_in.startsWith(todayStr))
      setTodayRecord(today || null)
    }
  }

  // Camera QR Scanner Start
  const startCameraScanner = async () => {
    setCameraError(null)
    setIsCameraScanning(true)

    // Wait for DOM element to mount
    setTimeout(async () => {
      try {
        const element = document.getElementById('gym-gate-qr-reader')
        if (!element) return

        if (scannerRef.current) {
          try {
            await scannerRef.current.stop()
          } catch {
            // ignore
          }
        }

        const scanner = new Html5Qrcode('gym-gate-qr-reader')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' }, // uses back camera on mobile phones
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleGateQRScanned(decodedText)
          },
          () => {
            // frame error (silently ignore)
          }
        )
      } catch (err: any) {
        console.warn('Camera initiation failed:', err)
        setCameraError(
          err?.message || 'Unable to access camera. Please check camera permissions or use the quick check-in button below.'
        )
        setIsCameraScanning(false)
      }
    }, 200)
  }

  // Camera QR Scanner Stop
  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (err) {
        console.warn('Scanner stop error:', err)
      }
      scannerRef.current = null
    }
    setIsCameraScanning(false)
  }

  // Process Scanned QR
  const handleGateQRScanned = async (scannedCode: string) => {
    await stopCameraScanner()

    const trimmed = scannedCode.trim()

    // Validate QR code against official gym signature
    const isValidGymQR =
      trimmed === OFFICIAL_GYM_GATE_QR ||
      trimmed.includes('CFC-GATE') ||
      trimmed.includes('CFC-GYM') ||
      trimmed.toLowerCase().includes('corpusfitness')

    if (!isValidGymQR) {
      toast.error('Unrecognized QR! Please point camera at the official Corpus Fitness Club Entrance QR on the wall.')
      return
    }

    if (!member) {
      toast.error('Member profile not loaded.')
      return
    }

    // Check duplicate check-in
    if (db.checkDuplicateAttendance(member.id)) {
      toast(
        (t) => (
          <span className="flex items-center gap-2 text-gray-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>You have <strong>ALREADY checked in</strong> today! Enjoy your workout session.</span>
          </span>
        ),
        { duration: 4000 }
      )
      loadMemberData()
      return
    }

    try {
      const rec = db.markAttendance(member.id, 'qr', 'Gym Wall QR (Member Self-Scan)')
      loadMemberData()
      setCheckInSuccess(rec)
      toast.success(`Check-In Verified! Welcome to Corpus Fitness Club, ${member.profile?.full_name?.split(' ')[0]}!`)
    } catch (e: any) {
      toast.error(e.message || 'Check-in failed')
    }
  }

  // 1-Click Simulate Check-In (For desktop testing or when camera is unavailable)
  const handleSimulateScan = () => {
    handleGateQRScanned(OFFICIAL_GYM_GATE_QR)
  }

  // Determine current workout shift
  const currentHour = new Date().getHours()
  const currentShift =
    currentHour >= 5 && currentHour < 12
      ? 'Morning Shift (6:00 AM – 11:00 AM)'
      : 'Evening Shift (5:00 PM – 10:00 PM)'

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-widest">
              CORPUS FITNESS CLUB · AMRAVATI
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#E50914]">
              Gate Access
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display tracking-wider text-[#111111] uppercase mt-1">
            QR CHECK-IN & ATTENDANCE PASS
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Scan the official gym entrance QR code posted at the 3rd floor gate to record your workout entry, or show
            your digital pass to the reception scanner.
          </p>
        </div>

        {/* Today's Status Pill */}
        <div className="shrink-0">
          {todayRecord ? (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Checked In Today: {format(new Date(todayRecord.check_in), 'hh:mm a')}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Workout Entry Pending For Today</span>
            </div>
          )}
        </div>
      </div>

      {/* Mode Tabs: Scan Gym QR vs Show My QR Pass */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => {
            stopCameraScanner()
            setActiveTab('scan_gym_qr')
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'scan_gym_qr'
              ? 'bg-[#E50914] text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Scan Gym Entrance QR (Self Check-In)</span>
        </button>

        <button
          onClick={() => {
            stopCameraScanner()
            setActiveTab('my_qr_pass')
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my_qr_pass'
              ? 'bg-[#E50914] text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Show My Personal Member QR Pass</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Check-In Panel */}
        <div className="lg:col-span-6 space-y-6">
          {activeTab === 'scan_gym_qr' ? (
            /* TAB 1: Scan Gym Entrance QR */
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                    <Camera className="w-5 h-5 text-[#E50914]" />
                    <span>Gym Entrance QR Scanner</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Scan the QR code pasted on the gym entrance wall or desk.
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-[#E50914]">
                  Gate 01 · 3rd Floor
                </span>
              </div>

              {/* Today Check-In Already Done Notification */}
              {todayRecord ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-emerald-950 text-sm">Attendance Marked for Today!</h4>
                  <p className="text-xs text-emerald-800">
                    You checked in at <strong>{format(new Date(todayRecord.check_in), 'hh:mm a')}</strong> via{' '}
                    <span className="underline">{todayRecord.recorded_by}</span>.
                  </p>
                  <p className="text-[11px] text-emerald-700 italic">
                    Have an intense workout! Check-in resets automatically tomorrow morning at 6:00 AM.
                  </p>
                </div>
              ) : null}

              {/* Camera Scanner Viewport */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-[#F8FAFC] text-center overflow-hidden">
                {isCameraScanning ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto max-w-sm rounded-xl overflow-hidden shadow-inner bg-black">
                      <div id="gym-gate-qr-reader" className="w-full" />
                      <div className="absolute inset-x-0 top-0 h-1 bg-[#E50914] animate-pulse pointer-events-none" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={stopCameraScanner}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 text-white text-xs font-bold hover:bg-black transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Stop Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 text-[#E50914] flex items-center justify-center mx-auto shadow-sm">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Point Camera at Gym Entrance QR</h4>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                        Use your mobile rear camera to scan the laminated QR poster on the wall or front counter.
                      </p>
                    </div>

                    {cameraError && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 max-w-md mx-auto text-left flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{cameraError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                      <button
                        onClick={startCameraScanner}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Open Camera to Scan</span>
                      </button>

                      {/* Instant Test Button */}
                      <button
                        onClick={handleSimulateScan}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
                        <span>Quick Check-In (Instant Tap)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shift info note */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E50914]" />
                  <span>Current Shift: <strong>{currentShift}</strong></span>
                </div>
                <span className="font-mono text-[11px] text-gray-400">AMRAVATI · 444604</span>
              </div>
            </div>
          ) : (
            /* TAB 2: Customer Personal QR Pass (For Reception Desk Scan) */
            <div className="bg-white border-2 border-[#E50914] rounded-2xl p-6 sm:p-7 shadow-xl text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 bg-[#111111] text-white py-1.5 text-[10px] font-bold tracking-widest uppercase">
                CORPUS FITNESS CLUB · AMRAVATI
              </div>

              <div className="pt-4 flex flex-col items-center">
                <img
                  src={
                    member?.photo_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={member?.profile?.full_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#E50914] shadow-md mb-2"
                />
                <h3 className="font-bold text-lg text-gray-900">{member?.profile?.full_name}</h3>
                <span className="font-mono text-xs font-bold text-[#E50914]">{member?.member_id}</span>
                <span className="text-[11px] text-gray-500 mt-0.5">
                  Plan: {member?.current_plan?.plan?.name || 'Active Membership'}
                </span>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-2xl inline-block border border-gray-200 shadow-inner">
                <QRCode value={member?.member_id || 'CFC-2026-0001'} size={160} />
              </div>

              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Hold this QR code up to the front desk tablet scanner on the 3rd floor reception if reception is
                checking you in manually.
              </p>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Status: <strong className="text-emerald-600 uppercase font-bold">Active Member</strong></span>
                <span>VMV Road Branch</span>
              </div>
            </div>
          )}

          {/* Quick Guidance Box */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm text-xs text-gray-600 space-y-2">
            <h4 className="font-bold text-[#111111] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>How QR Entry Works at Corpus Fitness Club:</span>
            </h4>
            <ul className="space-y-1 list-disc list-inside text-gray-500">
              <li>Open this page upon reaching the 3rd floor gym gate.</li>
              <li>Tap <strong>"Open Camera to Scan"</strong> and aim at the QR code mounted next to the glass door.</li>
              <li>Your check-in is logged immediately with exact second-precision time.</li>
              <li>Prevents queues at the reception counter during peak morning and evening shifts.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Attendance History & Streak Stats */}
        <div className="lg:col-span-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Workouts</span>
              <div className="text-2xl font-black text-[#111111] mt-1">{attendance.length}</div>
              <span className="text-[10px] text-gray-500">All-time logged</span>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">This Month</span>
              <div className="text-2xl font-black text-[#E50914] mt-1">
                {
                  attendance.filter((a) =>
                    a.check_in.startsWith(format(new Date(), 'yyyy-MM'))
                  ).length
                }
              </div>
              <span className="text-[10px] text-gray-500">Sessions</span>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Consistency</span>
              <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>92%</span>
              </div>
              <span className="text-[10px] text-gray-500">Habit Score</span>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                  Check-In History Log
                </h3>
                <p className="text-[11px] text-gray-400">Past gym session logs and timestamps</p>
              </div>
              <span className="text-xs font-bold text-gray-500">{attendance.length} Sessions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b text-gray-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-In Time</th>
                    <th className="py-3 px-4">Check-In Mode</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {format(new Date(a.check_in), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700">
                        {format(new Date(a.check_in), 'hh:mm a')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {a.recorded_by || 'QR Gate'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Logged
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-400">
                        No attendance logged yet. Scan the gym entrance QR on the wall today!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Check-In Success Modal */}
      <AnimatePresence>
        {checkInSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-sm w-full p-7 border-2 border-emerald-500 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E50914] bg-red-50 px-2.5 py-1 rounded-full">
                CORPUS FITNESS CLUB · AMRAVATI
              </span>

              <h3 className="text-xl font-black text-gray-900 mt-2">Check-In Successful!</h3>

              <p className="text-xs text-gray-500 mt-1">
                Welcome, <strong>{member?.profile?.full_name}</strong> ({member?.member_id})
              </p>

              <div className="my-5 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-In Time:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {format(new Date(checkInSuccess.check_in), 'hh:mm:ss a')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-bold text-gray-900">
                    {format(new Date(checkInSuccess.check_in), 'dd MMMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-bold text-[#E50914]">3rd Floor Gate · VMV Rd</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 italic mb-5">
                "Stay hydrated and push your limits today!"
              </p>

              <button
                onClick={() => setCheckInSuccess(null)}
                className="w-full py-3 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-md"
              >
                Done & Start Workout
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
