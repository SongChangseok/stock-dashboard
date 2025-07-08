export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          photo_url: string | null;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          preferences: Json | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          photo_url?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          preferences?: Json | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          photo_url?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          preferences?: Json | null;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          total_value: number;
          daily_change: number;
          daily_change_percent: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          total_value?: number;
          daily_change?: number;
          daily_change_percent?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          total_value?: number;
          daily_change?: number;
          daily_change_percent?: number;
        };
      };
      stocks: {
        Row: {
          id: number;
          portfolio_id: string;
          symbol: string;
          name: string;
          quantity: number;
          avg_price: number;
          current_price: number;
          value: number;
          gain: number;
          gain_percent: number;
          sector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          portfolio_id: string;
          symbol: string;
          name: string;
          quantity: number;
          avg_price: number;
          current_price: number;
          value: number;
          gain: number;
          gain_percent: number;
          sector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          portfolio_id?: string;
          symbol?: string;
          name?: string;
          quantity?: number;
          avg_price?: number;
          current_price?: number;
          value?: number;
          gain?: number;
          gain_percent?: number;
          sector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_amount: number;
          current_amount: number;
          target_date: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_amount: number;
          current_amount?: number;
          target_date: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_amount?: number;
          current_amount?: number;
          target_date?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolio_shares: {
        Row: {
          id: string;
          portfolio_id: string;
          user_id: string;
          share_id: string;
          is_public: boolean;
          allow_comments: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
          view_count: number;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          user_id: string;
          share_id: string;
          is_public?: boolean;
          allow_comments?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          user_id?: string;
          share_id?: string;
          is_public?: boolean;
          allow_comments?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          metadata?: Json | null;
        };
      };
      public_portfolios: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          total_value: number;
          daily_change: number;
          daily_change_percent: number;
          stocks: Json;
          created_at: string;
          updated_at: string;
          is_public: boolean;
          share_url: string | null;
          share_id: string;
          view_count: number;
          shared_by: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          total_value?: number;
          daily_change?: number;
          daily_change_percent?: number;
          stocks: Json;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
          share_url?: string | null;
          share_id: string;
          view_count?: number;
          shared_by?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          total_value?: number;
          daily_change?: number;
          daily_change_percent?: number;
          stocks?: Json;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
          share_url?: string | null;
          share_id?: string;
          view_count?: number;
          shared_by?: Json | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];