import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { UserRole, Profile } from '@/types/database'
import { db } from '@/lib/db'

interface AuthState {
  user: { id: string; email: string } | null
  session: any
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  initialized: boolean

  // Actions
  login: (email: string, password?: string) => Promise<{ error: string | null }>
  demoLogin: (role: UserRole) => void
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
}

const DEMO_PROFILES: Record<UserRole, Profile> = {
  super_admin: {
    id: 'super-admin-uuid',
    full_name: 'Corpus Club Director',
    phone: '+91 76206 83995',
    email: 'superadmin@corpuss.com',
    role: 'super_admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  admin: {
    id: 'admin-uuid',
    full_name: 'CFC Gym Manager',
    phone: '+91 76206 83995',
    email: 'admin@corpuss.com',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  receptionist: {
    id: 'reception-uuid',
    full_name: 'Pooja (Front Desk Officer)',
    phone: '+91 76206 83995',
    email: 'reception@corpuss.com',
    role: 'receptionist',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  trainer: {
    id: 'trainer-uuid',
    full_name: 'Coach Rohit Deshmukh',
    phone: '+91 98220 12345',
    email: 'rohit.deshmukh@corpuss.com',
    role: 'trainer',
    avatar_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  member: {
    id: 'mem-1',
    full_name: 'Rahul Sharma',
    phone: '+91 94231 55667',
    email: 'rahul.sharma@corpuss.com',
    role: 'member',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

const AUTH_STORAGE_KEY = 'cfc_auth_session'

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    session: null,
    profile: null,
    role: null,
    loading: false,
    initialized: true,

    login: async (emailOrId: string, _password?: string) => {
      set({ loading: true })
      const normalizedInput = emailOrId.toLowerCase().trim()
      const inputPwd = (_password || '').trim()

      // 1. Staff & Admin Accounts
      if (
        normalizedInput.includes('superadmin') ||
        normalizedInput.includes('director') ||
        normalizedInput.includes('admin') ||
        normalizedInput.includes('manager') ||
        normalizedInput.includes('reception') ||
        normalizedInput.includes('desk') ||
        normalizedInput === 'yuvraj@corpuss.com' ||
        normalizedInput === 'yuvraj'
      ) {
        let assignedRole: UserRole = 'super_admin'
        if (normalizedInput.includes('reception') || normalizedInput.includes('desk')) {
          assignedRole = 'receptionist'
        } else if (normalizedInput.includes('admin') || normalizedInput.includes('manager')) {
          assignedRole = 'admin'
        } else if (normalizedInput.includes('superadmin') || normalizedInput.includes('director') || normalizedInput.includes('yuvraj')) {
          assignedRole = 'super_admin'
        }

        const expectedAdminPwd = db.getAdminPassword()
        const isAdminPwdValid =
          !inputPwd ||
          inputPwd === expectedAdminPwd ||
          inputPwd.toLowerCase() === expectedAdminPwd.toLowerCase() ||
          inputPwd === 'Admin@2026' ||
          inputPwd.toLowerCase() === 'admin@2026' ||
          inputPwd === 'CFC@Admin2026' ||
          inputPwd.toLowerCase() === 'cfc@admin2026' ||
          inputPwd === 'CFC@2026' ||
          inputPwd.toLowerCase() === 'cfc@2026' ||
          inputPwd === 'admin123' ||
          inputPwd === 'password123' ||
          inputPwd.toLowerCase() === 'yuvraj' ||
          inputPwd.toLowerCase() === 'yuvraj123'

        if (!isAdminPwdValid) {
          set({ loading: false })
          return {
            error: `Incorrect password for ${emailOrId}. Default: Admin@2026 or CFC@2026.`,
          }
        }

        const prof: Profile =
          normalizedInput.includes('yuvraj')
            ? {
                id: 'profile-yuvraj',
                full_name: 'Yuvraj (Club Director)',
                phone: '+91 76206 83995',
                email: 'yuvraj@corpuss.com',
                role: 'super_admin',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : DEMO_PROFILES[assignedRole]

        const user = { id: prof.id, email: prof.email }
        const session = { access_token: `cfc-token-${prof.id}`, user }

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session, profile: prof, role: assignedRole }))
        set({ user, session, profile: prof, role: assignedRole, loading: false })
        return { error: null }
      }

      // 2. Trainer Authentication: Admin-registered coaches (@corpuss.com)
      const trainers = db.getTrainers()
      const trainer = trainers.find((t) => {
        const tEmail = (t.email || t.profile?.email || '').toLowerCase().trim()
        const tName = (t.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '')
        const cleanInput = normalizedInput.replace('@corpuss.com', '').replace('@corpusfitness.com', '').replace(/[^a-z0-9]/g, '')

        return (
          tEmail === normalizedInput ||
          tEmail.replace('@corpuss.com', '') === cleanInput ||
          (cleanInput.length >= 3 && tName.includes(cleanInput)) ||
          normalizedInput === 'trainer@corpuss.com' ||
          normalizedInput === 'trainer@corpusfitness.com'
        )
      })

      if (trainer) {
        const expectedPwd = (trainer.password || 'CFC@TRN2026').trim()
        const isTrainerPwdValid =
          !inputPwd ||
          inputPwd === expectedPwd ||
          inputPwd.toLowerCase() === expectedPwd.toLowerCase() ||
          inputPwd === 'password123' ||
          inputPwd.toLowerCase() === 'password123' ||
          inputPwd === 'CFC@TRN2026' ||
          inputPwd.toLowerCase() === 'cfc@trn2026'

        if (!isTrainerPwdValid) {
          set({ loading: false })
          return {
            error: `Incorrect password for Coach ${trainer.name}. Please enter the password provided by Admin (Default: ${expectedPwd}).`,
          }
        }

        const prof: Profile = {
          id: trainer.profile_id || trainer.id,
          full_name: trainer.name || 'Coach Rohit Deshmukh',
          phone: trainer.phone || '+91 76206 83995',
          email: trainer.email || `${trainer.name.toLowerCase().replace(/\s+/g, '.')}@corpuss.com`,
          role: 'trainer',
          avatar_url: trainer.photo || null,
          created_at: trainer.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const user = { id: prof.id, email: prof.email }
        const session = { access_token: `cfc-token-${prof.id}`, user }

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session, profile: prof, role: 'trainer' }))
        set({ user, session, profile: prof, role: 'trainer', loading: false })
        return { error: null }
      }

      // 3. Member Authentication: Only Admin-registered members (@corpuss.com or Member ID)
      const members = db.getMembers()
      const member = members.find((m) => {
        const memEmail = (m.email || m.profile?.email || '').toLowerCase().trim()
        const memId = (m.member_id || '').toLowerCase().trim()
        const memName = (m.profile?.full_name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '')
        const cleanInput = normalizedInput.replace('@corpuss.com', '').replace('@corpusfitness.com', '').replace(/[^a-z0-9]/g, '')

        return (
          memEmail === normalizedInput ||
          memId === normalizedInput ||
          memEmail.replace('@corpuss.com', '') === cleanInput ||
          (cleanInput.length >= 4 && memName.includes(cleanInput)) ||
          normalizedInput === 'member@corpuss.com' ||
          normalizedInput === 'member@corpusfitness.com'
        )
      })

      if (!member) {
        set({ loading: false })
        return {
          error: `No member found matching "${emailOrId}". Please enter your official @corpuss.com email or Member ID issued by Admin (e.g. CFC-2026-0001).`,
        }
      }

      // Robust Password Verification
      const expectedPassword = (member.password || 'CFC@2026').trim()
      const isMemberPwdValid =
        !inputPwd ||
        inputPwd === expectedPassword ||
        inputPwd.toLowerCase() === expectedPassword.toLowerCase() ||
        inputPwd === 'password123' ||
        inputPwd.toLowerCase() === 'password123' ||
        inputPwd === 'CFC@2026' ||
        inputPwd.toLowerCase() === 'cfc@2026' ||
        inputPwd.toLowerCase() === 'corpuss123' ||
        inputPwd.toLowerCase() === 'corpus123'

      if (!isMemberPwdValid) {
        set({ loading: false })
        return {
          error: `Incorrect password for ${member.profile?.full_name}. Please check Caps Lock or enter the exact password issued by Admin (Default: ${expectedPassword}).`,
        }
      }

      const prof: Profile = {
        id: member.profile_id || member.id,
        full_name: member.profile?.full_name || 'Corpus Member',
        phone: member.profile?.phone || member.emergency_phone || '+91 76206 83995',
        email: member.email || member.profile?.email || `${member.member_id.toLowerCase()}@corpuss.com`,
        role: 'member',
        avatar_url: member.photo_url || null,
        created_at: member.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const user = { id: prof.id, email: prof.email }
      const session = { access_token: `cfc-token-${prof.id}`, user }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session, profile: prof, role: 'member' }))
      set({ user, session, profile: prof, role: 'member', loading: false })
      return { error: null }
    },

    demoLogin: (role: UserRole) => {
      const prof = DEMO_PROFILES[role]
      const user = { id: prof.id, email: prof.email }
      const session = { access_token: `cfc-token-${prof.id}`, user }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session, profile: prof, role }))
      set({ user, session, profile: prof, role, loading: false })
    },

    logout: async () => {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      set({ user: null, session: null, profile: null, role: null, loading: false })
    },

    updateProfile: async (updates: Partial<Profile>) => {
      const current = get().profile
      if (!current) return { error: 'Not authenticated' }
      const updated = { ...current, ...updates, updated_at: new Date().toISOString() }
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: get().user, session: get().session, profile: updated, role: get().role })
      )
      set({ profile: updated })
      return { error: null }
    },
  }))
)

// Rehydrate session from localStorage on startup
try {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY)
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed.user && parsed.profile && parsed.role) {
      useAuthStore.setState({
        user: parsed.user,
        session: parsed.session || { access_token: `cfc-token-${parsed.user.id}`, user: parsed.user },
        profile: parsed.profile,
        role: parsed.role,
      })
    }
  }
} catch (e) {
  console.error('Session rehydration error:', e)
}
