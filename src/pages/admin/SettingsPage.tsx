import { useState, useRef, useEffect } from 'react'
import {
  Settings,
  Building,
  Phone,
  Clock,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Database,
  QrCode,
  Eye,
  EyeOff,
  Key,
  Download,
  Upload,
  Camera,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { GYM_INFO } from '@/lib/constants'
import { db } from '@/lib/db'
import { useAuth } from '@/hooks/useAuth'
import { processImageFile } from '@/lib/imageUpload'

export default function SettingsPage() {
  const { profile, updateProfile } = useAuth()
  const adminDpInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAdminDp, setIsUploadingAdminDp] = useState(false)
  const [adminName, setAdminName] = useState(profile?.full_name || 'Yuvraj (Club Director)')
  const [adminEmail, setAdminEmail] = useState(profile?.email || 'yuvraj@corpuss.com')
  const [adminPhone, setAdminPhone] = useState(profile?.phone || '+91 76206 83995')
  const [isSavingAdminProfile, setIsSavingAdminProfile] = useState(false)

  // Sync state when profile loads or updates
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setAdminName(profile.full_name)
      if (profile.email) setAdminEmail(profile.email)
      if (profile.phone) setAdminPhone(profile.phone)
    }
  }, [profile])

  const handleAdminDpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAdminDp(true)
    const toastId = toast.loading('Reading & compressing admin photo...')

    try {
      const base64 = await processImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
      })

      if (updateProfile) {
        await updateProfile({ avatar_url: base64 })
      }
      db.saveAdminProfile({ avatar_url: base64 })
      window.dispatchEvent(new CustomEvent('cfc_db_synced'))
      toast.success('Admin DP updated successfully!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to update photo', { id: toastId })
    } finally {
      setIsUploadingAdminDp(false)
      if (adminDpInputRef.current) adminDpInputRef.current.value = ''
    }
  }

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminName.trim()) {
      toast.error('Admin name is required')
      return
    }
    setIsSavingAdminProfile(true)
    const toastId = toast.loading('Saving admin director profile...')
    try {
      const updates = {
        full_name: adminName.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim(),
      }
      db.saveAdminProfile(updates)
      if (updateProfile) {
        await updateProfile(updates)
      }
      window.dispatchEvent(new CustomEvent('cfc_db_synced'))
      toast.success('Admin profile saved permanently across all devices!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to save admin profile', { id: toastId })
    } finally {
      setIsSavingAdminProfile(false)
    }
  }

  const [gymSettings, setGymSettings] = useState({
    name: GYM_INFO.name,
    established: GYM_INFO.established,
    phone: GYM_INFO.phone,
    whatsapp: '917620683995',
    email: GYM_INFO.email,
    address: GYM_INFO.address.full,
    morningHours: '6:00 AM – 11:00 AM',
    eveningHours: '5:00 PM – 10:00 PM',
    currency: '₹ (INR)',
    timezone: 'Asia/Kolkata',
    upiId: 'corpusfitness@sbi',
  })

  // Database Backup & Restore
  const handleExportBackup = () => {
    try {
      const jsonStr = db.exportDatabaseJson()
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cfc_database_backup_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Database backup downloaded successfully!')
    } catch {
      toast.error('Failed to export backup')
    }
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const res = db.importDatabaseJson(text)
        toast.success(`Database restored! (${res.count} tables updated). Reloading...`)
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      } catch (err: any) {
        toast.error(err.message || 'Failed to restore database')
      }
    }
    reader.readAsText(file)
  }

  // Admin Master Password Form State
  const [adminPwdForm, setAdminPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showAdminCurrent, setShowAdminCurrent] = useState(false)
  const [showAdminNew, setShowAdminNew] = useState(false)
  const [showAdminConfirm, setShowAdminConfirm] = useState(false)
  const [isChangingAdminPwd, setIsChangingAdminPwd] = useState(false)

  const handleAdminPasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminPwdForm.newPassword || adminPwdForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (adminPwdForm.newPassword !== adminPwdForm.confirmPassword) {
      toast.error('New password and confirmation do not match')
      return
    }

    try {
      setIsChangingAdminPwd(true)
      const res = db.changeAdminPassword(adminPwdForm.currentPassword, adminPwdForm.newPassword)
      toast.success(res.message)
      setAdminPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to update Admin password')
    } finally {
      setIsChangingAdminPwd(false)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Gym business settings updated successfully!')
  }

  const auditLogs = [
    { time: '10:45 AM Today', action: 'Member Registration', user: 'Admin', details: 'Added Rahul Sharma (CFC-2026-0001)' },
    { time: '10:50 AM Today', action: 'Fee Payment', user: 'Receptionist', details: 'Receipt CFC-REC-2026-0001 (₹5,000)' },
    { time: '09:15 AM Today', action: 'QR Check-in', user: 'Scanner Terminal', details: 'Member CFC-2026-0002 verified' },
    { time: 'Yesterday', action: 'Plan Modified', user: 'Super Admin', details: 'Updated Half-Yearly rates' },
    { time: '2 days ago', action: 'Expense Logged', user: 'Gym Manager', details: 'Electricity bill payment (₹12,400)' },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
          SYSTEM & GYM CONFIGURATION
        </h2>
        <p className="text-xs text-gray-500">
          Manage brand address, operating shifts, UPI payment gateway handles, and audit logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Gym Business Info */}
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-bold text-base text-[#111111] mb-6 flex items-center gap-2">
            <Building className="h-5 w-5 text-[#E50914]" /> Business & Operational Settings
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Business Name</label>
                <input
                  type="text"
                  value={gymSettings.name}
                  onChange={(e) => setGymSettings({ ...gymSettings, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Established Year</label>
                <input
                  type="text"
                  value={gymSettings.established}
                  onChange={(e) => setGymSettings({ ...gymSettings, established: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={gymSettings.phone}
                  onChange={(e) => setGymSettings({ ...gymSettings, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={gymSettings.whatsapp}
                  onChange={(e) => setGymSettings({ ...gymSettings, whatsapp: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 uppercase mb-1">Full Physical Address</label>
                <input
                  type="text"
                  value={gymSettings.address}
                  onChange={(e) => setGymSettings({ ...gymSettings, address: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Morning Shift Timings</label>
                <input
                  type="text"
                  value={gymSettings.morningHours}
                  onChange={(e) => setGymSettings({ ...gymSettings, morningHours: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Evening Shift Timings</label>
                <input
                  type="text"
                  value={gymSettings.eveningHours}
                  onChange={(e) => setGymSettings({ ...gymSettings, eveningHours: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Operating Currency</label>
                <input type="text" disabled value={gymSettings.currency} className="input-field bg-gray-100" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Official UPI VPA Handle</label>
                <input
                  type="text"
                  value={gymSettings.upiId}
                  onChange={(e) => setGymSettings({ ...gymSettings, upiId: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" /> Save Business Profile
              </button>
            </div>
          </form>
        </div>

        {/* Right: Security, Admin Password & Audit Trail */}
        <div className="lg:col-span-4 space-y-6">
          {/* Admin Profile & DP Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#E50914]" /> Director Profile & DP
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#E50914] uppercase">
                {profile?.role || 'Super Admin'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Edit director credentials & profile picture from device gallery — no links required
            </p>

            <input
              ref={adminDpInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAdminDpUpload}
            />

            {/* Photo Avatar Preview & Action */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-red-50 border-2 border-[#E50914] flex items-center justify-center font-bold text-lg text-[#E50914]">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Admin DP" className="w-full h-full object-cover" />
                  ) : adminName ? (
                    adminName[0].toUpperCase()
                  ) : (
                    'A'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => adminDpInputRef.current?.click()}
                  disabled={isUploadingAdminDp}
                  className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white cursor-pointer"
                  title="Upload from Gallery"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-[#111111]">{adminName || 'Corpus Club Director'}</p>
                <p className="text-[10px] text-gray-400">{adminEmail || 'yuvraj@corpuss.com'}</p>
                <button
                  type="button"
                  onClick={() => adminDpInputRef.current?.click()}
                  disabled={isUploadingAdminDp}
                  className="mt-2 px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 text-[11px] font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer border border-gray-300 transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E50914]" />
                  {isUploadingAdminDp ? 'Uploading...' : '📁 Change DP (Device Gallery)'}
                </button>
              </div>
            </div>

            {/* Profile Fields Form */}
            <form onSubmit={handleSaveAdminProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Director / Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Yuvraj (Club Director)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Admin Sign-In Email *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="yuvraj@corpuss.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Director Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="+91 76206 83995"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingAdminProfile}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingAdminProfile ? 'Saving Changes...' : 'Save Admin Profile'}</span>
              </button>
            </form>
          </div>

          {/* Admin Master Password Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#111111] mb-1 flex items-center gap-2">
              <Key className="h-5 w-5 text-[#E50914]" /> Admin Master Password
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Update your administrative portal sign-in password
            </p>

            {/* Current Status Pill */}
            <div className="mb-4 p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-semibold text-[11px]">Password Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                {localStorage.getItem('cfc_admin_password')
                  ? '🔒 Custom Password Active'
                  : '🔑 Default Key (2026@admin)'}
              </span>
            </div>

            <form onSubmit={handleAdminPasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                  Current Admin Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showAdminCurrent ? 'text' : 'password'}
                    value={adminPwdForm.currentPassword}
                    onChange={(e) =>
                      setAdminPwdForm({ ...adminPwdForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminCurrent(!showAdminCurrent)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showAdminCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                  New Admin Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showAdminNew ? 'text' : 'password'}
                    value={adminPwdForm.newPassword}
                    onChange={(e) =>
                      setAdminPwdForm({ ...adminPwdForm, newPassword: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminNew(!showAdminNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showAdminNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showAdminConfirm ? 'text' : 'password'}
                    value={adminPwdForm.confirmPassword}
                    onChange={(e) =>
                      setAdminPwdForm({ ...adminPwdForm, confirmPassword: e.target.value })
                    }
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminConfirm(!showAdminConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showAdminConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingAdminPwd}
                className="w-full py-2.5 rounded-lg bg-[#E50914] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                {isChangingAdminPwd ? 'Updating Master Key...' : 'Update Admin Password'}
              </button>
            </form>
          </div>

          {/* Database Backup & Restore / Port Migration */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#111111] mb-1 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#E50914]" /> Database Backup & Transfer
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Export complete gym records (members, workouts, renewals, payments) or restore onto another browser or port
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Database Backup (.json)</span>
              </button>

              <label className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-300 hover:border-[#E50914] bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-[#E50914] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Restore from Backup File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold">💡 Note on Port & Browser Storage:</p>
                <p>
                  Browser records are stored per URL port (e.g. <code>localhost:5173</code> vs <code>localhost:5174</code>). If you run on 5174 and need your 5173 data, download the backup on 5173 and restore it here in 1 click!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#111111] mb-1 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" /> Security Status
            </h3>
            <p className="text-xs text-gray-400 mb-4">Role-based access & session security</p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-gray-700">
                <span>Database Protection:</span>
                <span className="font-bold text-green-600">Active (Prisma & RLS)</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Password Hashing:</span>
                <span className="font-bold text-green-600">Bcrypt Enabled</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Protected ERP Routes:</span>
                <span className="font-bold text-green-600">Enforced</span>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#111111] mb-1 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#E50914]" /> System Audit Trail
            </h3>
            <p className="text-xs text-gray-400 mb-4">Recent administrative actions</p>

            <div className="space-y-3">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#E50914]">{log.action}</span>
                    <span className="text-[10px] text-gray-400">{log.time}</span>
                  </div>
                  <p className="text-gray-800 text-[11px]">{log.details}</p>
                  <span className="text-[9px] text-gray-400 mt-1 block">By: {log.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
