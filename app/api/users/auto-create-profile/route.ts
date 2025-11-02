import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Auto-create profile for new users
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile already exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Profile already exists', profile: existing });
    }

    // Get user info from Clerk
    const user = await currentUser();
    const displayName = user?.firstName || user?.lastName 
      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() 
      : user?.username || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || null;
    const avatarUrl = user?.imageUrl || null;

    // Create basic profile with Clerk info
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        username: null, // User can set later
        display_name: displayName,
        bio: null,
        avatar_url: avatarUrl,
        favorite_genres: [],
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile created', profile: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

