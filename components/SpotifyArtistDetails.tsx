"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height?: number; width?: number }[];
  genres: string[];
  followers: { total: number };
  popularity: number;
  albums?: {
    id: string;
    name: string;
    artists: { id: string; name: string }[];
    images: { url: string; height?: number; width?: number }[];
    release_date: string;
    total_tracks: number;
  }[];
}

interface SpotifyArtistDetailsProps {
  artistId: string;
  includeAlbums?: boolean;
}

export default function SpotifyArtistDetails({ 
  artistId, 
  includeAlbums = true 
}: SpotifyArtistDetailsProps) {
  const [artist, setArtist] = useState<SpotifyArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArtistDetails();
  }, [artistId]);

  async function fetchArtistDetails() {
    try {
      const url = `/api/spotify/artist/${artistId}${includeAlbums ? '?albums=true' : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch artist");
      }

      const data = await response.json();
      setArtist(data);
    } catch (err: any) {
      console.error("Error fetching Spotify artist:", err);
      setError(err.message || "Failed to load artist details");
    } finally {
      setLoading(false);
    }
  }

  function formatFollowers(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="spinner h-8 w-8"></div>
        <p className="text-[#9ab]">Loading artist details...</p>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="bg-[#2a3441] rounded-lg p-8 text-center">
        <div className="text-red-400 mb-2">⚠️ {error || "Artist not found"}</div>
        <p className="text-[#678] text-sm">
          This artist may not be available on Spotify
        </p>
      </div>
    );
  }

  const artistImage = artist.images[0]?.url || "";

  return (
    <div className="space-y-6">
      {/* Artist Header */}
      <div className="bg-[#1e2936] rounded-lg p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Artist Image */}
          <div className="flex-shrink-0">
            {artistImage ? (
              <img
                src={artistImage}
                alt={artist.name}
                className="w-full md:w-64 h-64 rounded-full object-cover shadow-2xl"
              />
            ) : (
              <div className="w-full md:w-64 h-64 rounded-full bg-[#2a3441] flex items-center justify-center">
                <span className="text-6xl">🎤</span>
              </div>
            )}
          </div>

          {/* Artist Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {artist.name}
              </h1>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-[#9ab]">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="font-semibold">
                    {formatFollowers(artist.followers.total)} followers
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">
                    {artist.popularity}% popularity
                  </span>
                </div>
              </div>
            </div>

            {/* Genres */}
            {artist.genres && artist.genres.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#9ab] mb-2 uppercase tracking-wide">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-[#2a3441] text-white rounded-full text-sm capitalize"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spotify Attribution */}
            <div className="flex items-center gap-2 text-xs text-[#678] pt-2">
              <svg className="w-4 h-4 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span>Powered by Spotify</span>
            </div>
          </div>
        </div>
      </div>

      {/* Albums */}
      {artist.albums && artist.albums.length > 0 && (
        <div className="bg-[#1e2936] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Albums & Singles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.albums.map((album) => {
              const albumCover = album.images[0]?.url || "";
              const releaseYear = new Date(album.release_date).getFullYear();
              
              return (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-[#2a3441]">
                    {albumCover ? (
                      <img
                        src={albumCover}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🎵</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                  </div>
                  <h3 className="font-semibold text-white text-sm truncate group-hover:text-[#00c030] transition-colors">
                    {album.name}
                  </h3>
                  <p className="text-xs text-[#678]">
                    {releaseYear} • {album.total_tracks} tracks
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
