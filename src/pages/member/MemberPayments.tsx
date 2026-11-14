import { useState, useEffect } from 'react'
import { CreditCard, Printer, CheckCircle2, DollarSign } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/db'
import type { Payment, Member } from '@/types/database'

export default function MemberPayments() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [member, setMember] = useState<Member | null>(null)

  useEffect(() => {
    const allMembers = db.getMembers()
    const matched =
      allMembers.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
      allMembers[0]

    setMember(matched)
    if (matched) {
      const records = db.getPayments().filter((p) => p.member_id === matched.id)
      setPayments(records)
    }
  }, [profile])

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  const printReceipt = (p: Payment) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head><title>Receipt - ${p.receipt_number}</title></head>
        <body style="font-family:sans-serif;padding:30px;max-width:550px;margin:auto;">
          <h2 style="color:#E50914;margin:0;">CORPUS FITNESS CLUB</h2>
          <p style="font-size:12px;color:#666;">VMV Road, Amravati · +91 76206 83995</p>
          <hr/>
          <p><strong>Receipt:</strong> ${p.receipt_number}</p>
          <p><strong>Date:</strong> ${p.payment_date}</p>
          <p><strong>Member:</strong> ${member?.profile?.full_name} (${member?.member_id})</p>
          <p><strong>Amount Paid:</strong> ₹${p.amount.toLocaleString('en-IN')}</p>
          <p><strong>Method:</strong> ${p.payment_method}</p>
          <p><strong>Status:</strong> <span style="color:green;font-weight:bold;">${p.status.toUpperCase()}</span></p>
          <hr/>
          <p style="font-size:10px;color:#888;">Thank you for training with Corpus Fitness Club!</p>
          <script>window.print();</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
          FEE PAYMENTS & OFFICIAL RECEIPTS
        </h2>
        <p className="text-xs text-gray-500">
          History of all membership subscriptions and digital tax invoices
        </p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Lifetime Membership Fees</span>
          <p className="text-3xl font-extrabold text-[#111111] mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
          ✓ All Dues Clear
        </span>
      </div>

      {/* Receipts List */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
            Receipt Records ({payments.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b text-gray-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Receipt #</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Amount Paid</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-bold text-[#E50914]">{p.receipt_number}</td>
                  <td className="py-3 px-4 text-gray-600">{p.payment_date}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{p.payment_method}</td>
                  <td className="py-3 px-4 font-extrabold text-gray-900">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => printReceipt(p)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#E50914] text-white font-bold hover:bg-[#B91C1C]"
                    >
                      <Printer className="h-3 w-3" /> Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
