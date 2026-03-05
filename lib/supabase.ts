import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      artists: {
        Row: {
          id: string;
          name: string;
          image_url: string | null;
          genres: string[];
          bio: string | null;
          followers_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string | null;
          genres?: string[];
          bio?: string | null;
          followers_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string | null;
          genres?: string[];
          bio?: string | null;
          followers_count?: number;
          created_at?: string;
        };
      };
      albums: {
        Row: {
          id: string;
          title: string;
          artist_id: string;
          cover_url: string | null;
          release_year: number;
          genres: string[];
          album_type: string;
          tracklist: any;
          ratings_count: number;
          reviews_count: number;
          average_rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist_id: string;
          cover_url?: string | null;
          release_year?: number;
          genres?: string[];
          album_type?: string;
          tracklist?: any;
          ratings_count?: number;
          reviews_count?: number;
          average_rating?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          artist_id?: string;
          cover_url?: string | null;
          release_year?: number;
          genres?: string[];
          album_type?: string;
          tracklist?: any;
          ratings_count?: number;
          reviews_count?: number;
          average_rating?: number;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          album_id: string;
          user_id: string;
          rating: number;
          text: string;
          likes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          user_id: string;
          rating: number;
          text: string;
          likes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          user_id?: string;
          rating?: number;
          text?: string;
          likes?: number;
          created_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          album_id: string;
          user_id: string;
          rating: number;
          listened: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          user_id: string;
          rating: number;
          listened?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          user_id?: string;
          rating?: number;
          listened?: boolean;
          created_at?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
      };
      list_items: {
        Row: {
          id: string;
          list_id: string;
          album_id: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          album_id: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          album_id?: string;
          position?: number;
          created_at?: string;
        };
      };
      album_recommendations: {
        Row: {
          id: string;
          album_id: string;
          recommended_album_id: string;
          score: number;
        };
        Insert: {
          id?: string;
          album_id: string;
          recommended_album_id: string;
          score?: number;
        };
        Update: {
          id?: string;
          album_id?: string;
          recommended_album_id?: string;
          score?: number;
        };
      };
      review_likes: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      artist_follows: {
        Row: {
          id: string;
          user_id: string;
          artist_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          artist_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          artist_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
