# Fix Login and Password Reset Issues - Step by Step

## Current Status
✅ Your account exists: `petn@nextkbh.dk`
✅ Email is confirmed
✅ Supabase configuration is correct
✅ No rate limiting or account locks
❌ Login failing with "Invalid email or password"
❌ Password reset email link shows error page

## Root Cause
The password reset email link is failing because the Supabase Site URL needs to be configured to your production URL instead of localhost.

## SOLUTION: Reset Your Password Manually

### Step 1: Go to Supabase Dashboard
1. Open this link in your browser: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/users
2. Log in to Supabase if needed

### Step 2: Find Your User
1. You should see a list of users
2. Find the user with email: `petn@nextkbh.dk`
3. Click on that user row

### Step 3: Reset Password
1. In the user details page, look for a button that says **"Send password recovery email"** or **"Reset password"**
2. Click that button
3. Check your email inbox for the password reset email
4. Click the link in the email

### Step 4: If Email Link Still Fails - Use Direct Password Reset
If the email link still shows an error page, you can set a new password directly:

1. In the Supabase user details page, look for a **"Reset Password"** or **"Set Password"** option
2. Some Supabase dashboards allow you to directly set a new password without email
3. Set a new password (make it strong: at least 8 characters, mix of letters, numbers, symbols)
4. Click Save

### Step 5: Fix Site URL (Important!)
To prevent future password reset issues:

1. Go to: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/url-configuration
2. Find the **"Site URL"** field
3. Change it from `http://localhost:3000` to your actual production URL
   - If you're using Netlify, it should be something like: `https://your-app-name.netlify.app`
   - If you don't know your production URL, check your Netlify dashboard
4. Click **Save**

### Step 6: Try Logging In
1. Go back to your app's login page
2. Enter email: `petn@nextkbh.dk`
3. Enter your new password
4. Click Login

## Alternative: If You Can't Access Supabase Dashboard

If you don't have access to the Supabase dashboard, you'll need to:

1. Contact whoever set up the Supabase project
2. Ask them to reset your password
3. Or ask them to give you access to the Supabase dashboard

## After Successfully Logging In

Once you're logged in, you can change your password anytime from within the app:

1. Go to the Teacher Dashboard (`/teacher`)
2. Click the **"Change Password"** button (top right, next to Logout)
3. Enter your current password and new password
4. This method works entirely within the app and doesn't require email verification

## Still Having Issues?

If you still can't log in after following these steps:

1. **Double-check your email**: Make sure you're using `petn@nextkbh.dk` exactly
2. **Check password**: Make sure you're typing the password correctly (no extra spaces, caps lock off)
3. **Try password reset again**: After fixing the Site URL, try the password reset email one more time
4. **Check spam folder**: The password reset email might be in your spam folder
5. **Clear browser cache**: Sometimes old cached data can cause issues
6. **Try a different browser**: Test if the issue is browser-specific

## Technical Details (For Reference)

- Supabase Project ID: `bgotkjqweuzdcvspbcxb`
- Supabase URL: `https://bgotkjqweuzdcvspbcxb.supabase.co`
- User ID: `c9987d7b-9fd0-4f86-8c1d-dddd88c7090e`
- Account created: Nov 2, 2025
- Email confirmed: Nov 2, 2025
- Last successful login: Dec 11, 2025

The account is valid and active - you just need to reset the password.
