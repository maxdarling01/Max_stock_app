/*
  # Initial Schema for Maximum Stock App

  ## Overview
  This migration sets up the complete database schema for a stock video and photo platform
  with user authentication, asset management, downloads tracking, and favorites functionality.

  ## New Tables
  
  ### 1. `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. `assets`
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `type` (text) - 'video' or 'photo'
  - `thumbnail_url` (text)
  - `duration` (integer, nullable) - for videos in seconds
  - `resolution` (text) - '4K' or 'HD'
  - `orientation` (text) - 'landscape', 'portrait', or 'square'
  - `category` (text)
  - `tags` (text array)
  - `download_count` (integer, default 0)
  - `file_size` (text)
  - `formats` (text array)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `downloads`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `asset_id` (uuid, references assets)
  - `format` (text)
  - `downloaded_at` (timestamptz)

  ### 4. `favorites`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `asset_id` (uuid, references assets)
  - `created_at` (timestamptz)

  ### 5. `search_history`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, nullable for anonymous)
  - `query` (text)
  - `is_ai_search` (boolean)
  - `results_count` (integer)
  - `searched_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read own profile, update own profile
  - Assets: Public read access, no write access (admin only)
  - Downloads: Users can read/create own downloads
  - Favorites: Users can read/create/delete own favorites
  - Search history: Users can read/create own search history

  ## Functions
  - `increment_download_count()` - Trigger to increment asset download count
  - `update_updated_at()` - Trigger to update updated_at timestamp
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('video', 'photo')),
  thumbnail_url text NOT NULL,
  duration integer,
  resolution text NOT NULL CHECK (resolution IN ('4K', 'HD')),
  orientation text NOT NULL CHECK (orientation IN ('landscape', 'portrait', 'square')),
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  download_count integer DEFAULT 0,
  file_size text NOT NULL,
  formats text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assets"
  ON assets FOR SELECT
  TO public
  USING (true);

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  format text NOT NULL,
  downloaded_at timestamptz DEFAULT now()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own downloads"
  ON downloads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own downloads"
  ON downloads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  query text NOT NULL,
  is_ai_search boolean DEFAULT false,
  results_count integer DEFAULT 0,
  searched_at timestamptz DEFAULT now()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own search history"
  ON search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own search history"
  ON search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assets
  SET download_count = download_count + 1
  WHERE id = NEW.asset_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to increment download count
CREATE TRIGGER increment_asset_downloads
  AFTER INSERT ON downloads
  FOR EACH ROW
  EXECUTE FUNCTION increment_download_count();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_resolution ON assets(resolution);
CREATE INDEX IF NOT EXISTS idx_assets_orientation ON assets(orientation);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_asset_id ON downloads(asset_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_asset_id ON favorites(asset_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
