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
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Music Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Letterboxd for music. Share your taste, discover new sounds.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/`,
              },
            });
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feed</h1>
        <button
          onClick={() => router.push("/share")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Share Music
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
