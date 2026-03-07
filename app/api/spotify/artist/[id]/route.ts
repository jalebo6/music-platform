import { NextRequest, NextResponse } from 'next/server';
import { getArtistDetails, getArtistAlbums } from '@/lib/spotify';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: artistId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeAlbums = searchParams.get('albums') === 'true';

    if (!artistId) {
      return NextResponse.json(
        { error: 'Artist ID is required' },
        { status: 400 }
      );
    }

    const artist = await getArtistDetails(artistId);

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    let albums: any[] = [];
    if (includeAlbums) {
      albums = await getArtistAlbums(artistId, 20);
    }

    return NextResponse.json({
      ...artist,
      albums: includeAlbums ? albums : undefined,
    });
  } catch (error: any) {
    console.error('Spotify artist fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch artist details' },
      { status: 500 }
    );
  }
}
