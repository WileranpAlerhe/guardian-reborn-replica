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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          district: string
          id: string
          is_default: boolean
          label: string | null
          number: string
          recipient: string
          state: string
          street: string
          updated_at: string
          user_id: string
          zip: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          district: string
          id?: string
          is_default?: boolean
          label?: string | null
          number: string
          recipient: string
          state: string
          street: string
          updated_at?: string
          user_id: string
          zip: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          district?: string
          id?: string
          is_default?: boolean
          label?: string | null
          number?: string
          recipient?: string
          state?: string
          street?: string
          updated_at?: string
          user_id?: string
          zip?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          affiliate_url: string | null
          category: string | null
          created_at: string
          device: string | null
          event: string
          id: number
          language: string | null
          lead_id: string
          page_path: string | null
          page_title: string | null
          page_url: string | null
          params: Json
          placement: string | null
          price: number | null
          product_id: string | null
          product_name: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          affiliate_url?: string | null
          category?: string | null
          created_at?: string
          device?: string | null
          event: string
          id?: number
          language?: string | null
          lead_id: string
          page_path?: string | null
          page_title?: string | null
          page_url?: string | null
          params?: Json
          placement?: string | null
          price?: number | null
          product_id?: string | null
          product_name?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          affiliate_url?: string | null
          category?: string | null
          created_at?: string
          device?: string | null
          event?: string
          id?: number
          language?: string | null
          lead_id?: string
          page_path?: string | null
          page_title?: string | null
          page_url?: string | null
          params?: Json
          placement?: string | null
          price?: number | null
          product_id?: string | null
          product_name?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          link: string | null
          order: number
          placement: string
          subtitle: string | null
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url: string
          link?: string | null
          order?: number
          placement?: string
          subtitle?: string | null
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          link?: string | null
          order?: number
          placement?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      collection_products: {
        Row: {
          collection_id: string
          position: number
          product_id: string
        }
        Insert: {
          collection_id: string
          position?: number
          product_id: string
        }
        Update: {
          collection_id?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          active: boolean
          banner_url: string | null
          created_at: string
          id: string
          order: number
          slug: string
          subtitle: string | null
          title: string
        }
        Insert: {
          active?: boolean
          banner_url?: string | null
          created_at?: string
          id?: string
          order?: number
          slug: string
          subtitle?: string | null
          title: string
        }
        Update: {
          active?: boolean
          banner_url?: string | null
          created_at?: string
          id?: string
          order?: number
          slug?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_order: number
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          used_count?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          unit_price_cents: number
          variant: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
          unit_price_cents: number
          variant?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          unit_price_cents?: number
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          copy_paste: string | null
          coupon_code: string | null
          created_at: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_cents: number
          external_ref: string
          gateway_id: string | null
          id: string
          installments: number
          paid_at: string | null
          payment_method: string
          qr_code: string | null
          raw_response: Json | null
          raw_webhook: Json | null
          shipping_address: Json | null
          shipping_cents: number
          shipping_method: string | null
          status: string
          subtotal_cents: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          copy_paste?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_cents?: number
          external_ref: string
          gateway_id?: string | null
          id?: string
          installments?: number
          paid_at?: string | null
          payment_method?: string
          qr_code?: string | null
          raw_response?: Json | null
          raw_webhook?: Json | null
          shipping_address?: Json | null
          shipping_cents?: number
          shipping_method?: string | null
          status?: string
          subtotal_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          copy_paste?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_cpf?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          discount_cents?: number
          external_ref?: string
          gateway_id?: string | null
          id?: string
          installments?: number
          paid_at?: string | null
          payment_method?: string
          qr_code?: string | null
          raw_response?: Json | null
          raw_webhook?: Json | null
          shipping_address?: Json | null
          shipping_cents?: number
          shipping_method?: string | null
          status?: string
          subtotal_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          affiliate_url: string
          badges: string[]
          brand: string | null
          category: string
          coupon_text: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          ean: string | null
          id: string
          image: string
          images: Json
          installment_value: number | null
          installments_count: number | null
          model: string | null
          name: string
          old_price: number
          order: number
          pix_price: number | null
          price: number
          rating: number
          sku: string | null
          slug: string | null
          sold: number
          source_url: string | null
          specs: Json
          stock: number
          updated_at: string
          variants: Json
          warranty_months: number | null
          weight_g: number | null
        }
        Insert: {
          active?: boolean
          affiliate_url?: string
          badges?: string[]
          brand?: string | null
          category?: string
          coupon_text?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          ean?: string | null
          id: string
          image?: string
          images?: Json
          installment_value?: number | null
          installments_count?: number | null
          model?: string | null
          name: string
          old_price?: number
          order?: number
          pix_price?: number | null
          price?: number
          rating?: number
          sku?: string | null
          slug?: string | null
          sold?: number
          source_url?: string | null
          specs?: Json
          stock?: number
          updated_at?: string
          variants?: Json
          warranty_months?: number | null
          weight_g?: number | null
        }
        Update: {
          active?: boolean
          affiliate_url?: string
          badges?: string[]
          brand?: string | null
          category?: string
          coupon_text?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          ean?: string | null
          id?: string
          image?: string
          images?: Json
          installment_value?: number | null
          installments_count?: number | null
          model?: string | null
          name?: string
          old_price?: number
          order?: number
          pix_price?: number | null
          price?: number
          rating?: number
          sku?: string | null
          slug?: string | null
          sold?: number
          source_url?: string | null
          specs?: Json
          stock?: number
          updated_at?: string
          variants?: Json
          warranty_months?: number | null
          weight_g?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          body_end_script: string | null
          body_start_script: string | null
          ga4_id: string | null
          gtm_id: string | null
          head_script: string | null
          id: string
          path_prefix: string | null
          streetpays_api_key: string | null
          updated_at: string
        }
        Insert: {
          body_end_script?: string | null
          body_start_script?: string | null
          ga4_id?: string | null
          gtm_id?: string | null
          head_script?: string | null
          id?: string
          path_prefix?: string | null
          streetpays_api_key?: string | null
          updated_at?: string
        }
        Update: {
          body_end_script?: string | null
          body_start_script?: string | null
          ga4_id?: string | null
          gtm_id?: string | null
          head_script?: string | null
          id?: string
          path_prefix?: string | null
          streetpays_api_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "customer"
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
      app_role: ["admin", "manager", "customer"],
    },
  },
} as const
