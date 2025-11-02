import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get recommendations for current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('recommendations')
      .select('*')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }

    // Get profiles and media items
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((r: any) => r.from_user_id))];
      const mediaIds = [...new Set(data.map((r: any) => r.media_id))];

      const [profilesRes, mediaRes] = await Promise.all([
        userIds.length > 0 ? supabaseAdmin.from('profiles').select('*').in('user_id', userIds) : { data: [] },
        mediaIds.length > 0 ? supabaseAdmin.from('wishlist').select('*').in('id', mediaIds) : { data: [] },
      ]);

      const profileMap = new Map(profilesRes.data?.map((p: any) => [p.user_id, p]) || []);
      const mediaMap = new Map(mediaRes.data?.map((m: any) => [m.id, m]) || []);

      const recommendationsWithData = data.map((rec: any) => ({
        ...rec,
        from_user: profileMap.get(rec.from_user_id) || null,
        profiles: profileMap.get(rec.from_user_id) || null,
        media: mediaMap.get(rec.media_id) || null,
        wishlist: mediaMap.get(rec.media_id) || null,
      }));

      return NextResponse.json(recommendationsWithData || []);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

// POST - Create a recommendation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to_user_id, media_id, message } = body;

    if (!to_user_id || !media_id) {
      return NextResponse.json({ error: 'to_user_id and media_id required' }, { status: 400 });
    }

    if (userId === to_user_id) {
      return NextResponse.json({ error: 'Cannot recommend to yourself' }, { status: 400 });
    }

    const recommendationId = `rec-${userId}-${to_user_id}-${media_id}-${Date.now()}`;

    const { data, error } = await supabaseAdmin
      .from('recommendations')
      .insert({
        id: recommendationId,
        from_user_id: userId,
        to_user_id,
        media_id,
        message,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create recommendation' }, { status: 500 });
    }

    // Get profile and media
    if (data) {
      const [profileRes, mediaRes] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('user_id', userId).single(),
        supabaseAdmin.from('wishlist').select('*').eq('id', media_id).single(),
      ]);

      if (profileRes.data) {
        data.profiles = profileRes.data;
        data.from_user = profileRes.data;
      }
      if (mediaRes.data) {
        data.wishlist = mediaRes.data;
        data.media = mediaRes.data;
      }
    }

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      id: `notif-rec-${to_user_id}-${recommendationId}-${Date.now()}`,
      user_id: to_user_id,
      notification_type: 'recommendation',
      from_user_id: userId,
      target_id: media_id,
      target_type: 'media',
      title: 'New Recommendation',
      message: message || 'recommended this to you',
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return NextResponse.json({ error: 'Failed to create recommendation' }, { status: 500 });
  }
}

