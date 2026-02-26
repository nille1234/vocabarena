# Supabase Email Template Configuration Fix

## Problem
The password reset flow is not working because the email template in Supabase needs to be updated to use the correct format for the Henosia sandbox environment.

## Solution

You need to update the **Reset Password** email template in your Supabase dashboard.

### Step 1: Access Email Templates

Go to your Supabase project's email templates page:
https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/templates

### Step 2: Update the Reset Password Template

Find the "Reset Password" template and replace its content with:

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">
    Reset Password
  </a>
</p>
```

**Important:** Make sure to use exactly this format. The key elements are:
- `{{ .SiteURL }}` - Uses your configured Site URL
- `/auth/confirm` - Your token verification endpoint
- `token_hash={{ .TokenHash }}` - The password reset token
- `type=recovery` - Identifies this as a password reset
- `next=/auth/update-password` - Where to redirect after verification

### Step 3: Verify Site URL Configuration

Go to: https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/auth/url-configuration

Ensure your Site URL is set to:
```
https://app-sandbox.henosia.com
```

This MUST match the domain where your Henosia application is running.

### Step 4: Test the Flow

1. Go to `/auth/forgot-password` in your app
2. Enter your email address
3. Check your email for the password reset link
4. Click the link - it should redirect to `/auth/update-password`
5. Enter your new password
6. You should be redirected to `/teacher`

## What Was Fixed in the Code

The following code changes have been made to support this flow:

1. **app/auth/confirm/route.ts** - Added `export const dynamic = 'force-dynamic'` to ensure proper route handling
2. The route already handles `type=recovery` and redirects to `/auth/update-password`
3. All auth routes are properly configured in the middleware

## Common Issues

### "Cannot open the page" Error
This means the email template is still using an old format. Make sure you've updated the template exactly as shown above.

### Email Not Received
- Check your spam folder
- Verify the email address is registered in your system
- Check Supabase logs for email sending errors

### Token Expired
Password reset tokens expire after 1 hour. Request a new password reset email.

## Why This Format?

The template uses `{{ .SiteURL }}` instead of a hardcoded URL because:
- It automatically uses the correct domain (sandbox, production, etc.)
- It's more maintainable
- It follows Supabase best practices

The token is sent as `token_hash` in the URL, which is then verified by your `/auth/confirm` endpoint before redirecting the user to the password update page.
