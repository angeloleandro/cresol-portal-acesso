export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          role: 'admin' | 'sector_admin' | 'user' | null
          position: string | null
          work_location_id: string | null
          position_id: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'sector_admin' | 'user' | null
          position?: string | null
          work_location_id?: string | null
          position_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'sector_admin' | 'user' | null
          position?: string | null
          work_location_id?: string | null
          position_id?: string | null
          updated_at?: string | null
        }
      }
      sectors: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sector_news: {
        Row: {
          id: string
          sector_id: string
          title: string
          summary: string
          content: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sector_id: string
          title: string
          summary: string
          content: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sector_id?: string
          title?: string
          summary?: string
          content?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sector_events: {
        Row: {
          id: string
          sector_id: string
          title: string
          description: string
          location: string | null
          start_date: string
          end_date: string | null
          is_featured: boolean | null
          is_published: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sector_id: string
          title: string
          description: string
          location?: string | null
          start_date: string
          end_date?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sector_id?: string
          title?: string
          description?: string
          location?: string | null
          start_date?: string
          end_date?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'sector_admin' | 'user'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}