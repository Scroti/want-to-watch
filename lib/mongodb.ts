import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Please add your Supabase URL to .env.local');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Please add your Supabase Service Role Key to .env.local');
}

// Server-side Supabase client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

