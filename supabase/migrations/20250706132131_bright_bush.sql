/*
  # Fix user signup database error

  1. Database Functions
    - Create or replace the `create_user_profile` function that automatically creates a user profile when a new user signs up
    - This function extracts the full_name from the user metadata and creates a profile entry

  2. Triggers
    - Ensure the trigger is properly connected to execute the function when a new user is created in auth.users

  3. Security
    - The function uses security definer to ensure it has the necessary permissions to insert into user_profiles
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.create_user_profile()
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

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile() TO service_role;