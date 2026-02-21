# Supabase Setup Guide

Your StockFx Investment app is now using **Supabase** instead of Firebase!

## Setup Steps

### 1. Create Database Tables

Go to your Supabase dashboard:
1. Navigate to **Settings → SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `SUPABASE_SETUP.sql` from this repository
4. Click **Run** (or CMD+Enter)
5. You should see "Success" message

### 2. Enable Authentication

In your Supabase dashboard:
1. Go to **Authentication → Providers**
2. Make sure **Email** provider is enabled
3. Go to **Authentication → Email Templates**
4. Review email confirmation templates (optional customization)

### 3. Configure RLS (Row Level Security)

The SQL script already sets up RLS policies:
- ✅ Users can read their own data
- ✅ Users can update their own data
- ✅ Anyone can insert new users (for registration)
- ✅ Admin can read all users
- ✅ Admin can update user data

### 4. Your Credentials (Already Added)

Your app is already configured with:
- **Project URL**: https://ngxptvwtklwalmkbnylq.supabase.co
- **Anon Key**: Embedded in `src/lib/supabase.ts`

### 5. Environment Variables (Optional)

If you want to use environment variables instead of hardcoding:

Create `.env.local`:
```
VITE_SUPABASE_URL=https://ngxptvwtklwalmkbnylq.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then update `src/lib/supabase.ts`:
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;
```

## Testing Locally

1. Run dev server:
```bash
npm run dev
```

2. Go to http://localhost:5173

3. Test registration:
   - Use any email/password
   - User should be created in Supabase Auth
   - User profile should appear in database

4. Test login:
   - Register first
   - Login with same credentials
   - Should fetch user data from Supabase

5. Test admin dashboard:
   - Login as admin (see code for credentials)
   - Should see all users fetched from Supabase

## What Changed

### Replaced Firebase with Supabase:
- `src/lib/firebase.ts` → `src/lib/supabase.ts`
- `src/lib/firebaseAuth.ts` → `src/lib/supabaseAuth.ts`
- `src/lib/session.ts` - Updated imports and error messages
- `src/App.tsx` - Initialize Supabase instead of Firebase

### Key Advantages:
- ✅ Works perfectly on Vercel
- ✅ PostgreSQL database (more reliable)
- ✅ No "Load failed" errors
- ✅ Better RLS (Row Level Security)
- ✅ Easy to switch hosts later
- ✅ Free tier generous (500MB storage, 1GB bandwidth)

## Deployment to Vercel

After testing locally, deploy with:
```bash
git add -A
git commit -m "Switch from Firebase to Supabase"
git push
```

Vercel will auto-deploy. No additional configuration needed - the hardcoded credentials work anywhere!

## Troubleshooting

**Error: "relation 'users' does not exist"**
→ Run the SQL setup script again, make sure it executed successfully

**Error: "No users found in database"**
→ Check Supabase dashboard → SQL Editor: `SELECT * FROM users;`

**Login/Registration not working**
→ Check browser console (F12) for the detailed logs with 🚀✅❌ icons

**"Load failed" error on Vercel**
→ Check Supabase project URL and anon key are correct in `src/lib/supabase.ts`

## Support

Supabase docs: https://supabase.com/docs
Feel free to reach out if you need help!
