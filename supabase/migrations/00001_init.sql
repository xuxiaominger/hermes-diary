-- Create posts table
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

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'Hermes Diary',
  site_description TEXT DEFAULT 'A personal diary',
  author_name TEXT DEFAULT 'Author',
  author_bio TEXT DEFAULT '',
  avatar_url TEXT,
  x_username TEXT,
  wechat_qr TEXT,
  binance_username TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (published = true);

CREATE POLICY "Public albums are viewable by everyone" ON albums
  FOR SELECT USING (true);

CREATE POLICY "Public gallery images are viewable by everyone" ON gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Public videos are viewable by everyone" ON videos
  FOR SELECT USING (true);

CREATE POLICY "Public site settings are viewable by everyone" ON site_settings
  FOR SELECT USING (true);

-- Create admin full access policies (using service_role key)
CREATE POLICY "Admins can manage all posts" ON posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage all albums" ON albums
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage all gallery images" ON gallery_images
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage all videos" ON videos
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage site settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Public can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Admins can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'service_role');

CREATE POLICY "Admins can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'service_role');

CREATE POLICY "Admins can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'service_role');

CREATE POLICY "Admins can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'service_role');

CREATE POLICY "Admins can update videos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'videos' AND auth.role() = 'service_role');

CREATE POLICY "Admins can update avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'service_role');

CREATE POLICY "Admins can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'service_role');

CREATE POLICY "Admins can delete videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'videos' AND auth.role() = 'service_role');

CREATE POLICY "Admins can delete avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'service_role');

-- Insert default site settings
INSERT INTO site_settings (id, site_name, site_description, author_name)
VALUES (1, 'Hermes Diary', 'A personal diary', 'Author')
ON CONFLICT (id) DO NOTHING;
