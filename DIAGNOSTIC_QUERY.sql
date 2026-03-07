-- Run this query in Supabase SQL Editor to check teacher profiles

-- Check all user profiles
SELECT 
  id,
  role,
  password_change_required,
  created_by,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- Check auth users (to see if the teacher account exists)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
