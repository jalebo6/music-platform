"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AlbumCover from "@/components/AlbumCover";

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  genre: string;
}

export default function Home() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [trendingUsers, setTrendingUsers] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchFeed();
    fetchTrendingUsers();
    fetchPopularTags();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  async function fetchFeed() {
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
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrendingUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .limit(6);
    setTrendingUsers(data || []);
  }

  async function fetchPopularTags() {
    // Get all shares and extract popular tags
    const { data } = await supabase
      .from("shares")
      .select("tags")
      .limit(50);
    
    if (data) {
      const tagCounts: { [key: string]: number } = {};
      data.forEach((share) => {
        share.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      const sorted = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tag]) => tag);
      
      setPopularTags(sorted);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] space-y-4">
        <div className="spinner h-12 w-12"></div>
        <p className="text-[#9ab] font-medium">Loading your feed...</p>
      </div>
    );
  }

  // Not logged in - Landing page
  if (!user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <div className="text-center max-w-4xl">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-block mb-6 p-6 rounded-2xl bg-[#2a3441]">
              <span className="text-6xl">🎵</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white leading-tight">
              Your Music Journey
            </h1>
            <p className="text-2xl md:text-3xl text-[#9ab] mb-3 font-semibold">
              Like Letterboxd, but for music
            </p>
            <p className="text-lg md:text-xl text-[#678] max-w-2xl mx-auto leading-relaxed">
              Share songs you love, discover new sounds, and connect with music lovers worldwide
            </p>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
            }}
            className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-[#14181c] bg-[#00c030] rounded-lg hover:bg-[#00e054] transform hover:scale-105 transition-all shadow-lg mb-16"
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e2936] p-8 rounded-lg text-center hover:bg-[#2a3441] transition-all">
              <div className="text-5xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-white mb-2">Share Music</h3>
              <p className="text-[#9ab] leading-relaxed">
                Post songs and albums you love with your thoughts
              </p>
            </div>
            <div className="bg-[#1e2936] p-8 rounded-lg text-center hover:bg-[#2a3441] transition-all">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">Discuss</h3>
              <p className="text-[#9ab] leading-relaxed">
                Comment and upvote on others' music shares
              </p>
            </div>
            <div className="bg-[#1e2936] p-8 rounded-lg text-center hover:bg-[#2a3441] transition-all">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">Discover</h3>
              <p className="text-[#9ab] leading-relaxed">
                Find new music through your community
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - 3-Column Layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Feed (2/3 width on desktop) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Your Feed</h1>
            <p className="text-[#9ab]">Recent activity from the community</p>
          </div>
          <button
            onClick={() => router.push("/share")}
            className="bg-[#00c030] hover:bg-[#00e054] text-[#14181c] font-bold px-5 py-3 rounded flex items-center space-x-2 transition-all whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Empty State */}
        {shares.length === 0 ? (
          <div className="bg-[#1e2936] p-12 rounded-lg text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No shares yet
            </h3>
            <p className="text-[#9ab] mb-6 max-w-md mx-auto">
              Be the first to share music with the community!
            </p>
            <button
              onClick={() => router.push("/share")}
              className="btn-primary"
            >
              Share Your First Song
            </button>
          </div>
        ) : (
          /* Feed Items */
          shares.map((share) => (
            <ShareCard key={share.id} share={share} />
          ))
        )}
      </div>

      {/* Sidebar - Discovery (1/3 width on desktop) */}
      <div className="space-y-6">
        {/* Trending Users */}
        <div className="bg-[#1e2936] rounded-lg p-5">
          <h2 className="text-lg font-bold text-white mb-4">Popular Users</h2>
          <div className="space-y-3">
            {trendingUsers.map((trendingUser) => (
              <Link
                key={trendingUser.id}
                href={`/profile/${trendingUser.id}`}
                className="flex items-center space-x-3 hover:bg-[#2a3441] p-2 rounded transition-colors"
              >
                {trendingUser.avatar_url ? (
                  <Image
                    src={trendingUser.avatar_url}
                    alt={trendingUser.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#456] flex items-center justify-center text-white font-bold">
                    {trendingUser.name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate text-sm">
                    {trendingUser.name}
                  </p>
                  {trendingUser.bio && (
                    <p className="text-xs text-[#678] truncate">
                      {trendingUser.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/discover"
            className="block mt-4 text-center text-sm font-semibold text-[#00c030] hover:text-[#00e054] transition-colors"
          >
            Discover more →
          </Link>
        </div>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="bg-[#1e2936] rounded-lg p-5">
            <h2 className="text-lg font-bold text-white mb-4">Popular Genres</h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/discover?tag=${tag}`}
                  className="text-xs font-semibold px-3 py-2 rounded bg-[#456] text-[#9ab] hover:bg-[#678] hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[#1e2936] rounded-lg p-5">
          <h2 className="text-lg font-bold text-white mb-4">Quick Links</h2>
          <div className="space-y-2 text-sm">
            <Link
              href="/albums"
              className="block text-[#9ab] hover:text-white transition-colors font-medium"
            >
              → Browse Albums
            </Link>
            <Link
              href="/artists"
              className="block text-[#9ab] hover:text-white transition-colors font-medium"
            >
              → Browse Artists
            </Link>
            <Link
              href="/discover"
              className="block text-[#9ab] hover:text-white transition-colors font-medium"
            >
              → Discover Music
            </Link>
            <Link
              href="/share"
              className="block text-[#9ab] hover:text-white transition-colors font-medium"
            >
              → Share a Song
            </Link>
            <Link
              href={`/profile/${user.id}`}
              className="block text-[#9ab] hover:text-white transition-colors font-medium"
            >
              → Your Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
