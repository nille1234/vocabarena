# Teacher Invitation Email Setup

## Overview
The teacher invitation system now uses Supabase's built-in `inviteUserByEmail()` method, which automatically sends an invitation email to new teachers. This is more secure than the previous system as users set their own passwords.

## How It Works

1. **Super Admin invites a teacher** by entering their email address
2. **Supabase sends an invitation email** with a magic link
3. **Teacher clicks the link** and is directed to set their password
4. **Teacher logs in** with their new credentials

## Configuration Steps

### Step 0: Environment Setup (For Netlify Deployment)

The invite system now automatically detects your deployment URL, so it works across all environments:
- **Local development**: Uses `http://localhost:3000`
- **Netlify preview**: Uses your preview URL automatically
- **Netlify production**: Uses your production URL automatically

**Optional but recommended**: Add `NEXT_PUBLIC_APP_URL` to your Netlify environment variables with your production URL (e.g., `https://your-app.netlify.app`) as a fallback.

## Required: Configure Supabase Email Template

You **must** configure the "Invite User" email template in your Supabase dashboard for invitations to work properly.

### Step 1: Access Email Templates

Go to your Supabase project's email templates page:
```
https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/templates
```

### Step 2: Update the "Invite User" Template

Find the **"Invite User"** template and replace its content with:

```html
<h2>You've been invited to VocabArena</h2>

<p>You have been invited to join VocabArena as a teacher.</p>

<p>Click the link below to accept the invitation and set up your account:</p>

<p>
  <a href="{{ .ConfirmationURL }}">Accept Invitation</a>
</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't expect this invitation, you can safely ignore this email.</p>
```

**Important:**
- Use `{{ .ConfirmationURL }}` - This is a special Supabase variable that automatically uses the `redirectTo` parameter set in the API code
- This ensures the invitation link works correctly with Henosia's preview system
- The URL will automatically include the token and redirect to the correct page

### Step 3: Configure Supabase Redirect URLs

Go to: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/url-configuration

**Set your Site URL** to your Netlify production URL:
```
https://your-app.netlify.app
```

**Add Redirect URLs** to allow authentication from all environments:
```
http://localhost:3000/**
https://app-sandbox.henosia.com/**
https://your-app.netlify.app/**
https://deploy-preview-*--your-app.netlify.app/**
```

Replace `your-app` with your actual Netlify site name.

### Step 4: Test the Flow

1. Go to `/teacher` in your app
2. Click "Invite Teacher"
3. Enter an email address
4. Check the email inbox for the invitation
5. Click the invitation link
6. Set a password
7. You should be redirected to `/teacher`

## What Changed

### Before (Old System)
- ❌ Super admin had to create a temporary password
- ❌ Password had to be shared with the teacher (insecure)
- ❌ No email was sent automatically
- ❌ Teacher had to manually change password on first login

### After (New System)
- ✅ No temporary passwords needed
- ✅ Teacher sets their own password securely
- ✅ Invitation email sent automatically by Supabase
- ✅ Better user experience and security

## Code Changes Made

1. **API Route** (`app/api/invite-teacher/route.ts`)
   - Removed `password` parameter
   - Changed from `admin.createUser()` to `admin.inviteUserByEmail()`
   - Set `password_change_required: false` (not needed anymore)

2. **UI Component** (`components/teacher/InviteTeacherDialog.tsx`)
   - Removed password field
   - Updated description to explain invitation email
   - Simplified form to just email input

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify the email template is configured correctly
- Check Supabase logs for email sending errors
- Ensure SMTP is configured in Supabase (or using Supabase's default email service)

### "Invalid or expired token" Error
- Invitation links expire after 24 hours
- Send a new invitation if the link has expired

### User Can't Set Password
- Verify the email template redirects to `/auth/confirm?type=invite`
- Check that the `auth/confirm` route is handling `type=invite` correctly

## Security Benefits

1. **No password sharing** - Teachers create their own secure passwords
2. **Time-limited tokens** - Invitation links expire after 24 hours
3. **Email verification** - Confirms the teacher has access to the email
4. **Audit trail** - `created_by` field tracks who invited each teacher
