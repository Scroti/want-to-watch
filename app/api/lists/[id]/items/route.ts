import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Add item to list
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
    const body = await request.json();
    const { media_id } = body;

    if (!media_id) {
      return NextResponse.json({ error: 'media_id required' }, { status: 400 });
    }

    // Check if user owns the list
    const { data: list } = await supabaseAdmin
      .from('custom_lists')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!list || list.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if item already in list
    const { data: existing } = await supabaseAdmin
      .from('custom_list_items')
      .select('*')
      .eq('list_id', id)
      .eq('media_id', media_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Item already in list' }, { status: 409 });
    }

    // Add item
    const { data, error } = await supabaseAdmin
      .from('custom_list_items')
      .insert({
        list_id: id,
        media_id,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to add item to list' }, { status: 500 });
    }

    // Get media item
    if (data && data.media_id) {
      const { data: mediaItem } = await supabaseAdmin
        .from('wishlist')
        .select('*')
        .eq('id', data.media_id)
        .single();
      
      if (mediaItem) {
        data.media = mediaItem;
        data.wishlist = mediaItem;
      }
    }

    // Update items count
    const { data: listData } = await supabaseAdmin
      .from('custom_lists')
      .select('items_count')
      .eq('id', id)
      .single();
    
    if (listData) {
      await supabaseAdmin
        .from('custom_lists')
        .update({ items_count: (listData.items_count || 0) + 1 })
        .eq('id', id);
    }

    // Create activity
    await supabaseAdmin.from('activities').insert({
      id: `activity-${userId}-${id}-${Date.now()}`,
      user_id: userId,
      activity_type: 'added_to_list',
      target_id: id,
      target_type: 'list',
      metadata: { media_id },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error adding item to list:', error);
    return NextResponse.json({ error: 'Failed to add item to list' }, { status: 500 });
  }
}

// DELETE - Remove item from list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const media_id = searchParams.get('media_id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!media_id) {
      return NextResponse.json({ error: 'media_id required' }, { status: 400 });
    }

    // Check if user owns the list
    const { data: list } = await supabaseAdmin
      .from('custom_lists')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!list || list.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('custom_list_items')
      .delete()
      .eq('list_id', id)
      .eq('media_id', media_id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to remove item from list' }, { status: 500 });
    }

    // Update items count
    const { data: listData } = await supabaseAdmin
      .from('custom_lists')
      .select('items_count')
      .eq('id', id)
      .single();
    
    if (listData) {
      await supabaseAdmin
        .from('custom_lists')
        .update({ items_count: Math.max(0, (listData.items_count || 0) - 1) })
        .eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing item from list:', error);
    return NextResponse.json({ error: 'Failed to remove item from list' }, { status: 500 });
  }
}

