import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get reviews for a media item or user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mediaId = searchParams.get('mediaId');
    const userId = searchParams.get('userId');

    let query = supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (mediaId) {
      query = query.eq('media_id', mediaId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else {
      return NextResponse.json({ error: 'mediaId or userId required' }, { status: 400 });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Get user profiles
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
      const reviewsWithProfiles = data.map((review: any) => ({
        ...review,
        user: profileMap.get(review.user_id) || null,
        profiles: profileMap.get(review.user_id) || null,
      }));

      return NextResponse.json(reviewsWithProfiles || []);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST - Create a review
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { media_id, rating, title, content, contains_spoilers } = body;

    if (!media_id || !rating) {
      return NextResponse.json({ error: 'media_id and rating required' }, { status: 400 });
    }

    // Check if review already exists
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('media_id', media_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Review already exists' }, { status: 409 });
    }

    const reviewId = `review-${userId}-${media_id}-${Date.now()}`;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        id: reviewId,
        user_id: userId,
        media_id,
        rating,
        title,
        content,
        contains_spoilers: contains_spoilers || false,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    // Get user profile
    if (data && userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profile) {
        data.user = profile;
        data.profiles = profile;
      }
    }

    // Create activity
    await supabaseAdmin.from('activities').insert({
      id: `activity-${userId}-${reviewId}-${Date.now()}`,
      user_id: userId,
      activity_type: 'reviewed',
      target_id: media_id,
      target_type: 'media',
      metadata: { rating, title },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

