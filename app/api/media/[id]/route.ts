import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// GET - Get media details from TMDB
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [tmdb_id, media_type] = id.split('-');

    if (!tmdb_id || !media_type) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }

    const endpoint = media_type === 'tv' ? 'tv' : 'movie';
    
    // Fetch both details and videos
    const [detailsRes, videosRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdb_id}?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdb_id}/videos?api_key=${TMDB_API_KEY}`)
    ]);

    if (!detailsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch media details' }, { status: 500 });
    }

    const data = await detailsRes.json();
    const videosData = videosRes.ok ? await videosRes.json() : { results: [] };
    
    // Find the first trailer (preferably YouTube)
    const trailer = videosData.results?.find((video: any) => 
      video.type === 'Trailer' && (video.site === 'YouTube' || video.site === 'Youtube')
    ) || videosData.results?.find((video: any) => video.type === 'Trailer') || null;
    
    // Transform to match our MediaItem format
    const media = {
      tmdb_id: data.id,
      title: data.title || data.name,
      overview: data.overview,
      poster_path: data.poster_path,
      release_date: data.release_date,
      first_air_date: data.first_air_date,
      media_type: media_type as 'movie' | 'tv',
      trailer: trailer ? {
        key: trailer.key,
        site: trailer.site,
        type: trailer.type,
      } : null,
    };

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media details:', error);
    return NextResponse.json({ error: 'Failed to fetch media details' }, { status: 500 });
  }
}

