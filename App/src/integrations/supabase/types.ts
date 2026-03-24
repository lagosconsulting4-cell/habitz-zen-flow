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
      access_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          type: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          type?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          type?: string
          used_at?: string | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          display_order: number
          emoji: string
          gem_reward: number
          id: string
          is_secret: boolean
          name: string
          tier: string
        }
        Insert: {
          category: string
          condition_type: string
          condition_value: number
          created_at?: string
          description: string
          display_order?: number
          emoji: string
          gem_reward?: number
          id: string
          is_secret?: boolean
          name: string
          tier: string
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          display_order?: number
          emoji?: string
          gem_reward?: number
          id?: string
          is_secret?: boolean
          name?: string
          tier?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      auditoria_reembolsos: {
        Row: {
          criado_em: string
          email: string
          id: string
          justificativa_detalhada: string
          motivo_principal: string
          produto: string
          status_analise: string
          sub_resposta: string | null
          transacao_id: string
        }
        Insert: {
          criado_em?: string
          email: string
          id?: string
          justificativa_detalhada: string
          motivo_principal: string
          produto: string
          status_analise?: string
          sub_resposta?: string | null
          transacao_id: string
        }
        Update: {
          criado_em?: string
          email?: string
          id?: string
          justificativa_detalhada?: string
          motivo_principal?: string
          produto?: string
          status_analise?: string
          sub_resposta?: string | null
          transacao_id?: string
        }
        Relationships: []
      }
      avatars: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          emoji: string
          gem_cost: number | null
          id: string
          is_premium_exclusive: boolean
          is_starter: boolean
          name: string
          tier: string
          unlock_achievement_id: string | null
          unlock_level: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          emoji: string
          gem_cost?: number | null
          id: string
          is_premium_exclusive?: boolean
          is_starter?: boolean
          name: string
          tier: string
          unlock_achievement_id?: string | null
          unlock_level?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          emoji?: string
          gem_cost?: number | null
          id?: string
          is_premium_exclusive?: boolean
          is_starter?: boolean
          name?: string
          tier?: string
          unlock_achievement_id?: string | null
          unlock_level?: number | null
        }
        Relationships: []
      }
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
      cancellation_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          rating: number
          reason: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating: number
          reason: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number
          reason?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string | null
          energy_level: number | null
          focus_level: number | null
          id: string
          mood_level: number
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checkin_date: string
          created_at?: string | null
          energy_level?: number | null
          focus_level?: number | null
          id?: string
          mood_level: number
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string | null
          energy_level?: number | null
          focus_level?: number | null
          id?: string
          mood_level?: number
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          event_date: string
          event_name: string
          event_properties: Json | null
          id: string
          screen: string | null
          session_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          event_date?: string
          event_name: string
          event_properties?: Json | null
          id?: string
          screen?: string | null
          session_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          event_date?: string
          event_name?: string
          event_properties?: Json | null
          id?: string
          screen?: string | null
          session_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      gem_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      guided_day_completions: {
        Row: {
          completed_at: string
          created_at: string
          global_day: number
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          global_day: number
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          global_day?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guided_day_completions_global_day_fkey"
            columns: ["global_day"]
            isOneToOne: false
            referencedRelation: "guided_days"
            referencedColumns: ["global_day"]
          },
        ]
      }
      guided_days: {
        Row: {
          audio_url: string | null
          created_at: string
          day: number
          description: string | null
          estimated_minutes: number | null
          global_day: number
          id: string
          title: string
          type: string
          updated_at: string
          week: number
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          day: number
          description?: string | null
          estimated_minutes?: number | null
          global_day?: number
          id?: string
          title: string
          type: string
          updated_at?: string
          week: number
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          day?: number
          description?: string | null
          estimated_minutes?: number | null
          global_day?: number
          id?: string
          title?: string
          type?: string
          updated_at?: string
          week?: number
        }
        Relationships: []
      }
      guided_user_state: {
        Row: {
          created_at: string
          last_completed_global_day: number
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          last_completed_global_day?: number
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          last_completed_global_day?: number
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          completion_count: number
          created_at: string
          habit_id: string
          id: string
          note: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          completed_at?: string
          completed_at_time?: string | null
          completion_count?: number
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
          completion_count?: number
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
          },
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
          },
        ]
      }
      habit_templates: {
        Row: {
          auto_complete_source:
            | Database["public"]["Enums"]["habit_auto_complete_source"]
            | null
          category_id: string | null
          color: string | null
          created_at: string | null
          default_days_of_week: number[] | null
          default_every_n_days: number | null
          default_frequency_type:
            | Database["public"]["Enums"]["habit_frequency_type"]
            | null
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
          auto_complete_source?:
            | Database["public"]["Enums"]["habit_auto_complete_source"]
            | null
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          default_days_of_week?: number[] | null
          default_every_n_days?: number | null
          default_frequency_type?:
            | Database["public"]["Enums"]["habit_frequency_type"]
            | null
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
          auto_complete_source?:
            | Database["public"]["Enums"]["habit_auto_complete_source"]
            | null
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          default_days_of_week?: number[] | null
          default_every_n_days?: number | null
          default_frequency_type?:
            | Database["public"]["Enums"]["habit_frequency_type"]
            | null
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
          },
        ]
      }
      habits: {
        Row: {
          auto_complete_source:
            | Database["public"]["Enums"]["habit_auto_complete_source"]
            | null
          category: string
          color: string | null
          created_at: string
          days_of_week: number[]
          due_date: string | null
          duration_minutes: number | null
          emoji: string | null
          every_n_days: number | null
          frequency_type:
            | Database["public"]["Enums"]["habit_frequency_type"]
            | null
          goal_value: number | null
          habit_type: string | null
          icon_key: string | null
          id: string
          is_active: boolean
          name: string
          notification_pref: Json | null
          onboarding_version: string | null
          period: string
          priority: number | null
          recommendation_score: number | null
          reminder_time: string | null
          source: string | null
          streak: number
          template_id: string | null
          times_per_day: number
          times_per_month: number | null
          times_per_week: number | null
          type: string | null
          unit: Database["public"]["Enums"]["habit_unit"] | null
          updated_at: string
          user_id: string
          week_variation: Json | null
        }
        Insert: {
          auto_complete_source?:
            | Database["public"]["Enums"]["habit_auto_complete_source"]
            | null
          category: string
          color?: string | null
          created_at?: string
          days_of_week?: number[]
          due_date?: string | null
          duration_minutes?: number | null
          emoji?: string | null
          every_n_days?: number | null
          frequency_type?:
            | Database["public"]["Enums"]["habit_frequency_type"]
            | null
          goal_value?: number | null
          habit_type?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          name: string
          notification_pref?: Json | null
          onboarding_version?: string | null
          period: string
          priority?: number | null
          recommendation_score?: number | null
          reminder_time?: string | null
          source?: string | null
          streak?: number
          template_id?: string | null
          times_per_day?: number
          times_per_month?: number | null
          times_per_week?: number | null
          type?: string | null
          unit?: Database["public"]["Enums"]["habit_unit"] | null
          updated_at?: string
          user_id: string
          week_variation?: Json | null
        }
        Update: {
          auto_complete_source?:
            | Database["public"]["Enums"]["habit_auto_complete_source"]
            | null
          category?: string
          color?: string | null
          created_at?: string
          days_of_week?: number[]
          due_date?: string | null
          duration_minutes?: number | null
          emoji?: string | null
          every_n_days?: number | null
          frequency_type?:
            | Database["public"]["Enums"]["habit_frequency_type"]
            | null
          goal_value?: number | null
          habit_type?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notification_pref?: Json | null
          onboarding_version?: string | null
          period?: string
          priority?: number | null
          recommendation_score?: number | null
          reminder_time?: string | null
          source?: string | null
          streak?: number
          template_id?: string | null
          times_per_day?: number
          times_per_month?: number | null
          times_per_week?: number | null
          type?: string | null
          unit?: Database["public"]["Enums"]["habit_unit"] | null
          updated_at?: string
          user_id?: string
          week_variation?: Json | null
        }
        Relationships: []
      }
      journey_days: {
        Row: {
          card_content: string
          day_number: number
          estimated_minutes: number | null
          id: string
          is_cliff_day: boolean | null
          is_rest_day: boolean | null
          is_review_day: boolean | null
          journey_id: string
          motivational_note: string | null
          phase_id: string
          title: string
        }
        Insert: {
          card_content: string
          day_number: number
          estimated_minutes?: number | null
          id?: string
          is_cliff_day?: boolean | null
          is_rest_day?: boolean | null
          is_review_day?: boolean | null
          journey_id: string
          motivational_note?: string | null
          phase_id: string
          title: string
        }
        Update: {
          card_content?: string
          day_number?: number
          estimated_minutes?: number | null
          id?: string
          is_cliff_day?: boolean | null
          is_rest_day?: boolean | null
          is_review_day?: boolean | null
          journey_id?: string
          motivational_note?: string | null
          phase_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_days_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "admin_journey_overview"
            referencedColumns: ["journey_id"]
          },
          {
            foreignKeyName: "journey_days_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_days_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "journey_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_habit_templates: {
        Row: {
          canonical_key: string | null
          category: string
          days_of_week: number[] | null
          emoji: string | null
          end_day: number | null
          frequency_type: string | null
          goal_progression: Json | null
          id: string
          illustration_key: string | null
          initial_goal_value: number | null
          journey_id: string
          name: string
          period: string
          sort_order: number | null
          start_day: number
          tracking_type: string
          unit: string | null
        }
        Insert: {
          canonical_key?: string | null
          category?: string
          days_of_week?: number[] | null
          emoji?: string | null
          end_day?: number | null
          frequency_type?: string | null
          goal_progression?: Json | null
          id?: string
          illustration_key?: string | null
          initial_goal_value?: number | null
          journey_id: string
          name: string
          period?: string
          sort_order?: number | null
          start_day?: number
          tracking_type?: string
          unit?: string | null
        }
        Update: {
          canonical_key?: string | null
          category?: string
          days_of_week?: number[] | null
          emoji?: string | null
          end_day?: number | null
          frequency_type?: string | null
          goal_progression?: Json | null
          id?: string
          illustration_key?: string | null
          initial_goal_value?: number | null
          journey_id?: string
          name?: string
          period?: string
          sort_order?: number | null
          start_day?: number
          tracking_type?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_habit_templates_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "admin_journey_overview"
            referencedColumns: ["journey_id"]
          },
          {
            foreignKeyName: "journey_habit_templates_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_phases: {
        Row: {
          badge_illustration_key: string | null
          badge_name: string | null
          day_end: number
          day_start: number
          description: string | null
          id: string
          journey_id: string
          phase_number: number
          subtitle: string | null
          title: string
        }
        Insert: {
          badge_illustration_key?: string | null
          badge_name?: string | null
          day_end: number
          day_start: number
          description?: string | null
          id?: string
          journey_id: string
          phase_number: number
          subtitle?: string | null
          title: string
        }
        Update: {
          badge_illustration_key?: string | null
          badge_name?: string | null
          day_end?: number
          day_start?: number
          description?: string | null
          id?: string
          journey_id?: string
          phase_number?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_phases_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "admin_journey_overview"
            referencedColumns: ["journey_id"]
          },
          {
            foreignKeyName: "journey_phases_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_recommendation_scores: {
        Row: {
          calculated_at: string | null
          dominant_signal: string | null
          id: string
          journey_id: string
          score: number
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          dominant_signal?: string | null
          id?: string
          journey_id: string
          score?: number
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          dominant_signal?: string | null
          id?: string
          journey_id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      journeys: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          duration_days: number
          expected_result: string | null
          id: string
          illustration_key: string
          is_active: boolean | null
          level: number
          prerequisite_journey_slug: string | null
          prerequisite_min_percent: number | null
          promise: string | null
          slug: string
          sort_order: number | null
          subtitle: string | null
          tags: string[] | null
          target_audience: string | null
          theme_slug: string
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          expected_result?: string | null
          id?: string
          illustration_key: string
          is_active?: boolean | null
          level?: number
          prerequisite_journey_slug?: string | null
          prerequisite_min_percent?: number | null
          promise?: string | null
          slug: string
          sort_order?: number | null
          subtitle?: string | null
          tags?: string[] | null
          target_audience?: string | null
          theme_slug: string
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          expected_result?: string | null
          id?: string
          illustration_key?: string
          is_active?: boolean | null
          level?: number
          prerequisite_journey_slug?: string | null
          prerequisite_min_percent?: number | null
          promise?: string | null
          slug?: string
          sort_order?: number | null
          subtitle?: string | null
          tags?: string[] | null
          target_audience?: string | null
          theme_slug?: string
          title?: string
        }
        Relationships: []
      }
      landing_events: {
        Row: {
          created_at: string
          event: string
          id: number
          inserted_by: string | null
          meta: Json | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: number
          inserted_by?: string | null
          meta?: Json | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: number
          inserted_by?: string | null
          meta?: Json | null
          session_id?: string | null
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          admin_user_id: string
          content: string | null
          created_at: string
          id: string
          lead_id: string
          metadata: Json | null
          type: string
        }
        Insert: {
          admin_user_id: string
          content?: string | null
          created_at?: string
          id?: string
          lead_id: string
          metadata?: Json | null
          type: string
        }
        Update: {
          admin_user_id?: string
          content?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "admin_unconverted_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses"
            referencedColumns: ["id"]
          },
        ]
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
      module_lessons: {
        Row: {
          content_url: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          is_premium: boolean | null
          lesson_number: number
          lesson_type: string
          module_id: string
          sort_order: number
          title: string
          transcript: string | null
          updated_at: string
        }
        Insert: {
          content_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          lesson_number: number
          lesson_type: string
          module_id: string
          sort_order?: number
          title: string
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          content_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          lesson_number?: number
          lesson_type?: string
          module_id?: string
          sort_order?: number
          title?: string
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "program_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "module_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      module_resources: {
        Row: {
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          is_bonus: boolean | null
          module_id: string | null
          resource_type: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_bonus?: boolean | null
          module_id?: string | null
          resource_type: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_bonus?: boolean | null
          module_id?: string | null
          resource_type?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "program_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_history: {
        Row: {
          action_taken: string | null
          body: string
          clicked_at: string | null
          completed_from_notification: boolean | null
          context_type: string
          dismissed_at: string | null
          habit_id: string | null
          id: string
          message_key: string
          notification_date: string
          opened_at: string | null
          sent_at: string
          title: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          body: string
          clicked_at?: string | null
          completed_from_notification?: boolean | null
          context_type: string
          dismissed_at?: string | null
          habit_id?: string | null
          id?: string
          message_key: string
          notification_date?: string
          opened_at?: string | null
          sent_at?: string
          title: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          body?: string
          clicked_at?: string | null
          completed_from_notification?: boolean | null
          context_type?: string
          dismissed_at?: string | null
          habit_id?: string | null
          id?: string
          message_key?: string
          notification_date?: string
          opened_at?: string | null
          sent_at?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          afternoon_enabled: boolean
          afternoon_time: string | null
          created_at: string
          delayed_enabled: boolean
          end_of_day_enabled: boolean
          evening_enabled: boolean
          evening_time: string | null
          morning_enabled: boolean
          morning_time: string | null
          multiple_pending_enabled: boolean
          notifications_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          streak_milestone_enabled: boolean
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          afternoon_enabled?: boolean
          afternoon_time?: string | null
          created_at?: string
          delayed_enabled?: boolean
          end_of_day_enabled?: boolean
          evening_enabled?: boolean
          evening_time?: string | null
          morning_enabled?: boolean
          morning_time?: string | null
          multiple_pending_enabled?: boolean
          notifications_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          streak_milestone_enabled?: boolean
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          afternoon_enabled?: boolean
          afternoon_time?: string | null
          created_at?: string
          delayed_enabled?: boolean
          end_of_day_enabled?: boolean
          evening_enabled?: boolean
          evening_time?: string | null
          morning_enabled?: boolean
          morning_time?: string | null
          multiple_pending_enabled?: boolean
          notifications_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          streak_milestone_enabled?: boolean
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nps_feedback: {
        Row: {
          comentario: string | null
          created_at: string
          email: string | null
          id: string
          motivo: string | null
          nota: number | null
          produto: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          email?: string | null
          id?: string
          motivo?: string | null
          nota?: number | null
          produto: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          email?: string | null
          id?: string
          motivo?: string | null
          nota?: number | null
          produto?: string
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          id: string
          scores: Json | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          scores?: Json | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          scores?: Json | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pending_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          email: string
          id: string
          product_names: string | null
          provider: string | null
          provider_payment_intent: string | null
          provider_session_id: string | null
          status: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          email: string
          id?: string
          product_names?: string | null
          provider?: string | null
          provider_payment_intent?: string | null
          provider_session_id?: string | null
          status?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          email?: string
          id?: string
          product_names?: string | null
          provider?: string | null
          provider_payment_intent?: string | null
          provider_session_id?: string | null
          status?: string
        }
        Relationships: []
      }
      personal_plans: {
        Row: {
          assessment_id: string | null
          created_at: string
          diagnosis_type: string
          generated_pdf_url: string | null
          id: string
          recommended_habits: Json | null
          recommended_modules: Json | null
          updated_at: string
          user_id: string
          week_schedule: Json | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          diagnosis_type: string
          generated_pdf_url?: string | null
          id?: string
          recommended_habits?: Json | null
          recommended_modules?: Json | null
          updated_at?: string
          user_id: string
          week_schedule?: Json | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          diagnosis_type?: string
          generated_pdf_url?: string | null
          id?: string
          recommended_habits?: Json | null
          recommended_modules?: Json | null
          updated_at?: string
          user_id?: string
          week_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_plans_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "onboarding_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_recovery_exports: {
        Row: {
          campaign_name: string | null
          exported_at: string
          exported_by: string | null
          id: string
          source_id: string
          source_table: string
        }
        Insert: {
          campaign_name?: string | null
          exported_at?: string
          exported_by?: string | null
          id?: string
          source_id: string
          source_table: string
        }
        Update: {
          campaign_name?: string | null
          exported_at?: string
          exported_by?: string | null
          id?: string
          source_id?: string
          source_table?: string
        }
        Relationships: []
      }
      pix_transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          email: string
          external_id: string
          id: string
          name: string
          paid_at: string | null
          status: string | null
          tracking: Json | null
          transaction_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          email: string
          external_id: string
          id?: string
          name: string
          paid_at?: string | null
          status?: string | null
          tracking?: Json | null
          transaction_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          email?: string
          external_id?: string
          id?: string
          name?: string
          paid_at?: string | null
          status?: string | null
          tracking?: Json | null
          transaction_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_since: string | null
          avatar_config: Json | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          equipped_avatar_emoji: string | null
          has_completed_onboarding: boolean
          id: string
          is_admin: boolean
          is_premium: boolean
          onboarding_completed_at: string | null
          onboarding_goals: Json | null
          onboarding_v2_data: Json | null
          onboarding_version: string | null
          phone: string | null
          premium_since: string | null
          quiz_linked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_since?: string | null
          avatar_config?: Json | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          equipped_avatar_emoji?: string | null
          has_completed_onboarding?: boolean
          id?: string
          is_admin?: boolean
          is_premium?: boolean
          onboarding_completed_at?: string | null
          onboarding_goals?: Json | null
          onboarding_v2_data?: Json | null
          onboarding_version?: string | null
          phone?: string | null
          premium_since?: string | null
          quiz_linked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_since?: string | null
          avatar_config?: Json | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          equipped_avatar_emoji?: string | null
          has_completed_onboarding?: boolean
          id?: string
          is_admin?: boolean
          is_premium?: boolean
          onboarding_completed_at?: string | null
          onboarding_goals?: Json | null
          onboarding_v2_data?: Json | null
          onboarding_version?: string | null
          phone?: string | null
          premium_since?: string | null
          quiz_linked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      program_modules: {
        Row: {
          created_at: string
          description: string | null
          focus: string | null
          id: string
          is_bonus: boolean | null
          module_number: number
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
          week_assignment: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          focus?: string | null
          id?: string
          is_bonus?: boolean | null
          module_number: number
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
          week_assignment?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          focus?: string | null
          id?: string
          is_bonus?: boolean | null
          module_number?: number
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
          week_assignment?: number | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          billing_interval: string | null
          created_at: string
          currency: string
          email: string | null
          id: string
          payment_method: string | null
          product_names: string | null
          provider: string | null
          provider_payment_intent: string | null
          provider_session_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          billing_interval?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          payment_method?: string | null
          product_names?: string | null
          provider?: string | null
          provider_payment_intent?: string | null
          provider_session_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          billing_interval?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          payment_method?: string | null
          product_names?: string | null
          provider?: string | null
          provider_payment_intent?: string | null
          provider_session_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          age_range: string | null
          assigned_to: string | null
          challenges: Json | null
          completed: boolean | null
          consistency_feeling: string | null
          converted_to_customer: boolean | null
          created_at: string | null
          email: string
          energy_peak: string | null
          financial_range: string | null
          follow_up_status: string | null
          gender: string | null
          id: string
          last_campaign_sent_at: string | null
          linked_at: string | null
          name: string
          notes: string | null
          objective: string | null
          onboarding_completed: boolean | null
          phone: string
          profession: string | null
          projected_feeling: string | null
          recommended_habits: Json | null
          source: string | null
          tags: string[] | null
          time_available: string | null
          updated_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          week_days: Json | null
          week_days_preset: string | null
          work_schedule: string | null
          years_promising: string | null
        }
        Insert: {
          age_range?: string | null
          assigned_to?: string | null
          challenges?: Json | null
          completed?: boolean | null
          consistency_feeling?: string | null
          converted_to_customer?: boolean | null
          created_at?: string | null
          email: string
          energy_peak?: string | null
          financial_range?: string | null
          follow_up_status?: string | null
          gender?: string | null
          id?: string
          last_campaign_sent_at?: string | null
          linked_at?: string | null
          name: string
          notes?: string | null
          objective?: string | null
          onboarding_completed?: boolean | null
          phone: string
          profession?: string | null
          projected_feeling?: string | null
          recommended_habits?: Json | null
          source?: string | null
          tags?: string[] | null
          time_available?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          week_days?: Json | null
          week_days_preset?: string | null
          work_schedule?: string | null
          years_promising?: string | null
        }
        Update: {
          age_range?: string | null
          assigned_to?: string | null
          challenges?: Json | null
          completed?: boolean | null
          consistency_feeling?: string | null
          converted_to_customer?: boolean | null
          created_at?: string | null
          email?: string
          energy_peak?: string | null
          financial_range?: string | null
          follow_up_status?: string | null
          gender?: string | null
          id?: string
          last_campaign_sent_at?: string | null
          linked_at?: string | null
          name?: string
          notes?: string | null
          objective?: string | null
          onboarding_completed?: boolean | null
          phone?: string
          profession?: string | null
          projected_feeling?: string | null
          recommended_habits?: Json | null
          source?: string | null
          tags?: string[] | null
          time_available?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          week_days?: Json | null
          week_days_preset?: string | null
          work_schedule?: string | null
          years_promising?: string | null
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
          app_version: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          platform: string | null
          session_date: string
          started_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          platform?: string | null
          session_date?: string
          started_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          platform?: string | null
          session_date?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      streak_freeze_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          protected_date: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          protected_date?: string | null
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          protected_date?: string | null
          source?: string
          user_id?: string
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
      user_achievements: {
        Row: {
          achievement_id: string
          progress_snapshot: Json
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          progress_snapshot?: Json
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          progress_snapshot?: Json
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_avatars: {
        Row: {
          avatar_id: string
          is_equipped: boolean
          unlocked_at: string
          user_id: string
        }
        Insert: {
          avatar_id: string
          is_equipped?: boolean
          unlocked_at?: string
          user_id: string
        }
        Update: {
          avatar_id?: string
          is_equipped?: boolean
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_avatars_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cohorts: {
        Row: {
          acquisition_source: string | null
          created_at: string
          first_3day_streak_date: string | null
          first_7day_streak_date: string | null
          first_completion_date: string | null
          first_habit_date: string | null
          first_purchase_date: string | null
          onboarding_completed: boolean | null
          signup_cohort_month: string
          signup_cohort_week: string
          user_id: string
        }
        Insert: {
          acquisition_source?: string | null
          created_at?: string
          first_3day_streak_date?: string | null
          first_7day_streak_date?: string | null
          first_completion_date?: string | null
          first_habit_date?: string | null
          first_purchase_date?: string | null
          onboarding_completed?: boolean | null
          signup_cohort_month: string
          signup_cohort_week: string
          user_id: string
        }
        Update: {
          acquisition_source?: string | null
          created_at?: string
          first_3day_streak_date?: string | null
          first_7day_streak_date?: string | null
          first_completion_date?: string | null
          first_habit_date?: string | null
          first_purchase_date?: string | null
          onboarding_completed?: boolean | null
          signup_cohort_month?: string
          signup_cohort_week?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gems: {
        Row: {
          created_at: string
          current_gems: number
          lifetime_gems_earned: number
          lifetime_gems_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_gems?: number
          lifetime_gems_earned?: number
          lifetime_gems_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_gems?: number
          lifetime_gems_earned?: number
          lifetime_gems_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_journey_day_completions: {
        Row: {
          completed_at: string | null
          day_number: number
          id: string
          journey_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          day_number: number
          id?: string
          journey_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          day_number?: number
          id?: string
          journey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_day_completions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "admin_journey_overview"
            referencedColumns: ["journey_id"]
          },
          {
            foreignKeyName: "user_journey_day_completions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_habits: {
        Row: {
          canonical_key: string | null
          created_at: string | null
          current_goal_value: number | null
          expires_on_day: number | null
          habit_id: string
          id: string
          introduced_on_day: number
          is_active: boolean | null
          journey_habit_template_id: string | null
          journey_id: string
          user_id: string
        }
        Insert: {
          canonical_key?: string | null
          created_at?: string | null
          current_goal_value?: number | null
          expires_on_day?: number | null
          habit_id: string
          id?: string
          introduced_on_day: number
          is_active?: boolean | null
          journey_habit_template_id?: string | null
          journey_id: string
          user_id: string
        }
        Update: {
          canonical_key?: string | null
          created_at?: string | null
          current_goal_value?: number | null
          expires_on_day?: number | null
          habit_id?: string
          id?: string
          introduced_on_day?: number
          is_active?: boolean | null
          journey_habit_template_id?: string | null
          journey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_habits_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_journey_habits_journey_habit_template_id_fkey"
            columns: ["journey_habit_template_id"]
            isOneToOne: false
            referencedRelation: "journey_habit_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_journey_habits_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "admin_journey_overview"
            referencedColumns: ["journey_id"]
          },
          {
            foreignKeyName: "user_journey_habits_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_state: {
        Row: {
          completed_at: string | null
          completion_percent: number | null
          created_at: string | null
          current_day: number
          current_phase: number
          days_completed: number | null
          id: string
          journey_id: string
          paused_at: string | null
          started_at: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_percent?: number | null
          created_at?: string | null
          current_day?: number
          current_phase?: number
          days_completed?: number | null
          id?: string
          journey_id: string
          paused_at?: string | null
          started_at?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_percent?: number | null
          created_at?: string | null
          current_day?: number
          current_phase?: number
          days_completed?: number | null
          id?: string
          journey_id?: string
          paused_at?: string | null
          started_at?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_state_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "admin_journey_overview"
            referencedColumns: ["journey_id"]
          },
          {
            foreignKeyName: "user_journey_state_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          notification_preferences: Json | null
          perfect_days: number
          total_habits_completed: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          notification_preferences?: Json | null
          perfect_days?: number
          total_habits_completed?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          notification_preferences?: Json | null
          perfect_days?: number
          total_habits_completed?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streak_freezes: {
        Row: {
          available_freezes: number
          created_at: string
          last_free_freeze_date: string
          last_purchase_week: string | null
          total_freezes_earned: number
          total_freezes_used: number
          updated_at: string
          user_id: string
          weekly_purchases_count: number | null
        }
        Insert: {
          available_freezes?: number
          created_at?: string
          last_free_freeze_date?: string
          last_purchase_week?: string | null
          total_freezes_earned?: number
          total_freezes_used?: number
          updated_at?: string
          user_id: string
          weekly_purchases_count?: number | null
        }
        Update: {
          available_freezes?: number
          created_at?: string
          last_free_freeze_date?: string
          last_purchase_week?: string | null
          total_freezes_earned?: number
          total_freezes_used?: number
          updated_at?: string
          user_id?: string
          weekly_purchases_count?: number | null
        }
        Relationships: []
      }
      user_unlocks: {
        Row: {
          id: string
          unlock_id: string
          unlock_type: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          unlock_id: string
          unlock_type: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          unlock_id?: string
          unlock_type?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          awaiting_input: string | null
          created_at: string | null
          id: string
          last_interaction: string | null
          messages: Json | null
          opted_out: boolean | null
          pending_action: string | null
          pending_data: Json | null
          phone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          awaiting_input?: string | null
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          messages?: Json | null
          opted_out?: boolean | null
          pending_action?: string | null
          pending_data?: Json | null
          phone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          awaiting_input?: string | null
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          messages?: Json | null
          opted_out?: boolean | null
          pending_action?: string | null
          pending_data?: Json | null
          phone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_status"
            referencedColumns: ["user_id"]
          },
        ]
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          habit_id: string | null
          id: string
          metadata: Json | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          habit_id?: string | null
          id?: string
          metadata?: Json | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          habit_id?: string | null
          id?: string
          metadata?: Json | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_cohort_retention: {
        Row: {
          cohort_size: number | null
          cohort_week: string | null
          day_1_retained: number | null
          day_1_retention_percent: number | null
          day_30_retained: number | null
          day_30_retention_percent: number | null
          day_7_retained: number | null
          day_7_retention_percent: number | null
        }
        Relationships: []
      }
      admin_completion_by_category: {
        Row: {
          category: string | null
          completion_rate_7d_percent: number | null
          total_completions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      admin_completion_by_time_of_day: {
        Row: {
          hour: number | null
          total_completions: number | null
        }
        Relationships: []
      }
      admin_completion_rates_30d: {
        Row: {
          completion_rate_percent: number | null
          date: string | null
          total_completions: number | null
          total_scheduled_habits: number | null
        }
        Relationships: []
      }
      admin_content_stats: {
        Row: {
          total_books: number | null
          total_guided_days: number | null
          total_journey_days: number | null
          total_journey_habits: number | null
          total_journeys: number | null
          total_meditations: number | null
          total_quotes: number | null
          total_tips: number | null
        }
        Relationships: []
      }
      admin_dau_mau_wau: {
        Row: {
          dau: number | null
          dau_yesterday: number | null
          mau: number | null
          mau_last_month: number | null
          stickiness_percent: number | null
          wau: number | null
          wau_last_week: number | null
        }
        Relationships: []
      }
      admin_dau_trend_30d: {
        Row: {
          date: string | null
          dau: number | null
        }
        Relationships: []
      }
      admin_engagement_metrics: {
        Row: {
          avg_habits_per_user: number | null
          completions_30d: number | null
          completions_7d: number | null
          completions_today: number | null
          total_habits: number | null
          users_completed_today: number | null
          users_with_habits: number | null
        }
        Relationships: []
      }
      admin_journey_dropoff: {
        Row: {
          day_number: number | null
          is_cliff_zone: boolean | null
          journey_title: string | null
          slug: string | null
          users_on_day: number | null
        }
        Relationships: []
      }
      admin_journey_overview: {
        Row: {
          abandoned_users: number | null
          active_users: number | null
          avg_days_completed: number | null
          completed_users: number | null
          completion_rate: number | null
          journey_id: string | null
          level: number | null
          slug: string | null
          theme_slug: string | null
          title: string | null
          total_enrollments: number | null
        }
        Relationships: []
      }
      admin_journey_totals: {
        Row: {
          active_journeys: number | null
          completed_journeys: number | null
          overall_completion_rate: number | null
          total_enrollments: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      admin_leads_by_age: {
        Row: {
          age_range: string | null
          conversion_rate: number | null
          converted: number | null
          total: number | null
        }
        Relationships: []
      }
      admin_leads_by_financial_range: {
        Row: {
          conversion_rate: number | null
          converted: number | null
          financial_range: string | null
          total: number | null
        }
        Relationships: []
      }
      admin_leads_by_gender: {
        Row: {
          conversion_rate: number | null
          converted: number | null
          gender: string | null
          total: number | null
        }
        Relationships: []
      }
      admin_leads_by_objective: {
        Row: {
          conversion_rate: number | null
          converted: number | null
          objective: string | null
          total: number | null
        }
        Relationships: []
      }
      admin_leads_by_profession: {
        Row: {
          conversion_rate: number | null
          converted: number | null
          profession: string | null
          total: number | null
        }
        Relationships: []
      }
      admin_leads_by_source: {
        Row: {
          active_days: number | null
          completed: number | null
          conversion_rate: number | null
          converted: number | null
          first_lead_date: string | null
          followed_up: number | null
          last_lead_date: string | null
          source: string | null
          total_leads: number | null
        }
        Relationships: []
      }
      admin_leads_by_utm: {
        Row: {
          conversion_rate: number | null
          converted: number | null
          first_lead_date: string | null
          last_lead_date: string | null
          total_leads: number | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Relationships: []
      }
      admin_leads_funnel: {
        Row: {
          completed_quiz: number | null
          completion_rate: number | null
          contact_rate: number | null
          contacted: number | null
          conversion_rate: number | null
          converted: number | null
          customers: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      admin_leads_heatmap: {
        Row: {
          conversion_rate: number | null
          converted_count: number | null
          day_of_week: number | null
          hour_of_day: number | null
          lead_count: number | null
        }
        Relationships: []
      }
      admin_leads_summary: {
        Row: {
          contacted_leads: number | null
          conversion_rate_percent: number | null
          converted_leads: number | null
          customer_conversions: number | null
          leads_30d: number | null
          leads_7d: number | null
          leads_today: number | null
          leads_with_tags: number | null
          lost_leads: number | null
          new_leads: number | null
          total_leads: number | null
          utm_sources_count: number | null
        }
        Relationships: []
      }
      admin_leads_temporal: {
        Row: {
          completed: number | null
          contacted: number | null
          conversion_rate: number | null
          converted: number | null
          date: string | null
          total_leads: number | null
        }
        Relationships: []
      }
      admin_leads_temporal_weekly: {
        Row: {
          completed: number | null
          contacted: number | null
          conversion_rate: number | null
          converted: number | null
          total_leads: number | null
          week_start: string | null
        }
        Relationships: []
      }
      admin_leads_top_challenges: {
        Row: {
          challenge: string | null
          conversion_rate: number | null
          converted_count: number | null
          lead_count: number | null
        }
        Relationships: []
      }
      admin_north_star_metric: {
        Row: {
          last_week_active_users: number | null
          rolling_7d_active_users: number | null
          week_over_week_change_percent: number | null
          weekly_active_users_with_completion: number | null
        }
        Relationships: []
      }
      admin_pix_recovery: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          email: string | null
          exported_at: string | null
          id: string | null
          name: string | null
          payment_method: string | null
          phone: string | null
          product_label: string | null
          product_names: string | null
          provider: string | null
          source_table: string | null
          status: string | null
          updated_at: string | null
          urgency: string | null
        }
        Relationships: []
      }
      admin_pix_recovery_summary: {
        Row: {
          aging_count: number | null
          already_exported: number | null
          bora_open: number | null
          foquinha_open: number | null
          fresh_count: number | null
          not_exported: number | null
          other_open: number | null
          recent_count: number | null
          stale_count: number | null
          total_amount_cents: number | null
          total_open: number | null
        }
        Relationships: []
      }
      admin_revenue_metrics: {
        Row: {
          avg_purchase_cents: number | null
          paying_users: number | null
          purchases_30d: number | null
          purchases_7d: number | null
          purchases_today: number | null
          revenue_30d_cents: number | null
          revenue_7d_cents: number | null
          revenue_today_cents: number | null
          total_purchases: number | null
          total_revenue_cents: number | null
        }
        Relationships: []
      }
      admin_session_metrics: {
        Row: {
          avg_session_duration_minutes: number | null
          avg_session_duration_seconds: number | null
          avg_sessions_per_user: number | null
          desktop_sessions: number | null
          max_session_duration_seconds: number | null
          median_session_duration_seconds: number | null
          mobile_sessions: number | null
          tablet_sessions: number | null
          total_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      admin_streak_distribution: {
        Row: {
          avg_streak: number | null
          median_streak: number | null
          no_streak: number | null
          percent_with_7plus_streak: number | null
          streak_1_6: number | null
          streak_100_plus: number | null
          streak_30_99: number | null
          streak_7_29: number | null
        }
        Relationships: []
      }
      admin_unconverted_leads: {
        Row: {
          age_range: string | null
          created_at: string | null
          email: string | null
          financial_range: string | null
          follow_up_status: string | null
          id: string | null
          last_campaign_sent_at: string | null
          lead_temperature: string | null
          name: string | null
          objective: string | null
          phone: string | null
          profession: string | null
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Relationships: []
      }
      admin_unconverted_leads_summary: {
        Row: {
          cold_leads: number | null
          cool_leads: number | null
          hot_leads: number | null
          total_unconverted: number | null
          warm_leads: number | null
        }
        Relationships: []
      }
      admin_user_stats: {
        Row: {
          active_30d: number | null
          active_7d: number | null
          active_today: number | null
          admin_users: number | null
          avg_perfect_days_per_user: number | null
          avg_streak: number | null
          max_streak: number | null
          perfect_days_total: number | null
          premium_users: number | null
          total_users: number | null
        }
        Relationships: []
      }
      notification_analytics: {
        Row: {
          context_type: string | null
          date_sent: string | null
          direct_completion_rate_percent: number | null
          direct_completions: number | null
          dismissal_rate_percent: number | null
          dismissals: number | null
          last_sent: string | null
          message_key: string | null
          open_rate_percent: number | null
          total_opened: number | null
          total_sent: number | null
        }
        Relationships: []
      }
      notification_daily_summary: {
        Row: {
          context_type: string | null
          date: string | null
          direct_completions: number | null
          dismissals: number | null
          total_opened: number | null
          total_sent: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      notification_user_analytics: {
        Row: {
          direct_completions: number | null
          first_notification_at: string | null
          last_notification_at: string | null
          total_notifications: number | null
          total_opened: number | null
          unique_contexts_received: number | null
          user_id: string | null
          user_open_rate_percent: number | null
        }
        Relationships: []
      }
      user_progress_status: {
        Row: {
          completed_onboardings: number | null
          display_name: string | null
          has_completed_onboarding: boolean | null
          last_onboarding_at: string | null
          onboarding_completed_at: string | null
          onboarding_goals: Json | null
          status: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_gems: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: {
          new_balance: number
          transaction_id: string
        }[]
      }
      add_lead_note: {
        Args: { p_admin_id: string; p_lead_id: string; p_note: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      add_lead_tag: {
        Args: { p_admin_id: string; p_lead_id: string; p_tag: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      add_xp: {
        Args: {
          p_amount: number
          p_habit_id?: string
          p_metadata?: Json
          p_reason: string
          p_user_id: string
        }
        Returns: {
          leveled_up: boolean
          new_level: number
          new_total_xp: number
          previous_level: number
        }[]
      }
      admin_grant_premium: {
        Args: {
          p_admin_id: string
          p_reason?: string
          p_target_user_id: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      admin_restore_user: {
        Args: {
          p_admin_id: string
          p_reason?: string
          p_target_user_id: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      admin_suspend_user: {
        Args: { p_admin_id: string; p_reason: string; p_target_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      advance_journey_to_next_day: {
        Args: { p_journey_id: string; p_user_id: string }
        Returns: Json
      }
      assign_user_to_cohort: { Args: { p_user_id: string }; Returns: undefined }
      calculate_level_from_xp: { Args: { p_total_xp: number }; Returns: number }
      can_complete_guided_day: {
        Args: { target_global_day: number }
        Returns: boolean
      }
      check_unlock: {
        Args: { p_unlock_id: string; p_unlock_type: string; p_user_id: string }
        Returns: boolean
      }
      check_weekly_freeze_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      complete_habit_atomic: {
        Args: {
          p_completed_at: string
          p_habit_id: string
          p_increment_streak?: boolean
          p_user_id: string
          p_xp_amount?: number
        }
        Returns: Json
      }
      complete_onboarding: {
        Args: { p_goals: Json; p_user_id: string }
        Returns: undefined
      }
      consume_access_token: { Args: { p_token: string }; Returns: boolean }
      current_user_is_admin: { Args: never; Returns: boolean }
      equip_avatar: {
        Args: { p_avatar_id: string; p_user_id: string }
        Returns: undefined
      }
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_user_admin: { Args: { p_user_id: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_admin_id: string
          p_metadata?: Json
          p_new_data?: Json
          p_old_data?: Json
          p_target_id?: string
          p_target_table?: string
        }
        Returns: string
      }
      mark_leads_emailed: {
        Args: { p_campaign_name?: string; p_lead_ids: string[] }
        Returns: number
      }
      mark_pix_recovery_exported: {
        Args: {
          p_campaign_name?: string
          p_ids: string[]
          p_source_tables: string[]
        }
        Returns: number
      }
      purchase_streak_freeze: { Args: { p_user_id: string }; Returns: boolean }
      purchase_streak_freeze_with_limit: {
        Args: { p_user_id: string }
        Returns: Json
      }
      remove_lead_tag: {
        Args: { p_admin_id: string; p_lead_id: string; p_tag: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      reset_habit_streaks: {
        Args: never
        Returns: {
          habits_checked: number
          habits_reset: number
        }[]
      }
      save_avatar_config: {
        Args: { p_config: Json; p_user_id: string }
        Returns: undefined
      }
      search_leads: {
        Args: {
          page_num?: number
          page_size?: number
          search_query?: string
          sort_column?: string
          sort_direction?: string
          source_filter?: string
          status_filter?: string
        }
        Returns: {
          age_range: string
          assigned_to: string
          consistency_feeling: string
          converted_to_customer: boolean
          created_at: string
          current_page: number
          email: string
          energy_peak: string
          financial_range: string
          follow_up_status: string
          gender: string
          id: string
          name: string
          notes: string
          objective: string
          phone: string
          profession: string
          projected_feeling: string
          source: string
          tags: string[]
          time_available: string
          total_count: number
          total_pages: number
          updated_at: string
          utm_campaign: string
          utm_medium: string
          utm_source: string
          work_schedule: string
          years_promising: string
        }[]
      }
      toggle_habit_atomic: {
        Args: {
          p_completed_at: string
          p_habit_id: string
          p_user_id: string
          p_xp_amount?: number
        }
        Returns: Json
      }
      unlock_achievement: {
        Args: {
          p_achievement_id: string
          p_progress_snapshot?: Json
          p_user_id: string
        }
        Returns: number
      }
      unlock_avatar: {
        Args: { p_auto_equip?: boolean; p_avatar_id: string; p_user_id: string }
        Returns: boolean
      }
      unlock_item: {
        Args: { p_unlock_id: string; p_unlock_type: string; p_user_id: string }
        Returns: boolean
      }
      update_lead_status: {
        Args: {
          p_admin_id: string
          p_lead_id: string
          p_new_status: string
          p_note?: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      update_streak: {
        Args: { p_user_id: string }
        Returns: {
          current_streak: number
          is_new_record: boolean
        }[]
      }
      update_streak_milestones: { Args: never; Returns: undefined }
      use_streak_freeze: {
        Args: { p_protected_date?: string; p_user_id: string }
        Returns: boolean
      }
      validate_access_token: {
        Args: { p_token: string }
        Returns: {
          error_message: string
          is_valid: boolean
          token_email: string
          token_type: string
        }[]
      }
    }
    Enums: {
      habit_auto_complete_source: "manual" | "health"
      habit_frequency_type:
        | "fixed_days"
        | "times_per_week"
        | "times_per_month"
        | "every_n_days"
        | "daily"
        | "once"
      habit_notification_type: "reminder" | "completed"
      habit_unit:
        | "none"
        | "steps"
        | "minutes"
        | "km"
        | "custom"
        | "hours"
        | "pages"
        | "liters"
      whatsapp_message_role: "user" | "assistant"
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
    Enums: {
      habit_auto_complete_source: ["manual", "health"],
      habit_frequency_type: [
        "fixed_days",
        "times_per_week",
        "times_per_month",
        "every_n_days",
        "daily",
        "once",
      ],
      habit_notification_type: ["reminder", "completed"],
      habit_unit: [
        "none",
        "steps",
        "minutes",
        "km",
        "custom",
        "hours",
        "pages",
        "liters",
      ],
      whatsapp_message_role: ["user", "assistant"],
    },
  },
} as const
A new version of Supabase CLI is available: v2.78.1 (currently installed v2.64.2)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
