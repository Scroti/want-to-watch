import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get lists (user's lists or public lists)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('userId');
    const publicOnly = searchParams.get('publicOnly') === 'true';

    let query = supabaseAdmin
      .from('custom_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
      if (publicOnly) {
        query = query.eq('is_public', true);
      }
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
    }

    // Fetch profiles separately to avoid join issues
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((list: any) => list.user_id))];
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

      const listsWithProfiles = data.map((list: any) => ({
        ...list,
        profiles: profileMap.get(list.user_id) || null,
        user: profileMap.get(list.user_id) || null,
      }));

      return NextResponse.json(listsWithProfiles || []);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
}

// POST - Create a list
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, is_public, cover_image_url } = body;

    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    const listId = `list-${userId}-${Date.now()}`;

    const { data, error } = await supabaseAdmin
      .from('custom_lists')
      .insert({
        id: listId,
        user_id: userId,
        name,
        description,
        is_public: is_public !== false,
        cover_image_url,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
    }

    // Fetch profile separately
    if (data && data.user_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', data.user_id)
        .single();

      if (profile) {
        data.profiles = profile;
        data.user = profile;
      }
    }

    // Create activity
    await supabaseAdmin.from('activities').insert({
      id: `activity-${userId}-${listId}-${Date.now()}`,
      user_id: userId,
      activity_type: 'created_list',
      target_id: listId,
      target_type: 'list',
      metadata: { name },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
  }
}

