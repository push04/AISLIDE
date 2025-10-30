import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a Supabase client with graceful fallback for development
export const supabase = supabaseUrl.includes('placeholder')
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder');
};

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          theme_preference: 'light' | 'dark' | 'system';
          language_preference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      lessons: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          description: string | null;
          tags: string[];
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          estimated_minutes: number;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
      };
      flashcard_decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          tags: string[];
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['flashcard_decks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['flashcard_decks']['Insert']>;
      };
      flashcards: {
        Row: {
          id: string;
          deck_id: string;
          front: string;
          back: string;
          difficulty: number;
          interval: number;
          repetitions: number;
          ease_factor: number;
          next_review: string;
          last_reviewed: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['flashcards']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['flashcards']['Insert']>;
      };
    };
  };
};
