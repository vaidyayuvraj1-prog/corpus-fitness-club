import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  QrCode,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Target,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Copy,
  RefreshCw,
  Key,
  Lock,
  ShieldCheck,
  EyeOff,
  Upload,
  Camera,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { db, generateCorpussEmail, generateCorpussPassword } from '@/lib/db'
import { processImageFile } from '@/lib/imageUpload'
import type { Member, MembershipPlan } from '@/types/database'
import { FITNESS_GOALS, GYM_INFO } from '@/lib/constants'
import { format } from 'date-fns'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [viewMember, setViewMember] = useState<Member | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Member | null>(null)
  const [registeredCredentials, setRegisteredCredentials] = useState<{
    name: string
    member_id: string
    email: string
    password: string
    phone: string
  } | null>(null)

  // Dedicated Credentials View/Reset Modal
  const [credentialsModalMember, setCredentialsModalMember] = useState<Member | null>(null)
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [showModalPassword, setShowModalPassword] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: 'CFC@2026',
    gender: 'male' as 'male' | 'female' | 'other',
    date_of_birth: '1998-05-15',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    fitness_goal: 'Weight Loss & Bulking',
    plan_id: 'half-yearly',
    amount: 3200,
    payment_method: 'UPI',
    status: 'active' as const,
    photo_url: '',
  })

  const memberPhotoInputRef = useRef<HTMLInputElement>(null)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)

  const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingPhoto(true)
    const toastId = toast.loading('Reading & compressing member photo...')

    try {
      const compressed = await processImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
      })
      setFormData((prev) => ({ ...prev, photo_url: compressed }))
      toast.success('Member photo loaded from device gallery!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to process image', { id: toastId })
    } finally {
      setIsProcessingPhoto(false)
      if (memberPhotoInputRef.current) memberPhotoInputRef.current.value = ''
    }
  }

  useEffect(() => {
    loadData()
    const handleSync = () => loadData()
    window.addEventListener('cfc_db_synced', handleSync)
    return () => window.removeEventListener('cfc_db_synced', handleSync)
  }, [])

  function loadData() {
    setMembers(db.getMembers())
    setPlans(db.getPlans())
  }

  // Filter members
  const filtered = members.filter((m) => {
    const s = search.toLowerCase()
    const matchesSearch =
      m.profile?.full_name?.toLowerCase().includes(s) ||
      m.member_id.toLowerCase().includes(s) ||
      m.profile?.phone?.includes(s)

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    const matchesPlan =
      planFilter === 'all' || m.current_plan?.plan_id === planFilter || m.current_plan?.plan?.name === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const paginatedMembers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditMember(null)
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      password: generateCorpussPassword(),
      gender: 'male',
      date_of_birth: '1998-05-15',
      address: 'Harshraj Colony, Amravati',
      emergency_contact: 'Family Member',
      emergency_phone: '',
      fitness_goal: 'Weight Loss & Bulking',
      plan_id: plans[0]?.id || 'half-yearly',
      amount: plans[0]?.price_men || 3200,
      payment_method: 'UPI',
      status: 'active',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    })
    setShowAddModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (m: Member) => {
    setEditMember(m)
    setFormData({
      full_name: m.profile?.full_name || '',
      phone: m.profile?.phone || '',
      email: m.email || m.profile?.email || '',
      password: m.password || 'CFC@2026',
      gender: m.gender,
      date_of_birth: m.date_of_birth,
      address: m.address,
      emergency_contact: m.emergency_contact || '',
      emergency_phone: m.emergency_phone || '',
      fitness_goal: m.fitness_goal,
      plan_id: m.current_plan?.plan_id || plans[0]?.id || '',
      amount: m.current_plan?.amount_paid || 3200,
      payment_method: m.current_plan?.payment_method || 'UPI',
      status: m.status as any,
      photo_url: m.photo_url || '',
    })
    setShowAddModal(true)
  }

  // Reset/Change Member Password Handler
  const handleResetMemberPassword = (newPass: string) => {
    if (!credentialsModalMember || !newPass.trim()) return
    const trimmed = newPass.trim()
    db.saveMember({
      id: credentialsModalMember.id,
      password: trimmed,
    })
    toast.success(`Password updated to "${trimmed}"`)
    loadData()
    setCredentialsModalMember((prev) => (prev ? { ...prev, password: trimmed } : null))
    setNewPasswordInput('')
  }

  // Save Member
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.full_name.trim()) {
      toast.error('Please enter member full name')
      return
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter valid 10-digit phone number')
      return
    }

    // Force @corpuss.com official domain
    let memberEmail = formData.email?.trim().toLowerCase()
    if (!memberEmail) {
      memberEmail = generateCorpussEmail(formData.full_name)
    } else if (!memberEmail.endsWith('@corpuss.com')) {
      const cleanPrefix = memberEmail.split('@')[0].replace(/[^a-z0-9]/g, '.')
      memberEmail = `${cleanPrefix}@corpuss.com`
    }

    const emailCheck = db.isEmailRegistered(memberEmail, editMember?.id)
    if (emailCheck.isRegistered) {
      toast.error(
        `Email "${memberEmail}" is already registered with ${emailCheck.name} (${emailCheck.memberId || 'Staff'}). One email can only be used once!`
      )
      return
    }

    const assignedPassword = formData.password?.trim() || generateCorpussPassword()

    try {
      if (editMember) {
        db.saveMember({
          id: editMember.id,
          full_name: formData.full_name,
          phone: formData.phone,
          email: memberEmail,
          password: assignedPassword,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          emergency_phone: formData.emergency_phone,
          fitness_goal: formData.fitness_goal,
          status: formData.status,
          photo_url: formData.photo_url,
        })
        toast.success(`Member ${formData.full_name} updated successfully!`)
      } else {
        const newM = db.saveMember({
          full_name: formData.full_name,
          phone: formData.phone,
          email: memberEmail,
          password: assignedPassword,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          emergency_phone: formData.emergency_phone,
          fitness_goal: formData.fitness_goal,
          current_plan_id: formData.plan_id,
          status: formData.status,
          photo_url: formData.photo_url,
        })
        toast.success(`Member registered! Assigned ID: ${newM.member_id}`)

        // Trigger Credential Delivery Modal
        setRegisteredCredentials({
          name: formData.full_name,
          member_id: newM.member_id,
          email: memberEmail,
          password: assignedPassword,
          phone: formData.phone,
        })
      }

      loadData()
      setShowAddModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save member')
    }
  }

  // Delete Member
  const handleDeleteMember = () => {
    if (!deleteConfirm) return
    db.deleteMember(deleteConfirm.id)
    toast.success('Member archived/removed')
    setDeleteConfirm(null)
    loadData()
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Member ID', 'Name', 'Phone', 'Email', 'Gender', 'Status', 'Plan', 'Expiry Date']
    const rows = filtered.map((m) => [
      m.member_id,
      m.profile?.full_name || '',
      m.profile?.phone || '',
      m.profile?.email || '',
      m.gender,
      m.status,
      m.current_plan?.plan?.name || 'No Active Plan',
      m.current_plan?.end_date || 'N/A',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `cfc_members_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print ID Card Function
  const handlePrintCard = (m: Member) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CFC Member ID - ${m.profile?.full_name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0f0f0; }
          .id-card { width: 340px; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border: 2px solid #E50914; text-align: center; }
          .header { background: #111111; color: white; padding: 16px; border-bottom: 4px solid #E50914; }
          .header h2 { margin: 0; font-size: 18px; letter-spacing: 1px; }
          .header p { margin: 2px 0 0; font-size: 9px; color: #E50914; font-weight: bold; }
          .photo { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; margin: 16px auto 8px; border: 3px solid #E50914; }
          .name { font-size: 16px; font-weight: bold; color: #111; margin: 0; }
          .id-code { font-size: 12px; font-weight: bold; color: #E50914; margin: 4px 0 12px; font-family: monospace; }
          .details { text-align: left; padding: 0 24px; font-size: 11px; color: #444; line-height: 1.6; }
          .qr { margin: 16px 0; }
          .footer { background: #f8fafc; padding: 8px; font-size: 8px; color: #666; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="id-card">
          <div class="header">
            <h2>CORPUS FITNESS CLUB</h2>
            <p>VMV ROAD, AMRAVATI · OFFICIAL MEMBER PASS</p>
          </div>
          <img src="${m.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" class="photo" />
          <h3 class="name">${m.profile?.full_name}</h3>
          <p class="id-code">${m.member_id}</p>
          <div class="details">
            <div><strong>Plan:</strong> ${m.current_plan?.plan?.name || 'Active Plan'}</div>
            <div><strong>Phone:</strong> ${m.profile?.phone}</div>
            <div><strong>Valid Thru:</strong> ${m.current_plan?.end_date || 'N/A'}</div>
          </div>
          <div class="qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(m.member_id)}" />
          </div>
          <div class="footer">
            Corpus Fitness Club · Contact: +91 76206 83995 · Amravati
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            MEMBER DIRECTORY
          </h2>
          <p className="text-xs text-gray-500">
            Total {members.length} registered members · {members.filter((m) => m.status === 'active').length} active
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add New Member
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID (e.g. CFC-2026), or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#E50914]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#E50914]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="expired">Expired</option>
            <option value="frozen">Frozen</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#E50914]"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-gray-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Member Info</th>
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Phone / Contact</th>
                <th className="py-3.5 px-4">Active Plan</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={m.profile?.full_name}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{m.profile?.full_name}</p>
                        <p className="text-[11px] text-gray-400 capitalize">{m.gender} · {m.fitness_goal}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#E50914]">
                    {m.member_id}
                  </td>

                  <td className="py-3.5 px-4 text-gray-600">
                    <p className="font-semibold text-gray-900">{m.profile?.phone}</p>
                    <p className="text-[10px] text-[#E50914] font-mono font-bold">{m.email || m.profile?.email}</p>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-gray-800">
                    {m.current_plan?.plan?.name || 'Standard Access'}
                  </td>

                  <td className="py-3.5 px-4 text-gray-600 font-medium">
                    {m.current_plan?.end_date ? format(new Date(m.current_plan.end_date), 'dd MMM yyyy') : 'N/A'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        m.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : m.status === 'expired'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {m.status === 'expired' && (
                        <Link
                          to="/admin/memberships"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E50914] text-white text-[10px] font-bold hover:bg-[#B91C1C] shadow-xs mr-1 animate-pulse"
                          title="Renew Expired Membership"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Renew</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setCredentialsModalMember(m)
                          setNewPasswordInput('')
                          setShowModalPassword(false)
                        }}
                        title="View / Reset Login Credentials"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMember(m)}
                        title="View Profile"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrintCard(m)}
                        title="Print ID Card"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#E50914] hover:bg-red-50"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        title="Edit Member"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(m)}
                        title="Delete Member"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-[#111111]">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT MEMBER MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                <div>
                  <h3 className="font-display text-2xl tracking-wider text-[#111111] uppercase">
                    {editMember ? 'Edit Member Profile' : 'Add New Member'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editMember ? `Updating ID: ${editMember.member_id}` : 'Generates automatic CFC ID & creates payment'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-4">
                {/* Photo Upload from Device Gallery */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    ref={memberPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMemberPhotoUpload}
                  />

                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-red-50 border-2 border-[#E50914] flex items-center justify-center shadow-xs">
                      {formData.photo_url ? (
                        <img src={formData.photo_url} alt="Member" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => memberPhotoInputRef.current?.click()}
                      disabled={isProcessingPhoto}
                      className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white cursor-pointer"
                      title="Upload Photo"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Member Photograph (Gallery / Camera)
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Pick photo directly from device gallery — prints on official member ID card.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => memberPhotoInputRef.current?.click()}
                        disabled={isProcessingPhoto}
                        className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-[11px] font-bold text-gray-800 inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#E50914]" />
                        {isProcessingPhoto ? 'Compressing...' : '📁 Choose from Gallery'}
                      </button>
                      {formData.photo_url && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, photo_url: '' }))}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-bold cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.full_name}
                      onChange={(e) => {
                        const name = e.target.value
                        const autoEmail = !editMember ? generateCorpussEmail(name) : formData.email
                        setFormData({ ...formData, full_name: name, email: autoEmail })
                      }}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 94231 55667"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        Official Email (@corpuss.com) *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            email: generateCorpussEmail(formData.full_name || 'member'),
                          })
                        }
                        className="text-[10px] text-[#E50914] font-bold hover:underline cursor-pointer"
                      >
                        Auto-Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul.sharma@corpuss.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      className="input-field font-mono font-bold text-xs"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Personal email nahi chalega. Sirf admin-issued <strong>@corpuss.com</strong> email use hoga.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        Portal Login Password *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            password: generateCorpussPassword(),
                          })
                        }
                        className="text-[10px] text-[#E50914] font-bold hover:underline cursor-pointer"
                      >
                        Auto-Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CFC@7842"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field font-mono font-bold"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Admin yeh password create karke member ko login ke liye dega.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="input-field"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Residential Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Harshraj Colony, VMV Road"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Emergency Contact & Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. Father: 98221 11223"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Fitness Goal</label>
                    <select
                      value={formData.fitness_goal}
                      onChange={(e) => setFormData({ ...formData, fitness_goal: e.target.value })}
                      className="input-field"
                    >
                      {FITNESS_GOALS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Membership Plan</label>
                    <select
                      value={formData.plan_id}
                      onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                      className="input-field"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ₹{formData.gender === 'female' ? p.price_women : p.price_men}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Membership Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="frozen">Frozen (On Hold)</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Method</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="input-field"
                    >
                      <option value="UPI">UPI (GooglePay / PhonePe)</option>
                      <option value="Cash">Cash at Desk</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
                  >
                    {editMember ? 'Update Member' : 'Save & Generate ID Card'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW MEMBER PROFILE & ID CARD MODAL ────────────────── */}
      <AnimatePresence>
        {viewMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <span className="font-display text-xl tracking-wider text-[#111111] uppercase">
                  Member Details & ID Card
                </span>
                <button
                  onClick={() => setViewMember(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ID Card Display */}
              <div className="bg-[#FFFFFF] border-2 border-[#E50914] rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 bg-[#111111] text-white py-2 text-[10px] font-bold tracking-widest uppercase">
                  CORPUS FITNESS CLUB · AMRAVATI
                </div>

                <div className="mt-6 flex flex-col items-center">
                  <img
                    src={viewMember.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={viewMember.profile?.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#E50914] shadow-md mb-3"
                  />
                  <h3 className="text-xl font-bold text-[#111111]">{viewMember.profile?.full_name}</h3>
                  <p className="font-mono text-sm font-bold text-[#E50914]">{viewMember.member_id}</p>
                </div>

                <div className="my-4 py-2 border-y border-gray-100 grid grid-cols-2 gap-2 text-xs text-left">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Plan</span>
                    <span className="font-bold text-gray-800">{viewMember.current_plan?.plan?.name || 'Active Plan'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Valid Until</span>
                    <span className="font-bold text-gray-800">{viewMember.current_plan?.end_date || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Phone</span>
                    <span className="font-bold text-gray-800">{viewMember.profile?.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Goal</span>
                    <span className="font-bold text-gray-800">{viewMember.fitness_goal}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center my-3">
                  <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-xs">
                    <QRCode value={viewMember.member_id} size={110} />
                  </div>
                </div>

                <p className="text-[10px] text-gray-400">
                  Scan this QR at the entrance kiosk to record attendance automatically.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => handlePrintCard(viewMember)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] shadow-sm"
                >
                  <Printer className="h-4 w-4" /> Print Member ID Pass
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Archive Member?</h3>
              <p className="text-xs text-gray-500 mb-6">
                Are you sure you want to remove <strong>{deleteConfirm.profile?.full_name}</strong> ({deleteConfirm.member_id})?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CREDENTIALS SHARE MODAL (SHOWN RIGHT AFTER REGISTRATION) ── */}
      <AnimatePresence>
        {registeredCredentials && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[#111111] uppercase tracking-wide">
                  Member Registered!
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Share these portal login credentials with the new member.
                </p>
              </div>

              {/* Credential Slip Card */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5 text-xs mb-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Member Name</span>
                  <span className="font-bold text-[#111111]">{registeredCredentials.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Member ID</span>
                  <span className="font-mono font-bold text-[#E50914] bg-red-50 px-2 py-0.5 rounded">
                    {registeredCredentials.member_id}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Login Email</span>
                  <span className="font-mono font-bold text-[#111111]">{registeredCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Assigned Password</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {registeredCredentials.password}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-gray-500">Member Portal</span>
                  <span className="text-blue-600 font-semibold">http://localhost:5173/auth/login</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const text = `*CORPUS FITNESS CLUB (CFC) - Member Portal Access*\n\nHello ${registeredCredentials.name},\nWelcome to Corpus Fitness Club, Amravati!\n\nYour Member ID: *${registeredCredentials.member_id}*\nLogin Email: *${registeredCredentials.email}*\nLogin Password: *${registeredCredentials.password}*\n\nLogin to your member dashboard here:\nhttp://localhost:5173/auth/login\n\nFor any help, contact front desk: +91 76206 83995.`
                    const cleanPhone = registeredCredentials.phone.replace(/[^0-9]/g, '')
                    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> Share Credentials via WhatsApp
                </button>

                <button
                  onClick={() => {
                    const text = `CORPUS FITNESS CLUB (CFC)\nMember: ${registeredCredentials.name}\nMember ID: ${registeredCredentials.member_id}\nEmail: ${registeredCredentials.email}\nPassword: ${registeredCredentials.password}\nLogin URL: http://localhost:5173/auth/login`
                    navigator.clipboard.writeText(text)
                    toast.success('Credentials copied to clipboard!')
                  }}
                  className="w-full py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> Copy Login Credentials
                </button>

                <button
                  onClick={() => setRegisteredCredentials(null)}
                  className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
                >
                  Close & Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DEDICATED VIEW / RESET MEMBER CREDENTIALS MODAL ─────────── */}
      <AnimatePresence>
        {credentialsModalMember && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg tracking-wider text-[#111111] uppercase">
                      Member Login Credentials
                    </h3>
                    <p className="text-[11px] text-gray-500">Official @corpuss.com account access</p>
                  </div>
                </div>
                <button
                  onClick={() => setCredentialsModalMember(null)}
                  className="text-gray-400 hover:text-black p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Member Details */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs mb-4">
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Member Name</span>
                  <span className="font-bold text-gray-900">{credentialsModalMember.profile?.full_name}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Member ID</span>
                  <span className="font-mono font-bold text-[#E50914] bg-red-50 px-2 py-0.5 rounded">
                    {credentialsModalMember.member_id}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Official Email</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-900">
                      {credentialsModalMember.email || credentialsModalMember.profile?.email}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credentialsModalMember.email || credentialsModalMember.profile?.email || '')
                        toast.success('Email copied!')
                      }}
                      className="p-1 text-gray-400 hover:text-black"
                      title="Copy Email"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Current Password</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {showModalPassword ? credentialsModalMember.password || 'CFC@2026' : '••••••••'}
                    </span>
                    <button
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="p-1 text-gray-400 hover:text-black"
                      title="Show/Hide Password"
                    >
                      {showModalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credentialsModalMember.password || 'CFC@2026')
                        toast.success('Password copied!')
                      }}
                      className="p-1 text-gray-400 hover:text-black"
                      title="Copy Password"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset Password Form */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 mb-4">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-2">
                  Change / Reset Password:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new password (e.g. CFC@9021)"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput(generateCorpussPassword())}
                    className="px-2 py-1.5 text-[11px] font-bold bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-900"
                    title="Generate Random"
                  >
                    Random
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetMemberPassword(newPasswordInput)}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const text = `*CORPUS FITNESS CLUB (CFC) - Official Portal Credentials*\n\nHello ${credentialsModalMember.profile?.full_name},\nHere are your gym login details:\n\n• Member ID: *${credentialsModalMember.member_id}*\n• Official Email: *${credentialsModalMember.email || credentialsModalMember.profile?.email}*\n• Password: *${credentialsModalMember.password || 'CFC@2026'}*\n\nSign in here: http://localhost:5173/auth/login\n\nFor assistance, contact front desk: +91 76206 83995.`
                    const cleanPhone = (credentialsModalMember.profile?.phone || credentialsModalMember.emergency_phone || '').replace(/[^0-9]/g, '')
                    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Credentials to Member
                </button>

                <button
                  onClick={() => {
                    const text = `CORPUS FITNESS CLUB (CFC)\nMember: ${credentialsModalMember.profile?.full_name}\nMember ID: ${credentialsModalMember.member_id}\nEmail: ${credentialsModalMember.email || credentialsModalMember.profile?.email}\nPassword: ${credentialsModalMember.password || 'CFC@2026'}\nLogin URL: http://localhost:5173/auth/login`
                    navigator.clipboard.writeText(text)
                    toast.success('Credentials copied to clipboard!')
                  }}
                  className="w-full py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Login Details
                </button>

                <button
                  onClick={() => setCredentialsModalMember(null)}
                  className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
