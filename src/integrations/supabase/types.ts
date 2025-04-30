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
      ai_provider_settings: {
        Row: {
          created_at: string | null
          feature_name: string
          feature_type: Database["public"]["Enums"]["ai_feature_type"]
          id: string
          provider: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          feature_type: Database["public"]["Enums"]["ai_feature_type"]
          id?: string
          provider: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          feature_type?: Database["public"]["Enums"]["ai_feature_type"]
          id?: string
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_identity: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          brand_models: Json[] | null
          brand_name: string | null
          characteristics: string[] | null
          created_at: string
          gender: Database["public"]["Enums"]["brand_audience_gender"] | null
          id: string
          income_level: Database["public"]["Enums"]["income_level"] | null
          onboarding_completed: boolean | null
          photography_lighting: string | null
          photography_mood: string | null
          tasks_completed: string[] | null
          updated_at: string
          user_id: string
          values: string[] | null
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          brand_models?: Json[] | null
          brand_name?: string | null
          characteristics?: string[] | null
          created_at?: string
          gender?: Database["public"]["Enums"]["brand_audience_gender"] | null
          id?: string
          income_level?: Database["public"]["Enums"]["income_level"] | null
          onboarding_completed?: boolean | null
          photography_lighting?: string | null
          photography_mood?: string | null
          tasks_completed?: string[] | null
          updated_at?: string
          user_id: string
          values?: string[] | null
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          brand_models?: Json[] | null
          brand_name?: string | null
          characteristics?: string[] | null
          created_at?: string
          gender?: Database["public"]["Enums"]["brand_audience_gender"] | null
          id?: string
          income_level?: Database["public"]["Enums"]["income_level"] | null
          onboarding_completed?: boolean | null
          photography_lighting?: string | null
          photography_mood?: string | null
          tasks_completed?: string[] | null
          updated_at?: string
          user_id?: string
          values?: string[] | null
        }
        Relationships: []
      }
      expose_localizations: {
        Row: {
          created_at: string
          expose_id: string | null
          headline: string | null
          id: string
          is_auto_translated: boolean | null
          locale: string
          product_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expose_id?: string | null
          headline?: string | null
          id?: string
          is_auto_translated?: boolean | null
          locale: string
          product_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expose_id?: string | null
          headline?: string | null
          id?: string
          is_auto_translated?: boolean | null
          locale?: string
          product_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expose_localizations_expose_id_fkey"
            columns: ["expose_id"]
            isOneToOne: false
            referencedRelation: "exposes"
            referencedColumns: ["id"]
          },
        ]
      }
      expose_revisions: {
        Row: {
          brand_constraints: string | null
          created_at: string
          expose_id: string | null
          headline: string | null
          hero_image_url: string
          id: string
          occasion: string | null
        }
        Insert: {
          brand_constraints?: string | null
          created_at?: string
          expose_id?: string | null
          headline?: string | null
          hero_image_url: string
          id?: string
          occasion?: string | null
        }
        Update: {
          brand_constraints?: string | null
          created_at?: string
          expose_id?: string | null
          headline?: string | null
          hero_image_url?: string
          id?: string
          occasion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expose_revisions_expose_id_fkey"
            columns: ["expose_id"]
            isOneToOne: false
            referencedRelation: "exposes"
            referencedColumns: ["id"]
          },
        ]
      }
      exposes: {
        Row: {
          body_copy: string | null
          brand_constraints: string | null
          created_at: string
          end_date: string | null
          error_message: string | null
          headline: string | null
          hero_image_desktop_url: string | null
          hero_image_generation_status: string | null
          hero_image_mobile_url: string | null
          hero_image_tablet_url: string | null
          hero_image_url: string | null
          id: string
          image_variations: Json[] | null
          occasion: string | null
          selected_product_ids: string[]
          selected_variation_index: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["expose_status"]
          theme: string | null
          theme_description: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_copy?: string | null
          brand_constraints?: string | null
          created_at?: string
          end_date?: string | null
          error_message?: string | null
          headline?: string | null
          hero_image_desktop_url?: string | null
          hero_image_generation_status?: string | null
          hero_image_mobile_url?: string | null
          hero_image_tablet_url?: string | null
          hero_image_url?: string | null
          id?: string
          image_variations?: Json[] | null
          occasion?: string | null
          selected_product_ids?: string[]
          selected_variation_index?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["expose_status"]
          theme?: string | null
          theme_description?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_copy?: string | null
          brand_constraints?: string | null
          created_at?: string
          end_date?: string | null
          error_message?: string | null
          headline?: string | null
          hero_image_desktop_url?: string | null
          hero_image_generation_status?: string | null
          hero_image_mobile_url?: string | null
          hero_image_tablet_url?: string | null
          hero_image_url?: string | null
          id?: string
          image_variations?: Json[] | null
          occasion?: string | null
          selected_product_ids?: string[]
          selected_variation_index?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["expose_status"]
          theme?: string | null
          theme_description?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      prep_tasks: {
        Row: {
          created_at: string | null
          days_before_service: number
          dependencies: string[] | null
          estimated_minutes: number
          id: string
          menu_item_id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          task_description: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_before_service: number
          dependencies?: string[] | null
          estimated_minutes: number
          id?: string
          menu_item_id: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          task_description: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_before_service?: number
          dependencies?: string[] | null
          estimated_minutes?: number
          id?: string
          menu_item_id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          task_description?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          price: number | null
          shopify_gid: string
          sku: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          image_url?: string | null
          images?: string[] | null
          price?: number | null
          shopify_gid: string
          sku?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          price?: number | null
          shopify_gid?: string
          sku?: string | null
          title?: string
          updated_at?: string
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
      ai_feature_type: "text_generation" | "image_generation"
      brand_audience_gender: "all" | "male" | "female" | "non_binary"
      expose_status: "draft" | "published" | "scheduled" | "archived"
      income_level: "low" | "medium" | "high" | "luxury"
      task_priority: "low" | "medium" | "high"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_feature_type: ["text_generation", "image_generation"],
      brand_audience_gender: ["all", "male", "female", "non_binary"],
      expose_status: ["draft", "published", "scheduled", "archived"],
      income_level: ["low", "medium", "high", "luxury"],
      task_priority: ["low", "medium", "high"],
    },
  },
} as const
