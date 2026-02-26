# Fix Login and Password Reset Issues

## Current Situation
- Email: petn@nextkbh.dk
- Account exists and is confirmed ✓
- Password not working: "Invalid email or password"
- Password reset redirects to localhost (doesn't work)

## Solution: Fix Supabase Configuration

### Step 1: Update Supabase Site URL

The password reset email is trying to redirect to `localhost` instead of your actual Netlify URL. You need to update this in Supabase.

**Go to Supabase Dashboard:**
1. Open: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/url-configuration
2. Find the **"Site URL"** field
3. Change it from `http://localhost:3000` to your **actual Netlify URL**
   - Example: `https://your-app-name.netlify.app`
   - Or whatever your production URL is
4. Click **Save**

### Step 2: Update Password Reset Email Template

**Go to Email Templates:**
1. Open: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/templates
2. Click on **"Reset Password"** template
3. Make sure the template contains:

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">
    Reset Password
  </a>
</p>
```

4. Click **Save**

### Step 3: Reset Your Password

Now that the configuration is fixed:

1. Go to the forgot password page: `/auth/forgot-password`
2. Enter your email: `petn@nextkbh.dk`
3. Click "Send reset email"
4. Check your email inbox
5. Click the reset link (it should now work and not redirect to localhost)
6. Enter your new password
7. Log in with your new password

### Step 4: Alternative - Manual Password Reset via Supabase Dashboard

If you need immediate access, you can reset your password directly in Supabase:

1. Go to: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/users
2. Find your user: `petn@nextkbh.dk`
3. Click on the user
4. Click "Send password recovery email" or "Reset password"
5. Follow the email instructions

## Why This Happened

The Supabase Site URL was set to `localhost:3000` (development URL) instead of your production Netlify URL. This caused all password reset emails to redirect to localhost, which doesn't work when you're not running the app locally.

## Browser Opening in Edge

This is a Windows setting, not related to the app:
- Go to: Windows Settings → Apps → Default apps → Web browser
- Select Chrome as your default browser

## After Logging In

Once you successfully log in, you can change your password anytime from the Teacher Dashboard:
1. Go to `/teacher`
2. Click "Change Password" button (top right, next to Logout)
3. Enter current password and new password
4. This method doesn't require email verification

## Need Help?

If you still can't log in after following these steps:
1. Make sure you're using the correct email: `petn@nextkbh.dk`
2. Try resetting your password again after updating the Site URL
3. Check your spam folder for the password reset email
4. Make sure you're accessing the app from the correct URL (not localhost)
