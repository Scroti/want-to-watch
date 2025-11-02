import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Search both movies and TV shows
    const [moviesRes, tvRes] = await Promise.all([
      fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
      ),
      fetch(
        `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
      ),
    ]);

    const [moviesData, tvData] = await Promise.all([
      moviesRes.json(),
      tvRes.json(),
    ]);

    // Combine results and add media_type
    const results = [
      ...moviesData.results.map((item: any) => ({
        ...item,
        media_type: 'movie',
        title: item.title,
      })),
      ...tvData.results.map((item: any) => ({
        ...item,
        media_type: 'tv',
        title: item.name,
      })),
    ];

    return NextResponse.json({
      results,
      total_pages: Math.max(moviesData.total_pages || 1, tvData.total_pages || 1),
      total_results: (moviesData.total_results || 0) + (tvData.total_results || 0),
    });
  } catch (error) {
    console.error('TMDB API error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}

