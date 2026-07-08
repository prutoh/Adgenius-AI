// ============================================
// SUPABASE DATABASE TYPES
// Generated from your schema
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan_id: string
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan_id?: string
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan_id?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          generation_type: string
          tokens_used: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          generation_type: string
          tokens_used?: number
          created_at?: string
        }
        Update: {
          generation_type?: string
          tokens_used?: number
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string
          input_data: Record<string, unknown>
          output_text: string
          platform: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          input_data: Record<string, unknown>
          output_text: string
          platform?: string | null
          created_at?: string
        }
        Update: {
          input_data?: Record<string, unknown>
          output_text?: string
          platform?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          lemon_squeezy_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          lemon_squeezy_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          plan_id?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          invoice_number: string
          plan_id: string
          amount: number
          currency: string
          interval: string
          status: string
          pdf_url: string | null
          paypal_order_id: string | null
          lemon_squeezy_order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_number: string
          plan_id: string
          amount: number
          currency?: string
          interval?: string
          status?: string
          pdf_url?: string | null
          paypal_order_id?: string | null
          lemon_squeezy_order_id?: string | null
          created_at?: string
        }
        Update: {
          status?: string
          pdf_url?: string | null
          paypal_order_id?: string | null
          lemon_squeezy_order_id?: string | null
        }
      }
    }
    Functions: {
      get_monthly_usage: {
        Args: { p_user_id: string }
        Returns: number
      }
    }
  }
}