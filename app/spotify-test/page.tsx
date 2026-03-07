"use client";

import { useState } from "react";
import SpotifyAlbumDetails from "@/components/SpotifyAlbumDetails";
import SpotifyArtistDetails from "@/components/SpotifyArtistDetails";
import AlbumSearch from "@/components/AlbumSearch";

export default function SpotifyTestPage() {
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Example album IDs for quick testing
  const exampleAlbums = [
    { id: "2noRn2Aes5aoNVsU6iWThc", name: "Dark Side of the Moon", artist: "Pink Floyd" },
    { id: "6FJxoadUE4JNVwWHghBwnb", name: "Random Access Memories", artist: "Daft Punk" },
    { id: "6vc1OuklADBbM0cPUX7U53", name: "Alive 2007", artist: "Daft Punk" },
    { id: "5zi7WsKlIiUXv09tbGLKsE", name: "Homework", artist: "Daft Punk" },
  ];

  const exampleArtists = [
    { id: "0k17h0D3J5VfsdmQ1iZtE9", name: "Pink Floyd" },
    { id: "4tZwfgrHOc3mvqYlEYSvVi", name: "Daft Punk" },
    { id: "3WrFJ7ztbogyGnTHbHJFl2", name: "The Beatles" },
  ];

  async function handleSearch() {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=5`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4 p-4 rounded-xl bg-[#2a3441]">
          <svg className="w-10 h-10 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-white">Spotify Integration Test</h1>
            <p className="text-sm text-[#678]">Test the Spotify API integration</p>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-[#2a3441] border-l-4 border-[#00c030] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-3">🔧 Setup Required</h2>
        <div className="space-y-2 text-[#9ab]">
          <p>To use Spotify integration, you need to:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#00c030] hover:underline">Spotify Developer Dashboard</a></li>
            <li>Create a new app</li>
            <li>Copy your Client ID and Client Secret</li>
            <li>Add them to your <code className="bg-[#1e2936] px-2 py-1 rounded text-sm">.env.local</code> file:</li>
          </ol>
          <pre className="bg-[#1e2936] p-3 rounded text-sm overflow-x-auto mt-2">
{`SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here`}
          </pre>
          <p className="text-sm text-[#678] mt-2">
            After adding credentials, restart the dev server with <code className="bg-[#1e2936] px-2 py-1 rounded">npm run dev</code>
          </p>
        </div>
      </div>

      {/* Album Search Component Test */}
      <div className="bg-[#1e2936] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">🔍 Search Albums</h2>
        <AlbumSearch
          onSelect={(album) => {
            console.log("Selected:", album);
            setSelectedAlbumId(album.id);
          }}
          placeholder="Try searching for an album..."
        />
        {selectedAlbumId && (
          <div className="mt-4 text-sm text-[#9ab]">
            Selected album ID: <code className="bg-[#2a3441] px-2 py-1 rounded">{selectedAlbumId}</code>
          </div>
        )}
      </div>

      {/* Quick Test - Albums */}
      <div className="bg-[#1e2936] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">🎵 Test Albums</h2>
        <p className="text-[#9ab] mb-4">Click an example album to load its details:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {exampleAlbums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedAlbumId === album.id
                  ? 'bg-[#00c030] text-[#14181c]'
                  : 'bg-[#2a3441] text-white hover:bg-[#456]'
              }`}
            >
              <div className="font-semibold">{album.name}</div>
              <div className="text-sm opacity-75">{album.artist}</div>
            </button>
          ))}
        </div>

        {selectedAlbumId && (
          <div className="border-t border-[#456] pt-6">
            <SpotifyAlbumDetails albumId={selectedAlbumId} />
          </div>
        )}
      </div>

      {/* Quick Test - Artists */}
      <div className="bg-[#1e2936] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">🎤 Test Artists</h2>
        <p className="text-[#9ab] mb-4">Click an example artist to load their details:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {exampleArtists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => setSelectedArtistId(artist.id)}
              className={`p-4 rounded-lg text-center transition-all ${
                selectedArtistId === artist.id
                  ? 'bg-[#00c030] text-[#14181c]'
                  : 'bg-[#2a3441] text-white hover:bg-[#456]'
              }`}
            >
              <div className="font-semibold">{artist.name}</div>
            </button>
          ))}
        </div>

        {selectedArtistId && (
          <div className="border-t border-[#456] pt-6">
            <SpotifyArtistDetails artistId={selectedArtistId} includeAlbums={true} />
          </div>
        )}
      </div>

      {/* Manual Search */}
      <div className="bg-[#1e2936] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">🔎 Manual API Search</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for albums..."
            className="flex-1 bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 focus:outline-none focus:border-[#00c030]"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults && (
          <div className="mt-4">
            <h3 className="font-semibold text-white mb-2">Results:</h3>
            <pre className="bg-[#2a3441] p-4 rounded text-xs text-[#9ab] overflow-x-auto">
              {JSON.stringify(searchResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Cache Stats */}
      <div className="bg-[#1e2936] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">📊 Performance</h2>
        <div className="space-y-2 text-[#9ab]">
          <p>✅ In-memory caching enabled</p>
          <p>✅ Automatic token refresh</p>
          <p>✅ Rate limit handling with retry logic</p>
          <p>✅ Graceful error fallbacks</p>
        </div>
      </div>
    </div>
  );
}
