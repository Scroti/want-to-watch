import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get list details with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get list
    const { data: list, error: listError } = await supabaseAdmin
      .from('custom_lists')
      .select('*')
      .eq('id', id)
      .single();

    // Get user profile
    if (list && list.user_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', list.user_id)
        .single();
      
      if (profile) {
        list.profiles = profile;
        list.user = profile;
      }
    }

    if (listError || !list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Get list items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('custom_list_items')
      .select('*')
      .eq('list_id', id)
      .order('added_at', { ascending: false });

    // Get media items for each list item
    if (items && items.length > 0) {
      const mediaIds = items.map((item: any) => item.media_id);
      const { data: mediaItems } = await supabaseAdmin
        .from('wishlist')
        .select('*')
        .in('id', mediaIds);

      const mediaMap = new Map(mediaItems?.map((m: any) => [m.id, m]) || []);
      
      items.forEach((item: any) => {
        const media = mediaMap.get(item.media_id);
        if (media) {
          item.media = media;
          item.wishlist = media;
        }
      });
    }

    if (itemsError) {
      console.error('Error fetching list items:', itemsError);
    }

    return NextResponse.json({
      ...list,
      items: items || [],
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 });
  }
}

// PATCH - Update list
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, is_public, cover_image_url } = body;

    const { data, error } = await supabaseAdmin
      .from('custom_lists')
      .update({
        name,
        description,
        is_public,
        cover_image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    // Get user profile
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

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
  }
}

// DELETE - Delete list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('custom_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
  }
}

