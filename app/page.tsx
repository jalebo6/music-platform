"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ShareCard from "@/components/ShareCard";
import { useRouter } from "next/navigation";

interface Share {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  album: string | null;
  thought: string;
  tags: string[];
  created_at: string;
  users: {
    name: string;
    avatar_url: string;
  };
}

export default function Home() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchFeed();
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] space-y-4">
        <div className="spinner h-12 w-12"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your feed...</p>
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
            <div className="inline-block mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <span className="text-6xl">🎵</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Share Your Music Journey
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-3 font-semibold">
              Like Letterboxd, but for music
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
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
            className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl mb-16"
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-8 text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Share Music</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Post songs and albums you love with your personal thoughts
              </p>
            </div>
            <div className="card p-8 text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Discuss & Upvote</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Comment and upvote on others' music shares
              </p>
            </div>
            <div className="card p-8 text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Discover</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Find new music through your community's taste
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - Feed
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">Your Feed</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover what people are listening to</p>
        </div>
        <button
          onClick={() => router.push("/share")}
          className="btn-primary inline-flex items-center justify-center space-x-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Share Music</span>
        </button>
      </div>

      {/* Empty State */}
      {shares.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No shares yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Be the first to share music with the community! Tell everyone what you're listening to.
          </p>
          <button
            onClick={() => router.push("/share")}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Share Your First Song</span>
          </button>
        </div>
      ) : (
        /* Feed Items */
        <div className="space-y-6">
          {shares.map((share) => (
            <ShareCard key={share.id} share={share} />
          ))}
        </div>
      )}
    </div>
  );
}
