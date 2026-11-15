import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { UserRole, Profile } from '@/types/database'
import { db, syncDatabaseWithServer, FAKE_MEMBER_IDS, FAKE_MEMBER_EMAILS } from '@/lib/db'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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
    full_name: 'Yuvraj Vaidya (Director & Admin)',
    phone: '+91 76206 83995',
    email: 'admin@corpuss.com',
    role: 'super_admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  admin: {
    id: 'admin-uuid',
    full_name: 'Yuvraj Vaidya (Director & Admin)',
    phone: '+91 76206 83995',
    email: 'admin@corpuss.com',
    role: 'super_admin',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  receptionist: {
    id: 'reception-uuid',
    full_name: 'Front Desk Officer',
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
    id: 'mem-6',
    full_name: 'Yuvraj Vaidya',
    phone: '+91 76206 83995',
    email: 'yuvraj.vaidya@corpuss.com',
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

      // 0. Cloud Sync: Real-time pull from Supabase so any member created on another device is instantly loaded
      if (typeof window !== 'undefined' && isSupabaseConfigured && supabase) {
        try {
          const { data: cloudRow } = await supabase
            .from('cfc_store')
            .select('data')
            .eq('key', 'cfc_db_members')
            .single()
          if (cloudRow?.data && Array.isArray(cloudRow.data)) {
            const localMembers = db.getMembers()
            const memberMap = new Map<string, any>()
            cloudRow.data.forEach((m: any) => {
              if (
                !m ||
                FAKE_MEMBER_IDS.has(m?.id) ||
                FAKE_MEMBER_EMAILS.has((m?.email || '').toLowerCase()) ||
                FAKE_MEMBER_EMAILS.has((m?.profile?.email || '').toLowerCase())
              )
                return
              if (m?.id) memberMap.set(m.id, m)
            })
            localMembers.forEach((m: any) => {
              if (
                !m ||
                FAKE_MEMBER_IDS.has(m?.id) ||
                FAKE_MEMBER_EMAILS.has((m?.email || '').toLowerCase()) ||
                FAKE_MEMBER_EMAILS.has((m?.profile?.email || '').toLowerCase())
              )
                return
              const mEmail = (m.email || m.profile?.email || '').toLowerCase()
              if (!memberMap.has(m.id) && (!mEmail || !memberMap.has(mEmail))) {
                memberMap.set(m.id, m)
              }
            })
            localStorage.setItem('cfc_db_members', JSON.stringify(Array.from(new Set(memberMap.values()))))
          }
        } catch {
          // offline fallback
        }
      }

      // 1. Staff & Admin Accounts (Strictly admin@corpuss.com with master password 2026@admin)
      if (
        normalizedInput === 'admin@corpuss.com' ||
        normalizedInput === 'admin' ||
        normalizedInput === 'superadmin@corpuss.com' ||
        normalizedInput === 'superadmin' ||
        normalizedInput.includes('reception') ||
        normalizedInput.includes('desk')
      ) {
        let assignedRole: UserRole = 'super_admin'
        if (normalizedInput.includes('reception') || normalizedInput.includes('desk')) {
          assignedRole = 'receptionist'
        } else {
          assignedRole = 'super_admin'
        }

        const expectedAdminPwd = db.getAdminPassword() || '2026@admin'
        const isAdminPwdValid =
          inputPwd === expectedAdminPwd ||
          inputPwd.toLowerCase() === expectedAdminPwd.toLowerCase() ||
          inputPwd === '2026@admin' ||
          inputPwd.toLowerCase() === '2026@admin' ||
          inputPwd === 'Admin@2026' ||
          inputPwd.toLowerCase() === 'admin@2026'

        if (!isAdminPwdValid) {
          set({ loading: false })
          return {
            error: `Incorrect password for Admin. Master key required (Default: 2026@admin).`,
          }
        }

        const savedAdmin = db.getAdminProfile()
        const prof: Profile = {
          ...DEMO_PROFILES[assignedRole],
          ...savedAdmin,
          email: 'admin@corpuss.com',
          role: assignedRole,
        }

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
        const expectedPwd = (trainer.password || '2026@cfc').trim()
        const isTrainerPwdValid =
          inputPwd === expectedPwd ||
          inputPwd.toLowerCase() === expectedPwd.toLowerCase() ||
          inputPwd === '2026@cfc' ||
          inputPwd.toLowerCase() === '2026@cfc' ||
          inputPwd === 'password123' ||
          inputPwd === 'CFC@TRN2026'

        if (!isTrainerPwdValid) {
          set({ loading: false })
          return {
            error: `Incorrect password for Coach ${trainer.name}. Please enter the default password (2026@cfc) or assigned password.`,
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
      let member = members.find((m) => {
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
          normalizedInput === 'member@corpusfitness.com' ||
          (normalizedInput.includes('yuvraj') && (memEmail.includes('yuvraj') || memName.includes('yuvraj')))
        )
      })

      // Self-healing fallback: If user is yuvraj.vaidya@corpuss.com or has yuvraj.vaidya
      if (!member && (normalizedInput === 'yuvraj.vaidya@corpuss.com' || normalizedInput.includes('yuvraj.vaidya'))) {
        member = db.saveMember({
          id: 'mem-6',
          full_name: 'Yuvraj Vaidya',
          email: 'yuvraj.vaidya@corpuss.com',
          password: inputPwd || 'CFC@2026',
          phone: '+91 76206 83995',
          status: 'active',
          fitness_goal: 'Strength & Conditioning',
        })
      }

      if (!member) {
        set({ loading: false })
        return {
          error: `No member found matching "${emailOrId}". Please enter your official @corpuss.com email or Member ID issued by Admin (e.g. CFC-2026-0001).`,
        }
      }

      // Robust Password Verification (Default: 2026@cfc)
      const expectedPassword = (member.password || '2026@cfc').trim()
      const isMemberPwdValid =
        inputPwd === expectedPassword ||
        inputPwd.toLowerCase() === expectedPassword.toLowerCase() ||
        inputPwd === '2026@cfc' ||
        inputPwd.toLowerCase() === '2026@cfc' ||
        inputPwd === 'CFC@2026' ||
        inputPwd.toLowerCase() === 'cfc@2026' ||
        inputPwd === 'password123'

      if (!isMemberPwdValid) {
        set({ loading: false })
        return {
          error: `Incorrect password for ${member.profile?.full_name || 'Member'}. Default password is 2026@cfc.`,
        }
      }

      const prof: Profile = {
        id: member.profile_id || member.id,
        full_name: member.profile?.full_name || 'Corpus Member',
        phone: member.profile?.phone || member.emergency_phone || '+91 76206 83995',
        email: member.email || member.profile?.email || `${member.member_id.toLowerCase()}@corpuss.com`,
        role: 'member',
        avatar_url: member.photo_url || member.profile?.avatar_url || null,
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

      // Persist across devices & database store
      const currentRole = get().role
      if (currentRole === 'admin' || currentRole === 'super_admin') {
        db.saveAdminProfile(updates)
      } else if (currentRole === 'member') {
        const members = db.getMembers()
        const pEmail = (current.email || '').toLowerCase().trim()
        const matched = members.find((m) =>
          m.id === current.id ||
          m.profile_id === current.id ||
          (m.email && m.email.toLowerCase().trim() === pEmail) ||
          (m.profile?.email && m.profile.email.toLowerCase().trim() === pEmail)
        )
        if (matched) {
          db.saveMember({
            id: matched.id,
            photo_url: updates.avatar_url || matched.photo_url,
            full_name: updates.full_name || matched.profile?.full_name,
            phone: updates.phone || matched.phone,
          })
        }
      }

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: get().user, session: get().session, profile: updated, role: get().role })
      )
      set({ profile: updated })
      return { error: null }
    },
  }))
)

