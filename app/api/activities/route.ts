import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get activity feed (following feed)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // If targetUserId, get their activities
    // Otherwise, get activities from people the current user follows
    if (targetUserId) {
      const { data, error } = await supabaseAdmin
        .from('activities')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
      }

      // Get profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((a: any) => a.user_id))];
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .in('user_id', userIds);
        
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
        const activitiesWithProfiles = data.map((activity: any) => ({
          ...activity,
          user: profileMap.get(activity.user_id) || null,
          profiles: profileMap.get(activity.user_id) || null,
        }));

        return NextResponse.json(activitiesWithProfiles || []);
      }

      return NextResponse.json(data || []);
    } else {
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get list of users current user follows
      const { data: follows } = await supabaseAdmin
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const followingIds = follows?.map(f => f.following_id) || [];

      if (followingIds.length === 0) {
        return NextResponse.json([]);
      }

      // Get activities from followed users
      const { data, error } = await supabaseAdmin
        .from('activities')
        .select('*')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
      }

      // Get profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((a: any) => a.user_id))];
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .in('user_id', userIds);
        
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
        const activitiesWithProfiles = data.map((activity: any) => ({
          ...activity,
          user: profileMap.get(activity.user_id) || null,
          profiles: profileMap.get(activity.user_id) || null,
        }));

        return NextResponse.json(activitiesWithProfiles || []);
      }

      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

