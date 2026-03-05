"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

interface Artist {
  id: string;
  name: string;
  image_url: string;
  genres: string[];
  followers_count: number;
  bio: string;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  async function fetchArtists() {
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Artists</h1>
        <p className="text-[#9ab]">Discover and follow your favorite artists</p>
      </div>

      {/* Artists Grid */}
      {artists.length === 0 ? (
        <div className="bg-[#1e2936] rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🎤</div>
          <h3 className="text-2xl font-bold text-white mb-3">
            No artists yet
          </h3>
          <p className="text-[#9ab]">
            Check back soon for more artists!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group"
            >
              <div className="relative aspect-square rounded-full overflow-hidden mb-3 shadow-lg">
                {artist.image_url ? (
                  <Image
                    src={artist.image_url}
                    alt={artist.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2a3441] flex items-center justify-center">
                    <span className="text-5xl">🎤</span>
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-white text-sm mb-1 truncate group-hover:text-[#00c030] transition-colors text-center">
                {artist.name}
              </h3>
              
              {artist.genres.length > 0 && (
                <p className="text-xs text-[#678] truncate text-center">
                  {artist.genres[0]}
                </p>
              )}
              
              {artist.followers_count > 0 && (
                <p className="text-xs text-[#9ab] text-center mt-1">
                  {artist.followers_count} followers
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
