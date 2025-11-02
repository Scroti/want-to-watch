import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get counts from wishlist
    const { data: wishlistItems } = await supabaseAdmin
      .from('wishlist')
      .select('status, rating')
      .eq('user_id', userId);

    const total_items = wishlistItems?.length || 0;
    const watched_count = wishlistItems?.filter(item => item.status === 'watched' || item.status === 'completed').length || 0;
    const want_to_watch_count = wishlistItems?.filter(item => item.status === 'want_to_watch').length || 0;
    const currently_watching_count = wishlistItems?.filter(item => item.status === 'currently_watching').length || 0;
    const dropped_count = wishlistItems?.filter(item => item.status === 'dropped').length || 0;

    // Calculate average rating
    const ratings = wishlistItems?.filter(item => item.rating).map(item => item.rating) || [];
    const average_rating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : undefined;

    // Get reviews count
    const { count: reviews_count } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get followers count
    const { count: followers_count } = await supabaseAdmin
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    // Get following count
    const { count: following_count } = await supabaseAdmin
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    // Get lists count
    const { count: lists_count } = await supabaseAdmin
      .from('custom_lists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return NextResponse.json({
      total_items,
      watched_count,
      want_to_watch_count,
      currently_watching_count,
      dropped_count,
      reviews_count: reviews_count || 0,
      followers_count: followers_count || 0,
      following_count: following_count || 0,
      lists_count: lists_count || 0,
      average_rating,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

