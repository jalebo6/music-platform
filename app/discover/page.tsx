"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ShareCard from "@/components/ShareCard";
import Link from "next/link";
import Image from "next/image";

export default function DiscoverPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

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
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [selectedGenre]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
    
    if (session?.user) {
      // Fetch following status
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", session.user.id);
      
      const followingSet = new Set(data?.map(f => f.following_id) || []);
      setFollowingUsers(followingSet);
    }
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
      .limit(8);

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

    const isFollowing = followingUsers.has(userId);

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId);
      
      const newFollowing = new Set(followingUsers);
      newFollowing.delete(userId);
      setFollowingUsers(newFollowing);
    } else {
      await supabase
        .from("follows")
        .insert({
          follower_id: currentUser.id,
          following_id: userId,
        });
      
      setFollowingUsers(new Set([...followingUsers, userId]));
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Discover
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore music from the community, search for songs, and find new favorites
        </p>
      </div>

      {/* Search Bar */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for songs, artists, or albums..."
              className="input-primary pl-12"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Genre Filter Pills */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Filter by Genre
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedGenre(null);
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGenre === null
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  selectedGenre === genre
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shares Feed (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedGenre
              ? `${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)} Music`
              : searchQuery
              ? "Search Results"
              : "Trending Now"}
          </h2>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
              <div className="spinner h-12 w-12"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
            </div>
          ) : shares.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No shares found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? "Try a different search term or browse by genre"
                  : "No music shared with this genre yet"}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre(null);
                }}
                className="btn-secondary"
              >
                Show All
              </button>
            </div>
          ) : (
            shares.map((share) => (
              <ShareCard key={share.id} share={share} />
            ))
          )}
        </div>

        {/* Sidebar - Popular Users (1/3 width on large screens) */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Users
            </h2>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="card p-4 hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex items-center space-x-3 flex-1 min-w-0"
                    >
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
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
                        className={`ml-3 flex-shrink-0 font-semibold text-sm px-4 py-2 rounded-lg transition-all ${
                          followingUsers.has(user.id)
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
                        }`}
                      >
                        {followingUsers.has(user.id) ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
