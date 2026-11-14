import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Users,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Copy,
  Lock,
  Sparkles,
  UserCheck,
  UserX,
  History,
  Filter,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Dumbbell,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { Trainer, Member, TrainerAssignment } from '@/types/database'

export default function AdminTrainersPage() {
  const [activeTab, setActiveTab] = useState<'coaches' | 'assignments'>('coaches')
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [assignments, setAssignments] = useState<TrainerAssignment[]>([])

  // Coach Directory search & modals
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Trainer | null>(null)
  const [registeredCredentials, setRegisteredCredentials] = useState<{
    name: string
    email: string
    password: string
    phone: string
    specialization: string
  } | null>(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'CFC@TRN2026',
    specialization: 'Strength Training & Conditioning',
    experience: '5+ Years',
    bio: '',
    photo: '',
  })

  // Assignment Management state
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'with_trainer' | 'without_trainer'>('all')
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('all')
  const [memberSearch, setMemberSearch] = useState('')

  // Assign/Reassign Modal state
  const [assignModalMember, setAssignModalMember] = useState<Member | null>(null)
  const [assignForm, setAssignForm] = useState({
    trainer_id: '',
    pt_package: '1-on-1 Personal Transformation',
    notes: '',
  })

  // Remove Trainer Confirm Modal state
  const [removeTrainerMember, setRemoveTrainerMember] = useState<Member | null>(null)
  const [removeNotes, setRemoveNotes] = useState('Member switched to General Floor Self-Guided training')

  // History Modal state
  const [historyModalMember, setHistoryModalMember] = useState<Member | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setTrainers(db.getTrainers())
    setMembers(db.getMembers())
    setAssignments(db.getTrainerAssignments())
  }

  const handleOpenAdd = () => {
    setEditingTrainer(null)
    const generatedPwd = 'CFC@TRN' + Math.floor(1000 + Math.random() * 9000)
    setForm({
      name: '',
      phone: '+91 76206 83995',
      email: '',
      password: generatedPwd,
      specialization: 'Strength Training & Bodybuilding',
      experience: '4+ Years',
      bio: 'Certified strength and conditioning coach helping members build safe lifting habits.',
      photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (t: Trainer) => {
    setEditingTrainer(t)
    setForm({
      name: t.name,
      phone: t.phone,
      email: t.email,
      password: t.password || 'CFC@TRN2026',
      specialization: t.specialization,
      experience: t.experience,
      bio: t.bio,
      photo: t.photo || '',
    })
    setShowModal(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Trainer name is required')
      return
    }

    let trainerEmail = form.email.trim().toLowerCase()
    if (!trainerEmail) {
      trainerEmail = `${form.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@corpuss.com`
    } else if (!trainerEmail.endsWith('@corpuss.com')) {
      const cleanPrefix = trainerEmail.split('@')[0].replace(/[^a-z0-9]/g, '.')
      trainerEmail = `${cleanPrefix}@corpuss.com`
    }
    const emailCheck = db.isEmailRegistered(trainerEmail, undefined, editingTrainer?.id)
    if (emailCheck.isRegistered) {
      toast.error(
        `Email "${trainerEmail}" is already registered with ${emailCheck.name}. One email can only be used once!`
      )
      return
    }

    try {
      const assignedPassword = form.password || 'CFC@TRN' + Math.floor(1000 + Math.random() * 9000)

      const saved = db.saveTrainer({
        id: editingTrainer?.id,
        name: form.name,
        phone: form.phone,
        email: trainerEmail,
        password: assignedPassword,
        specialization: form.specialization,
        experience: form.experience,
        bio: form.bio,
        photo: form.photo,
      })

      if (editingTrainer) {
        toast.success(`Trainer ${form.name} updated successfully!`)
      } else {
        toast.success(`Coach ${saved.name} registered!`)
        setRegisteredCredentials({
          name: form.name,
          email: trainerEmail,
          password: assignedPassword,
          phone: form.phone,
          specialization: form.specialization,
        })
      }

      setShowModal(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save trainer')
    }
  }

  const handleDeleteTrainer = () => {
    if (!deleteConfirm) return
    try {
      db.deleteTrainer(deleteConfirm.id)
      toast.success(`Coach ${deleteConfirm.name} removed from roster`)
      setDeleteConfirm(null)
      loadData()
    } catch {
      toast.error('Failed to delete trainer')
    }
  }

  // Assign / Change Trainer Handler
  const handleOpenAssignModal = (m: Member) => {
    setAssignModalMember(m)
    setAssignForm({
      trainer_id: m.trainer_id || (trainers[0]?.id || ''),
      pt_package: m.pt_package || '1-on-1 Personal Transformation',
      notes: m.trainer_id ? `Reassigned from ${m.trainer_name || 'previous coach'}` : 'Initial trainer assignment',
    })
  }

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignModalMember || !assignForm.trainer_id) {
      toast.error('Please select a trainer')
      return
    }

    const selectedTrainer = trainers.find((t) => t.id === assignForm.trainer_id)
    if (!selectedTrainer) {
      toast.error('Trainer not found')
      return
    }

    try {
      db.assignTrainer({
        member_id: assignModalMember.id,
        trainer_id: selectedTrainer.id,
        trainer_name: selectedTrainer.name,
        notes: assignForm.notes,
        assigned_by: 'CFC Admin',
        pt_package: assignForm.pt_package,
      })
      toast.success(
        `Coach ${selectedTrainer.name} assigned to ${assignModalMember.profile?.full_name || 'Member'}!`
      )
      setAssignModalMember(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign trainer')
    }
  }

  // Remove Trainer Handler
  const handleConfirmRemoveTrainer = () => {
    if (!removeTrainerMember) return
    try {
      db.removeTrainer(removeTrainerMember.id, removeNotes, 'CFC Admin')
      toast.success(
        `Trainer removed for ${removeTrainerMember.profile?.full_name || 'Member'}. Switched to Self-Guided.`
      )
      setRemoveTrainerMember(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove trainer')
    }
  }

  // Filtered coaches
  const filteredTrainers = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.toLowerCase().includes(search.toLowerCase())
  )

  // Categorize members
  const withTrainerMembers = members.filter(
    (m) => Boolean(m.trainer_id && m.trainer_id !== 'none' && m.trainer_name)
  )
  const withoutTrainerMembers = members.filter(
    (m) => !m.trainer_id || m.trainer_id === 'none' || !m.trainer_name
  )

  // Filter members for Table
  const filteredMembers = members.filter((m) => {
    const hasTrainer = Boolean(m.trainer_id && m.trainer_id !== 'none' && m.trainer_name)

    // Category filter
    if (categoryFilter === 'with_trainer' && !hasTrainer) return false
    if (categoryFilter === 'without_trainer' && hasTrainer) return false

    // Trainer filter
    if (selectedTrainerId !== 'all') {
      if (selectedTrainerId === 'none' && hasTrainer) return false
      if (selectedTrainerId !== 'none' && m.trainer_id !== selectedTrainerId) return false
    }

    // Search filter
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase()
      const matchName = (m.profile?.full_name || '').toLowerCase().includes(q)
      const matchCode = (m.member_id || '').toLowerCase().includes(q)
      const matchTrainer = (m.trainer_name || '').toLowerCase().includes(q)
      const matchPhone = (m.profile?.phone || '').includes(q)
      if (!matchName && !matchCode && !matchTrainer && !matchPhone) return false
    }

    return true
  })

  // Trainer-wise member counts
  const trainerWiseCounts: Record<string, number> = {}
  trainers.forEach((t) => {
    trainerWiseCounts[t.id] = members.filter((m) => m.trainer_id === t.id).length
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            TRAINER & PT MANAGEMENT
          </h2>
          <p className="text-xs text-gray-500">
            Certified floor coach roster, 1-on-1 member assignments, and duty oversight
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'coaches' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Register New Trainer
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('coaches')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'coaches'
              ? 'border-[#E50914] text-[#E50914]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Floor Coaches & Directory ({trainers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'border-[#E50914] text-[#E50914]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Member Trainer Assignment & Roster ({members.length})</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: COACHES DIRECTORY                                             */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'coaches' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trainer by name or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Showing <strong>{filteredTrainers.length}</strong> registered coaches
            </div>
          </div>

          {/* Trainers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTrainers.map((tr) => (
              <div
                key={tr.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={tr.photo || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80'}
                      alt={tr.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute top-3 right-3 bg-[#E50914] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {tr.experience}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-[#111111]">{tr.name}</h3>
                    <p className="text-xs font-bold text-[#E50914] mb-2">{tr.specialization}</p>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-4">{tr.bio}</p>

                    <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span>{tr.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{tr.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-[#E50914]" />
                        <span className="font-bold text-gray-900">
                          {trainerWiseCounts[tr.id] ?? tr.assigned_member_count ?? 0} Trainees Assigned
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(tr)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:border-[#E50914] hover:text-[#E50914] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(tr)}
                    className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Archive / Remove Trainer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: MEMBER TRAINER ASSIGNMENT & ROSTER (PROMPT REQUIREMENT 1)      */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Top KPI Cards: With Trainer vs Without Trainer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Members</span>
              <p className="text-3xl font-extrabold text-[#111111] mt-1">{members.length}</p>
              <span className="text-[11px] text-gray-500 font-medium">Enrolled Gym Members</span>
            </div>

            <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 shadow-sm bg-gradient-to-br from-emerald-50/30 to-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">With Trainer</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {members.length > 0 ? Math.round((withTrainerMembers.length / members.length) * 100) : 0}% Roster
                </span>
              </div>
              <p className="text-3xl font-extrabold text-emerald-700 mt-1">{withTrainerMembers.length}</p>
              <span className="text-[11px] text-gray-500 font-medium">Assigned floor or personal coach</span>
            </div>

            <div className="bg-white border-2 border-amber-500/40 rounded-2xl p-5 shadow-sm bg-gradient-to-br from-amber-50/30 to-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Without Trainer</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {members.length > 0 ? Math.round((withoutTrainerMembers.length / members.length) * 100) : 0}% Roster
                </span>
              </div>
              <p className="text-3xl font-extrabold text-amber-700 mt-1">{withoutTrainerMembers.length}</p>
              <span className="text-[11px] text-gray-500 font-medium">Self-Guided Floor Members</span>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Available Coaches</span>
              <p className="text-3xl font-extrabold text-[#E50914] mt-1">{trainers.length}</p>
              <span className="text-[11px] text-gray-500 font-medium">Floor & PT Staff</span>
            </div>
          </div>

          {/* Trainer-Wise Member Count Badges */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E50914]" /> Coach-Wise Member Allocation
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {trainers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrainerId(selectedTrainerId === t.id ? 'all' : t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                    selectedTrainerId === t.id
                      ? 'bg-[#E50914] text-white border-[#E50914] shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <span>{t.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      selectedTrainerId === t.id ? 'bg-white text-[#E50914]' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {trainerWiseCounts[t.id] ?? 0}
                  </span>
                </button>
              ))}

              <button
                onClick={() => setSelectedTrainerId(selectedTrainerId === 'none' ? 'all' : 'none')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                  selectedTrainerId === 'none'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-amber-50/60 hover:bg-amber-100/60 text-amber-800 border-amber-200'
                }`}
              >
                <span>Self-Guided (No Coach)</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    selectedTrainerId === 'none' ? 'bg-white text-amber-800' : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {withoutTrainerMembers.length}
                </span>
              </button>

              {selectedTrainerId !== 'all' && (
                <button
                  onClick={() => setSelectedTrainerId('all')}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer"
                >
                  Reset Coach Filter
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills & Search Bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Members ({members.length})
              </button>
              <button
                onClick={() => setCategoryFilter('with_trainer')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  categoryFilter === 'with_trainer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>With Trainer ({withTrainerMembers.length})</span>
              </button>
              <button
                onClick={() => setCategoryFilter('without_trainer')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  categoryFilter === 'without_trainer'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Without Trainer ({withoutTrainerMembers.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search member, ID, phone, coach..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Member Info</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Membership Status</th>
                    <th className="py-3.5 px-4">Assigned Floor Coach</th>
                    <th className="py-3.5 px-4">Assignment Date</th>
                    <th className="py-3.5 px-4">PT Package / Goal</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMembers.map((m) => {
                    const hasTrainer = Boolean(m.trainer_id && m.trainer_id !== 'none' && m.trainer_name)
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Member Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                m.photo_url ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                              }
                              alt={m.profile?.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            />
                            <div>
                              <p className="font-bold text-gray-900 text-xs">
                                {m.profile?.full_name || 'Member'}
                              </p>
                              <p className="text-[10px] font-mono text-[#E50914] font-semibold">{m.member_id}</p>
                              <p className="text-[10px] text-gray-400">{m.profile?.phone}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-3.5 px-4">
                          {hasTrainer ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <UserCheck className="w-3 h-3" /> With Trainer
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <UserX className="w-3 h-3" /> Without Trainer
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              m.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>

                        {/* Trainer Name */}
                        <td className="py-3.5 px-4">
                          {hasTrainer ? (
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>{m.trainer_name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">Self-Guided (No Coach)</span>
                          )}
                        </td>

                        {/* Assignment Date */}
                        <td className="py-3.5 px-4 font-mono text-gray-600 text-[11px]">
                          {hasTrainer ? (
                            m.created_at ? m.created_at.slice(0, 10) : '2025-06-10'
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* PT Package */}
                        <td className="py-3.5 px-4 text-gray-700">
                          <span className="font-medium">
                            {m.pt_package || (hasTrainer ? '1-on-1 Transformation' : m.fitness_goal || 'General Fitness')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenAssignModal(m)}
                              className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-[11px] font-bold text-gray-700 hover:border-[#E50914] hover:text-[#E50914] transition-colors cursor-pointer"
                              title={hasTrainer ? 'Change Assigned Trainer' : 'Assign Coach'}
                            >
                              {hasTrainer ? 'Change Coach' : 'Assign Coach'}
                            </button>

                            {hasTrainer && (
                              <button
                                onClick={() => setRemoveTrainerMember(m)}
                                className="px-2 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Remove Trainer (Switch to Without Trainer)"
                              >
                                Remove
                              </button>
                            )}

                            <button
                              onClick={() => setHistoryModalMember(m)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                              title="View Assignment History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredMembers.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No members found matching your category, trainer, or search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ASSIGN / CHANGE TRAINER MODAL                                         */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {assignModalMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                    {assignModalMember.trainer_id ? 'Change Assigned Coach' : 'Assign Floor Coach'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Member: <strong>{assignModalMember.profile?.full_name}</strong> ({assignModalMember.member_id})
                  </p>
                </div>
                <button onClick={() => setAssignModalMember(null)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Select Coach *</label>
                  <select
                    value={assignForm.trainer_id}
                    onChange={(e) => setAssignForm({ ...assignForm, trainer_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">-- Choose Coach from Roster --</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialization}) · {trainerWiseCounts[t.id] ?? 0} active trainees
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Training Program / PT Package
                  </label>
                  <select
                    value={assignForm.pt_package}
                    onChange={(e) => setAssignForm({ ...assignForm, pt_package: e.target.value })}
                    className="input-field"
                  >
                    <option value="1-on-1 Personal Transformation">1-on-1 Personal Transformation</option>
                    <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
                    <option value="Hypertrophy & Muscle Building">Hypertrophy & Muscle Building</option>
                    <option value="Strength & Powerlifting Protocol">Strength & Powerlifting Protocol</option>
                    <option value="General Floor Supervision">General Floor Supervision</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Assignment Notes</label>
                  <textarea
                    rows={2}
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                    placeholder="e.g. Member requested focus on squat depth and hypertrophy split..."
                    className="input-field resize-none"
                  />
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  <strong>Historical preservation:</strong> All previous logged workout sessions and historical
                  trainer logs are securely archived. Reassigning a coach will never delete past data.
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignModalMember(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* REMOVE TRAINER CONFIRMATION MODAL                                    */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {removeTrainerMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <UserX className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#111111]">Remove Assigned Coach?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Remove Coach <strong>{removeTrainerMember.trainer_name}</strong> from member{' '}
                  <strong>{removeTrainerMember.profile?.full_name}</strong>.
                </p>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Reason / Notes</label>
                  <input
                    type="text"
                    value={removeNotes}
                    onChange={(e) => setRemoveNotes(e.target.value)}
                    className="input-field"
                  />
                </div>
                <p className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  Member will be transitioned to <strong>Without Trainer (Self-Guided)</strong>. They will retain
                  full access to Admin Default Workout Plans, Custom Plan creation, and Monthly Fitness Reports.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRemoveTrainerMember(null)}
                  className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemoveTrainer}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Confirm Removal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ASSIGNMENT HISTORY AUDIT MODAL                                       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {historyModalMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-display text-lg tracking-wider text-[#111111] uppercase flex items-center gap-2">
                    <History className="w-5 h-5 text-[#E50914]" /> Coach Assignment History
                  </h3>
                  <p className="text-xs text-gray-500">
                    Member: <strong>{historyModalMember.profile?.full_name}</strong> ({historyModalMember.member_id})
                  </p>
                </div>
                <button onClick={() => setHistoryModalMember(null)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto text-xs pr-1">
                {assignments
                  .filter((a) => a.member_id === historyModalMember.id)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : log.status === 'changed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="font-bold text-gray-900">
                            {log.trainer_name ? `Coach: ${log.trainer_name}` : 'No Coach (Floor Member)'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px]">{log.notes || 'No notes recorded'}</p>
                        {log.previous_trainer_name && (
                          <p className="text-[10px] text-gray-400">
                            Previous Coach: {log.previous_trainer_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-[10px] text-gray-400 font-mono shrink-0">
                        <p>{log.assigned_date}</p>
                        <p className="text-gray-500 font-sans font-semibold">By: {log.assigned_by}</p>
                      </div>
                    </div>
                  ))}

                {assignments.filter((a) => a.member_id === historyModalMember.id).length === 0 && (
                  <div className="p-6 text-center text-gray-400 text-xs">
                    No prior historical assignment changes logged for this member.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setHistoryModalMember(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ADD / EDIT TRAINER PROFILE MODAL                                      */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                    {editingTrainer ? 'Edit Trainer Profile' : 'Register New Coach'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Assign coach floor credentials and coaching specialization
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coach Kunal Wankhade"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98220 12345"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 5+ Years"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Official Login Email (@corpuss.com) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="coach.kunal@corpuss.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="input-field font-mono font-bold text-xs"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Trainer ko official <strong>@corpuss.com</strong> email issue hoga.
                  </p>
                </div>

                {/* Password Input with Auto-Generate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700 uppercase">
                      Portal Login Password *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          password: 'CFC@TRN' + Math.floor(1000 + Math.random() * 9000),
                        })
                      }
                      className="text-[10px] text-[#E50914] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" /> Auto-Generate
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. CFC@TRN2026"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field pl-9 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Strength Training, Hypertrophy, Zumba"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Photo URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={form.photo}
                    onChange={(e) => setForm({ ...form, photo: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Coach Biography</label>
                  <textarea
                    rows={3}
                    placeholder="Certifications, training approach, and fitness philosophy..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
                  >
                    {editingTrainer ? 'Update Coach' : 'Save & Issue Credentials'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* CREDENTIALS SHARE MODAL (SHOWN RIGHT AFTER TRAINER REGISTRATION)      */}
      {/* ────────────────────────────────────────────────────────────────────── */}
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
                  Trainer Registered!
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Share these portal login credentials with the trainer.
                </p>
              </div>

              {/* Credential Slip Card */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5 text-xs mb-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Coach Name</span>
                  <span className="font-bold text-[#111111]">{registeredCredentials.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Official Login Email</span>
                  <span className="font-mono font-bold text-[#E50914]">{registeredCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Password</span>
                  <span className="font-mono font-bold text-gray-900 bg-amber-100 px-2 py-0.5 rounded">
                    {registeredCredentials.password}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Role / Portal</span>
                  <span className="font-bold text-gray-700">Floor Trainer / /trainer</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    const pass = registeredCredentials.password || 'CFC@TRN2026'
                    const text = `🏋️ CORPUS FITNESS CLUB (CFC) — Coach Portal Login\n\nHello Coach ${registeredCredentials.name},\nYour trainer account has been activated:\n\n📧 Login Email: ${registeredCredentials.email}\n🔑 Password: ${pass} (Default: CFC@TRN2026)\n\nPlease log in to access your assigned member roster and workout plans.\nFront Desk: +91 76206 83995.`
                    navigator.clipboard.writeText(text)
                    toast.success('Trainer credentials copied to clipboard!')
                  }}
                  className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Copy className="w-4 h-4" /> Copy Credential Message
                </button>

                <button
                  onClick={() => {
                    const pass = registeredCredentials.password || 'CFC@TRN2026'
                    const msg = encodeURIComponent(
                      `🏋️ CORPUS FITNESS CLUB (CFC) — Coach Portal Login\n\nHello Coach ${registeredCredentials.name},\nYour trainer account has been activated:\n\n📧 Login Email: ${registeredCredentials.email}\n🔑 Password: ${pass} (Default: CFC@TRN2026)\n\nPlease log in to access your assigned member roster and workout plans.\nFront Desk: +91 76206 83995.`
                    )
                    const phoneClean = registeredCredentials.phone.replace(/[^0-9]/g, '')
                    window.open(`https://wa.me/${phoneClean}?text=${msg}`, '_blank')
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Send on WhatsApp
                </button>

                <button
                  onClick={() => setRegisteredCredentials(null)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* DELETE TRAINER CONFIRM MODAL                                          */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Remove Coach {deleteConfirm.name}?</h3>
              <p className="text-xs text-gray-500 mt-1 mb-5">
                This coach will be removed from the active floor roster. Any currently assigned members will be preserved.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border rounded-lg text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTrainer}
                  className="flex-1 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
                >
                  Delete Coach
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
