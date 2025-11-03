# Invite-Only User Management System

## Overview

VocabArena now uses an **invite-only system** where only authorized super admins can create teacher accounts. Public sign-up has been disabled.

## User Roles

### Super Admin
- **Email**: petn@nextkbh.dk
- **Capabilities**:
  - Access to "User Management" tab in teacher dashboard
  - Can invite new teachers
  - Can view all users and their status
  - Has full access to all features

### Teachers
- Created by super admin via invitation
- Each teacher has isolated data (own vocabulary lists and game links)
- Must change password on first login
- Cannot see or access other teachers' data

## How to Invite a Teacher

1. Log in as super admin (petn@nextkbh.dk)
2. Navigate to the Teacher Dashboard
3. Click on the "User Management" tab
4. Click "Invite Teacher" button
5. Enter:
   - Teacher's email address
   - Temporary password (minimum 6 characters)
6. Click "Invite Teacher"

The new teacher will:
- Receive an email notification
- Be able to log in with the provided credentials
- Be forced to change their password on first login

## First Login Flow for Teachers

1. Teacher receives invitation email with temporary password
2. Teacher goes to login page
3. Teacher enters email and temporary password
4. System automatically redirects to password change page
5. Teacher must enter and confirm new password
6. After successful password change, teacher is redirected to their dashboard

## Security Features

✅ **No Public Sign-Up**: Sign-up page and links have been removed  
✅ **Data Isolation**: Each teacher can only see/edit their own vocabulary lists and game links via RLS policies  
✅ **Forced Password Change**: New teachers must change their temporary password on first login  
✅ **Email Confirmation**: New accounts are automatically confirmed (no verification loop)  
✅ **Admin Controls**: Super admin can view all users and their status  

## Database Schema

### user_profiles Table
- `id`: UUID (references auth.users)
- `role`: 'super_admin' | 'teacher'
- `password_change_required`: boolean
- `created_by`: UUID (references the admin who created this user)
- `created_at`: timestamp
- `updated_at`: timestamp

### Updated Tables
- `vocabulary_lists`: Added `user_id` column
- `game_links`: Added `user_id` column

## RLS Policies

### Vocabulary Lists & Cards
- Users can only read/write their own lists and cards
- Super admins can read all lists (but not modify others')

### Game Links
- Public read access for active game links (students need this)
- Users can only create/update/delete their own game links
- Super admins can read all game links

### User Profiles
- Users can read their own profile
- Super admins can read all profiles
- Super admins can create and update profiles
- Users can update their own `password_change_required` flag

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` is sensitive and should never be committed to version control.

## API Routes

### POST /api/invite-teacher
Creates a new teacher account.

**Request Body**:
```json
{
  "email": "teacher@example.com",
  "password": "temporary_password"
}
```

**Headers**:
- `Authorization: Bearer {access_token}`

**Response**:
```json
{
  "success": true,
  "userId": "uuid",
  "email": "teacher@example.com"
}
```

## Troubleshooting

### Teacher can't see their data
- Check that vocabulary lists and game links have the correct `user_id`
- Verify RLS policies are enabled and correct

### Invite teacher fails
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Check that the inviting user is a super admin
- Verify the email doesn't already exist

### Password change not working
- Check that `user_profiles` table exists
- Verify the user has `password_change_required` set to true
- Ensure RLS policies allow users to update their own profile

## Migration History

1. `006_add_user_management_and_isolation.sql` - Added user management schema and RLS policies
2. `007_setup_user_profiles_and_assign_data.sql` - Created initial user profiles and assigned existing data

## Future Enhancements

Potential features to add:
- Bulk user creation via CSV upload
- Ability to disable/enable user accounts
- Password reset functionality for teachers (admin-initiated)
- User activity tracking and analytics
- Email templates customization
- Role-based permissions (e.g., read-only teachers)
