"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
// import AlbumSearch from "@/components/AlbumSearch";

interface SelectedAlbum {
  id: string;
  name: string;
  artists: string[];
  image: string;
  release_date: string;
}

export default function SharePage() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [thought, setThought] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<SelectedAlbum | null>(null);
  const [useSpotify, setUseSpotify] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/");
    } else {
      setUser(session.user);
    }
    setAuthLoading(false);
  }

  const handleAlbumSelect = (album: SelectedAlbum) => {
    setSelectedAlbum(album);
    setTitle(album.name);
    setArtist(album.artists.join(", "));
    setAlbum(album.name);
  };

  const clearAlbumSelection = () => {
    setSelectedAlbum(null);
    setTitle("");
    setArtist("");
    setAlbum("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!user) return;
    if (useSpotify && !selectedAlbum) {
      alert("Please search and select an album from Spotify");
      return;
    }
    if (!useSpotify && (!title || !artist)) {
      alert("Please fill in the song/album title and artist");
      return;
    }
    if (!thought || thought.length < 10) {
      alert("Please write at least 10 characters about your thoughts");
      return;
    }

    setLoading(true);

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const { error } = await supabase.from("shares").insert({
      user_id: user.id,
      title,
      artist,
      album: album || null,
      thought,
      tags: tagArray,
    });

    if (error) {
      console.error("Error creating share:", error);
      alert("Failed to create share. Please try again.");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] space-y-4">
        <div className="spinner h-12 w-12"></div>
        <p className="text-[#9ab] font-medium">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block mb-4 p-3 rounded-xl bg-[#2a3441]">
          <span className="text-4xl">🎵</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Share Your Music
        </h1>
        <p className="text-lg text-[#9ab] max-w-xl mx-auto">
          Tell the world about a song or album you love. Share your thoughts and feelings.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#1e2936] rounded-lg p-8 md:p-10 space-y-6">
        {/* Spotify Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#2a3441] rounded-lg">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <div>
              <div className="font-semibold text-white">Search Spotify</div>
              <div className="text-xs text-[#678]">Get real album data, artwork & tracklists</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setUseSpotify(!useSpotify);
              if (!useSpotify) clearAlbumSelection();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useSpotify ? 'bg-[#1DB954]' : 'bg-[#456]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useSpotify ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Spotify Album Search */}
        {useSpotify && !selectedAlbum && (
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Album Name <span className="text-[#00c030]">*</span>
            </label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Album title"
              className="w-full bg-[#1a1f27] border border-[#2a3441] rounded-lg px-4 py-2 text-white placeholder-[#678]"
            />
            <p className="text-xs text-[#678] mt-2">
              Enter the album title
            </p>
          </div>
        )}

        {/* Selected Album Display */}
        {useSpotify && selectedAlbum && (
          <div className="p-4 bg-[#2a3441] rounded-lg">
            <div className="flex items-center gap-4 mb-3">
              {selectedAlbum.image && (
                <img
                  src={selectedAlbum.image}
                  alt={selectedAlbum.name}
                  className="w-20 h-20 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <div className="font-bold text-white text-lg">{selectedAlbum.name}</div>
                <div className="text-[#9ab]">{selectedAlbum.artists.join(", ")}</div>
                <div className="text-xs text-[#678]">
                  {new Date(selectedAlbum.release_date).getFullYear()}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={clearAlbumSelection}
              className="text-sm text-[#00c030] hover:underline"
            >
              Change Album
            </button>
          </div>
        )}

        {/* Manual Entry (when Spotify is off or after selection) */}
        {!useSpotify && (
          <>
            {/* Song/Album Title */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Song/Album Title <span className="text-[#00c030]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Bohemian Rhapsody"
                className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 focus:outline-none focus:border-[#00c030]"
              />
            </div>

            {/* Artist */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Artist <span className="text-[#00c030]">*</span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                placeholder="e.g., Queen"
                className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 focus:outline-none focus:border-[#00c030]"
              />
            </div>

            {/* Album (Optional) */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Album <span className="text-[#678] text-xs font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="e.g., A Night at the Opera"
                className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 focus:outline-none focus:border-[#00c030]"
              />
            </div>
          </>
        )}

        {/* Your Thoughts */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Your Thoughts <span className="text-[#00c030]">*</span>
          </label>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            required
            rows={6}
            placeholder="What do you love about this music? How does it make you feel? Share your thoughts..."
            className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 resize-none focus:outline-none focus:border-[#00c030]"
            style={{ minHeight: '120px' }}
          />
          <p className="text-xs text-[#678] mt-2">
            Minimum 10 characters. Be thoughtful and genuine.
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Tags <span className="text-[#678] text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., rock, classic, epic, 70s"
            className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 focus:outline-none focus:border-[#00c030]"
          />
          <p className="text-xs text-[#678] mt-2">
            Separate tags with commas. Help others discover your share!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !title || !artist || !thought}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="spinner h-5 w-5"></div>
                <span>Sharing...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Share</span>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            disabled={loading}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-[#1e2936] rounded-lg border border-[#456]">
        <h3 className="font-bold text-white mb-3 flex items-center space-x-2">
          <svg className="w-5 h-5 text-[#00c030]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Tips for great shares</span>
        </h3>
        <ul className="text-sm text-[#9ab] space-y-2">
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Be specific about what you love – emotions, lyrics, production</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Share personal connections or memories with the music</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Use tags to help others discover similar music</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
