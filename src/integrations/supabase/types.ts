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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      historical_exchange_rates: {
        Row: {
          created_at: string | null
          currency: string
          data_date: string
          exchange_rate: number | null
          id: string
          making_date: string
          selling_price: number | null
        }
        Insert: {
          created_at?: string | null
          currency: string
          data_date: string
          exchange_rate?: number | null
          id?: string
          making_date: string
          selling_price?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          data_date?: string
          exchange_rate?: number | null
          id?: string
          making_date?: string
          selling_price?: number | null
        }
        Relationships: []
      }
      historical_lme_prices: {
        Row: {
          created_at: string | null
          data_date: string
          id: string
          making_date: string
          metal: string
          price_usd: number
        }
        Insert: {
          created_at?: string | null
          data_date: string
          id?: string
          making_date: string
          metal: string
          price_usd: number
        }
        Update: {
          created_at?: string | null
          data_date?: string
          id?: string
          making_date?: string
          metal?: string
          price_usd?: number
        }
        Relationships: []
      }
      historical_shfe_prices: {
        Row: {
          created_at: string | null
          data_date: string
          id: string
          making_date: string
          metal: string
          price_cny: number
          price_usd: number | null
        }
        Insert: {
          created_at?: string | null
          data_date: string
          id?: string
          making_date: string
          metal: string
          price_cny: number
          price_usd?: number | null
        }
        Update: {
          created_at?: string | null
          data_date?: string
          id?: string
          making_date?: string
          metal?: string
          price_cny?: number
          price_usd?: number | null
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          change_24h: number | null
          close_price: number | null
          created_at: string
          high_price: number | null
          id: string
          low_price: number | null
          market: string
          open_price: number | null
          price: number
          recorded_at: string
          symbol: string
          volume: number | null
        }
        Insert: {
          change_24h?: number | null
          close_price?: number | null
          created_at?: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          market: string
          open_price?: number | null
          price: number
          recorded_at?: string
          symbol: string
          volume?: number | null
        }
        Update: {
          change_24h?: number | null
          close_price?: number | null
          created_at?: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          market?: string
          open_price?: number | null
          price?: number
          recorded_at?: string
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
      monthly_market_averages: {
        Row: {
          avg_high: number | null
          avg_low: number | null
          avg_price: number
          created_at: string
          data_points: number | null
          id: string
          market: string
          month: number
          symbol: string
          updated_at: string
          year: number
        }
        Insert: {
          avg_high?: number | null
          avg_low?: number | null
          avg_price: number
          created_at?: string
          data_points?: number | null
          id?: string
          market: string
          month: number
          symbol: string
          updated_at?: string
          year: number
        }
        Update: {
          avg_high?: number | null
          avg_low?: number | null
          avg_price?: number
          created_at?: string
          data_points?: number | null
          id?: string
          market?: string
          month?: number
          symbol?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      yearly_market_averages: {
        Row: {
          avg_high: number | null
          avg_low: number | null
          avg_price: number
          created_at: string
          data_points: number | null
          id: string
          market: string
          symbol: string
          updated_at: string
          year: number
        }
        Insert: {
          avg_high?: number | null
          avg_low?: number | null
          avg_price: number
          created_at?: string
          data_points?: number | null
          id?: string
          market: string
          symbol: string
          updated_at?: string
          year: number
        }
        Update: {
          avg_high?: number | null
          avg_low?: number | null
          avg_price?: number
          created_at?: string
          data_points?: number | null
          id?: string
          market?: string
          symbol?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
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
      app_role: "admin" | "viewer"
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
      app_role: ["admin", "viewer"],
    },
  },
} as const
