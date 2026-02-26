# Password Reset Setup Guide

## Overview
This document explains how the password reset flow works and what configuration is needed in your Supabase project.

## How It Works

### 1. User Requests Password Reset
- User enters their email on `/auth/forgot-password`
- The app calls `supabase.auth.resetPasswordForEmail(email)` without a `redirectTo` parameter
- Supabase sends an email using the configured email template

### 2. Email Template Configuration
The password reset email template in your Supabase dashboard must use this format:

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">
    Reset Password
  </a>
</p>
```

**Important:** The link must include:
- `{{ .SiteURL }}` - Your application's Site URL
- `/auth/confirm` - The confirmation endpoint
- `token_hash={{ .TokenHash }}` - The password reset token
- `type=recovery` - Indicates this is a password reset
- `next=/auth/update-password` - Where to redirect after token verification

### 3. Token Verification
When the user clicks the link:
1. They're redirected to `/auth/confirm?token_hash=...&type=recovery&next=/auth/update-password`
2. The `app/auth/confirm/route.ts` handler:
   - Verifies the token using `supabase.auth.verifyOtp()`
   - Creates an authenticated session
   - Redirects to `/auth/update-password`

### 4. Password Update
On `/auth/update-password`:
- User enters their new password
- The app calls `supabase.auth.updateUser({ password: newPassword })`
- User is redirected to the teacher dashboard

## Required Configuration

### 1. Update Email Template in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/templates

Find the "Reset Password" template and update it to:

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">
    Reset Password
  </a>
</p>
```

### 2. Verify Site URL Configuration

Go to: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/url-configuration

Ensure your Site URL is set correctly:
- For Henosia sandbox: `https://app-sandbox.henosia.com`
- For local development: `http://localhost:3000`
- For production: Your production domain (e.g., `https://yourdomain.com`)

**IMPORTANT:** The Site URL must match the domain where your application is running. For the Henosia sandbox environment, this MUST be `https://app-sandbox.henosia.com`.

## Code Changes Made

### 1. Updated `app/auth/confirm/route.ts`
- Added logic to detect `type=recovery` and redirect to `/auth/update-password`
- Maintains backward compatibility with email confirmations

### 2. Updated `components/forgot-password-form.tsx`
- Removed the `redirectTo` parameter from `resetPasswordForEmail()`
- Now relies on Supabase's Site URL configuration

## Testing the Flow

1. Go to `/auth/forgot-password`
2. Enter your email address
3. Check your email for the password reset link
4. Click the link - it should redirect to `/auth/update-password`
5. Enter your new password
6. You should be redirected to `/teacher`

## Troubleshooting

### "Cannot open the page at supabase" error
This means the email template is using the old format with a direct `redirectTo` URL. Update the template as described above.

### Email not received
- Check your spam folder
- Verify the email address is correct
- Check Supabase logs for email sending errors

### Token expired
Password reset tokens expire after a certain time (default is 1 hour). Request a new password reset email.

### Redirect not working
- Verify the Site URL is configured correctly in Supabase
- Check that `/auth/confirm` route is working
- Check browser console for errors
