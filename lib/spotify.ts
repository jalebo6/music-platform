import SpotifyWebApi from 'spotify-web-api-node';

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SpotifyCache {
  private cache: Map<string, CacheEntry<any>>;
  private ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 60) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Create cache instances
const albumCache = new SpotifyCache(120); // 2 hours
const artistCache = new SpotifyCache(120); // 2 hours
const searchCache = new SpotifyCache(30); // 30 minutes
const tokenCache = new SpotifyCache(50); // 50 minutes (tokens expire in 60)

// Token management
let isRefreshingToken = false;
let tokenRefreshPromise: Promise<void> | null = null;

async function ensureAccessToken(): Promise<void> {
  const cachedToken = tokenCache.get<string>('access_token');
  
  if (cachedToken) {
    spotifyApi.setAccessToken(cachedToken);
    return;
  }

  // If already refreshing, wait for that to complete
  if (isRefreshingToken && tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  isRefreshingToken = true;
  tokenRefreshPromise = (async () => {
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      const accessToken = data.body.access_token;
      
      spotifyApi.setAccessToken(accessToken);
      tokenCache.set('access_token', accessToken);
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw new Error('Failed to authenticate with Spotify');
    } finally {
      isRefreshingToken = false;
      tokenRefreshPromise = null;
    }
  })();

  return tokenRefreshPromise;
}

// Retry logic for rate limiting
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // If it's a 401, refresh token and retry
      if (error?.statusCode === 401) {
        tokenCache.clear();
        await ensureAccessToken();
        continue;
      }
      
      // If it's a 429 (rate limit), wait and retry
      if (error?.statusCode === 429) {
        const retryAfter = error.headers?.['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * (i + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  throw lastError;
}

// Export types
export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  images: { url: string; height?: number; width?: number }[];
  release_date: string;
  total_tracks: number;
  genres?: string[];
  label?: string;
  tracks?: SpotifyTrack[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
  artists: { id: string; name: string }[];
  preview_url?: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height?: number; width?: number }[];
  genres: string[];
  followers: { total: number };
  popularity: number;
}

export interface SpotifySearchResult {
  albums: {
    id: string;
    name: string;
    artists: string[];
    image: string;
    release_date: string;
  }[];
  artists: {
    id: string;
    name: string;
    image: string;
  }[];
}

// API Functions

/**
 * Search for albums and artists
 */
export async function searchSpotify(
  query: string,
  type: 'album' | 'artist' | 'track' = 'album',
  limit: number = 10
): Promise<SpotifySearchResult> {
  const cacheKey = `search:${type}:${query}:${limit}`;
  const cached = searchCache.get<SpotifySearchResult>(cacheKey);
  
  if (cached) return cached;

  await ensureAccessToken();

  const result = await withRetry(async () => {
    const response = await spotifyApi.search(query, [type], { limit });
    
    const albums = response.body.albums?.items.map(album => ({
      id: album.id,
      name: album.name,
      artists: album.artists.map(a => a.name),
      image: album.images[0]?.url || '',
      release_date: album.release_date,
    })) || [];

    const artists = response.body.artists?.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url || '',
    })) || [];

    return { albums, artists };
  });

  searchCache.set(cacheKey, result);
  return result;
}

/**
 * Get album details including tracks
 */
export async function getAlbumDetails(albumId: string): Promise<SpotifyAlbum | null> {
  const cacheKey = `album:${albumId}`;
  const cached = albumCache.get<SpotifyAlbum>(cacheKey);
  
  if (cached) return cached;

  await ensureAccessToken();

  try {
    const album = await withRetry(async () => {
      const response = await spotifyApi.getAlbum(albumId);
      return response.body;
    });

    const result: SpotifyAlbum = {
      id: album.id,
      name: album.name,
      artists: album.artists.map(a => ({ id: a.id, name: a.name })),
      images: album.images.map(img => ({ 
        url: img.url, 
        height: img.height || 0, 
        width: img.width || 0 
      })),
      release_date: album.release_date,
      total_tracks: album.total_tracks,
      genres: album.genres,
      label: album.label,
      tracks: album.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        duration_ms: track.duration_ms,
        track_number: track.track_number,
        artists: track.artists.map(a => ({ id: a.id, name: a.name })),
        preview_url: track.preview_url || undefined,
      })),
    };

    albumCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching album details:', error);
    return null;
  }
}

