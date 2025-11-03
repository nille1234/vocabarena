-- This migration sets up the initial super admin user and assigns existing data
-- Note: This assumes the super admin user (petn@nextkbh.dk) already exists in auth.users
-- If not, they need to sign up first before running this migration

DO $$
DECLARE
  super_admin_id UUID;
BEGIN
  -- Find the user ID for petn@nextkbh.dk
  SELECT id INTO super_admin_id
  FROM auth.users
  WHERE email = 'petn@nextkbh.dk'
  LIMIT 1;

  -- If the user exists, create their profile and assign data
  IF super_admin_id IS NOT NULL THEN
    -- Create super admin profile (if it doesn't exist)
    INSERT INTO user_profiles (id, role, password_change_required, created_by)
    VALUES (super_admin_id, 'super_admin', false, NULL)
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        password_change_required = false;

    -- Assign all existing vocabulary lists to super admin
    UPDATE vocabulary_lists
    SET user_id = super_admin_id
    WHERE user_id IS NULL;

    -- Assign all existing game links to super admin
    UPDATE game_links
    SET user_id = super_admin_id
    WHERE user_id IS NULL;

    RAISE NOTICE 'Super admin profile created and data assigned for user: %', super_admin_id;
  ELSE
    RAISE NOTICE 'User petn@nextkbh.dk not found. Please ensure this user exists in auth.users before running this migration.';
  END IF;
END $$;
