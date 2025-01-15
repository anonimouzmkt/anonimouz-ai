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
      dispatch_contact_results: {
        Row: {
          contact_name: string
          contact_phone: string
          created_at: string
          dispatch_id: string
          error_message: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_name: string
          contact_phone: string
          created_at?: string
          dispatch_id: string
          error_message?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_name?: string
          contact_phone?: string
          created_at?: string
          dispatch_id?: string
          error_message?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_contact_results_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "dispatch_results"
            referencedColumns: ["id"]
          }
        ]
      }
      dispatch_results: {
        Row: {
          ai_context: string | null
          created_at: string
          error_count: number
          id: string
          initial_message: string
          instance_id: string
          is_ai_dispatch: boolean
          success_count: number
          total_contacts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_context?: string | null
          created_at?: string
          error_count?: number
          id?: string
          initial_message: string
          instance_id: string
          is_ai_dispatch?: boolean
          success_count?: number
          total_contacts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_context?: string | null
          created_at?: string
          error_count?: number
          id?: string
          initial_message?: string
          instance_id?: string
          is_ai_dispatch?: boolean
          success_count?: number
          total_contacts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_results_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          admin_users: boolean | null
          api_key: string
          created_at: string
          email: string | null
          id: string
          language: string
          role: Database["public"]["Enums"]["user_role"]
          theme_color: string
          unique_id: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          admin_users?: boolean | null
          api_key?: string
          created_at?: string
          email?: string | null
          id: string
          language?: string
          role?: Database["public"]["Enums"]["user_role"]
          theme_color?: string
          unique_id?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          admin_users?: boolean | null
          api_key?: string
          created_at?: string
          email?: string | null
          id?: string
          language?: string
          role?: Database["public"]["Enums"]["user_role"]
          theme_color?: string
          unique_id?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          created_at: string
          id: string
          name: string
          qr_code: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          qr_code?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          qr_code?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_instance_status: {
        Args: {
          p_instance_id: string
          p_status: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin_user" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}