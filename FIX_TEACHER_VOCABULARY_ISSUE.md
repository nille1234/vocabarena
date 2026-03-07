# Fix for Teacher Vocabulary List Creation Issue

## Problem
Teachers are getting a **409 Conflict error** when trying to create vocabulary lists. The error occurs due to conflicting Row Level Security (RLS) policies on the `vocabulary_lists` table.

## Solution
Apply the migration file `009_fix_vocabulary_lists_rls_409_error.sql` to fix the RLS policies.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project's SQL Editor:
   ```
   https://supabase.com/dashboard/project/bgotkjqweuzdcvspbcxb/sql/new
   ```

2. Copy the entire contents of the file `supabase/migrations/009_fix_vocabulary_lists_rls_409_error.sql`

3. Paste it into the SQL Editor

4. Click "Run" to execute the migration

5. You should see a success message

### Option 2: Using Supabase CLI (If you have it set up locally)

```bash
npx supabase db push
```

## What This Fix Does

The migration:
1. **Removes conflicting RLS policies** that were blocking teachers from creating vocabulary lists
2. **Creates simplified, non-conflicting policies** that:
   - Allow teachers and super admins to create vocabulary lists
   - Ensure users can only access their own lists
   - Allow super admins to view all lists
   - Prevent policy conflicts that cause 409 errors

## After Applying the Fix

1. Ask your teacher to refresh the page
2. Have them try creating a vocabulary list again
3. It should now work without the "unknown error"

## Technical Details

The 409 error was caused by RLS policy conflicts. The old policies had overlapping conditions that caused the database to reject INSERT operations. The new policies are:

- **Enable read for users on own lists**: Users can SELECT their own vocabulary lists
- **Enable read for super admins on all lists**: Super admins can SELECT all vocabulary lists
- **Enable insert for authenticated users**: Teachers and super admins can INSERT vocabulary lists (with user_id matching their auth.uid())
- **Enable update for users on own lists**: Users can UPDATE their own vocabulary lists
- **Enable delete for users on own lists**: Users can DELETE their own vocabulary lists

These policies are mutually exclusive and won't conflict with each other.