/**
 * Get artist details
 */
export async function getArtistDetails(artistId: string): Promise<SpotifyArtist | null> {
  const cacheKey = `artist:${artistId}`;
  const cached = artistCache.get<SpotifyArtist>(cacheKey);
  
  if (cached) return cached;

  await ensureAccessToken();

  try {
    const artist = await withRetry(async () => {
      const response = await spotifyApi.getArtist(artistId);
      return response.body;
    });

    const result: SpotifyArtist = {
      id: artist.id,
      name: artist.name,
      images: artist.images.map(img => ({ 
        url: img.url, 
        height: img.height || 0, 
        width: img.width || 0 
      })),
      genres: artist.genres,
      followers: artist.followers,
      popularity: artist.popularity,
    };

    artistCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return null;
  }
}

/**
 * Get artist's top albums
 */
export async function getArtistAlbums(
  artistId: string,
  limit: number = 20
): Promise<SpotifyAlbum[]> {
  const cacheKey = `artist_albums:${artistId}:${limit}`;
  const cached = albumCache.get<SpotifyAlbum[]>(cacheKey);
  
  if (cached) return cached;

  await ensureAccessToken();

  try {
    const albums = await withRetry(async () => {
      const response = await spotifyApi.getArtistAlbums(artistId, {
        limit,
        include_groups: 'album,single',
      });
      return response.body.items;
    });

    const result = albums.map(album => ({
      id: album.id,
      name: album.name,
      artists: album.artists.map(a => ({ id: a.id, name: a.name })),
      images: album.images,
      release_date: album.release_date,
      total_tracks: album.total_tracks,
    }));

    albumCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    return [];
  }
}

/**
 * Get multiple albums (for batch requests)
 */
export async function getAlbumsBatch(albumIds: string[]): Promise<SpotifyAlbum[]> {
  await ensureAccessToken();

  // Check cache first
  const results: SpotifyAlbum[] = [];
  const uncachedIds: string[] = [];

  for (const id of albumIds) {
    const cached = albumCache.get<SpotifyAlbum>(`album:${id}`);
    if (cached) {
      results.push(cached);
    } else {
      uncachedIds.push(id);
    }
  }

  if (uncachedIds.length === 0) return results;

  try {
    // Fetch uncached albums (max 20 at a time)
    const chunks = [];
    for (let i = 0; i < uncachedIds.length; i += 20) {
      chunks.push(uncachedIds.slice(i, i + 20));
    }

    for (const chunk of chunks) {
      const albums = await withRetry(async () => {
        const response = await spotifyApi.getAlbums(chunk);
        return response.body.albums;
      });

      for (const album of albums) {
        const result: SpotifyAlbum = {
          id: album.id,
          name: album.name,
          artists: album.artists.map(a => ({ id: a.id, name: a.name })),
          images: album.images,
          release_date: album.release_date,
          total_tracks: album.total_tracks,
          genres: album.genres,
          label: album.label,
        };

        albumCache.set(`album:${album.id}`, result);
        results.push(result);
      }
    }
  } catch (error) {
    console.error('Error fetching albums batch:', error);
  }

  return results;
}

// Export cache stats for monitoring
export function getCacheStats() {
  return {
    albums: albumCache.size(),
    artists: artistCache.size(),
    searches: searchCache.size(),
  };
}

export function clearAllCaches() {
  albumCache.clear();
  artistCache.clear();
  searchCache.clear();
  tokenCache.clear();
}
