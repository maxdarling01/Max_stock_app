/*
  # Add AI Semantic Search with OpenAI Embeddings

  ## Overview
  Enables AI-powered semantic search using OpenAI embeddings and vector similarity matching.
  
  ## Changes
  1. New Extensions
    - Enable pgvector extension for vector operations
  
  2. Schema Updates
    - Add `embedding` column to `assets` table (vector type, 1536 dimensions for OpenAI text-embedding-3-small)
    - Column is nullable to allow gradual migration and fallback to keyword search
  
  3. New Functions
    - `match_assets` - RPC function for semantic similarity search
      * Takes query_embedding (1536-dim vector), match_threshold (0-1), match_count (number)
      * Returns top matching assets ordered by similarity score
      * Only returns assets with similarity >= threshold
  
  4. New Indexes
    - Vector index on embedding column for fast similarity searches
  
  ## Search Logic
  - Vector similarity uses cosine distance (1 - dot product for normalized vectors)
  - Threshold of 0.7 means 70% minimum similarity
  - Match count limits results (typically 20 for pagination)
  
  ## Backward Compatibility
  - Existing assets without embeddings can still be searched via keyword search
  - New embeddings generated when videos are uploaded
  - Embeddings can be regenerated server-side if needed
  
  ## Security
  - No new RLS policies needed (uses existing "Anyone can read assets" policy)
  - RPC function is public (read-only, no data modification)
  
  ## Notes
  - Vector dimension: 1536 (matches OpenAI text-embedding-3-small model)
  - Similarity metric: 1 - (dot product) for cosine distance
  - Performance: O(log n) with vector index on typical queries
*/

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to assets table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE assets ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- Create vector index for fast similarity search (using cosine distance)
CREATE INDEX IF NOT EXISTS idx_assets_embedding_cosine ON assets
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS match_assets(vector, double precision, integer) CASCADE;

-- Create RPC function for semantic similarity search
CREATE OR REPLACE FUNCTION match_assets(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  type text,
  thumbnail_url text,
  file_url text,
  duration integer,
  resolution text,
  orientation text,
  category text,
  tags text[],
  download_count integer,
  file_size text,
  formats text[],
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    assets.id,
    assets.title,
    assets.description,
    assets.type,
    assets.thumbnail_url,
    assets.file_url,
    assets.duration,
    assets.resolution,
    assets.orientation,
    assets.category,
    assets.tags,
    assets.download_count,
    assets.file_size,
    assets.formats,
    assets.created_at,
    assets.updated_at,
    (1 - (assets.embedding <=> query_embedding)) as similarity
  FROM assets
  WHERE assets.embedding IS NOT NULL
    AND (1 - (assets.embedding <=> query_embedding)) >= match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
