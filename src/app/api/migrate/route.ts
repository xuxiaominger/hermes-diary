import { NextResponse } from "next/server";

const MIGRATION_SQL = `-- Create tables
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'Hermes Diary',
  site_description TEXT DEFAULT '记录商业与法律之路上的思考与见闻',
  author_name TEXT DEFAULT '',
  author_bio TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public posts" ON posts;
CREATE POLICY "Public posts" ON posts FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Public albums" ON albums;
CREATE POLICY "Public albums" ON albums FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public gallery" ON gallery_images;
CREATE POLICY "Public gallery" ON gallery_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public videos" ON videos;
CREATE POLICY "Public videos" ON videos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public settings" ON site_settings;
CREATE POLICY "Public settings" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin posts" ON posts;
CREATE POLICY "Admin posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin albums" ON albums;
CREATE POLICY "Admin albums" ON albums FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin gallery" ON gallery_images;
CREATE POLICY "Admin gallery" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin videos" ON videos;
CREATE POLICY "Admin videos" ON videos FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin settings" ON site_settings;
CREATE POLICY "Admin settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings (id, site_name, site_description, author_name)
VALUES (1, 'Hermes Diary', '记录商业与法律之路上的思考与见闻', '')
ON CONFLICT (id) DO NOTHING;`;

export async function GET() {
  return NextResponse.json({ sql: MIGRATION_SQL });
}
