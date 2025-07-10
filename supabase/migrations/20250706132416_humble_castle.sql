/*
  # Fix Authentication Trigger

  1. Problem
    - Supabase signup failing with "Database error saving new user"
    - Missing or incorrect trigger for creating user profiles on signup

  2. Solution
    - Drop existing trigger if it exists
    - Create proper trigger function that matches our user_profiles table structure
    - Set up trigger to automatically create user profile on auth.users insert

  3. Security
    - Maintain existing RLS policies on user_profiles table
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile();

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