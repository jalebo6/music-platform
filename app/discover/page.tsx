"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ShareCard from "@/components/ShareCard";
import Link from "next/link";

export default function DiscoverPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const genres = [
    "rock",
    "hip-hop",
    "electronic",
    "jazz",
    "pop",
    "r&b",
    "indie",
    "folk",
    "classical",
    "metal",
  ];

  useEffect(() => {
    checkUser();
    fetchTrending();
    fetchUsers();
  }, [selectedGenre]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
  }

  async function fetchTrending() {
    setLoading(true);
    try {
      let query = supabase
        .from("shares")
        .select(`
          *,
          users (
            name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (selectedGenre) {
        query = query.contains("tags", [selectedGenre]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error("Error fetching trending:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .limit(10);

    setUsers(data || []);
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      fetchTrending();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shares")
        .select(`
          *,
          users (
            name,
            avatar_url
          )
        `)
        .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow(userId: string) {
    if (!currentUser) return;

    const { data: existing } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUser.id)
      .eq("following_id", userId)
      .single();

    if (existing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId);
    } else {
      await supabase
        .from("follows")
        .insert({
          follower_id: currentUser.id,
          following_id: userId,
        });
    }

    fetchUsers();
  }

  async function handleFollowGenre(genre: string) {
    if (!currentUser) return;

    const { data: existing } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUser.id)
      .eq("genre", genre)
      .single();

    if (existing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("genre", genre);
    } else {
      await supabase
        .from("follows")
        .insert({
          follower_id: currentUser.id,
          genre: genre,
        });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Discover
      </h1>

      <div className="mb-8">
        <div className="flex space-x-2 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search songs or artists..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
          >
            Search
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Filter by Genre
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedGenre(null);
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-lg transition ${
                selectedGenre === null
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  setSelectedGenre(genre);
                  setSearchQuery("");
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedGenre === genre
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedGenre
              ? `${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)} Music`
              : searchQuery
              ? "Search Results"
              : "Trending"}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No shares found. Try a different search or genre.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {shares.map((share) => (
                <ShareCard key={share.id} share={share} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Popular Users
          </h2>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between"
              >
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center space-x-3 flex-1"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>
                {currentUser && currentUser.id !== user.id && (
                  <button
                    onClick={() => handleFollow(user.id)}
                    className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
                  >
                    Follow
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
