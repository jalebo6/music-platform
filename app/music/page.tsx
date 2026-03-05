"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AlbumCover from "@/components/AlbumCover";

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  genre: string;
}

export default function MusicPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    checkUser();
    fetchAlbums();
  }, [filter]);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  async function fetchAlbums() {
    setLoading(true);

    let query = supabase.from("albums").select("*").order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("genre", filter);
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      setAlbums(data);
    }
    setLoading(false);
  }

  const genres = ["all", "Hip Hop", "Rock", "Electronic", "R&B", "Trap", "Alternative Rock"];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Browse Music</h1>
        <p className="text-[#9ab]">Discover, rate, and review albums</p>
      </div>

      {/* Genre Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setFilter(genre)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === genre
                ? "bg-[#00c030] text-[#14181c]"
                : "bg-[#2a3441] text-[#9ab] hover:bg-[#456]"
            }`}
          >
            {genre === "all" ? "All Genres" : genre}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="spinner h-12 w-12"></div>
        </div>
      )}

      {/* Albums Grid */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {albums.map((album) => (
            <div key={album.id}>
              <AlbumCover
                albumId={album.id}
                albumTitle={album.title}
                albumArtist={album.artist}
                coverUrl={album.cover_url}
                userId={user?.id}
                showHoverActions={!!user}
                size="md"
              />
              <div className="mt-2">
                <h3 className="font-bold text-white text-sm truncate">{album.title}</h3>
                <p className="text-xs text-[#9ab] truncate">{album.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && albums.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-[#9ab] text-lg">No albums found in this genre</p>
        </div>
      )}
    </div>
  );
}
