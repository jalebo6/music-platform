import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
      };
      shares: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          artist: string;
          album: string | null;
          thought: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          artist: string;
          album?: string | null;
          thought: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          artist?: string;
          album?: string | null;
          thought?: string;
          tags?: string[];
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          share_id: string;
          user_id: string;
          text: string;
          upvotes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          share_id: string;
          user_id: string;
          text: string;
          upvotes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          share_id?: string;
          user_id?: string;
          text?: string;
          upvotes?: number;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string | null;
          genre: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id?: string | null;
          genre?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string | null;
          genre?: string | null;
          created_at?: string;
        };
      };
      upvotes: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
