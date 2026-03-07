import { NextRequest, NextResponse } from 'next/server';
import { searchSpotify } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') as 'album' | 'artist' | 'track' || 'album';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const results = await searchSpotify(query, type, limit);
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Spotify search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search Spotify' },
      { status: 500 }
    );
  }
}
