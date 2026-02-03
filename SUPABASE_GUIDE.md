# Understanding Supabase Dashboard and Your Project

## What is Supabase?

Supabase is your project's **database and authentication system**. Think of it as:
- **Database**: Where all your game data, user accounts, and vocabulary lists are stored
- **Authentication**: How users log in and sign up
- **Real-time**: Allows live updates (like multiplayer games)

---

## 🎯 Quick Overview: What You Have

Your Quizzy project uses Supabase for:
1. **User Authentication** (login/signup)
2. **Vocabulary Storage** (word lists for games)
3. **Game Sessions** (multiplayer game data)
4. **Team Battles** (team-based competitions)

---

## 📊 Understanding the Supabase Dashboard

### How to Access
1. Go to [supabase.com](https://supabase.com)
2. Log in with your account
3. Select your Quizzy project

### Main Sections Explained

#### 1. **Table Editor** (Most Important!)
This is where you see your actual data.

**Your Tables:**
- `profiles` - User information
- `vocabulary_lists` - Collections of words for games
- `vocabulary_items` - Individual words in each list
- `game_sessions` - Active/past games
- `team_battles` - Team competition data
- `team_battle_participants` - Players in team battles

**What you can do:**
- View all data in spreadsheet format
- Add/edit/delete records manually
- See how many users, games, word lists you have

#### 2. **Authentication**
Shows all user accounts.

**What you see:**
- List of all registered users
- Email addresses
- Sign-up dates
- Last login times

**What you can do:**
- Manually create test users
- Delete users
- Reset passwords
- See authentication logs

#### 3. **SQL Editor**
Run database commands directly.

**When to use:**
- Create new tables
- Modify table structure
- Run complex queries
- Fix data issues

**Example queries you might use:**
```sql
-- See all vocabulary lists
SELECT * FROM vocabulary_lists;

-- Count total users
SELECT COUNT(*) FROM auth.users;

-- See recent games
SELECT * FROM game_sessions ORDER BY created_at DESC LIMIT 10;
```

#### 4. **Database** → **Migrations**
Shows the history of database changes.

**Your migrations:**
- `001_team_battle_tables.sql` - Created team battle system
- `002_vocabulary_management.sql` - Created vocabulary system

**What this means:**
- Each migration is a "version" of your database
- They run in order to build your database structure
- Never edit old migrations (create new ones instead)

#### 5. **API** → **API Docs**
Auto-generated documentation for your database.

**What you see:**
- How to query each table from code
- Example code snippets
- Available filters and operations

#### 6. **Storage**
File storage (if you need to store images, audio, etc.)

**Currently:** You're not using this yet, but you could for:
- User profile pictures
- Audio pronunciations
- Game assets

---

## 🔗 How Your Code Connects to Supabase

### Environment Variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These connect your Next.js app to your Supabase project.

### Key Files in Your Project

#### 1. **`lib/supabase/client.ts`**
Creates Supabase client for browser-side code.
```typescript
// Used in React components
const supabase = createBrowserClient()
```

#### 2. **`lib/supabase/server.ts`**
Creates Supabase client for server-side code.
```typescript
// Used in API routes and server components
const supabase = await createServerClient()
```

#### 3. **`lib/supabase/middleware.ts`**
Handles authentication automatically.
- Refreshes user sessions
- Protects routes that require login

#### 4. **`lib/supabase/vocabularyManagement.ts`**
Functions to work with vocabulary data:
- `createVocabularyList()` - Create new word list
- `getVocabularyLists()` - Get all lists
- `addVocabularyItems()` - Add words to a list
- etc.

---

## 🎮 How Data Flows in Your App

### Example: Creating a Game

1. **Teacher creates game** (Frontend)
   ```typescript
   // In your React component
   const { data } = await supabase
     .from('game_sessions')
     .insert({ code: 'ABC123', ... })
   ```

2. **Data saved to Supabase** (Database)
   - New row appears in `game_sessions` table
   - You can see it in Table Editor

3. **Students join game** (Frontend)
   ```typescript
   // Students query by game code
   const { data } = await supabase
     .from('game_sessions')
     .select('*')
     .eq('code', 'ABC123')
   ```

4. **Real-time updates** (Supabase Realtime)
   ```typescript
   // Listen for changes
   supabase
     .channel('game-updates')
     .on('postgres_changes', ...)
     .subscribe()
   ```

---

## 🔒 Row Level Security (RLS)

**What is RLS?**
Security rules that control who can access what data.

**Example Rules in Your Project:**
- Users can only see their own profile
- Teachers can create vocabulary lists
- Students can read vocabulary lists but not edit them
- Users can only join games, not delete them

**Where to manage:**
Dashboard → Authentication → Policies

**Important:** Always keep RLS enabled! It prevents data leaks.

---

## 🧪 Testing Your Database

### Using the Test Page
You have a test page at `/teacher/test-db` that:
- Checks database connection
- Tests creating vocabulary lists
- Tests reading data
- Shows any errors

### Manual Testing in Dashboard
1. Go to Table Editor
2. Click on a table (e.g., `vocabulary_lists`)
3. Click "Insert row" to add test data
4. Use your app and see if it appears
5. Check if your app can read/write correctly

---

## 🐛 Common Issues and Solutions

### Issue 1: "Failed to fetch"
**Problem:** Can't connect to Supabase
**Check:**
- Is `.env.local` file present?
- Are the environment variables correct?
- Is your Supabase project active?

### Issue 2: "Row Level Security policy violation"
**Problem:** RLS blocking your query
**Solution:**
- Check policies in Dashboard → Authentication → Policies
- Make sure user is authenticated
- Verify policy allows the operation

### Issue 3: "Relation does not exist"
**Problem:** Table doesn't exist
**Solution:**
- Run migrations: `npm run migrate` (if you have this script)
- Check Table Editor to see if table exists
- Verify migration files ran successfully

### Issue 4: "Column does not exist"
**Problem:** Trying to access a column that's not in the table
**Solution:**
- Check table structure in Table Editor
- Update your code to match actual column names
- Run any pending migrations

---

## 📚 Useful Dashboard Features

### 1. **Logs** (Dashboard → Logs)
See all database queries and errors in real-time.
- Helps debug issues
- Shows slow queries
- Displays authentication attempts

### 2. **Database → Backups**
Automatic backups of your data.
- Daily backups (on paid plans)
- Can restore if something goes wrong

### 3. **Project Settings**
- API keys (keep these secret!)
- Database password
- Connection strings
- Project URL

---

## 🚀 Next Steps

### To Understand Better:
1. **Open Table Editor** - Look at your actual data
2. **Check Authentication** - See your user accounts
3. **Review Migrations** - Understand your database structure
4. **Test the `/teacher/test-db` page** - See live connection

### To Learn More:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 💡 Quick Reference

| I want to... | Where to go |
|--------------|-------------|
| See my data | Table Editor |
| Check users | Authentication → Users |
| Run SQL | SQL Editor |
| View API docs | API → API Docs |
| Check errors | Logs |
| Manage security | Authentication → Policies |
| Get API keys | Project Settings → API |

---

## ❓ Still Confused?

Think of Supabase like this:
- **Dashboard** = Control panel for your database
- **Tables** = Excel spreadsheets with your data
- **RLS** = Security guard checking permissions
- **Migrations** = Instructions to build your database
- **Client code** = How your app talks to the database

Your app (Next.js) ↔️ Supabase Client ↔️ Supabase Database ↔️ Dashboard (you viewing it)
