import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Like/unlike a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if already liked
    const { data: existing } = await supabaseAdmin
      .from('review_likes')
      .select('*')
      .eq('review_id', id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabaseAdmin
        .from('review_likes')
        .delete()
        .eq('review_id', id)
        .eq('user_id', userId);

      // Decrement likes count
      const { data: review } = await supabaseAdmin
        .from('reviews')
        .select('likes_count')
        .eq('id', id)
        .single();
      
      if (review) {
        await supabaseAdmin
          .from('reviews')
          .update({ likes_count: Math.max(0, (review.likes_count || 0) - 1) })
          .eq('id', id);
      }

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabaseAdmin
        .from('review_likes')
        .insert({
          review_id: id,
          user_id: userId,
        });

      // Increment likes count
      const { data: review } = await supabaseAdmin
        .from('reviews')
        .select('likes_count')
        .eq('id', id)
        .single();
      
      if (review) {
        await supabaseAdmin
          .from('reviews')
          .update({ likes_count: (review.likes_count || 0) + 1 })
          .eq('id', id);
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

