# 🚀 Quick Start Guide - Want To Watch

Follow these steps to get your app up and running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase Database

### A. Get your Supabase credentials:
1. Go to https://app.supabase.com
2. Open your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role** key (click "Reveal" to see it - it's a long JWT token)

### B. Create the database table:
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql` file
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)

✅ You should see "Success. No rows returned"

## Step 3: Set Up Clerk Authentication

1. Go to https://clerk.com and sign up/login
2. Create a new application
3. In the dashboard, go to **API Keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)

## Step 4: Get TMDB API Key

1. Go to https://www.themoviedb.org and create a free account
2. Go to **Settings** → **API**
3. Request an API key (it's free)
4. Copy your API key

## Step 5: Create Environment File

Create a file named `.env.local` in the root directory:

```bash
# On Mac/Linux:
touch .env.local

# On Windows:
# Create a new file named .env.local
```

Then open `.env.local` and paste this template, filling in your actual values:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_paste_your_key_here
CLERK_SECRET_KEY=sk_test_paste_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.paste_your_full_key_here

# TMDB API
TMDB_API_KEY=paste_your_tmdb_api_key_here
```

### ⚠️ Important:
- Replace ALL placeholder values with your actual keys
- Don't share this file or commit it to Git (it's already in .gitignore)
- Keep your keys secret!

## Step 6: Start the Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
```

## Step 7: Open Your Browser

Go to: **http://localhost:3000**

## Step 8: Sign In

- The app will redirect you to sign in
- Sign up for a new account or sign in if you already have one
- Once authenticated, you'll see the main app!

## ✅ That's It!

You should now be able to:
- 🔍 Search for movies and TV shows
- ➕ Add items to your wishlist
- 📝 View and manage your wishlist
- 🗑️ Remove items from your wishlist

---

## Troubleshooting

### "Missing required environment variable" error?
- Make sure `.env.local` exists in the root directory
- Check that all environment variables are filled in
- Restart the dev server after changing `.env.local`

### Database errors?
- Make sure you ran the SQL schema in Supabase SQL Editor
- Verify your Supabase URL and Service Role Key are correct

### Authentication errors?
- Check your Clerk keys are correct
- Make sure you're using the right environment (test vs production)

### Can't search movies?
- Verify your TMDB API key is correct
- Check the browser console for errors

---

## Need Help?

See `SETUP_GUIDE.md` for more detailed setup instructions.

