export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          affiliate_link: string | null
          author: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          rating: number | null
          title: string
        }
        Insert: {
          affiliate_link?: string | null
          author: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          rating?: number | null
          title: string
        }
        Update: {
          affiliate_link?: string | null
          author?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          rating?: number | null
          title?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          created_at: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: string
          created_at: string
          emoji: string | null
          id: string
          is_active: boolean
          name: string
          period: string
          streak: number
          updated_at: string
          days_of_week: number[]
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          emoji?: string | null
          id?: string
          is_active?: boolean
          name: string
          period: string
          streak?: number
          updated_at?: string
          days_of_week?: number[]
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          emoji?: string | null
          id?: string
          is_active?: boolean
          name?: string
          period?: string
          streak?: number
          updated_at?: string
          days_of_week?: number[]
          user_id?: string
        }
        Relationships: []
      }
      meditations: {
        Row: {
          ambient_sounds: string[]
          audio_path: string
          category: string
          category_label: string
          cover_image_url: string | null
          created_at: string
          description: string
          duration_label: string
          duration_seconds: number
          focus: string | null
          id: string
          is_active: boolean
          premium_only: boolean
          slug: string
          sort_order: number
          steps: string[]
          title: string
          updated_at: string
        }
        Insert: {
          ambient_sounds?: string[]
          audio_path: string
          category: string
          category_label: string
          cover_image_url?: string | null
          created_at?: string
          description: string
          duration_label?: string
          duration_seconds?: number
          focus?: string | null
          id?: string
          is_active?: boolean
          premium_only?: boolean
          slug: string
          sort_order?: number
          steps?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          ambient_sounds?: string[]
          audio_path?: string
          category?: string
          category_label?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          duration_label?: string
          duration_seconds?: number
          focus?: string | null
          id?: string
          is_active?: boolean
          premium_only?: boolean
          slug?: string
          sort_order?: number
          steps?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string
          category: string | null
          created_at: string
          id: string
          text: string
        }
        Insert: {
          author: string
          category?: string | null
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          author?: string
          category?: string | null
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: []
      }
      tips: {
        Row: {
          category: string
          content: string
          created_at: string
          icon: string | null
          id: string
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          icon?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          icon?: string | null
          id?: string
          title?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const



