import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Send,
  Trash2,
  Search,
  Sparkles,
  MessageCircle,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Users,
  ShieldAlert,
  Dumbbell,
  X,
  Share2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { NotificationItem } from '@/types/database'
import { format } from 'date-fns'

const QUICK_TEMPLATES = [
  {
    title: 'Sunday Deep Sanitization & Floor Maintenance',
    category: 'warning',
    priority: 'high',
    target: 'all',
    sender: 'CFC Admin Office',
    message:
      'Dear Members, Corpus Fitness Club Amravati facility will remain closed this Sunday for scheduled deep sanitization, dumbbell rack realignment, and cable equipment servicing. Regular shift hours resume Monday 6:00 AM sharp.',
  },
  {
    title: 'Reminder: Morning & Evening Shift Timings',
    category: 'info',
    priority: 'normal',
    target: 'all',
    sender: 'CFC Front Desk',
    message:
      'Gym shift hours: Morning: 6:00 AM – 11:00 AM | Evening: 5:00 PM – 10:00 PM (Sunday Closed). Please make sure to scan your personal QR code at the reception counter before entering the gym floor.',
  },
  {
    title: '30-Day Body Transformation Challenge 2026',
    category: 'success',
    priority: 'high',
    target: 'active_members',
    sender: 'Chief Trainer Vikram',
    message:
      'Registrations are now open for our annual Body Transformation Challenge! Includes free baseline body composition analysis, certified coach meal protocol, and exciting trophies for top transformations. Contact the front desk to enter.',
  },
  {
    title: 'Urgent: Power Maintenance / Generator Backup Notice',
    category: 'alert',
    priority: 'urgent',
    target: 'all',
    sender: 'CFC Management',
    message:
      'Please note that MSEDCL scheduled power maintenance will occur between 1:00 PM - 3:00 PM. All workout shifts remain fully operational under full gym generator backup. Water dispensers and showers are normal.',
  },
  {
    title: 'Monthly Membership Renewal Reminder',
    category: 'info',
    priority: 'normal',
    target: 'active_members',
    sender: 'CFC Accounts',
    message:
      'Members whose packages expire this month are requested to renew at the reception or online to avoid interruption in your workout tracking and QR gate check-in.',
  },
]

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<NotificationItem | null>(null)

  // Form State
  const [form, setForm] = useState<{
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'alert'
    priority: 'normal' | 'high' | 'urgent'
    target_audience: 'all' | 'active_members' | 'trainers' | 'expired_members'
    sent_by: string
  }>({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    target_audience: 'all',
    sent_by: 'CFC Admin Office',
  })

  useEffect(() => {
    loadNotifications()
  }, [])

  function loadNotifications() {
    setNotifications(db.getNotifications())
  }

  const applyTemplate = (tpl: (typeof QUICK_TEMPLATES)[0]) => {
    setForm({
      title: tpl.title,
      message: tpl.message,
      type: tpl.category as 'info' | 'warning' | 'success' | 'alert',
      priority: tpl.priority as 'normal' | 'high' | 'urgent',
      target_audience: tpl.target as 'all' | 'active_members' | 'trainers' | 'expired_members',
      sent_by: tpl.sender,
    })
    setShowModal(true)
    toast.success('Template applied! You can customize before broadcasting.')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please enter both title and message.')
      return
    }

    db.broadcastNotification({
      title: form.title,
      message: form.message,
      type: form.type,
      priority: form.priority,
      target_audience: form.target_audience,
      sent_by: form.sent_by,
      channels: ['in_app', 'whatsapp'],
    })

    loadNotifications()
    setShowModal(false)
    toast.success('Notification broadcasted successfully to all target members!')

    // Reset form
    setForm({
      title: '',
      message: '',
      type: 'info',
      priority: 'normal',
      target_audience: 'all',
      sent_by: 'CFC Admin Office',
    })
  }

  const handleDelete = (id: string) => {
    db.deleteNotification(id)
    loadNotifications()
    setDeleteConfirm(null)
    toast.success('Broadcast notice removed successfully.')
  }

  // Pre-formatted WhatsApp text generator
  const getWhatsAppText = (n: NotificationItem) => {
    return `📢 *CORPUS FITNESS CLUB (CFC) - ANNOUNCEMENT*\n📍 3rd Floor, Above SBI, VMV Road, Amravati\n\n📌 *${n.title}*\n\n${n.message}\n\n━━━━━━━━━━━━━━━━━━━━\n⏰ *Gym Timings:* Mon–Sat 6:00 AM–11:00 AM | 5:00 PM–10:00 PM (Sunday Closed)\n📞 *Contact / WhatsApp:* +91 76206 83995\n🌐 *Member Portal:* https://corpusfitness.in/member\n— Sent by ${n.sent_by || 'CFC Admin'}`
  }

  const handleCopyWhatsApp = (n: NotificationItem) => {
    navigator.clipboard.writeText(getWhatsAppText(n))
    toast.success('WhatsApp announcement text copied to clipboard!')
  }

  const handleShareWhatsApp = (n: NotificationItem) => {
    const text = encodeURIComponent(getWhatsAppText(n))
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  // Filtered broadcasts
  const filtered = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()) ||
      (n.sent_by && n.sent_by.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filterType === 'all' || n.type === filterType || n.priority === filterType
    return matchesSearch && matchesFilter
  })

  const urgentCount = notifications.filter((n) => n.priority === 'urgent' || n.priority === 'high').length
  const totalMembersCount = db.getMembers().length

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-widest">
              CORPUS FITNESS CLUB · COMMUNICATIONS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#E50914]">
              Live Broadcast
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display tracking-wider text-[#111111] mt-1">
            MEMBER BROADCAST NOTIFICATIONS
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Broadcast official club alerts, holiday closures, shift timing updates, and challenge announcements to all
            members and trainers across their member portals and WhatsApp.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              title: '',
              message: '',
              type: 'info',
              priority: 'normal',
              target_audience: 'all',
              sent_by: 'CFC Admin Office',
            })
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md shrink-0"
        >
          <Send className="h-4 w-4" />
          <span>+ Create New Broadcast</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Broadcasts</span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#111111] mt-3">{notifications.length}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Sent to portal feeds</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">High / Urgent Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E50914] mt-3">{urgentCount}</div>
          <span className="text-[11px] text-red-600 font-semibold mt-1 block">Prioritized banner alerts</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Member Reach</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-3">{totalMembersCount * 12}+</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Active members & trainees</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Channels</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-3">2-Way</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Web Portal + WhatsApp</span>
        </div>
      </div>

      {/* Quick Announcement Templates */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#E50914]" />
          <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
            Quick 1-Click Announcement Templates
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Click any pre-written template to instantly populate and review the broadcast draft:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-left p-3.5 rounded-xl border border-gray-200 bg-[#F8FAFC] hover:bg-white hover:border-[#E50914] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      tpl.category === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : tpl.category === 'alert'
                        ? 'bg-red-100 text-[#E50914]'
                        : tpl.category === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {tpl.category}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#E50914]">
                    Use Template →
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-[#E50914] transition-colors">
                  {tpl.title}
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{tpl.message}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Broadcast Feed & Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-5 sm:p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Filter:</span>
            {[
              { id: 'all', label: 'All Notices' },
              { id: 'urgent', label: 'Urgent Only' },
              { id: 'warning', label: 'Holidays & Maintenance' },
              { id: 'info', label: 'General Info' },
              { id: 'success', label: 'Events & Challenges' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  filterType === f.id
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>
        </div>

        {/* Notices List */}
        <div className="divide-y divide-[#E5E7EB]">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900">No broadcasts found</h3>
              <p className="text-xs text-gray-500 mt-1">
                Try adjusting your search query or create a new announcement.
              </p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className="p-5 sm:p-6 hover:bg-[#F8FAFC] transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        n.priority === 'urgent'
                          ? 'bg-red-600 text-white animate-pulse'
                          : n.priority === 'high'
                          ? 'bg-red-100 text-[#E50914]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {n.priority} priority
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        n.type === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : n.type === 'alert'
                          ? 'bg-red-100 text-red-800'
                          : n.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {n.type}
                    </span>

                    <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      Audience: {n.target_audience === 'all' ? 'All Members & Staff' : n.target_audience}
                    </span>

                    <span className="text-[11px] text-gray-400 flex items-center gap-1 ml-auto md:ml-0">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(n.created_at), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111111]">{n.title}</h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl whitespace-pre-line">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                    <span>Sender: <strong className="text-gray-700">{n.sent_by || 'CFC Admin Office'}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live on Member Portal
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => handleCopyWhatsApp(n)}
                    title="Copy formatted text for WhatsApp group"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span className="hidden sm:inline">Copy Text</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(n)}
                    title="Share directly to WhatsApp"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(n)}
                    title="Delete notice"
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Broadcast Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E50914] text-white flex items-center justify-center shadow-md">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#111111] uppercase tracking-tight">
                      Compose Member Broadcast
                    </h3>
                    <p className="text-xs text-gray-500">
                      Instantly updates all member dashboards and generates WhatsApp alert.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Announcement Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Sunday Deep Cleaning Notice / Holiday Schedule"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Type / Category
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value as 'info' | 'warning' | 'success' | 'alert' })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-white"
                    >
                      <option value="info">General Info</option>
                      <option value="warning">Holiday / Timing Change</option>
                      <option value="alert">Urgent Notice</option>
                      <option value="success">Event / Challenge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Priority Level
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        setForm({ ...form, priority: e.target.value as 'normal' | 'high' | 'urgent' })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-white"
                    >
                      <option value="normal">Normal Priority</option>
                      <option value="high">High (Top Badge)</option>
                      <option value="urgent">Urgent Alert (Banner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Target Audience
                    </label>
                    <select
                      value={form.target_audience}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          target_audience: e.target.value as 'all' | 'active_members' | 'trainers' | 'expired_members',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-white"
                    >
                      <option value="all">All Members & Staff</option>
                      <option value="active_members">Active Members Only</option>
                      <option value="trainers">Trainers Only</option>
                      <option value="expired_members">Expired Members</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Sender Signature / Department
                  </label>
                  <input
                    type="text"
                    value={form.sent_by}
                    onChange={(e) => setForm({ ...form, sent_by: e.target.value })}
                    placeholder="e.g. CFC Admin Office / Chief Trainer Vikram"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Announcement Message Body *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Write detailed information for members. Include dates, timings, instructions, and contacts..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>

                {/* WhatsApp preview preview card */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-800 text-xs font-bold">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Automatic WhatsApp Broadcast Format</span>
                  </div>
                  <p className="text-[11px] text-gray-600 italic">
                    Once submitted, you will also be able to copy or directly send this announcement to your official
                    Corpus Fitness Club WhatsApp broadcast lists and member groups with 1 click!
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Broadcast Notice Now</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Broadcast Notice?</h3>
              <p className="text-xs text-gray-500 mb-6">
                Are you sure you want to retract "{deleteConfirm.title}"? It will be removed from all member portals.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
                >
                  Delete Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
