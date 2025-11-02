# Want To Watch

A Progressive Web App (PWA) built with Next.js for managing your personal wishlist of movies and TV series. Search for content from The Movie Database (TMDB) and keep track of what you want to watch.

## Features

- 🔐 **Authentication**: Secure authentication with Clerk
- 🔍 **Search**: Search for movies and TV series using TMDB API
- 📝 **Wishlist**: Add and manage your personal wishlist
- 💾 **Database**: Free tier Supabase PostgreSQL database
- 📱 **PWA**: Installable as a Progressive Web App
- 🌙 **Dark Mode**: Built-in dark mode support

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Movie API**: The Movie Database (TMDB)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your API keys from the dashboard

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run the SQL from `supabase/schema.sql`
4. Copy your project URL and service role key from Settings > API

### 4. Set up TMDB API

1. Go to [themoviedb.org](https://www.themoviedb.org)
2. Create an account and go to Settings > API
3. Request an API key (free)
4. Copy your API key

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then fill in all the values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

TMDB_API_KEY=your_tmdb_api_key_here
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The wishlist table stores:
- `id`: Unique identifier (tmdb_id-media_type)
- `user_id`: Clerk user ID
- `title`: Movie/TV show title
- `overview`: Description
- `poster_path`: Poster image path
- `release_date` / `first_air_date`: Release dates
- `media_type`: 'movie' or 'tv'
- `tmdb_id`: TMDB API ID
- `added_at`: Timestamp when added

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── search/          # TMDB search API
│   │   └── wishlist/        # Wishlist CRUD API
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── Wishlist.tsx
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── mongodb.ts           # Supabase client (legacy name)
│   └── types.ts
├── supabase/
│   └── schema.sql           # Database schema
└── public/
    └── manifest.json        # PWA manifest
```

## Building for Production

```bash
npm run build
npm start
```

## Notes

- The app uses Next.js API routes for server-side operations
- Supabase handles the database with Row Level Security (RLS) enabled
- All database operations are performed server-side for security
- The app works entirely through Next.js API routes - no separate backend needed!

## License

MIT
