/*
  # Add file_url column and admin insert policy

  ## Changes
  1. Schema Updates
    - Add `file_url` column to `assets` table (text, nullable initially for backward compatibility)
  
  2. Security Changes
    - Add policy for admin user (Maxdarling84@gmail.com) to insert assets
    - Policy checks authenticated user's email matches admin email

  ## Notes
  - file_url will store the R2 public URL for video files
  - Existing assets can continue to work without file_url
  - Admin can upload new assets via /admin/upload route
*/

-- Add file_url column to assets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE assets ADD COLUMN file_url text;
  END IF;
END $$;

-- Create policy for admin to insert assets
CREATE POLICY "Admin can insert assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'Maxdarling84@gmail.com'
  );

-- Create policy for admin to update assets (for tag editing)
CREATE POLICY "Admin can update assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'Maxdarling84@gmail.com'
  )
  WITH CHECK (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'Maxdarling84@gmail.com'
  );
