import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean

  /* Actions */
  initialize: () => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>
  deleteAccount: () => Promise<{ error: string | null }>

  /* Derived helpers */
  displayName: () => string
  initials: () => string
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({
          user: session.user,
          session,
          profile: profile || null,
          initialized: true,
        })
      } else {
        set({ initialized: true })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({
            user: session.user,
            session,
            profile: profile || null,
          })
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, session: null, profile: null })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          set({ session })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ initialized: true })
    }
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) {
        set({ loading: false })

        // "Database error saving new user" = trigger failed, but we can handle it
        if (error.message.includes('Database error')) {
          // Try signing in — user might already exist from a previous partial signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            // Truly a new user but DB trigger failed — advise retry
            return { error: 'Gagal mendaftar. Database sedang bermasalah, coba lagi dalam beberapa saat.' }
          }

          if (signInData.user) {
            // User exists, ensure profile exists
            await ensureProfile(signInData.user.id, email, fullName)

            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', signInData.user.id)
              .single()

            set({
              user: signInData.user,
              session: signInData.session,
              profile: profile || null,
              loading: false,
            })
            return { error: null }
          }
        }

        const msg = mapAuthError(error.message)
        return { error: msg }
      }

      if (data.user) {
        // Ensure profile exists (handles both trigger success and failure cases)
        await ensureProfile(data.user.id, email, fullName)

        // Create default preferences
        await supabase.from('user_preferences').upsert({
          user_id: data.user.id,
          dark_mode: false,
          email_notif: true,
          push_notif: true,
          public_profile: true,
          language: 'id',
          remember_me: false,
        } as Record<string, unknown>)

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        set({
          user: data.user,
          session: data.session,
          profile: profile || {
            id: data.user.id,
            email,
            full_name: fullName,
            username: '@' + fullName.toLowerCase().replace(/\s+/g, '').slice(0, 15),
            bio: `Mahasiswa · Belajar UI/UX di NODES`,
            avatar_url: null,
            role: 'Mahasiswa',
            level: 1,
            xp: 0,
            streak_days: 0,
            active_days: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          loading: false,
        })
      }

      set({ loading: false })
      return { error: null }
    } catch (err) {
      set({ loading: false })
      return { error: 'Terjadi kesalahan. Coba lagi nanti.' }
    }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ loading: false })
        const msg = mapAuthError(error.message)
        return { error: msg }
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        set({
          user: data.user,
          session: data.session,
          profile: profile || null,
          loading: false,
        })
      }

      set({ loading: false })
      return { error: null }
    } catch (err) {
      set({ loading: false })
      return { error: 'Terjadi kesalahan. Coba lagi nanti.' }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },

  updateProfile: async (data) => {
    const { user } = get()
    if (!user) return { error: 'Belum login' }

    try {
      const updateData = { ...data, updated_at: new Date().toISOString() }
      const { error } = await supabase
        .from('profiles')
        .update(updateData as Record<string, unknown>)
        .eq('id', user.id)

      if (error) return { error: error.message }

      // Refresh profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) set({ profile })
      return { error: null }
    } catch {
      return { error: 'Gagal memperbarui profil.' }
    }
  },

  deleteAccount: async () => {
    const { user } = get()
    if (!user) return { error: 'Belum login' }

    try {
      // Delete user data from all tables
      await supabase.from('module_progress').delete().eq('user_id', user.id)
      await supabase.from('canvas_projects').delete().eq('user_id', user.id)
      await supabase.from('user_preferences').delete().eq('user_id', user.id)
      await supabase.from('activity_log').delete().eq('user_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)

      // Sign out
      await supabase.auth.signOut()
      set({ user: null, session: null, profile: null })
      return { error: null }
    } catch {
      return { error: 'Gagal menghapus akun.' }
    }
  },

  displayName: () => {
    const { profile, user } = get()
    return profile?.full_name || user?.user_metadata?.full_name || 'User'
  },

  initials: () => {
    const name = get().displayName()
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  },
}))

/* Map Supabase error messages to Indonesian */
function mapAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email atau password salah.'
  if (msg.includes('Email not confirmed')) return 'Email belum diverifikasi. Cek inbox kamu.'
  if (msg.includes('User already registered')) return 'Email sudah terdaftar. Silakan masuk.'
  if (msg.includes('Password should be at least')) return 'Password minimal 6 karakter.'
  if (msg.includes('rate limit')) return 'Terlalu banyak percobaan. Tunggu beberapa saat.'
  if (msg.includes('Email rate limit')) return 'Terlalu banyak email terkirim. Tunggu beberapa saat.'
  if (msg.includes('Database error')) return 'Gagal mendaftar. Database sedang bermasalah, coba lagi.'
  if (msg.includes('invalid')) return 'Format email tidak valid.'
  return msg
}

/* Ensure profile row exists for a user (handles both trigger-created and manual cases) */
async function ensureProfile(userId: string, email: string, fullName: string) {
  const username = '@' + fullName.toLowerCase().replace(/\s+/g, '').slice(0, 15)

  // Check if profile already exists (created by DB trigger)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existing) {
    // Profile exists (trigger worked), just update full_name if needed
    await supabase
      .from('profiles')
      .update({ full_name: fullName, username, email } as Record<string, unknown>)
      .eq('id', userId)
  } else {
    // Profile doesn't exist (trigger failed), create it
    await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      username,
      bio: 'Mahasiswa · Belajar UI/UX di NODES',
      role: 'Mahasiswa',
      level: 1,
      xp: 0,
      streak_days: 0,
      active_days: 0,
    } as Record<string, unknown>)
  }
}
