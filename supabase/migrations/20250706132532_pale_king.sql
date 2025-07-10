/*
  # Fix Authentication Trigger

  This migration fixes the authentication issue by properly setting up the trigger
  that creates user profiles when new users sign up.

  ## Changes
  1. Drop existing triggers and functions with CASCADE to handle dependencies
  2. Create new trigger function that matches our user_profiles table structure
  3. Set up trigger to automatically create user profiles on signup

  ## Security
  - Function runs with SECURITY DEFINER to ensure proper permissions
  - Only inserts into user_profiles table with validated data
*/

-- Drop existing triggers and functions with CASCADE to handle dependencies
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;

-- Create the trigger function that matches our user_profiles table structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'therapist'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();