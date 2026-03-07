"use client";

import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";

interface Album {
  id: string;
  name: string;
  artists: string[];
  image: string;
  release_date: string;
}

interface AlbumSearchProps {
  onSelect: (album: Album) => void;
  placeholder?: string;
  className?: string;
}

export default function AlbumSearch({ onSelect, placeholder, className }: AlbumSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const searchSpotify = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=8`
        );

        if (!response.ok) {
          throw new Error("Failed to search");
        }

        const data = await response.json();
        setResults(data.albums || []);
      } catch (err: any) {
        console.error("Search error:", err);
        setError("Failed to search. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    searchSpotify(query);
  }, [query, searchSpotify]);

  const handleSelect = (album: Album) => {
    onSelect(album);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder || "Search for an album..."}
          className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#00c030]"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#678]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Results dropdown */}
      {showResults && (query.length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-[#1e2936] border border-[#456] rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="spinner h-6 w-6"></div>
              <span className="ml-3 text-[#9ab]">Searching Spotify...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="p-4 text-center text-[#678]">
              No albums found. Try a different search.
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="divide-y divide-[#456]">
              {results.map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleSelect(album)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#2a3441] transition-colors text-left"
                >
                  {album.image ? (
                    <img
                      src={album.image}
                      alt={album.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-[#456] flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-[#678]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">
                      {album.name}
                    </div>
                    <div className="text-sm text-[#9ab] truncate">
                      {album.artists.join(", ")}
                    </div>
                    <div className="text-xs text-[#678]">
                      {new Date(album.release_date).getFullYear()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showResults && query.length >= 2 && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
