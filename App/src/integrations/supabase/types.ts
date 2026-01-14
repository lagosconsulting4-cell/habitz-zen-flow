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
      habit_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon_key: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon_key?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon_key?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          completed_at_time: string | null
          created_at: string
          habit_id: string
          id: string
          note: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          completed_at: string
          completed_at_time?: string | null
          created_at?: string
          habit_id: string
          id?: string
          note?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          completed_at?: string
          completed_at_time?: string | null
          created_at?: string
          habit_id?: string
          id?: string
          note?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_notifications: {
        Row: {
          channel: string | null
          created_at: string | null
          habit_id: string
          id: string
          sound: string | null
          time: string
          time_sensitive: boolean | null
          type: Database["public"]["Enums"]["habit_notification_type"]
          updated_at: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          habit_id: string
          id?: string
          sound?: string | null
          time: string
          time_sensitive?: boolean | null
          type: Database["public"]["Enums"]["habit_notification_type"]
          updated_at?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          habit_id?: string
          id?: string
          sound?: string | null
          time?: string
          time_sensitive?: boolean | null
          type?: Database["public"]["Enums"]["habit_notification_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_notifications_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_templates: {
        Row: {
          auto_complete_source: Database["public"]["Enums"]["habit_auto_complete_source"] | null
          category_id: string | null
          color: string | null
          created_at: string | null
          default_days_of_week: number[] | null
          default_every_n_days: number | null
          default_frequency_type: Database["public"]["Enums"]["habit_frequency_type"] | null
          default_goal_value: number | null
          default_notifications: Json | null
          default_times_per_month: number | null
          default_times_per_week: number | null
          default_unit: Database["public"]["Enums"]["habit_unit"] | null
          icon_key: string | null
          id: string
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          auto_complete_source?: Database["public"]["Enums"]["habit_auto_complete_source"] | null
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          default_days_of_week?: number[] | null
          default_every_n_days?: number | null
          default_frequency_type?: Database["public"]["Enums"]["habit_frequency_type"] | null
          default_goal_value?: number | null
          default_notifications?: Json | null
          default_times_per_month?: number | null
          default_times_per_week?: number | null
          default_unit?: Database["public"]["Enums"]["habit_unit"] | null
          icon_key?: string | null
          id?: string
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_complete_source?: Database["public"]["Enums"]["habit_auto_complete_source"] | null
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          default_days_of_week?: number[] | null
          default_every_n_days?: number | null
          default_frequency_type?: Database["public"]["Enums"]["habit_frequency_type"] | null
          default_goal_value?: number | null
          default_notifications?: Json | null
          default_times_per_month?: number | null
          default_times_per_week?: number | null
          default_unit?: Database["public"]["Enums"]["habit_unit"] | null
          icon_key?: string | null
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "habit_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      habits: {
        Row: {
          auto_complete_source: Database["public"]["Enums"]["habit_auto_complete_source"] | null
          category: string
          color: string | null
          created_at: string
          emoji: string | null
          every_n_days: number | null
          frequency_type: Database["public"]["Enums"]["habit_frequency_type"] | null
          goal_value: number | null
          id: string
          icon_key: string | null
          is_active: boolean
          name: string
          notification_pref: Json | null
          period: string
          streak: number
          times_per_month: number | null
          times_per_week: number | null
          unit: Database["public"]["Enums"]["habit_unit"] | null
          updated_at: string
          days_of_week: number[]
          user_id: string
          // New enriched fields
          reminder_time: string | null
          duration_minutes: number | null
          priority: number | null
          template_id: string | null
          recommendation_score: number | null
          source: string | null
        }
        Insert: {
          auto_complete_source?: Database["public"]["Enums"]["habit_auto_complete_source"] | null
          category: string
          color?: string | null
          created_at?: string
          emoji?: string | null
          every_n_days?: number | null
          frequency_type?: Database["public"]["Enums"]["habit_frequency_type"] | null
          goal_value?: number | null
          id?: string
          icon_key?: string | null
          is_active?: boolean
          name: string
          notification_pref?: Json | null
          period: string
          streak?: number
          times_per_month?: number | null
          times_per_week?: number | null
          unit?: Database["public"]["Enums"]["habit_unit"] | null
          updated_at?: string
          days_of_week?: number[]
          user_id: string
          // New enriched fields
          reminder_time?: string | null
          duration_minutes?: number | null
          priority?: number | null
          template_id?: string | null
          recommendation_score?: number | null
          source?: string | null
        }
        Update: {
          auto_complete_source?: Database["public"]["Enums"]["habit_auto_complete_source"] | null
          category?: string
          color?: string | null
          created_at?: string
          emoji?: string | null
          every_n_days?: number | null
          frequency_type?: Database["public"]["Enums"]["habit_frequency_type"] | null
          goal_value?: number | null
          id?: string
          icon_key?: string | null
          is_active?: boolean
          name?: string
          notification_pref?: Json | null
          period?: string
          streak?: number
          times_per_month?: number | null
          times_per_week?: number | null
          unit?: Database["public"]["Enums"]["habit_unit"] | null
          updated_at?: string
          days_of_week?: number[]
          user_id?: string
          // New enriched fields
          reminder_time?: string | null
          duration_minutes?: number | null
          priority?: number | null
          template_id?: string | null
          recommendation_score?: number | null
          source?: string | null
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
          is_premium?: boolean | null
          premium_since?: string | null
          has_completed_onboarding?: boolean | null
          onboarding_completed_at?: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean | null
          premium_since?: string | null
          has_completed_onboarding?: boolean | null
          onboarding_completed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean | null
          premium_since?: string | null
          has_completed_onboarding?: boolean | null
          onboarding_completed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          created_at?: string
          updated_at?: string
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
      sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          session_date: string
          device_type: string | null
          platform: string | null
          app_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          session_date?: string
          device_type?: string | null
          platform?: string | null
          app_version?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          session_date?: string
          device_type?: string | null
          platform?: string | null
          app_version?: string | null
          created_at?: string
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          answers: Json
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          answers: Json
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          answers?: Json
          completed_at?: string | null
          created_at?: string
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
      guided_days: {
        Row: {
          id: string
          week: number
          day: number
          global_day: number
          title: string
          description: string | null
          estimated_minutes: number | null
          type: string
          audio_url: string | null
        }
        Insert: {
          id?: string
          week: number
          day: number
          global_day: number
          title: string
          description?: string | null
          estimated_minutes?: number | null
          type: string
          audio_url?: string | null
        }
        Update: {
          id?: string
          week?: number
          day?: number
          global_day?: number
          title?: string
          description?: string | null
          estimated_minutes?: number | null
          type?: string
          audio_url?: string | null
        }
        Relationships: []
      }
      guided_user_state: {
        Row: {
          user_id: string
          started_at: string
          last_completed_global_day: number
        }
        Insert: {
          user_id: string
          started_at?: string
          last_completed_global_day?: number
        }
        Update: {
          user_id?: string
          started_at?: string
          last_completed_global_day?: number
        }
        Relationships: [
          {
            foreignKeyName: "guided_user_state_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      guided_day_completions: {
        Row: {
          id: string
          user_id: string
          global_day: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          global_day: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          global_day?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guided_day_completions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      landing_events: {
        Row: {
          id: number
          event: string
          session_id: string
          meta: Json | null
          created_at: string | null
        }
        Insert: {
          id?: number
          event: string
          session_id: string
          meta?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: number
          event?: string
          session_id?: string
          meta?: Json | null
          created_at?: string | null
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
      habit_auto_complete_source: "manual" | "health"
      habit_frequency_type: "fixed_days" | "times_per_week" | "times_per_month" | "every_n_days" | "daily"
      habit_notification_type: "reminder" | "completed"
      habit_unit: "none" | "steps" | "minutes" | "km" | "custom"
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



