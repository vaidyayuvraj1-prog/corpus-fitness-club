import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types/database'

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllRead: (userId: string) => Promise<void>
  addNotification: (notif: Omit<Notification, 'id' | 'created_at'>) => Promise<void>
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (userId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.is_read).length,
        loading: false,
      })
    }
  },

  markAsRead: async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: async (userId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },

  addNotification: async (notif) => {
    const { data } = await supabase
      .from('notifications')
      .insert(notif)
      .select()
      .single()
    if (data) {
      set(state => ({
        notifications: [data, ...state.notifications],
        unreadCount: state.unreadCount + (data.is_read ? 0 : 1),
      }))
    }
  },
}))
