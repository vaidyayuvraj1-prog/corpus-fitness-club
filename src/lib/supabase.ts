import { createClient } from '@supabase/supabase-js'

export const SUPABASE_PROJECT_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://lqhqbyetwupgpkghhtlk.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_A6xuLDN6PlcAo-jWSewatQ_BNgp0-Sd'

export const isSupabaseConfigured = true

export const supabase = createClient<any>(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY)
