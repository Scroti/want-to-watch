import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get comments for a media item
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mediaId = searchParams.get('mediaId');

    if (!mediaId) {
      return NextResponse.json({ error: 'mediaId required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('media_id', mediaId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Get replies for each comment
    if (data && data.length > 0) {
      const commentIds = data.map(c => c.id);
      const userIds = [...new Set(data.map(c => c.user_id))];
      
      // Get profiles
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

      const { data: replies } = await supabaseAdmin
        .from('comments')
        .select('*')
        .in('parent_id', commentIds)
        .order('created_at', { ascending: true });

      // Attach user profiles and replies
      data.forEach(comment => {
        comment.user = profileMap.get(comment.user_id) || null;
        comment.replies = replies?.filter(r => r.parent_id === comment.id).map((reply: any) => ({
          ...reply,
          user: profileMap.get(reply.user_id) || null,
        })) || [];
        comment.reply_count = comment.replies.length;
      });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST - Create a comment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { media_id, parent_id, content, contains_spoilers } = body;

    if (!media_id || !content) {
      return NextResponse.json({ error: 'media_id and content required' }, { status: 400 });
    }

    const commentId = `comment-${userId}-${media_id}-${Date.now()}`;

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        id: commentId,
        user_id: userId,
        media_id,
        parent_id,
        content,
        contains_spoilers: contains_spoilers || false,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
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

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

