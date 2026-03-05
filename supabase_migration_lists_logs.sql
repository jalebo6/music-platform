-- Migration: Add Lists, Listening Logs, Reviews and Listen Later features
-- Run this after the initial schema

-- Albums table (if not exists - to store album data)
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  spotify_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(title, artist)
);

-- Lists table
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- List items table (albums in lists)
CREATE TABLE IF NOT EXISTS public.list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, album_id)
);

-- Listening logs table (diary/activity log)
CREATE TABLE IF NOT EXISTS public.listening_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  date_logged TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  listen_later BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- List likes table
CREATE TABLE IF NOT EXISTS public.list_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

-- List comments table
CREATE TABLE IF NOT EXISTS public.list_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table (for tracking all user actions)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'log', 'review', 'like', 'comment', 'list_create'
  target_type TEXT, -- 'album', 'list', 'share'
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON public.list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_album_id ON public.list_items(album_id);
CREATE INDEX IF NOT EXISTS idx_listening_logs_user_id ON public.listening_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_logs_date ON public.listening_logs(date_logged DESC);
CREATE INDEX IF NOT EXISTS idx_listening_logs_listen_later ON public.listening_logs(user_id, listen_later) WHERE listen_later = TRUE;
CREATE INDEX IF NOT EXISTS idx_list_likes_list_id ON public.list_likes(list_id);
CREATE INDEX IF NOT EXISTS idx_list_comments_list_id ON public.list_comments(list_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_title_artist ON public.albums(title, artist);

-- Enable RLS
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Albums policies
CREATE POLICY "Anyone can view albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create albums" ON public.albums FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Lists policies
CREATE POLICY "Anyone can view lists" ON public.lists FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create lists" ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lists" ON public.lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lists" ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- List items policies
CREATE POLICY "Anyone can view list items" ON public.list_items FOR SELECT USING (true);
CREATE POLICY "List owners can insert items" ON public.list_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.lists WHERE lists.id = list_id AND lists.user_id = auth.uid())
);
CREATE POLICY "List owners can delete items" ON public.list_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.lists WHERE lists.id = list_id AND lists.user_id = auth.uid())
);

-- Listening logs policies
CREATE POLICY "Users can view own logs" ON public.listening_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Anyone can view public logs" ON public.listening_logs FOR SELECT USING (listen_later = FALSE);
CREATE POLICY "Users can create own logs" ON public.listening_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON public.listening_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON public.listening_logs FOR DELETE USING (auth.uid() = user_id);

-- List likes policies
CREATE POLICY "Anyone can view list likes" ON public.list_likes FOR SELECT USING (true);
CREATE POLICY "Users can create own likes" ON public.list_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.list_likes FOR DELETE USING (auth.uid() = user_id);

-- List comments policies
CREATE POLICY "Anyone can view list comments" ON public.list_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.list_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.list_comments FOR DELETE USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view own activity" ON public.activity_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Anyone can view public activity" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Users can create own activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'listening_logs' THEN
    INSERT INTO public.activity_log (user_id, activity_type, target_type, target_id, metadata)
    VALUES (NEW.user_id, 'log', 'album', NEW.album_id, jsonb_build_object('rating', NEW.rating, 'review', NEW.review));
  ELSIF TG_TABLE_NAME = 'lists' THEN
    INSERT INTO public.activity_log (user_id, activity_type, target_type, target_id, metadata)
    VALUES (NEW.user_id, 'list_create', 'list', NEW.id, jsonb_build_object('title', NEW.title));
  ELSIF TG_TABLE_NAME = 'list_likes' THEN
    INSERT INTO public.activity_log (user_id, activity_type, target_type, target_id)
    VALUES (NEW.user_id, 'like', 'list', NEW.list_id);
  ELSIF TG_TABLE_NAME = 'list_comments' THEN
    INSERT INTO public.activity_log (user_id, activity_type, target_type, target_id, metadata)
    VALUES (NEW.user_id, 'comment', 'list', NEW.list_id, jsonb_build_object('text', NEW.text));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for activity logging
DROP TRIGGER IF EXISTS on_listening_log_created ON public.listening_logs;
CREATE TRIGGER on_listening_log_created
  AFTER INSERT ON public.listening_logs
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS on_list_created ON public.lists;
CREATE TRIGGER on_list_created
  AFTER INSERT ON public.lists
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS on_list_liked ON public.list_likes;
CREATE TRIGGER on_list_liked
  AFTER INSERT ON public.list_likes
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS on_list_commented ON public.list_comments;
CREATE TRIGGER on_list_commented
  AFTER INSERT ON public.list_comments
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();
