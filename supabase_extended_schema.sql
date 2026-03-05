-- Extended Music Platform Schema for Ratings & Search
-- Run this AFTER the base schema (supabase_schema.sql)

-- Albums table
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  cover_url TEXT,
  release_date DATE,
  genre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artists table
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lists table (user-curated music lists)
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- List items (albums in lists)
CREATE TABLE IF NOT EXISTS public.list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, album_id)
);

-- Ratings table (0.5-5 stars)
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0 AND MOD(rating * 10, 5) = 0),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, album_id)
);

-- Likes table (hearts)
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, album_id)
);

-- Listened table (checkmarks)
CREATE TABLE IF NOT EXISTS public.listened (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, album_id)
);

-- Artist follows table
CREATE TABLE IF NOT EXISTS public.artist_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, artist_id)
);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_albums_title ON public.albums USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_albums_artist ON public.albums USING gin(to_tsvector('english', artist));
CREATE INDEX IF NOT EXISTS idx_artists_name ON public.artists USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_songs_title ON public.songs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_lists_title ON public.lists USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_ratings_album_id ON public.ratings(album_id);
CREATE INDEX IF NOT EXISTS idx_likes_album_id ON public.likes(album_id);
CREATE INDEX IF NOT EXISTS idx_listened_album_id ON public.listened(album_id);

-- Enable Row Level Security
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listened ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Albums
CREATE POLICY "Anyone can view albums" ON public.albums FOR SELECT USING (true);

-- RLS Policies for Artists
CREATE POLICY "Anyone can view artists" ON public.artists FOR SELECT USING (true);

-- RLS Policies for Songs
CREATE POLICY "Anyone can view songs" ON public.songs FOR SELECT USING (true);

-- RLS Policies for Lists
CREATE POLICY "Anyone can view public lists" ON public.lists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create own lists" ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lists" ON public.lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lists" ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for List Items
CREATE POLICY "Anyone can view list items" ON public.list_items FOR SELECT USING (true);
CREATE POLICY "Users can manage own list items" ON public.list_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid())
);

-- RLS Policies for Ratings
CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Users can create own ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON public.ratings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Likes
CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Listened
CREATE POLICY "Anyone can view listened" ON public.listened FOR SELECT USING (true);
CREATE POLICY "Users can create own listened" ON public.listened FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own listened" ON public.listened FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Artist Follows
CREATE POLICY "Anyone can view artist follows" ON public.artist_follows FOR SELECT USING (true);
CREATE POLICY "Users can create own artist follows" ON public.artist_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own artist follows" ON public.artist_follows FOR DELETE USING (auth.uid() = follower_id);

-- Function to update list updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.lists
  SET updated_at = NOW()
  WHERE id = NEW.list_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update list updated_at when items change
DROP TRIGGER IF EXISTS on_list_item_changed ON public.list_items;
CREATE TRIGGER on_list_item_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.list_items
  FOR EACH ROW EXECUTE FUNCTION public.update_list_updated_at();
