import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get wishlist for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // Filter by status

    let query = supabaseAdmin
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }

    // Transform data
    const items = data?.map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      overview: item.overview,
      poster_path: item.poster_path,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      media_type: item.media_type,
      tmdb_id: item.tmdb_id,
      status: item.status || 'want_to_watch',
      rating: item.rating,
      watched_date: item.watched_date,
      tags: item.tags || [],
      priority: item.priority,
      notes: item.notes,
      addedAt: new Date(item.added_at),
      updatedAt: new Date(item.updated_at || item.added_at),
    })) || [];

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching user wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

