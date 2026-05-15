import type { BrandKit, EmailDetails, EmailRow, ThemeMode } from '@/lib/types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionPlan = 'free' | 'pro' | 'team' | 'enterprise';
export type SubscriptionStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          country: string | null;
          suspended_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          suspended_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      designs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          rows: EmailRow[];
          email_details: EmailDetails;
          theme: ThemeMode;
          variables: Record<string, string>;
          brand_kit: BrandKit | null;
          version: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          rows: EmailRow[];
          email_details: EmailDetails;
          theme: ThemeMode;
          variables?: Record<string, string>;
          brand_kit?: BrandKit | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['designs']['Insert']>;
      };
      brand_kits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kit: BrandKit;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          kit: BrandKit;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['brand_kits']['Insert']>;
      };
      subscriptions: {
        Row: {
          user_id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      usage_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['usage_events']['Insert']>;
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          main_category: string;
          sub_category: string;
          accent_color: string;
          access: 'free' | 'premium';
          featured: boolean;
          published: boolean;
          collection: string | null;
          direction: 'ltr' | 'rtl';
          sections: Json;
          use_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string;
          main_category: string;
          sub_category: string;
          accent_color?: string;
          access?: 'free' | 'premium';
          featured?: boolean;
          published?: boolean;
          collection?: string | null;
          direction?: 'ltr' | 'rtl';
          sections: Json;
          use_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['templates']['Insert']>;
      };
      app_settings: {
        Row: {
          id: number;
          data: Json;
          updated_at: string;
        };
        Insert: {
          id?: number;
          data: Json;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>;
      };
      preview_comments: {
        Row: {
          id: string;
          token: string;
          author_name: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          author_name: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['preview_comments']['Insert']>;
      };
      preview_links: {
        Row: {
          id: string;
          token: string;
          design_id: string;
          user_id: string;
          html: string;
          design_name: string;
          password: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token?: string;
          design_id: string;
          user_id: string;
          html: string;
          design_name?: string;
          password?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['preview_links']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_get_users: {
        Args: {
          p_search?: string;
          p_plan?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Array<{
          id: string;
          email: string | null;
          full_name: string | null;
          country: string | null;
          created_at: string;
          suspended_at: string | null;
          plan: string;
          status: string;
          design_count: number;
          last_active: string | null;
        }>;
      };
      admin_get_active_users: {
        Args: { p_days?: number };
        Returns: Array<{ bucket: string; active_users: number }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
