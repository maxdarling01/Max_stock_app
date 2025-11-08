/*
  # Fix Profile Creation and Admin Email Case Sensitivity

  1. Changes to `profiles` table policies
    - Add INSERT policy to allow users to create their own profile during signup
    - This enables the signup process to complete successfully
  
  2. Changes to `assets` table policies
    - Fix admin email case sensitivity (change Maxdarling84@gmail.com to maxdarling84@gmail.com)
    - This allows the admin user to upload videos successfully
  
  3. Add database trigger
    - Automatically create profile entry when new user signs up in auth.users
    - Ensures profiles table is always populated with user data
  
  ## Security Notes
  - Profile INSERT policy only allows users to create their own profile (auth.uid() = id)
  - Assets policies remain restrictive, only allowing specific admin email
  - Trigger runs with security definer to bypass RLS for automatic profile creation
*/

-- Drop existing admin policies on assets table
DROP POLICY IF EXISTS "Admin can insert assets" ON assets;
DROP POLICY IF EXISTS "Admin can update assets" ON assets;

-- Recreate admin policies with correct case-insensitive email check
CREATE POLICY "Admin can insert assets"
  ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    LOWER((SELECT email FROM profiles WHERE id = auth.uid())) = 'maxdarling84@gmail.com'
  );

CREATE POLICY "Admin can update assets"
  ON assets
  FOR UPDATE
  TO authenticated
  USING (
    LOWER((SELECT email FROM profiles WHERE id = auth.uid())) = 'maxdarling84@gmail.com'
  )
  WITH CHECK (
    LOWER((SELECT email FROM profiles WHERE id = auth.uid())) = 'maxdarling84@gmail.com'
  );

-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
