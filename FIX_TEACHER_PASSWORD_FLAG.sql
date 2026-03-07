-- Fix the teacher's account by removing the password_change_required flag
-- This flag might be interfering with their ability to create vocabulary lists

UPDATE user_profiles
SET password_change_required = false
WHERE id = 'c14e3f7b-6c5d-471d-b2b9-37ce43565195';

-- Verify the update
SELECT 
  id,
  role,
  password_change_required,
  created_at
FROM user_profiles
WHERE id = 'c14e3f7b-6c5d-471d-b2b9-37ce43565195';
