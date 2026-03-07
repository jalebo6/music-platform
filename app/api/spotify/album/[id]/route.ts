import { NextRequest, NextResponse } from 'next/server';
import { getAlbumDetails } from '@/lib/spotify';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: albumId } = await params;

    if (!albumId) {
      return NextResponse.json(
        { error: 'Album ID is required' },
        { status: 400 }
      );
    }

    const album = await getAlbumDetails(albumId);

    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(album);
  } catch (error: any) {
    console.error('Spotify album fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch album details' },
      { status: 500 }
    );
  }
}
