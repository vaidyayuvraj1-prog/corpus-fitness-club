import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  Plus,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  X,
  FileText,
  User,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { Payment, Member } from '@/types/database'
import { PAYMENT_METHODS, GYM_INFO } from '@/lib/constants'
import { format } from 'date-fns'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewReceipt, setViewReceipt] = useState<Payment | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Payment | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    member_id: '',
    amount: 3200,
    total_amount: 3200,
    pending_amount: 0,
    discount_amount: 0,
    payment_method: 'UPI' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other',
    transaction_ref: '',
    status: 'paid' as 'paid' | 'partial' | 'pending' | 'refunded',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setPayments(db.getPayments())
    setMembers(db.getMembers())
  }

  // Summary Metrics
  const totalRevenue = payments
    .filter((p) => p.status === 'paid' || p.status === 'partial')
    .reduce((sum, p) => sum + p.amount, 0)

  const upiTotal = payments
    .filter((p) => p.payment_method === 'UPI' && (p.status === 'paid' || p.status === 'partial'))
    .reduce((sum, p) => sum + p.amount, 0)

  const cashTotal = payments
    .filter((p) => p.payment_method === 'Cash' && (p.status === 'paid' || p.status === 'partial'))
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingTotal = payments
    .reduce((sum, p) => sum + (p.pending_amount || 0), 0)

  // Filtered Payments
  const filtered = payments.filter((p) => {
    const s = search.toLowerCase()
    const matchesSearch =
      p.receipt_number.toLowerCase().includes(s) ||
      p.member?.profile?.full_name?.toLowerCase().includes(s) ||
      p.member?.member_id?.toLowerCase().includes(s) ||
      p.member?.profile?.phone?.includes(s)

    const matchesMethod = methodFilter === 'All' || p.payment_method === methodFilter
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter

    return matchesSearch && matchesMethod && matchesStatus
  })

  // Open Add Modal
  const handleOpenAdd = () => {
    const firstMem = members[0]
    const planPrice = firstMem?.current_plan?.amount_paid || 3200
    setFormData({
      member_id: firstMem?.id || '',
      amount: planPrice,
      total_amount: planPrice,
      pending_amount: 0,
      discount_amount: 0,
      payment_method: 'UPI',
      transaction_ref: '',
      status: 'paid',
      notes: 'Full fee paid',
    })
    setShowAddModal(true)
  }

  // Save Payment Entry
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.member_id) {
      toast.error('Please select a member')
      return
    }
    if (formData.amount <= 0) {
      toast.error('Payment amount must be greater than 0')
      return
    }

    try {
      const saved = db.savePayment({
        member_id: formData.member_id,
        amount: Number(formData.amount),
        total_amount: Number(formData.total_amount),
        pending_amount: Number(formData.pending_amount),
        discount_amount: Number(formData.discount_amount),
        payment_method: formData.payment_method,
        transaction_ref: formData.transaction_ref || null,
        status: formData.status,
        notes: formData.notes,
      })

      toast.success(`Payment recorded! Receipt: ${saved.receipt_number}`)
      setShowAddModal(false)
      loadData()
      setViewReceipt(saved)
    } catch {
      toast.error('Failed to record payment')
    }
  }

  // Delete / Void Payment Record
  const handleDeletePayment = () => {
    if (!deleteConfirm) return
    try {
      db.deletePayment(deleteConfirm.id)
      toast.success(`Payment receipt "${deleteConfirm.receipt_number}" removed successfully!`)
      setDeleteConfirm(null)
      if (viewReceipt?.id === deleteConfirm.id) {
        setViewReceipt(null)
      }
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete payment record')
    }
  }

  // Print Receipt
  const handlePrintReceipt = (p: Payment) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${p.receipt_number}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; max-width: 650px; margin: auto; }
          .header { border-bottom: 3px solid #E50914; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #111; margin: 0; }
          .logo span { color: #E50914; }
          .address { font-size: 11px; color: #555; margin-top: 4px; line-height: 1.4; }
          .receipt-title { font-size: 18px; font-weight: bold; text-align: right; color: #111; }
          .receipt-num { font-size: 13px; font-family: monospace; color: #E50914; font-weight: bold; margin-top: 2px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 12px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .meta-box p { margin: 4px 0; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
          .table th { background: #111; color: white; padding: 10px; text-align: left; }
          .table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; }
          .total-box { margin-left: auto; width: 240px; font-size: 13px; }
          .total-box .row { display: flex; justify-content: space-between; padding: 4px 0; }
          .total-box .grand-total { font-size: 16px; font-weight: 900; color: #E50914; border-top: 2px solid #111; padding-top: 8px; margin-top: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #666; }
          .sign { text-align: center; border-top: 1px solid #111; width: 140px; padding-top: 4px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="logo">CORPUS <span>FITNESS CLUB</span></h1>
            <div class="address">
              3rd Floor, Above State Bank of India<br/>
              Harshraj Colony – Vidyut Nagar Square, VMV Road<br/>
              Amravati, Maharashtra 444604 · Ph: +91 76206 83995
            </div>
          </div>
          <div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
            <div class="receipt-num">${p.receipt_number}</div>
            <div style="font-size: 11px; color: #666; margin-top: 4px;">Date: ${p.payment_date}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <p><strong>Member Name:</strong> ${p.member?.profile?.full_name || 'Member'}</p>
            <p><strong>Member ID:</strong> ${p.member?.member_id || 'N/A'}</p>
            <p><strong>Contact:</strong> ${p.member?.profile?.phone || 'N/A'}</p>
          </div>
          <div class="meta-box">
            <p><strong>Payment Method:</strong> ${p.payment_method}</p>
            <p><strong>Transaction Ref:</strong> ${p.transaction_ref || 'N/A'}</p>
            <p><strong>Payment Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: green;">${p.status}</span></p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Total Fee</th>
              <th style="text-align: right;">Discount</th>
              <th style="text-align: right;">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Gym Membership Package</strong><br/>
                <span style="color: #666; font-size: 11px;">${p.notes || 'Full gym facility & equipment access'}</span>
              </td>
              <td style="text-align: right;">₹${(p.total_amount || p.amount).toLocaleString('en-IN')}</td>
              <td style="text-align: right;">₹${(p.discount_amount || 0).toLocaleString('en-IN')}</td>
              <td style="text-align: right; font-weight: bold;">₹${p.amount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div class="row">
            <span>Subtotal:</span>
            <span>₹${(p.total_amount || p.amount).toLocaleString('en-IN')}</span>
          </div>
          ${p.discount_amount ? `<div class="row" style="color: #10B981;"><span>Discount:</span><span>-₹${p.discount_amount.toLocaleString('en-IN')}</span></div>` : ''}
          <div class="row grand-total">
            <span>Amount Paid:</span>
            <span>₹${p.amount.toLocaleString('en-IN')}</span>
          </div>
          ${(p.pending_amount || 0) > 0 ? `<div class="row" style="color: #EF4444; font-weight: bold; margin-top: 4px;"><span>Balance Due:</span><span>₹${p.pending_amount?.toLocaleString('en-IN')}</span></div>` : ''}
        </div>

        <div class="footer">
          <div>
            <p style="margin: 0;">This is a computer-generated official receipt from Corpus Fitness Club ERP.</p>
            <p style="margin: 2px 0 0;">Thank you for training with us!</p>
          </div>
          <div class="sign">
            Authorized Signatory<br/>
            CFC Management
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
            PAYMENT MANAGEMENT & BILLING
          </h2>
          <p className="text-xs text-gray-500">
            Record fees, print GST/receipt invoices, track UPI/Cash collections, and manage pending balances
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Record New Payment
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Collections
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-green-600 font-bold mt-1 inline-block">
            ✓ Verified DB Receipts
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            UPI / Online Fees
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#3B82F6]">
            ₹{upiTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 inline-block">
            PhonePe, GPay, Paytm
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Cash Desk Payments
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            ₹{cashTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 inline-block">
            Front Counter Cash
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Pending Dues
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            ₹{pendingTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-amber-600 font-bold mt-1 inline-block">
            Partial Balances
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by receipt # (CFC-REC), member name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
          >
            <option value="All">All Payment Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
          >
            <option value="All">All Statuses</option>
            <option value="paid">Fully Paid</option>
            <option value="partial">Partial Payment</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-gray-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Pending Due</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#E50914]">{p.receipt_number}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-gray-900">{p.member?.profile?.full_name || 'Member'}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{p.member?.member_id}</p>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{p.payment_date}</td>
                  <td className="py-3.5 px-4 font-extrabold text-[#111111]">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {(p.pending_amount || 0) > 0 ? (
                      <span className="text-red-500 font-bold">₹{p.pending_amount?.toLocaleString('en-IN')}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">{p.payment_method}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        p.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : p.status === 'partial'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewReceipt(p)}
                        className="px-2.5 py-1 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                        title="View Receipt"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(p)}
                        className="p-1 rounded text-[#E50914] hover:bg-red-50"
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete / Void Payment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RECORD PAYMENT MODAL ──────────────────────────────────── */}
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
                  Record Fee Payment
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Select Member *</label>
                  <select
                    value={formData.member_id}
                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.profile?.full_name} ({m.member_id}) — {m.current_plan?.plan?.name || 'Standard'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Amount Paid (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Pending Balance (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.pending_amount}
                      onChange={(e) => setFormData({ ...formData, pending_amount: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Payment Method</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash at Counter</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Payment Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="paid">Full Paid</option>
                      <option value="partial">Partial Payment</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Transaction Ref / UTR #</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI/2026/091244"
                    value={formData.transaction_ref}
                    onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Notes / Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 6 Months package fee received"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                    Generate Receipt
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW RECEIPT MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {viewReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                <span className="font-display text-lg tracking-wider text-[#111111] uppercase">
                  Payment Receipt
                </span>
                <button onClick={() => setViewReceipt(null)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="border border-gray-200 rounded-xl p-5 bg-[#F8FAFC] space-y-4 text-xs">
                <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                  <div>
                    <h4 className="font-display text-xl text-[#111111]">CORPUS FITNESS CLUB</h4>
                    <p className="text-[10px] text-gray-500">Amravati, Maharashtra · +91 76206 83995</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-[#E50914]">{viewReceipt.receipt_number}</p>
                    <p className="text-[10px] text-gray-500">{viewReceipt.payment_date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Billed To</span>
                    <span className="font-bold text-gray-900">{viewReceipt.member?.profile?.full_name}</span>
                    <span className="block text-[10px] text-gray-500">{viewReceipt.member?.member_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Method & Status</span>
                    <span className="font-bold">{viewReceipt.payment_method}</span>
                    <span className="block text-[10px] text-green-600 font-bold uppercase">{viewReceipt.status}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Gym Membership Subscription</p>
                    <p className="text-[10px] text-gray-400">{viewReceipt.notes || 'Full gym facility access'}</p>
                  </div>
                  <span className="text-lg font-extrabold text-[#E50914]">
                    ₹{viewReceipt.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                {(viewReceipt.pending_amount || 0) > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Pending Due Balance:</span>
                    <span>₹{viewReceipt.pending_amount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => setDeleteConfirm(viewReceipt)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Void / Delete
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewReceipt(null)}
                    className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handlePrintReceipt(viewReceipt)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] shadow-sm"
                  >
                    <Printer className="h-4 w-4" /> Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE PAYMENT CONFIRMATION MODAL ──────────────────────── */}
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
              <h3 className="font-bold text-lg text-gray-900 mb-1">Void / Delete Payment?</h3>
              <p className="text-xs text-gray-600 mb-6">
                Are you sure you want to permanently delete payment receipt{' '}
                <strong className="text-gray-900 font-bold">{deleteConfirm.receipt_number}</strong>{' '}
                (₹{deleteConfirm.amount.toLocaleString('en-IN')}) for{' '}
                {deleteConfirm.member?.profile?.full_name || 'Member'}?
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
                  onClick={handleDeletePayment}
                  className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Yes, Void Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
