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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <div className="mb-8">
            <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Music Platform
            </h1>
            <p className="text-2xl text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Letterboxd for music
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Share your taste, discover new sounds, connect with music lovers.
            </p>
          </div>
          
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
            }}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-3xl mb-2">🎵</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Share Music</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Post songs you love with your thoughts</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Discuss</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comment and upvote on others' shares</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Discover</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Find new music through your community</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">Feed</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover what people are listening to</p>
        </div>
        <button
          onClick={() => router.push("/share")}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-md"
        >
          🎵 Share Music
        </button>
      </div>

      {shares.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No shares yet. Be the first to share!
          </p>
          <button
            onClick={() => router.push("/share")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Share Your First Song
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {shares.map((share) => (
            <ShareCard key={share.id} share={share} />
          ))}
        </div>
      )}
    </div>
  );
}
