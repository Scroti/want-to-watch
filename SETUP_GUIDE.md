# Quick Setup Guide

## ⚠️ Security Note
The database password is not needed for this setup. We use Supabase API keys instead.

## Getting Supabase Credentials

1. **Go to your Supabase project dashboard**: https://app.supabase.com

2. **Get your Project URL**:
   - Go to **Settings** → **API**
   - Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - This goes in: `NEXT_PUBLIC_SUPABASE_URL`

3. **Get your Service Role Key**:
   - In the same **Settings** → **API** page
   - Find **service_role** key (scroll down, it's under "Project API keys")
   - Click **Reveal** and copy it (long JWT token)
   - ⚠️ Keep this secret! Never commit it to Git.
   - This goes in: `SUPABASE_SERVICE_ROLE_KEY`

4. **Run the Database Schema**:
   - Go to **SQL Editor** in your Supabase dashboard
   - Create a new query
   - Copy and paste the contents of `supabase/schema.sql`
   - Click **Run**

## Create Your `.env.local` File

Create a `.env.local` file in the root directory with these variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
```

## What You Don't Need
- ❌ Database password (we use API keys)
- ❌ Database connection string
- ❌ Any other database credentials

## What You DO Need
- ✅ Supabase Project URL
- ✅ Supabase Service Role Key
- ✅ Clerk API keys
- ✅ TMDB API key

