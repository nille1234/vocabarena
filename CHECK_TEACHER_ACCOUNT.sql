-- Diagnostic query to check the teacher's account setup
-- Run this in Supabase SQL Editor

-- Check both user accounts (super admin and teacher)
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  p.role,
  p.password_change_required,
  p.created_by,
  p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- This will show both accounts and help us see if there's a difference
-- Look for:
-- 1. Does the teacher have a user_profiles entry?
-- 2. Is their role set to 'teacher'?
-- 3. Is their email_confirmed_at set?
-- 4. Any other differences compared to the super admin account?
