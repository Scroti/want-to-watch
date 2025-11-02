import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Check if current user follows a specific user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { data } = await supabaseAdmin
      .from('follows')
      .select('*')
      .eq('follower_id', userId)
      .eq('following_id', targetUserId)
      .single();

    return NextResponse.json({ isFollowing: !!data });
  } catch (error) {
    return NextResponse.json({ isFollowing: false });
  }
}

