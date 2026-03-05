"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      fetchProfile(session.user.id);
    }
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-500 hover:text-blue-600 transition">
            MusicPlatform
          </Link>

          {user ? (
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Feed
              </Link>
              <Link
                href="/discover"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Discover
              </Link>
              <Link
                href="/share"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Share
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center space-x-2"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {profile?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/`,
                  },
                });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
