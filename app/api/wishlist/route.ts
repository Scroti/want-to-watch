import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch user's wishlist
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }

    // Transform data to match MediaItem interface
    const items = data.map(item => ({
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
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tmdb_id, title, overview, poster_path, release_date, first_air_date, media_type, status, rating, watched_date, tags, priority, notes } = body;

    if (!tmdb_id || !title || !media_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if item already exists
    const { data: existing } = await supabaseAdmin
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', tmdb_id)
      .eq('media_type', media_type)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 409 }
      );
    }

    const itemId = `${tmdb_id}-${media_type}`;

    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from('wishlist')
      .insert({
        id: itemId,
        user_id: userId,
        title,
        overview,
        poster_path,
        release_date,
        first_air_date,
        media_type,
        tmdb_id,
        status: status || 'want_to_watch',
        rating,
        watched_date,
        tags: tags || [],
        priority,
        notes,
        added_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      );
    }

    // Transform to match MediaItem interface
    const item = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      overview: data.overview,
      poster_path: data.poster_path,
      release_date: data.release_date,
      first_air_date: data.first_air_date,
      media_type: data.media_type,
      tmdb_id: data.tmdb_id,
      status: data.status || 'want_to_watch',
      rating: data.rating,
      watched_date: data.watched_date,
      tags: data.tags || [],
      priority: data.priority,
      notes: data.notes,
      addedAt: new Date(data.added_at),
      updatedAt: new Date(data.updated_at || data.added_at),
    };

    // Create activity
    await supabaseAdmin.from('activities').insert({
      id: `activity-${userId}-${itemId}-${Date.now()}`,
      user_id: userId,
      activity_type: 'added_item',
      target_id: itemId,
      target_type: 'media',
      metadata: { title, media_type },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

