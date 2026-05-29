-- =============================================
-- Hermes Diary Database Schema
-- Run this in Supabase SQL Editor to set up your database
-- =============================================

-- 1. Posts (博客文章)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Sync flags
  sync_x BOOLEAN DEFAULT false,
  sync_wechat BOOLEAN DEFAULT false,
  sync_binance BOOLEAN DEFAULT false,
  synced_x BOOLEAN DEFAULT false,
  synced_wechat BOOLEAN DEFAULT false,
  synced_binance BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- 2. Albums (图册)
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Gallery Images (图片)
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt TEXT DEFAULT '',
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_album ON gallery_images(album_id);

-- 4. Videos (视频)
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  platform TEXT DEFAULT 'upload',
  duration INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Site Settings (网站设置)
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'Hermes Diary',
  site_description TEXT DEFAULT '个人博客',
  author_name TEXT DEFAULT '',
  author_bio TEXT DEFAULT '',
  avatar_url TEXT,
  x_api_key TEXT DEFAULT '',
  x_api_secret TEXT DEFAULT '',
  wechat_app_id TEXT DEFAULT '',
  wechat_app_secret TEXT DEFAULT '',
  binance_api_key TEXT DEFAULT '',
  binance_api_secret TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage buckets (run in Storage section of Supabase dashboard)
-- Buckets to create:
-- - 'images' (public) - for all image uploads
-- - 'videos' (public) - for video uploads (optional)

-- 7. Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies - allow public read, authenticated write
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated can manage posts"
  ON posts FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read albums"
  ON albums FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can manage albums"
  ON albums FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read gallery images"
  ON gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can manage gallery images"
  ON gallery_images FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can manage videos"
  ON videos FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can manage site settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated');
