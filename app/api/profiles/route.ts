import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get user profile by username or user_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const userId = searchParams.get('userId');

    if (!username && !userId) {
      return NextResponse.json({ error: 'Username or userId required' }, { status: 400 });
    }

    let query = supabaseAdmin.from('profiles').select('*');

    if (username) {
      // Try username first
      query = query.eq('username', username).single();
    } else if (userId) {
      query = query.eq('user_id', userId).single();
    }

    let { data, error } = await query;

    // If username lookup fails, try as user_id
    if (error && username && error.code === 'PGRST116') {
      query = supabaseAdmin.from('profiles').select('*').eq('user_id', username).single();
      const retryResult = await query;
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST - Create or update profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, display_name, bio, avatar_url, favorite_genres } = body;

    // Check if username is taken (if provided and changed)
    if (username) {
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .neq('user_id', userId)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        username,
        display_name,
        bio,
        avatar_url,
        favorite_genres: favorite_genres || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

