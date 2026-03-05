"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type SearchType = "albums" | "artists" | "songs" | "users" | "lists";

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  genre: string;
}

interface Artist {
  id: string;
  name: string;
  image_url: string;
  bio: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  albums?: { title: string };
}

interface User {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
}

interface List {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  users: { name: string };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<SearchType>("albums");
  const [query, setQuery] = useState(queryParam);
  const [loading, setLoading] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam]);

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const q = `%${searchQuery}%`;

    try {
      // Search albums
      const { data: albumData } = await supabase
        .from("albums")
        .select("*")
        .or(`title.ilike.${q},artist.ilike.${q}`)
        .limit(20);
      setAlbums(albumData || []);

      // Search artists
      const { data: artistData } = await supabase
        .from("artists")
        .select("*")
        .ilike("name", q)
        .limit(20);
      setArtists(artistData || []);

      // Search songs
      const { data: songData } = await supabase
        .from("songs")
        .select(`
          *,
          albums (title)
        `)
        .or(`title.ilike.${q},artist.ilike.${q}`)
        .limit(20);
      setSongs(songData || []);

      // Search users
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .ilike("name", q)
        .limit(20);
      setUsers(userData || []);

      // Search lists
      const { data: listData } = await supabase
        .from("lists")
        .select(`
          *,
          users (name)
        `)
        .ilike("title", q)
        .eq("is_public", true)
        .limit(20);
      setLists(listData || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    performSearch(query);
  }

  const tabs: { type: SearchType; label: string; count: number }[] = [
    { type: "albums", label: "Albums", count: albums.length },
    { type: "artists", label: "Artists", count: artists.length },
    { type: "songs", label: "Songs", count: songs.length },
    { type: "users", label: "Users", count: users.length },
    { type: "lists", label: "Lists", count: lists.length },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Search</h1>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search albums, artists, songs, users, lists..."
            className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded-lg px-6 py-4 pl-14 text-lg focus:outline-none focus:border-[#00c030] transition-colors"
            autoFocus
          />
          <svg
            className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#678]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 overflow-x-auto border-b border-[#456]">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`px-6 py-3 font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.type
                ? "text-white border-b-2 border-[#00c030]"
                : "text-[#9ab] hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 text-xs bg-[#456] px-2 py-1 rounded">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="spinner h-12 w-12"></div>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <div>
          {/* Albums Grid */}
          {activeTab === "albums" && (
            <div>
              {albums.length === 0 ? (
                <EmptyState message="No albums found" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Artists Grid */}
          {activeTab === "artists" && (
            <div>
              {artists.length === 0 ? (
                <EmptyState message="No artists found" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Songs List */}
          {activeTab === "songs" && (
            <div>
              {songs.length === 0 ? (
                <EmptyState message="No songs found" />
              ) : (
                <div className="space-y-2">
                  {songs.map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Grid */}
          {activeTab === "users" && (
            <div>
              {users.length === 0 ? (
                <EmptyState message="No users found" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lists Grid */}
          {activeTab === "lists" && (
            <div>
              {lists.length === 0 ? (
                <EmptyState message="No lists found" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {lists.map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Album Card Component
function AlbumCard({ album }: { album: Album }) {
  return (
    <Link href={`/album/${album.id}`} className="group">
      <div className="relative aspect-square bg-[#2a3441] rounded-lg overflow-hidden mb-3 group-hover:ring-2 group-hover:ring-[#00c030] transition-all">
        {album.cover_url ? (
          <Image
            src={album.cover_url}
            alt={album.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">🎵</div>
        )}
      </div>
      <h3 className="font-bold text-white text-sm mb-1 truncate group-hover:text-[#00c030] transition-colors">
        {album.title}
      </h3>
      <p className="text-xs text-[#9ab] truncate">{album.artist}</p>
      {album.genre && (
        <p className="text-xs text-[#678] mt-1">{album.genre}</p>
      )}
    </Link>
  );
}

// Artist Card Component
function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div className="bg-[#1e2936] rounded-lg p-6 hover:bg-[#2a3441] transition-all">
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#456] flex-shrink-0">
          {artist.image_url ? (
            <Image
              src={artist.image_url}
              alt={artist.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-2xl">🎤</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg mb-1 truncate">{artist.name}</h3>
          {artist.bio && (
            <p className="text-sm text-[#9ab] line-clamp-2">{artist.bio}</p>
          )}
        </div>
      </div>
      <button className="w-full bg-[#00c030] hover:bg-[#00e054] text-[#14181c] font-semibold py-2 px-4 rounded transition-all">
        Follow
      </button>
    </div>
  );
}

// Song Card Component
function SongCard({ song }: { song: Song }) {
  return (
    <div className="bg-[#1e2936] hover:bg-[#2a3441] rounded-lg p-4 transition-all flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="w-12 h-12 bg-[#456] rounded flex items-center justify-center text-2xl flex-shrink-0">
          🎵
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{song.title}</h3>
          <p className="text-sm text-[#9ab] truncate">
            {song.artist}
            {song.albums?.title && ` • ${song.albums.title}`}
          </p>
        </div>
      </div>
      <button className="ml-4 text-[#9ab] hover:text-[#00c030] transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}

// User Card Component
function UserCard({ user }: { user: User }) {
  return (
    <Link href={`/profile/${user.id}`}>
      <div className="bg-[#1e2936] rounded-lg p-6 hover:bg-[#2a3441] transition-all text-center">
        <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-[#456]">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-3xl font-bold text-white">
              {user.name[0].toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="font-bold text-white mb-2">{user.name}</h3>
        {user.bio && (
          <p className="text-sm text-[#9ab] line-clamp-2 mb-4">{user.bio}</p>
        )}
        <button className="w-full bg-[#00c030] hover:bg-[#00e054] text-[#14181c] font-semibold py-2 px-4 rounded transition-all">
          Follow
        </button>
      </div>
    </Link>
  );
}

// List Card Component
function ListCard({ list }: { list: List }) {
  return (
    <Link href={`/list/${list.id}`} className="group">
      <div className="relative aspect-square bg-[#2a3441] rounded-lg overflow-hidden mb-3 group-hover:ring-2 group-hover:ring-[#00c030] transition-all">
        {list.cover_url ? (
          <Image
            src={list.cover_url}
            alt={list.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">📋</div>
        )}
      </div>
      <h3 className="font-bold text-white text-sm mb-1 truncate group-hover:text-[#00c030] transition-colors">
        {list.title}
      </h3>
      <p className="text-xs text-[#9ab] truncate">by {list.users?.name}</p>
    </Link>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <p className="text-[#9ab] text-lg">{message}</p>
    </div>
  );
}
