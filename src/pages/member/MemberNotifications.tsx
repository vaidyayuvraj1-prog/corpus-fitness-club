import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  Clock,
  Sparkles,
  ShieldAlert,
  Calendar,
  MessageCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '@/lib/db'
import type { NotificationItem } from '@/types/database'
import { format } from 'date-fns'

export default function MemberNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'announcements'>('all')

  useEffect(() => {
    loadNotifs()
  }, [])

  function loadNotifs() {
    setNotifications(db.getNotifications())
  }

  const handleMarkAllRead = () => {
    db.markAllNotificationsRead()
    loadNotifs()
    toast.success('All announcements marked as read.')
  }

  const handleToggleRead = (id: string) => {
    db.markNotificationRead(id)
    loadNotifs()
  }

  const unreadCount = notifications.filter((n) => !n.is_read && !n.read).length

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read && !n.read
    if (filter === 'urgent') return n.priority === 'urgent' || n.priority === 'high' || n.type === 'alert'
    if (filter === 'announcements') return n.type === 'warning' || n.type === 'info'
    return true
  })

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight">
              Club Alerts & Announcements
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E50914] text-white animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Official broadcasts from Corpus Fitness Club management, shift timing updates, holiday maintenance notices,
            and fitness challenge alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-[#E50914]" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        {[
          { id: 'all', label: `All Notices (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'urgent', label: 'Urgent & Important' },
          { id: 'announcements', label: 'Gym Timings & Holidays' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-[#E50914] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center shadow-sm">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No notices in this view</h3>
            <p className="text-xs text-gray-500 mt-1">You are all caught up with club announcements!</p>
          </div>
        ) : (
          filtered.map((n) => {
            const isRead = n.is_read || n.read
            const isUrgent = n.priority === 'urgent' || n.priority === 'high' || n.type === 'alert'

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border transition-all ${
                  !isRead
                    ? 'bg-white border-l-4 border-l-[#E50914] border-gray-200 shadow-sm'
                    : 'bg-white/80 border-gray-200 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                        isUrgent
                          ? 'bg-red-50 text-[#E50914]'
                          : n.type === 'warning'
                          ? 'bg-amber-50 text-amber-600'
                          : n.type === 'success'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : n.type === 'warning' ? (
                        <Calendar className="w-5 h-5" />
                      ) : n.type === 'success' ? (
                        <Sparkles className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isUrgent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#E50914] uppercase tracking-wide">
                            High Priority
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            n.type === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : n.type === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {n.type}
                        </span>

                        <span className="text-[11px] text-gray-400 flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {format(new Date(n.created_at), 'dd MMM, hh:mm a')}
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          !isRead ? 'text-[#111111]' : 'text-gray-700'
                        }`}
                      >
                        {n.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                        <span>
                          Broadcasted by: <strong className="text-gray-700">{n.sent_by || 'CFC Admin Office'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isRead && (
                    <button
                      onClick={() => handleToggleRead(n.id)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#E50914] hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Gym Support Footer Note */}
      <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#E50914]" />
          <span>Have a question about an announcement? Contact reception or WhatsApp us directly.</span>
        </div>
        <a
          href="https://wa.me/917620683995?text=Hello%20Corpus%20Fitness%20Club,%20I%20have%20an%20enquiry%20about%20the%20recent%20announcement"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#E50914] hover:underline"
        >
          WhatsApp Reception (+91 76206 83995) →
        </a>
      </div>
    </div>
  )
}
