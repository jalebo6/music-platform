"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  images: { url: string; height?: number; width?: number }[];
  release_date: string;
  total_tracks: number;
  genres?: string[];
  label?: string;
  tracks?: {
    id: string;
    name: string;
    duration_ms: number;
    track_number: number;
    artists: { id: string; name: string }[];
    preview_url?: string;
  }[];
}

interface SpotifyAlbumDetailsProps {
  albumId: string;
  fallbackData?: {
    title: string;
    artist: string;
    cover_url?: string;
  };
}

export default function SpotifyAlbumDetails({ albumId, fallbackData }: SpotifyAlbumDetailsProps) {
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAlbumDetails();
  }, [albumId]);

  async function fetchAlbumDetails() {
    try {
      const response = await fetch(`/api/spotify/album/${albumId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch album");
      }

      const data = await response.json();
      setAlbum(data);
    } catch (err: any) {
      console.error("Error fetching Spotify album:", err);
      setError(err.message || "Failed to load album details");
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function getTotalDuration(): string {
    if (!album?.tracks) return "0:00";
    const totalMs = album.tracks.reduce((sum, track) => sum + track.duration_ms, 0);
    return formatDuration(totalMs);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="spinner h-8 w-8"></div>
        <p className="text-[#9ab]">Loading album details...</p>
      </div>
    );
  }

  if (error || !album) {
    // Show fallback if available
    if (fallbackData) {
      return (
        <div className="bg-[#2a3441] rounded-lg p-6 text-center">
          <div className="text-[#678] mb-4">
            {error || "Could not load from Spotify"}
          </div>
          <div className="flex flex-col items-center gap-4">
            {fallbackData.cover_url && (
              <img
                src={fallbackData.cover_url}
                alt={fallbackData.title}
                className="w-48 h-48 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{fallbackData.title}</h2>
              <p className="text-[#9ab]">{fallbackData.artist}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#2a3441] rounded-lg p-8 text-center">
        <div className="text-red-400 mb-2">⚠️ {error || "Album not found"}</div>
        <p className="text-[#678] text-sm">
          This album may not be available on Spotify
        </p>
      </div>
    );
  }

  // Get best quality image
  const coverImage = album.images[0]?.url || "";
  const releaseYear = new Date(album.release_date).getFullYear();

  return (
    <div className="space-y-6">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Album Cover */}
        <div className="flex-shrink-0">
          {coverImage ? (
            <img
              src={coverImage}
              alt={album.name}
              className="w-full md:w-72 h-auto rounded-lg shadow-2xl"
            />
          ) : (
            <div className="w-full md:w-72 h-72 bg-[#2a3441] rounded-lg flex items-center justify-center">
              <span className="text-6xl">🎵</span>
            </div>
          )}
        </div>

        {/* Album Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {album.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {album.artists.map((artist, index) => (
                <span key={artist.id}>
                  <Link
                    href={`/artists/${artist.id}`}
                    className="text-xl text-[#9ab] hover:text-[#00c030] transition-colors"
                  >
                    {artist.name}
                  </Link>
                  {index < album.artists.length - 1 && (
                    <span className="text-[#678] mx-2">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-[#9ab]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{releaseYear}</span>
            </div>

            {album.label && (
              <>
                <span className="text-[#456]">•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span>{album.label}</span>
                </div>
              </>
            )}

            <span className="text-[#456]">•</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>{album.total_tracks} tracks, {getTotalDuration()}</span>
            </div>
          </div>

          {/* Genres */}
          {album.genres && album.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {album.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-[#2a3441] text-[#9ab] rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
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

      {/* Tracklist */}
      {album.tracks && album.tracks.length > 0 && (
        <div className="bg-[#1e2936] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Tracklist</h2>
          <div className="space-y-1">
            {album.tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 hover:bg-[#2a3441] rounded transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-[#678] font-mono text-sm w-6 text-right flex-shrink-0">
                    {track.track_number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {track.name}
                    </div>
                    {track.artists.length > 1 && (
                      <div className="text-xs text-[#678] truncate">
                        {track.artists.map(a => a.name).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {track.preview_url && (
                    <button
                      onClick={() => {
                        const audio = new Audio(track.preview_url);
                        audio.play();
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#00c030] hover:scale-110 transform"
                      title="Preview"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  <span className="text-[#678] font-mono text-sm">
                    {formatDuration(track.duration_ms)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
