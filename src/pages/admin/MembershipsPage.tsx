import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Edit2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pause,
  Play,
  XCircle,
  RefreshCw,
  X,
  Search,
  MessageCircle,
  Copy,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  Users,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { MembershipPlan, Member, MembershipRenewalLog } from '@/types/database'
import { format, addMonths, addDays, differenceInDays } from 'date-fns'

export default function MembershipsPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [renewals, setRenewals] = useState<MembershipRenewalLog[]>([])
  const [activeTab, setActiveTab] = useState<'memberships' | 'renewals' | 'plans'>('memberships')
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'expired' | 'expiring_soon' | 'active'>('all')
  const [search, setSearch] = useState('')

  // Plan Edit Modal
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null)
  const [planForm, setPlanForm] = useState({
    name: '',
    duration_months: 1,
    duration_type: '1 Month',
    price_men: 700,
    price_women: 500,
    description: '',
    popular: false,
  })

  // Full Renewal Modal for Expired Members
  const [renewalMember, setRenewalMember] = useState<Member | null>(null)
  const [renewalForm, setRenewalForm] = useState({
    plan_id: '',
    renewal_date: format(new Date(), 'yyyy-MM-dd'), // Exact date customer renewed!
    new_start_date: format(new Date(), 'yyyy-MM-dd'),
    duration_months: 1,
    amount_paid: 1500,
    discount_amount: 0,
    payment_method: 'UPI',
    processed_by: 'Gym Admin (CFC)',
    notes: '',
  })

  // Post-Renewal WhatsApp Confirmation Modal
  const [lastCompletedRenewal, setLastCompletedRenewal] = useState<{
    member: Member
    renewal: MembershipRenewalLog
  } | null>(null)

  // Quick Action Modal (Extend / Pause / Cancel)
  const [actionMember, setActionMember] = useState<Member | null>(null)
  const [actionType, setActionType] = useState<'extend' | 'pause' | 'cancel' | null>(null)
  const [extendDays, setExtendDays] = useState(30)

  // Universal Deletion States
  const [deletePlanConfirm, setDeletePlanConfirm] = useState<MembershipPlan | null>(null)
  const [deleteRenewalConfirm, setDeleteRenewalConfirm] = useState<MembershipRenewalLog | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setPlans(db.getPlans())
    setMembers(db.getMembers())
    setRenewals(db.getRenewals())
  }

  // Open Plan Modal
  const handleOpenPlanModal = (plan?: MembershipPlan) => {
    if (plan) {
      setEditingPlan(plan)
      setPlanForm({
        name: plan.name,
        duration_months: plan.duration_months,
        duration_type: plan.duration_type,
        price_men: plan.price_men,
        price_women: plan.price_women,
        description: plan.description,
        popular: !!plan.popular,
      })
    } else {
      setEditingPlan(null)
      setPlanForm({
        name: '',
        duration_months: 1,
        duration_type: '1 Month',
        price_men: 700,
        price_women: 500,
        description: '',
        popular: false,
      })
    }
    setShowPlanModal(true)
  }

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault()
    db.savePlan({
      id: editingPlan?.id,
      ...planForm,
    })
    toast.success(editingPlan ? 'Plan updated successfully' : 'Custom Plan created')
    setShowPlanModal(false)
    loadData()
  }

  // Delete Plan Handler
  const handleDeletePlan = () => {
    if (!deletePlanConfirm) return
    try {
      db.deletePlan(deletePlanConfirm.id)
      toast.success(`Plan "${deletePlanConfirm.name}" deleted successfully!`)
      setDeletePlanConfirm(null)
      setShowPlanModal(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete plan')
    }
  }

  // Delete Renewal Log Handler
  const handleDeleteRenewal = () => {
    if (!deleteRenewalConfirm) return
    try {
      db.deleteRenewal(deleteRenewalConfirm.id)
      toast.success(`Renewal log for ${deleteRenewalConfirm.member_name} deleted!`)
      setDeleteRenewalConfirm(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete renewal')
    }
  }

  // Open Renewal Modal for an Expired or Active Member
  const handleOpenRenewal = (m: Member) => {
    setRenewalMember(m)
    const currentPlan = plans.find((p) => p.id === m.current_plan?.plan_id) || plans[0]
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const price = currentPlan ? currentPlan.price_men : 1500

    setRenewalForm({
      plan_id: currentPlan ? currentPlan.id : (plans[0]?.id || ''),
      renewal_date: todayStr,
      new_start_date: todayStr,
      duration_months: currentPlan ? currentPlan.duration_months : 1,
      amount_paid: price,
      discount_amount: 0,
      payment_method: 'UPI',
      processed_by: 'Gym Admin (CFC)',
      notes: `Membership renewed for ${m.profile?.full_name}`,
    })
  }

  // Execute Renewal
  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!renewalMember) return

    try {
      const selectedPlan = plans.find((p) => p.id === renewalForm.plan_id) || plans[0]

      const res = db.renewMember({
        member_id: renewalMember.id,
        plan_id: renewalForm.plan_id,
        renewal_date: renewalForm.renewal_date, // Kab customer ne renew kiya!
        new_start_date: renewalForm.new_start_date,
        duration_months: selectedPlan.duration_months,
        amount_paid: Number(renewalForm.amount_paid),
        discount_amount: Number(renewalForm.discount_amount),
        payment_method: renewalForm.payment_method,
        processed_by: renewalForm.processed_by,
        notes: renewalForm.notes,
      })

      loadData()
      setRenewalMember(null)
      setLastCompletedRenewal({ member: res.member, renewal: res.renewal })
      toast.success(`Membership renewed successfully! Status is now ACTIVE.`)
    } catch (err: any) {
      toast.error(err.message || 'Renewal failed')
    }
  }

  // Other Actions (Extend, Pause, Cancel)
  const handleExecuteQuickAction = () => {
    if (!actionMember) return
    try {
      if (actionType === 'extend') {
        const curEnd = actionMember.current_plan?.end_date
          ? new Date(actionMember.current_plan.end_date)
          : new Date()
        const newEnd = addDays(curEnd, extendDays)
        db.saveMember({
          id: actionMember.id,
          status: 'active',
          current_plan: actionMember.current_plan
            ? { ...actionMember.current_plan, end_date: format(newEnd, 'yyyy-MM-dd') }
            : undefined,
        })
        toast.success(`Extended by ${extendDays} days until ${format(newEnd, 'dd MMM yyyy')}`)
      } else if (actionType === 'pause') {
        db.saveMember({ id: actionMember.id, status: 'frozen' })
        toast.success(`Membership placed on hold for ${actionMember.profile?.full_name}`)
      } else if (actionType === 'cancel') {
        db.saveMember({ id: actionMember.id, status: 'cancelled' })
        toast.success(`Membership cancelled for ${actionMember.profile?.full_name}`)
      }
      loadData()
      setActionMember(null)
      setActionType(null)
    } catch {
      toast.error('Action failed')
    }
  }

  // WhatsApp formatted renewal confirmation slip generator
  const getRenewalWhatsAppText = (r: MembershipRenewalLog, m: Member) => {
    return `🎉 *MEMBERSHIP RENEWED - CORPUS FITNESS CLUB (CFC)*\n📍 3rd Floor, Above SBI, Harshraj Colony, VMV Road, Amravati\n\nDear *${r.member_name}* (${r.member_code}),\nYour gym membership has been renewed successfully!\n\n━━━━━━━━━━━━━━━━━━━━\n📅 *Renewal Date:* ${format(new Date(r.renewal_date), 'dd MMMM yyyy')}\n🏋️ *Plan Renewed:* ${r.renewed_plan_name}\n⏳ *New Valid Period:* ${format(new Date(r.new_start_date), 'dd MMM yyyy')} to ${format(new Date(r.new_expiry_date), 'dd MMM yyyy')}\n💰 *Amount Paid:* ₹${r.amount_paid.toLocaleString('en-IN')} (${r.payment_method})\n🧾 *Tax Receipt No:* ${r.receipt_number}\n— Processed by ${r.processed_by}\n━━━━━━━━━━━━━━━━━━━━\n⏰ *Shift Timings:* Mon–Sat 6:00 AM–11:00 AM | 5:00 PM–10:00 PM\n📞 *WhatsApp Helpline:* +91 76206 83995\nKeep training hard and crush your fitness goals!`
  }

  const handleShareRenewalWhatsApp = (r: MembershipRenewalLog, m: Member) => {
    const text = encodeURIComponent(getRenewalWhatsAppText(r, m))
    const phone = m.profile?.phone?.replace(/\D/g, '') || ''
    const url = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`
    window.open(url, '_blank')
  }

  const handleCopyRenewalText = (r: MembershipRenewalLog, m: Member) => {
    navigator.clipboard.writeText(getRenewalWhatsAppText(r, m))
    toast.success('Renewal slip copied to clipboard!')
  }

  // Expired members calculation
  const expiredMembers = members.filter((m) => m.status === 'expired')
  const expiringSoonMembers = members.filter((m) => {
    if (!m.current_plan?.end_date) return false
    const diff = differenceInDays(new Date(m.current_plan.end_date), new Date())
    return diff >= 0 && diff <= 10
  })

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.member_id.toLowerCase().includes(search.toLowerCase()) ||
      (m.current_plan?.plan?.name && m.current_plan.plan.name.toLowerCase().includes(search.toLowerCase()))

    if (!matchesSearch) return false

    if (subscriptionFilter === 'expired') return m.status === 'expired'
    if (subscriptionFilter === 'expiring_soon') {
      if (!m.current_plan?.end_date) return false
      const diff = differenceInDays(new Date(m.current_plan.end_date), new Date())
      return diff >= 0 && diff <= 10
    }
    if (subscriptionFilter === 'active') return m.status === 'active'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
              MEMBERSHIP & RENEWAL MANAGEMENT
            </h2>
            {expiredMembers.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#E50914] animate-pulse">
                {expiredMembers.length} Expired Need Renewal
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Track expiry dates, process membership renewals, record renewal dates, and view complete renewal history logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => setActiveTab('memberships')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'memberships' ? 'bg-[#E50914] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Subscriptions & Renewals ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('renewals')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'renewals' ? 'bg-[#E50914] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Renewal Log (Kab Renew Kiya) ({renewals.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'plans' ? 'bg-[#E50914] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Plans ({plans.length})
            </button>
          </div>

          <button
            onClick={() => handleOpenPlanModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 text-[#E50914]" /> + New Plan
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Active Memberships</span>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {members.filter((m) => m.status === 'active').length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Access verified via QR</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">Expired Customers</span>
          <div className="text-2xl font-black text-[#E50914] mt-2">{expiredMembers.length}</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Needs renewal to reactivate</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Expiring in 10 Days</span>
          <div className="text-2xl font-black text-amber-600 mt-2">{expiringSoonMembers.length}</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Follow up for early renewal</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Total Renewals Logged</span>
          <div className="text-2xl font-black text-blue-600 mt-2">{renewals.length}</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Complete audit history</span>
        </div>
      </div>

      {/* ── TAB 1: SUBSCRIPTIONS & RENEWAL DESK ───────────────────────── */}
      {activeTab === 'memberships' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Filter:</span>
              {[
                { id: 'all', label: `All (${members.length})` },
                { id: 'expired', label: `⚠️ Expired Only (${expiredMembers.length})`, badge: true },
                { id: 'expiring_soon', label: `⏰ Expiring Soon (${expiringSoonMembers.length})` },
                { id: 'active', label: 'Active Members' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSubscriptionFilter(f.id as typeof subscriptionFilter)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    subscriptionFilter === f.id
                      ? f.id === 'expired'
                        ? 'bg-[#E50914] text-white shadow-xs'
                        : 'bg-[#111111] text-white shadow-xs'
                      : f.id === 'expired'
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b text-gray-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member Info</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Subscribed Plan</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Renewal & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((m) => {
                  const isExpired = m.status === 'expired'
                  const diffDays = m.current_plan?.end_date
                    ? differenceInDays(new Date(m.current_plan.end_date), new Date())
                    : -1

                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors ${
                        isExpired ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              m.photo_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">{m.profile?.full_name}</span>
                            <span className="text-[11px] text-gray-500">{m.profile?.phone || 'No Phone'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-[#E50914]">{m.member_id}</td>

                      <td className="py-3 px-4 text-gray-700 font-semibold">
                        {m.current_plan?.plan?.name || 'Standard Plan'}
                      </td>

                      <td className="py-3 px-4 text-gray-500">
                        {m.current_plan?.start_date
                          ? format(new Date(m.current_plan.start_date), 'dd MMM yyyy')
                          : m.registration_date}
                      </td>

                      <td className="py-3 px-4">
                        {m.current_plan?.end_date ? (
                          <div>
                            <span
                              className={`font-bold block ${
                                isExpired ? 'text-red-600' : diffDays <= 7 ? 'text-amber-600' : 'text-gray-900'
                              }`}
                            >
                              {format(new Date(m.current_plan.end_date), 'dd MMM yyyy')}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {isExpired ? 'Expired' : `${diffDays} days left`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isExpired
                              ? 'bg-red-600 text-white animate-pulse'
                              : m.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'frozen'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PRIMARY RENEWAL BUTTON */}
                          <button
                            onClick={() => handleOpenRenewal(m)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                              isExpired
                                ? 'bg-[#E50914] hover:bg-[#B91C1C] text-white animate-bounce'
                                : 'bg-[#111111] hover:bg-black text-white'
                            }`}
                            title="Renew Membership Plan"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{isExpired ? 'Renew Now' : 'Renew'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setActionMember(m)
                              setActionType('extend')
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                            title="Extend Expiry by Days"
                          >
                            Extend
                          </button>

                          <button
                            onClick={() => {
                              setActionMember(m)
                              setActionType('pause')
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                            title="Put on Hold / Freeze"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No members matched this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: RENEWAL HISTORY LOG ("KAB RENEW KIYA") ───────────── */}
      {activeTab === 'renewals' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden space-y-4">
          <div className="p-5 sm:p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#111111] uppercase tracking-wider">
                  Customer Renewal History Log
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {renewals.length} Recorded Renewals
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Detailed audit trail of exactly when each customer renewed, previous plan vs renewed plan, validity
                extensions, payment modes, and receipt numbers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b text-gray-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member Name & ID</th>
                  <th className="py-3 px-4 text-[#E50914]">Renewal Date (Kab Renew Kiya)</th>
                  <th className="py-3 px-4">Previous Plan</th>
                  <th className="py-3 px-4">Renewed Plan</th>
                  <th className="py-3 px-4">Extended Validity</th>
                  <th className="py-3 px-4">Amount & Mode</th>
                  <th className="py-3 px-4">Tax Receipt</th>
                  <th className="py-3 px-4 text-right">WhatsApp Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {renewals.map((r) => {
                  const m = members.find((mem) => mem.id === r.member_id)

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">{r.member_name}</span>
                        <span className="font-mono text-[11px] text-[#E50914] font-bold">{r.member_code}</span>
                      </td>

                      {/* EXACT RENEWAL DATE */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#E50914] font-bold text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(r.renewal_date), 'dd MMMM yyyy')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          By: {r.processed_by || 'Admin'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500">
                        <span>{r.previous_plan_name}</span>
                        <span className="text-[10px] text-gray-400 block">
                          Expired: {format(new Date(r.previous_expiry_date), 'dd MMM yyyy')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900">{r.renewed_plan_name}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="text-gray-500">{format(new Date(r.new_start_date), 'dd MMM yy')}</span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className="font-bold text-emerald-700">
                            {format(new Date(r.new_expiry_date), 'dd MMM yy')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">
                          ₹{r.amount_paid.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase">{r.payment_method}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700 text-[11px]">
                        {r.receipt_number}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => m && handleShareRenewalWhatsApp(r, m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white text-[11px] font-bold transition-colors shadow-xs"
                            title="Resend WhatsApp Confirmation Slip"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => m && handleCopyRenewalText(r, m)}
                            className="p-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100"
                            title="Copy Slip Text"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteRenewalConfirm(r)}
                            className="p-1 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Renewal Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {renewals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No renewals processed yet. Click "Renew" on any expired member above to create a renewal log!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: MEMBERSHIP PLANS ──────────────────────────────────── */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative ${
                plan.popular ? 'border-[#E50914] ring-2 ring-[#E50914]/20' : 'border-[#E5E7EB]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E50914] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  MOST POPULAR
                </div>
              )}

              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-2xl tracking-wider text-[#111111]">{plan.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenPlanModal(plan)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#E50914] hover:bg-red-50"
                      title="Edit Plan"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletePlanConfirm(plan)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{plan.description}</p>

                <div className="my-5 py-4 border-y border-gray-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#111111]">
                      ₹{plan.price_men.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-500">/ {plan.duration_type}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Women Rate: <strong className="text-gray-800">₹{plan.price_women.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#E50914]" />
                    <span>Duration: {plan.duration_months} Month(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#E50914]" />
                    <span>Free Locker & Shower Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#E50914]" />
                    <span>Digital QR Gate Attendance</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenPlanModal(plan)}
                className="mt-6 w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition-colors"
              >
                Edit Plan Rates
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── EXPIRY RENEWAL MODAL (WHEN CUSTOMER RENEWED) ──────────────── */}
      <AnimatePresence>
        {renewalMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E50914] text-white flex items-center justify-center shadow-md">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 uppercase">Process Membership Renewal</h3>
                    <p className="text-xs text-gray-500">Record customer payment date and extend validity period</p>
                  </div>
                </div>
                <button
                  onClick={() => setRenewalMember(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmRenewal} className="p-6 space-y-4 overflow-y-auto">
                {/* Member Info Card */}
                <div className="p-3.5 rounded-2xl border border-red-200 bg-red-50/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block">
                      Target Customer
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{renewalMember.profile?.full_name}</h4>
                    <span className="font-mono text-xs text-[#E50914] font-bold">{renewalMember.member_id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase block">Previous Status</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600 text-white">
                      {renewalMember.status}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      Exp: {renewalMember.current_plan?.end_date || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* EXACT RENEWAL DATE ("Kab renew kiya") */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Renewal Date (Kab Customer Ne Renew Kiya) *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={renewalForm.renewal_date}
                      onChange={(e) => {
                        const newRenDate = e.target.value
                        setRenewalForm({
                          ...renewalForm,
                          renewal_date: newRenDate,
                          new_start_date: newRenDate,
                        })
                      }}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    You can set today's date or backdate to the exact day the customer made payment.
                  </span>
                </div>

                {/* Plan Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Select Membership Plan To Renew *
                  </label>
                  <select
                    value={renewalForm.plan_id}
                    onChange={(e) => {
                      const selected = plans.find((p) => p.id === e.target.value)
                      if (selected) {
                        setRenewalForm({
                          ...renewalForm,
                          plan_id: selected.id,
                          duration_months: selected.duration_months,
                          amount_paid: selected.price_men,
                        })
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-white font-semibold"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.duration_type}) — ₹{p.price_men.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto Calculated Expiry Preview */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">New Start Date</span>
                    <span className="font-bold text-gray-800">
                      {format(new Date(renewalForm.new_start_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="text-right">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">New Expiry Date</span>
                    <span className="font-bold text-emerald-600">
                      {format(
                        addMonths(new Date(renewalForm.new_start_date), renewalForm.duration_months),
                        'dd MMM yyyy'
                      )}
                    </span>
                  </div>
                </div>

                {/* Payment Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Amount Paid (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={renewalForm.amount_paid}
                      onChange={(e) => setRenewalForm({ ...renewalForm, amount_paid: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={renewalForm.discount_amount}
                      onChange={(e) => setRenewalForm({ ...renewalForm, discount_amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={renewalForm.payment_method}
                      onChange={(e) => setRenewalForm({ ...renewalForm, payment_method: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-white"
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash at Reception</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Processed By
                    </label>
                    <input
                      type="text"
                      value={renewalForm.processed_by}
                      onChange={(e) => setRenewalForm({ ...renewalForm, processed_by: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Notes / Remarks
                  </label>
                  <input
                    type="text"
                    value={renewalForm.notes}
                    onChange={(e) => setRenewalForm({ ...renewalForm, notes: e.target.value })}
                    placeholder="e.g. Renewed after 5 days expiry; UPI Ref 928371"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRenewalMember(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-md transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Confirm & Save Renewal</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── POST-RENEWAL WHATSAPP CONFIRMATION MODAL ─────────────────── */}
      <AnimatePresence>
        {lastCompletedRenewal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E50914] bg-red-50 px-2.5 py-1 rounded-full">
                CORPUS FITNESS CLUB · AMRAVATI
              </span>

              <h3 className="text-xl font-black text-gray-900 mt-2">Renewal Confirmed!</h3>
              <p className="text-xs text-gray-500 mt-1">
                <strong>{lastCompletedRenewal.member.profile?.full_name}</strong> is now{' '}
                <span className="text-emerald-600 font-bold uppercase">Active</span> until{' '}
                <strong>
                  {format(new Date(lastCompletedRenewal.renewal.new_expiry_date), 'dd MMMM yyyy')}
                </strong>
                .
              </p>

              {/* Renewal Slip Details */}
              <div className="my-5 p-4 rounded-2xl bg-[#F8FAFC] border border-gray-200 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Renewal Date:</span>
                  <span className="font-bold text-gray-900">
                    {format(new Date(lastCompletedRenewal.renewal.renewal_date), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Receipt No:</span>
                  <span className="font-mono font-bold text-[#E50914]">
                    {lastCompletedRenewal.renewal.receipt_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-bold text-gray-900">
                    ₹{lastCompletedRenewal.renewal.amount_paid.toLocaleString('en-IN')} (
                    {lastCompletedRenewal.renewal.payment_method})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    handleShareRenewalWhatsApp(lastCompletedRenewal.renewal, lastCompletedRenewal.member)
                  }
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Renewal Slip via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyRenewalText(lastCompletedRenewal.renewal, lastCompletedRenewal.member)
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Slip Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLastCompletedRenewal(null)}
                  className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-900"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── QUICK ACTION MODAL (EXTEND / PAUSE / CANCEL) ──────────────── */}
      <AnimatePresence>
        {actionMember && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center"
            >
              <h3 className="font-bold text-lg text-gray-900 mb-2 uppercase">
                {actionType === 'extend' && 'Extend Expiry Date'}
                {actionType === 'pause' && 'Put on Hold / Freeze'}
                {actionType === 'cancel' && 'Cancel Membership'}
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Target: <strong>{actionMember.profile?.full_name}</strong> ({actionMember.member_id})
              </p>

              {actionType === 'extend' && (
                <div className="mb-4 text-left">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Add Number of Days</label>
                  <input
                    type="number"
                    min={1}
                    value={extendDays}
                    onChange={(e) => setExtendDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActionMember(null)
                    setActionType(null)
                  }}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteQuickAction}
                  className="flex-1 py-2 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PLAN EDIT / CREATE MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {showPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900 uppercase">
                  {editingPlan ? 'Edit Membership Plan' : 'Create Custom Plan'}
                </h3>
                <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="e.g. Quarterly Plan"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#E50914] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={planForm.duration_months}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          duration_months: Number(e.target.value),
                          duration_type: `${e.target.value} Month(s)`,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#E50914] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Duration Label</label>
                    <input
                      type="text"
                      required
                      value={planForm.duration_type}
                      onChange={(e) => setPlanForm({ ...planForm, duration_type: e.target.value })}
                      placeholder="e.g. 3 Months"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#E50914] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price Men (₹) *</label>
                    <input
                      type="number"
                      required
                      value={planForm.price_men}
                      onChange={(e) => setPlanForm({ ...planForm, price_men: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#E50914] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price Women (₹) *</label>
                    <input
                      type="number"
                      required
                      value={planForm.price_women}
                      onChange={(e) => setPlanForm({ ...planForm, price_women: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#E50914] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#E50914] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={planForm.popular}
                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                    className="rounded text-[#E50914]"
                  />
                  <label htmlFor="popular" className="text-xs text-gray-700 font-bold">
                    Mark as Popular Plan
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {editingPlan ? (
                    <button
                      type="button"
                      onClick={() => setDeletePlanConfirm(editingPlan)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Plan</span>
                    </button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPlanModal(false)}
                      className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#E50914] text-white rounded-xl text-xs font-bold hover:bg-[#B91C1C] shadow-md"
                    >
                      Save Plan
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PLAN DELETE CONFIRMATION MODAL ───────────────────────────── */}
      <AnimatePresence>
        {deletePlanConfirm && (
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
              <h3 className="font-bold text-lg text-gray-900 mb-1">Delete Plan?</h3>
              <p className="text-xs text-gray-600 mb-6">
                Are you sure you want to permanently delete{' '}
                <strong className="text-gray-900 font-bold">"{deletePlanConfirm.name}"</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletePlanConfirm(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePlan}
                  className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Yes, Delete Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── RENEWAL RECORD DELETE CONFIRMATION MODAL ────────────────── */}
      <AnimatePresence>
        {deleteRenewalConfirm && (
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
              <h3 className="font-bold text-lg text-gray-900 mb-1">Delete Renewal Log?</h3>
              <p className="text-xs text-gray-600 mb-6">
                Delete renewal entry for{' '}
                <strong className="text-gray-900 font-bold">{deleteRenewalConfirm.member_name}</strong>{' '}
                (Receipt: {deleteRenewalConfirm.receipt_number})?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteRenewalConfirm(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRenewal}
                  className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Yes, Delete Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
