import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Filter,
  PieChart as PieIcon,
  X,
  CreditCard,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { Expense } from '@/types/database'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import { format } from 'date-fns'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)

  const [form, setForm] = useState({
    category: 'Electricity' as Expense['category'],
    amount: 5000,
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    payment_method: 'UPI',
    recorded_by: 'Super Admin',
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  function loadExpenses() {
    setExpenses(db.getExpenses())
  }

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)
  const monthlyRevenue = db.getDashboardStats().monthlyRevenue
  const netOperatingProfit = monthlyRevenue - totalExpense

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    try {
      db.saveExpense({
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.expense_date,
        description: form.description,
        payment_method: form.payment_method,
        recorded_by: form.recorded_by,
      })
      toast.success('Expense recorded successfully!')
      setShowAddModal(false)
      loadExpenses()
    } catch {
      toast.error('Failed to save expense')
    }
  }

  const handleDeleteExpense = (id: string) => {
    db.deleteExpense(id)
    toast.success('Expense record removed')
    loadExpenses()
  }

  const filtered =
    categoryFilter === 'All'
      ? expenses
      : expenses.filter((e) => e.category === categoryFilter)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            EXPENSE & OVERHEAD TRACKING
          </h2>
          <p className="text-xs text-gray-500">
            Log premises rent, electricity bills, equipment repairs, marketing, and staff payouts
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              category: 'Maintenance',
              amount: 2500,
              expense_date: format(new Date(), 'yyyy-MM-dd'),
              description: '',
              payment_method: 'UPI',
              recorded_by: 'Gym Manager',
            })
            setShowAddModal(true)
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Operational Outflow
          </span>
          <div className="text-3xl font-extrabold text-[#E50914]">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 inline-block">
            Across {expenses.length} logged expense items
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Monthly Gym Collections
          </span>
          <div className="text-3xl font-extrabold text-[#111111]">
            ₹{monthlyRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-green-600 font-bold mt-1 inline-block">
            ✓ Total Member Fees
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Net Monthly Balance
          </span>
          <div
            className={`text-3xl font-extrabold ${
              netOperatingProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ₹{netOperatingProfit.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 inline-block">
            (Total Collections - Outflow)
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">Category:</span>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
        >
          <option value="All">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Expense List Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-gray-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/80">
                  <td className="py-3.5 px-4 font-mono text-gray-600">{exp.expense_date}</td>
                  <td className="py-3.5 px-4 font-bold text-[#E50914]">{exp.category}</td>
                  <td className="py-3.5 px-4 text-gray-800">{exp.description}</td>
                  <td className="py-3.5 px-4 text-gray-600">{exp.payment_method}</td>
                  <td className="py-3.5 px-4 text-gray-500">{exp.recorded_by || 'Admin'}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-[#111111]">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD EXPENSE MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                  Add Expense Entry
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Expense Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="input-field"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={form.expense_date}
                      onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Payment Method</label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    className="input-field"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Description / Bill Memo *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Electricity bill payment for AC units"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
