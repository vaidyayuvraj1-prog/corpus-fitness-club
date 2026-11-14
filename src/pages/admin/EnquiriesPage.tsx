import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  UserPlus,
  Search,
  MessageCircle,
  X,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { Enquiry } from '@/types/database'
import { GYM_INFO, FITNESS_GOALS } from '@/lib/constants'
import { format } from 'date-fns'

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Enquiry | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'male',
    age: 24,
    interested_plan: 'Half-Yearly Plan',
    fitness_goal: 'Weight Loss & Bulking',
    lead_source: 'Walk-in Visit',
    assigned_staff: 'Coach Rohit Deshmukh',
    notes: '',
  })

  useEffect(() => {
    loadEnquiries()
  }, [])

  function loadEnquiries() {
    setEnquiries(db.getEnquiries())
  }

  // Update Status
  const handleStatusChange = (id: string, newStatus: any) => {
    db.saveEnquiry({ id, status: newStatus })
    toast.success('Lead status updated')
    loadEnquiries()
  }

  // 1-Click Convert to Member (Checks unique email)
  const handleConvertToMember = (enq: Enquiry) => {
    try {
      const newMember = db.convertEnquiryToMember(enq.id)
      if (newMember) {
        toast.success(
          `Converted ${enq.full_name} to Active Member! Assigned ID: ${newMember.member_id}`
        )
        loadEnquiries()
      }
    } catch (err: any) {
      toast.error(err.message || 'Conversion failed')
    }
  }

  // Delete Enquiry
  const handleDeleteEnquiry = () => {
    if (!deleteConfirm) return
    try {
      db.deleteEnquiry(deleteConfirm.id)
      toast.success(`Enquiry lead for "${deleteConfirm.full_name}" deleted successfully!`)
      setDeleteConfirm(null)
      loadEnquiries()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete enquiry')
    }
  }

  // Add Enquiry Submit
  const handleSaveEnquiry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      toast.error('Full name is required')
      return
    }

    try {
      const created = db.saveEnquiry({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        gender: form.gender as any,
        age: Number(form.age),
        interested_plan: form.interested_plan,
        fitness_goal: form.fitness_goal,
        lead_source: form.lead_source,
        assigned_staff: form.assigned_staff,
        notes: form.notes,
      })
      toast.success(`Enquiry registered! Ref: ${created.reference_no}`)
      setShowAddModal(false)
      loadEnquiries()
    } catch {
      toast.error('Failed to save enquiry')
    }
  }

  const filtered = enquiries.filter((e) => {
    const s = search.toLowerCase()
    const matchesSearch =
      e.full_name.toLowerCase().includes(s) ||
      e.reference_no.toLowerCase().includes(s) ||
      e.phone.includes(s)

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            ENQUIRY CRM & LEAD PIPELINE
          </h2>
          <p className="text-xs text-gray-500">
            Track online admissions, walk-ins, follow-up dates, and convert interested prospects into members with 1 click
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              full_name: '',
              phone: '+91 ',
              email: '',
              gender: 'male',
              age: 24,
              interested_plan: 'Half-Yearly Plan',
              fitness_goal: 'Weight Loss & Bulking',
              lead_source: 'Walk-in Visit',
              assigned_staff: 'Coach Rohit Deshmukh',
              notes: '',
            })
            setShowAddModal(true)
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Walk-in Lead
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Leads</span>
          <p className="text-2xl font-extrabold text-[#111111] mt-1">{enquiries.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">New Leads</span>
          <p className="text-2xl font-extrabold text-[#E50914] mt-1">
            {enquiries.filter((e) => e.status === 'new').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Interested / Follow-up</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {enquiries.filter((e) => e.status === 'interested' || e.status === 'contacted').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Converted Members</span>
          <p className="text-2xl font-extrabold text-green-600 mt-1">
            {enquiries.filter((e) => e.status === 'converted').length}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lead by name, phone, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
        >
          <option value="all">All Lead Statuses</option>
          <option value="new">New Inquiries</option>
          <option value="contacted">Contacted</option>
          <option value="interested">Hot Prospects / Interested</option>
          <option value="converted">Converted to Member</option>
          <option value="not_interested">Not Interested</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-gray-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Prospect Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Interested Plan</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((enq) => (
                <tr key={enq.id} className="hover:bg-gray-50/80">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#E50914]">{enq.reference_no}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-gray-900">{enq.full_name}</p>
                    <p className="text-[10px] text-gray-400">{enq.fitness_goal}</p>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <p className="font-semibold">{enq.phone}</p>
                    <p className="text-[10px] text-gray-400">{enq.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{enq.interested_plan}</td>
                  <td className="py-3.5 px-4 text-gray-500">{enq.lead_source}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        enq.status === 'new'
                          ? 'bg-red-50 text-[#E50914] border-red-200'
                          : enq.status === 'converted'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : enq.status === 'interested'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="converted">Converted</option>
                      <option value="not_interested">Not Interested</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(enq.full_name)},%20this%20is%20Corpus%20Fitness%20Club%20Amravati%20following%20up%20on%20your%20enquiry.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-green-600 hover:bg-green-50"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <a
                        href={`tel:${enq.phone}`}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50"
                        title="Call Prospect"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                      {enq.status !== 'converted' && (
                        <button
                          onClick={() => handleConvertToMember(enq)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E50914] text-white text-[10px] font-bold hover:bg-[#B91C1C]"
                          title="Convert to Member"
                        >
                          <UserPlus className="h-3 w-3" /> Convert
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(enq)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No CRM inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD ENQUIRY MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                  Register Walk-in Lead
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEnquiry} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Interested Plan</label>
                    <select
                      value={form.interested_plan}
                      onChange={(e) => setForm({ ...form, interested_plan: e.target.value })}
                      className="input-field"
                    >
                      <option value="Monthly Plan">Monthly Plan</option>
                      <option value="Quarterly Plan">Quarterly Plan</option>
                      <option value="Half-Yearly Plan">Half-Yearly Plan</option>
                      <option value="Yearly Plan">Yearly Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Lead Source</label>
                    <select
                      value={form.lead_source}
                      onChange={(e) => setForm({ ...form, lead_source: e.target.value })}
                      className="input-field"
                    >
                      <option value="Walk-in Visit">Walk-in Visit</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Friend Referral">Friend Referral</option>
                      <option value="Google Search">Google Search</option>
                      <option value="Flyer / Banner">Flyer / Banner</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Notes / Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="Wants morning batch, student discount, etc."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold">
                    Save Lead
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE ENQUIRY CONFIRMATION MODAL ──────────────────────── */}
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
              <h3 className="font-bold text-lg text-gray-900 mb-1">Delete Lead?</h3>
              <p className="text-xs text-gray-600 mb-6">
                Are you sure you want to delete lead enquiry for{' '}
                <strong className="text-gray-900 font-bold">"{deleteConfirm.full_name}"</strong>{' '}
                ({deleteConfirm.reference_no})?
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
                  onClick={handleDeleteEnquiry}
                  className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Yes, Delete Lead
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
