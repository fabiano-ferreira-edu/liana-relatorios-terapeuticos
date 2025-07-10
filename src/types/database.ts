export interface Database {
  public: {
    Tables: {
      app_configs: {
        Row: {
          id: string
          introduction_text: string
          cover_settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          introduction_text: string
          cover_settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          introduction_text?: string
          cover_settings?: any
          updated_at?: string
        }
      }
      frequencies: {
        Row: {
          id: number
          title: string
          description: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          image_url?: string | null
          updated_at?: string
        }
      }
      session_reports: {
        Row: {
          id: string
          therapist_name: string
          client_name: string
          session_date: string
          session_time: string | null
          selected_frequencies: number[]
          created_at: string
        }
        Insert: {
          id?: string
          therapist_name: string
          client_name: string
          session_date: string
          session_time?: string | null
          selected_frequencies: number[]
          created_at?: string
        }
        Update: {
          id?: string
          therapist_name?: string
          client_name?: string
          session_date?: string
          session_time?: string | null
          selected_frequencies?: number[]
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
      [_ in never]: never
    }
  }
}