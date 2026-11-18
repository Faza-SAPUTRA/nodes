/* ─── Supabase Database Types ─── */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          username: string | null
          bio: string | null
          avatar_url: string | null
          role: string
          level: number
          xp: number
          streak_days: number
          active_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          role?: string
          level?: number
          xp?: number
          streak_days?: number
          active_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          role?: string
          level?: number
          xp?: number
          streak_days?: number
          active_days?: number
          updated_at?: string
        }
      }
      module_progress: {
        Row: {
          id: string
          user_id: string
          module_id: number
          sub_babs: Record<string, boolean>
          progress: number
          notes: Record<string, string>
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: number
          sub_babs?: Record<string, boolean>
          progress?: number
          notes?: Record<string, string>
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          sub_babs?: Record<string, boolean>
          progress?: number
          notes?: Record<string, string>
          completed_at?: string | null
          updated_at?: string
        }
      }
      canvas_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          template: string
          layers: Record<string, unknown>[]
          layer_props: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template?: string
          layers?: Record<string, unknown>[]
          layer_props?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          template?: string
          layers?: Record<string, unknown>[]
          layer_props?: Record<string, unknown>
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          dark_mode: boolean
          email_notif: boolean
          push_notif: boolean
          public_profile: boolean
          language: string
          remember_me: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          dark_mode?: boolean
          email_notif?: boolean
          push_notif?: boolean
          public_profile?: boolean
          language?: string
          remember_me?: boolean
          updated_at?: string
        }
        Update: {
          dark_mode?: boolean
          email_notif?: boolean
          push_notif?: boolean
          public_profile?: boolean
          language?: string
          remember_me?: boolean
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          action: string
          details: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details?: string | null
          created_at?: string
        }
        Update: never
      }
    }
  }
}

/* ─── Helper Types ─── */
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ModuleProgress = Database['public']['Tables']['module_progress']['Row']
export type CanvasProject = Database['public']['Tables']['canvas_projects']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']
