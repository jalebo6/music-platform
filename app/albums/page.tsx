"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

interface Album {
  id: string;
  title: string;
  cover_url: string;
  release_year: number;
  album_type: string;
  average_rating: number;
  ratings_count: number;
  artists: {
    id: string;
    name: string;
  };
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "album" | "ep" | "single">("all");

  useEffect(() => {
    fetchAlbums();
  }, [filter]);

  async function fetchAlbums() {
    try {
      let query = supabase
        .from("albums")
        .select(`
          *,
          artists (
            id,
            name
          )
        `)
        .order("release_year", { ascending: false });

      if (filter !== "all") {
        query = query.eq("album_type", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error("Error fetching albums:", error);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Albums</h1>
          <p className="text-[#9ab]">Browse and rate albums</p>
        </div>
        
        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              filter === "all"
                ? "bg-[#00c030] text-[#14181c]"
                : "bg-[#2a3441] text-[#9ab] hover:bg-[#456]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("album")}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              filter === "album"
                ? "bg-[#00c030] text-[#14181c]"
                : "bg-[#2a3441] text-[#9ab] hover:bg-[#456]"
            }`}
          >
            Albums
          </button>
          <button
            onClick={() => setFilter("ep")}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              filter === "ep"
                ? "bg-[#00c030] text-[#14181c]"
                : "bg-[#2a3441] text-[#9ab] hover:bg-[#456]"
            }`}
          >
            EPs
          </button>
          <button
            onClick={() => setFilter("single")}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              filter === "single"
                ? "bg-[#00c030] text-[#14181c]"
                : "bg-[#2a3441] text-[#9ab] hover:bg-[#456]"
            }`}
          >
            Singles
          </button>
        </div>
      </div>

      {/* Albums Grid */}
      {albums.length === 0 ? (
        <div className="bg-[#1e2936] rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-2xl font-bold text-white mb-3">
            No {filter !== "all" ? `${filter}s` : "albums"} yet
          </h3>
          <p className="text-[#9ab]">
            Check back soon for more music!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="group"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3 shadow-lg">
                {album.cover_url ? (
                  <Image
                    src={album.cover_url}
                    alt={album.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2a3441] flex items-center justify-center">
                    <span className="text-5xl">🎵</span>
                  </div>
                )}
                
                {/* Rating overlay */}
                {album.average_rating > 0 && (
                  <div className="absolute top-2 right-2 bg-black/80 text-[#00c030] font-bold text-sm px-2 py-1 rounded">
                    {album.average_rating.toFixed(1)}
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-white text-sm mb-1 truncate group-hover:text-[#00c030] transition-colors">
                {album.title}
              </h3>
              <Link
                href={`/artists/${album.artists.id}`}
                className="text-xs text-[#9ab] hover:text-[#00c030] transition-colors truncate block"
                onClick={(e) => e.stopPropagation()}
              >
                {album.artists.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-[#678] mt-1">
                <span>{album.release_year}</span>
                {album.ratings_count > 0 && (
                  <>
                    <span>•</span>
                    <span>{album.ratings_count} ratings</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
