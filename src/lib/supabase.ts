import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      assets: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: 'video' | 'photo';
          thumbnail_url: string;
          file_url: string | null;
          duration: number | null;
          resolution: '4K' | 'HD';
          orientation: 'landscape' | 'portrait' | 'square';
          category: string;
          tags: string[];
          download_count: number;
          file_size: string;
          formats: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: 'video' | 'photo';
          thumbnail_url: string;
          file_url?: string | null;
          duration?: number | null;
          resolution: '4K' | 'HD';
          orientation: 'landscape' | 'portrait' | 'square';
          category: string;
          tags?: string[];
          download_count?: number;
          file_size: string;
          formats?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: 'video' | 'photo';
          thumbnail_url?: string;
          file_url?: string | null;
          duration?: number | null;
          resolution?: '4K' | 'HD';
          orientation?: 'landscape' | 'portrait' | 'square';
          category?: string;
          tags?: string[];
          download_count?: number;
          file_size?: string;
          formats?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      downloads: {
        Row: {
          id: string;
          user_id: string | null;
          asset_id: string | null;
          format: string;
          downloaded_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          asset_id?: string | null;
          format: string;
          downloaded_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          asset_id?: string | null;
          format?: string;
          downloaded_at?: string | null;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string | null;
          asset_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          asset_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          asset_id?: string | null;
          created_at?: string | null;
        };
      };
      search_history: {
        Row: {
          id: string;
          user_id: string | null;
          query: string;
          is_ai_search: boolean | null;
          results_count: number | null;
          searched_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          query: string;
          is_ai_search?: boolean | null;
          results_count?: number | null;
          searched_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          query?: string;
          is_ai_search?: boolean | null;
          results_count?: number | null;
          searched_at?: string | null;
        };
      };
      stripe_customers: {
        Row: {
          id: number;
          user_id: string;
          customer_id: string;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          customer_id: string;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          customer_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
      stripe_subscriptions: {
        Row: {
          id: number;
          customer_id: string;
          subscription_id: string | null;
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean | null;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
          status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          customer_id: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean | null;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          customer_id?: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean | null;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status?: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
      stripe_orders: {
        Row: {
          id: number;
          checkout_session_id: string;
          payment_intent_id: string;
          customer_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          status: 'pending' | 'completed' | 'canceled';
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          checkout_session_id: string;
          payment_intent_id: string;
          customer_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          status?: 'pending' | 'completed' | 'canceled';
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          checkout_session_id?: string;
          payment_intent_id?: string;
          customer_id?: string;
          amount_subtotal?: number;
          amount_total?: number;
          currency?: string;
          payment_status?: string;
          status?: 'pending' | 'completed' | 'canceled';
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
    };
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null;
          subscription_id: string | null;
          subscription_status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | null;
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean | null;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
        };
      };
      stripe_user_orders: {
        Row: {
          customer_id: string | null;
          order_id: number | null;
          checkout_session_id: string | null;
          payment_intent_id: string | null;
          amount_subtotal: number | null;
          amount_total: number | null;
          currency: string | null;
          payment_status: string | null;
          order_status: 'pending' | 'completed' | 'canceled' | null;
          order_date: string | null;
        };
      };
    };
    Functions: {
      match_assets: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          title: string;
          description: string;
          type: 'video' | 'photo';
          thumbnail_url: string;
          file_url: string | null;
          duration: number | null;
          resolution: '4K' | 'HD';
          orientation: 'landscape' | 'portrait' | 'square';
          category: string;
          tags: string[];
          download_count: number;
          file_size: string;
          formats: string[];
          created_at: string;
          updated_at: string;
          similarity: number;
        }[];
      };
    };
  };
};