import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PATCH - Update wishlist item (status, rating, etc.)
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
    
    const { status, rating, watched_date, tags, priority, notes } = body;

    // Get current item
    const { data: currentItem } = await supabaseAdmin
      .from('wishlist')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!currentItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (rating !== undefined) updates.rating = rating;
    if (watched_date !== undefined) updates.watched_date = watched_date;
    if (tags !== undefined) updates.tags = tags;
    if (priority !== undefined) updates.priority = priority;
    if (notes !== undefined) updates.notes = notes;

    // Update item
    const { data, error } = await supabaseAdmin
      .from('wishlist')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }

    // Create activity if status changed
    if (status && status !== currentItem.status) {
      const activityType = status === 'watched' ? 'watched_item' : 'added_item';
      await supabaseAdmin.from('activities').insert({
        id: `activity-${userId}-${id}-${Date.now()}`,
        user_id: userId,
        activity_type: activityType,
        target_id: id,
        target_type: 'media',
        metadata: { title: data.title, status, media_type: data.media_type },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

