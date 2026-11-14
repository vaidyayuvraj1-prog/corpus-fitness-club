import { supabase } from './supabase'
import type { DashboardStats } from '@/types/database'

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: expiredMembers },
    { count: todayAttendance },
    { data: paymentsThisMonth },
    { count: pendingPayments },
    { count: totalTrainers },
    { count: newEnquiries },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .gte('check_in', today),
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('payment_date', monthStart),
    supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('trainers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new'),
  ])

  const monthlyRevenue =
    paymentsThisMonth?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0

  return {
    totalMembers: totalMembers ?? 0,
    activeMembers: activeMembers ?? 0,
    expiredMembers: expiredMembers ?? 0,
    todayAttendance: todayAttendance ?? 0,
    monthlyRevenue,
    pendingPayments: pendingPayments ?? 0,
    totalTrainers: totalTrainers ?? 0,
    newEnquiries: newEnquiries ?? 0,
  }
}

export async function getMonthlyRevenue(months = 6) {
  const results = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('payment_date', start)
      .lte('payment_date', end)

    const revenue = data?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0
    results.push({
      month: d.toLocaleString('default', { month: 'short' }),
      revenue,
    })
  }
  return results
}

export async function checkDuplicateAttendance(memberId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .gte('check_in', today)

  return (count ?? 0) > 0
}

export async function markAttendance(
  memberId: string,
  method: 'qr' | 'manual',
  recordedBy?: string
) {
  const alreadyCheckedIn = await checkDuplicateAttendance(memberId)
  if (alreadyCheckedIn) {
    throw new Error('Member already checked in today')
  }

  const { data, error } = await supabase
    .from('attendance')
    .insert({
      member_id: memberId,
      check_in: new Date().toISOString(),
      method,
      recorded_by: recordedBy || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function generatePDFReceipt(payment: {
  receipt_number: string
  member_name: string
  amount: number
  payment_method: string
  payment_date: string
  plan_name?: string
}) {
  // Dynamically import jsPDF
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })

  // Header
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, 148, 210, 'F')

  doc.setTextColor(57, 255, 20) // neon green
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('CORPUS FITNESS CLUB', 74, 25, { align: 'center' })

  doc.setTextColor(180, 180, 180)
  doc.setFontSize(9)
  doc.text('3rd Floor, Above SBI, VMV Road, Amravati, MH 444604', 74, 32, { align: 'center' })
  doc.text('Phone: +91 76206 83995', 74, 37, { align: 'center' })

  // Divider
  doc.setDrawColor(57, 255, 20)
  doc.setLineWidth(0.5)
  doc.line(10, 42, 138, 42)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text('PAYMENT RECEIPT', 74, 52, { align: 'center' })

  // Receipt details
  const fields = [
    ['Receipt No:', payment.receipt_number],
    ['Member Name:', payment.member_name],
    ['Plan:', payment.plan_name || '—'],
    ['Payment Method:', payment.payment_method],
    ['Date:', payment.payment_date],
  ]

  let y = 65
  doc.setFontSize(10)
  for (const [label, value] of fields) {
    doc.setTextColor(150, 150, 150)
    doc.text(label, 15, y)
    doc.setTextColor(255, 255, 255)
    doc.text(value, 75, y)
    y += 10
  }

  // Amount
  doc.setDrawColor(57, 255, 20)
  doc.line(10, y + 2, 138, y + 2)
  doc.setTextColor(57, 255, 20)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(
    `Amount Paid: ₹${payment.amount.toLocaleString('en-IN')}`,
    74,
    y + 15,
    { align: 'center' }
  )

  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.text('Thank you for choosing Corpus Fitness Club!', 74, 180, { align: 'center' })
  doc.text('This is a computer-generated receipt.', 74, 185, { align: 'center' })

  doc.save(`CFC-Receipt-${payment.receipt_number}.pdf`)
}
