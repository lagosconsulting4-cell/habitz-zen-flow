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
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          checkin_date: string
          mood_level: number
          energy_level: number | null
          focus_level: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          checkin_date: string
          mood_level: number
          energy_level?: number | null
          focus_level?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          checkin_date?: string
          mood_level?: number
          energy_level?: number | null
          focus_level?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
      assessment_responses: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          answers: Json
          scores: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          answers: Json
          scores?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          answers?: Json
          scores?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      analysis_summaries: {
        Row: {
          id: string
          assessment_id: string
          user_id: string | null
          diagnosis_type: string
          probability_score: number
          summary_pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          user_id?: string | null
          diagnosis_type: string
          probability_score: number
          summary_pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          user_id?: string | null
          diagnosis_type?: string
          probability_score?: number
          summary_pdf_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_summaries_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessment_responses"
            referencedColumns: ["id"]
          }
        ]
      }
      tdah_archetypes: {
        Row: {
          id: string
          title: string
          description: string
          primary_symptoms: Json
        }
        Insert: {
          id: string
          title: string
          description: string
          primary_symptoms: Json
        }
        Update: {
          id?: string
          title?: string
          description?: string
          primary_symptoms?: Json
        }
        Relationships: []
      }
      program_modules: {
        Row: {
          id: string
          module_number: number
          title: string
          subtitle: string | null
          description: string | null
          focus: string | null
          week_assignment: number | null
          sort_order: number
          is_bonus: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_number: number
          title: string
          subtitle?: string | null
          description?: string | null
          focus?: string | null
          week_assignment?: number | null
          sort_order?: number
          is_bonus?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_number?: number
          title?: string
          subtitle?: string | null
          description?: string | null
          focus?: string | null
          week_assignment?: number | null
          sort_order?: number
          is_bonus?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_lessons: {
        Row: {
          id: string
          module_id: string
          lesson_number: number
          title: string
          lesson_type: string
          duration_minutes: number | null
          content_url: string | null
          transcript: string | null
          sort_order: number
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          lesson_number: number
          title: string
          lesson_type: string
          duration_minutes?: number | null
          content_url?: string | null
          transcript?: string | null
          sort_order?: number
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          lesson_number?: number
          title?: string
          lesson_type?: string
          duration_minutes?: number | null
          content_url?: string | null
          transcript?: string | null
          sort_order?: number
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "program_modules"
            referencedColumns: ["id"]
          }
        ]
      }
      module_resources: {
        Row: {
          id: string
          module_id: string | null
          resource_type: string
          title: string
          description: string | null
          file_url: string | null
          is_bonus: boolean
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          module_id?: string | null
          resource_type: string
          title: string
          description?: string | null
          file_url?: string | null
          is_bonus?: boolean
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string | null
          resource_type?: string
          title?: string
          description?: string | null
          file_url?: string | null
          is_bonus?: boolean
          tags?: string[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "program_modules"
            referencedColumns: ["id"]
          }
        ]
      }
      module_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          status: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          status?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          status?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "module_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      personal_plans: {
        Row: {
          id: string
          user_id: string
          assessment_id: string | null
          diagnosis_type: string
          recommended_modules: Json | null
          recommended_habits: Json | null
          week_schedule: Json | null
          generated_pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_id?: string | null
          diagnosis_type: string
          recommended_modules?: Json | null
          recommended_habits?: Json | null
          week_schedule?: Json | null
          generated_pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_id?: string | null
          diagnosis_type?: string
          recommended_modules?: Json | null
          recommended_habits?: Json | null
          week_schedule?: Json | null
          generated_pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_plans_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessment_responses"
            referencedColumns: ["id"]
          }
        ]
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



