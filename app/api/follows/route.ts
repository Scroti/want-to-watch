import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get following/followers list
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'following' or 'followers'

    const queryUserId = targetUserId || userId;

    if (!queryUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query;
    if (type === 'followers') {
      // Get users who follow this user
      const { data: follows } = await supabaseAdmin
        .from('follows')
        .select('follower_id')
        .eq('following_id', queryUserId);

      const followerIds = follows?.map(f => f.follower_id) || [];
      
      if (followerIds.length === 0) {
        return NextResponse.json([]);
      }

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('user_id', followerIds);

      return NextResponse.json(profiles || []);
    } else {
      // Get users this user follows
      const { data: follows } = await supabaseAdmin
        .from('follows')
        .select('following_id')
        .eq('follower_id', queryUserId);

      const followingIds = follows?.map(f => f.following_id) || [];
      
      if (followingIds.length === 0) {
        return NextResponse.json([]);
      }

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('user_id', followingIds);

      return NextResponse.json(profiles || []);
    }
  } catch (error) {
    console.error('Error fetching follows:', error);
    return NextResponse.json({ error: 'Failed to fetch follows' }, { status: 500 });
  }
}

// POST - Follow a user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: 'followingId required' }, { status: 400 });
    }

    if (userId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const { data: existing } = await supabaseAdmin
      .from('follows')
      .select('*')
      .eq('follower_id', userId)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already following' }, { status: 409 });
    }

    // Create follow
    const { data, error } = await supabaseAdmin
      .from('follows')
      .insert({
        follower_id: userId,
        following_id: followingId,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
    }

    // Create activity
    await supabaseAdmin.from('activities').insert({
      id: `follow-${userId}-${followingId}-${Date.now()}`,
      user_id: userId,
      activity_type: 'followed_user',
      target_id: followingId,
      target_type: 'user',
    });

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      id: `notif-follow-${followingId}-${userId}-${Date.now()}`,
      user_id: followingId,
      notification_type: 'follow',
      from_user_id: userId,
      title: 'New Follower',
      message: 'started following you',
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

// DELETE - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const followingId = searchParams.get('userId');

    if (!followingId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}

