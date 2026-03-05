"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

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
    setMenuOpen(false);
    router.push("/");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#14181c] border-b border-[#456]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <span className="text-2xl">🎵</span>
            <span className="text-lg font-bold text-white hidden sm:block">
              MusicShare
            </span>
          </Link>

          {/* Center: Search (desktop only when logged in) */}
          {user && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search albums, artists, songs..."
                  className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-2 pl-10 focus:outline-none focus:border-[#00c030] transition-colors"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#678]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          )}

          {user ? (
            <>
              {/* Right: Navigation + Profile (desktop) */}
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className={`text-sm font-semibold transition-colors ${
                    isActive("/")
                      ? "text-white"
                      : "text-[#9ab] hover:text-white"
                  }`}
                >
                  Feed
                </Link>
                <Link
                  href="/albums"
                  className={`text-sm font-semibold transition-colors ${
                    pathname?.startsWith("/albums")
                      ? "text-white"
                      : "text-[#9ab] hover:text-white"
                  }`}
                >
                  Albums
                </Link>
                <Link
                  href="/artists"
                  className={`text-sm font-semibold transition-colors ${
                    pathname?.startsWith("/artists")
                      ? "text-white"
                      : "text-[#9ab] hover:text-white"
                  }`}
                >
                  Artists
                </Link>
                <Link
                  href="/discover"
                  className={`text-sm font-semibold transition-colors ${
                    isActive("/discover")
                      ? "text-white"
                      : "text-[#9ab] hover:text-white"
                  }`}
                >
                  Discover
                </Link>
                <Link
                  href="/share"
                  className={`text-sm font-semibold transition-colors ${
                    isActive("/share")
                      ? "text-white"
                      : "text-[#9ab] hover:text-white"
                  }`}
                >
                  Share
                </Link>
                
                {/* Profile Avatar */}
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center space-x-2 group"
                >
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-transparent group-hover:ring-[#00c030] transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#456] flex items-center justify-center text-white font-semibold ring-2 ring-transparent group-hover:ring-[#00c030] transition-all">
                      {profile?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="text-[#9ab] hover:text-white transition-colors text-sm font-semibold"
                >
                  Sign Out
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-[#9ab] hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
              }}
              className="bg-[#00c030] hover:bg-[#00e054] text-[#14181c] font-bold py-2 px-6 rounded transition-all"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && user && (
          <div className="md:hidden py-4 border-t border-[#456]">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-2 pl-10 focus:outline-none focus:border-[#00c030]"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#678]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>

              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className={`font-semibold transition-colors ${
                  isActive("/")
                    ? "text-white"
                    : "text-[#9ab]"
                }`}
              >
                Feed
              </Link>
              <Link
                href="/albums"
                onClick={() => setMenuOpen(false)}
                className={`font-semibold transition-colors ${
                  pathname?.startsWith("/albums")
                    ? "text-white"
                    : "text-[#9ab]"
                }`}
              >
                Albums
              </Link>
              <Link
                href="/artists"
                onClick={() => setMenuOpen(false)}
                className={`font-semibold transition-colors ${
                  pathname?.startsWith("/artists")
                    ? "text-white"
                    : "text-[#9ab]"
                }`}
              >
                Artists
              </Link>
              <Link
                href="/discover"
                onClick={() => setMenuOpen(false)}
                className={`font-semibold transition-colors ${
                  isActive("/discover")
                    ? "text-white"
                    : "text-[#9ab]"
                }`}
              >
                Discover
              </Link>
              <Link
                href="/share"
                onClick={() => setMenuOpen(false)}
                className={`font-semibold transition-colors ${
                  isActive("/share")
                    ? "text-white"
                    : "text-[#9ab]"
                }`}
              >
                Share
              </Link>
              <Link
                href={`/profile/${user.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center space-x-3"
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
                  <div className="w-8 h-8 rounded-full bg-[#456] flex items-center justify-center text-white font-semibold">
                    {profile?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="font-semibold text-white">Profile</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-left text-[#00c030] font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