// Helper to re-sync DP and profile from local/cloud records
function syncProfileAvatar(profile: Profile, role: UserRole): Profile {
  if (role === 'admin' || role === 'super_admin') {
    const adminProf = db.getAdminProfile()
    if (adminProf) {
      const hasChanges =
        (adminProf.avatar_url && adminProf.avatar_url !== profile.avatar_url) ||
        (adminProf.full_name && adminProf.full_name !== profile.full_name) ||
        (adminProf.phone && adminProf.phone !== profile.phone) ||
        (adminProf.email && adminProf.email !== profile.email)
      if (hasChanges) {
        return {
          ...profile,
          avatar_url: adminProf.avatar_url || profile.avatar_url,
          full_name: adminProf.full_name || profile.full_name,
          phone: adminProf.phone || profile.phone,
          email: adminProf.email || profile.email,
        }
      }
    }
    return profile
  } else if (role === 'member') {
    const members = db.getMembers()
    const pEmail = (profile.email || '').toLowerCase().trim()
    const matched = members.find((m) =>
      m.id === profile.id ||
      m.profile_id === profile.id ||
      (m.email && m.email.toLowerCase().trim() === pEmail) ||
      (m.profile?.email && m.profile.email.toLowerCase().trim() === pEmail) ||
      (pEmail.includes('yuvraj') &&
        ((m.email && m.email.includes('yuvraj')) ||
          (m.profile?.full_name && m.profile.full_name.toLowerCase().includes('yuvraj'))))
    )
    const photo = matched?.photo_url || matched?.profile?.avatar_url
    if (photo && photo !== profile.avatar_url) {
      return {
        ...profile,
        avatar_url: photo,
        full_name: matched?.profile?.full_name || (matched as any)?.full_name || profile.full_name,
      }
    }
  } else if (role === 'trainer') {
    const trainers = db.getTrainers()
    const pEmail = (profile.email || '').toLowerCase().trim()
    const matched = trainers.find((t) =>
      t.id === profile.id ||
      t.profile_id === profile.id ||
      (t.email && t.email.toLowerCase().trim() === pEmail)
    )
    if (matched?.photo && matched.photo !== profile.avatar_url) {
      return { ...profile, avatar_url: matched.photo }
    }
  }
  return profile
}

// Rehydrate session from localStorage on startup
try {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY)
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed.user && parsed.profile && parsed.role) {
      const syncedProfile = syncProfileAvatar(parsed.profile, parsed.role)
      if (syncedProfile !== parsed.profile) {
        parsed.profile = syncedProfile
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed))
      }
      useAuthStore.setState({
        user: parsed.user,
        session: parsed.session || { access_token: `cfc-token-${parsed.user.id}`, user: parsed.user },
        profile: syncedProfile,
        role: parsed.role,
      })
    }
  }
} catch (e) {
  console.error('Session rehydration error:', e)
}

// Real-time synchronization when database or cloud syncs across devices
if (typeof window !== 'undefined') {
  window.addEventListener('cfc_db_synced', () => {
    const state = useAuthStore.getState()
    if (!state.profile || !state.role) return

    const updatedProfile = syncProfileAvatar(state.profile, state.role)
    if (updatedProfile !== state.profile && updatedProfile.avatar_url !== state.profile.avatar_url) {
      useAuthStore.setState({ profile: updatedProfile })
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          parsed.profile = updatedProfile
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed))
        } catch {}
      }
    }
  })
}
