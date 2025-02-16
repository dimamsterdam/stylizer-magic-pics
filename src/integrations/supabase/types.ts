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
          brand_constraints: string | null
          created_at: string
          end_date: string | null
          headline: string | null
          hero_image_url: string | null
          id: string
          occasion: string | null
          selected_product_ids: string[]
          start_date: string | null
          status: Database["public"]["Enums"]["expose_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_constraints?: string | null
          created_at?: string
          end_date?: string | null
          headline?: string | null
          hero_image_url?: string | null
          id?: string
          occasion?: string | null
          selected_product_ids?: string[]
          start_date?: string | null
          status?: Database["public"]["Enums"]["expose_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_constraints?: string | null
          created_at?: string
          end_date?: string | null
          headline?: string | null
          hero_image_url?: string | null
          id?: string
          occasion?: string | null
          selected_product_ids?: string[]
          start_date?: string | null
          status?: Database["public"]["Enums"]["expose_status"]
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
      expose_status: "draft" | "published" | "scheduled" | "archived"
      task_priority: "low" | "medium" | "high"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
