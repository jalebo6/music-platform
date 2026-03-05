"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

interface Artist {
  id: string;
  name: string;
  image_url: string;
  genres: string[];
  bio: string;
  followers_count: number;
}

interface AlbumWithReviews {
  id: string;
  title: string;
  cover_url: string;
  release_year: number;
  album_type: string;
  ratings_count: number;
  average_rating: number;
}

interface Review {
  id: string;
  album_id: string;
  rating: number;
  text: string;
  likes: number;
  created_at: string;
  users: {
    name: string;
    avatar_url: string;
  };
  albums: {
    id: string;
    title: string;
    cover_url: string;
  };
}

export default function ArtistPage() {
  const params = useParams();
  const router = useRouter();
  const artistId = params.id as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<AlbumWithReviews[]>([]);
  const [eps, setEps] = useState<AlbumWithReviews[]>([]);
  const [singles, setSingles] = useState<AlbumWithReviews[]>([]);
  const [popularReviews, setPopularReviews] = useState<Review[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchArtistData();
  }, [artistId]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    
    if (session?.user) {
      checkFollowStatus(session.user.id);
    }
  }

  async function fetchArtistData() {
    try {
      // Fetch artist details
      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("*")
        .eq("id", artistId)
        .single();

      if (artistError) throw artistError;
      setArtist(artistData);

      // Fetch all albums by this artist
      const { data: allAlbums, error: albumsError } = await supabase
        .from("albums")
        .select("*")
        .eq("artist_id", artistId)
        .order("release_year", { ascending: false });

      if (!albumsError && allAlbums) {
        // Separate by type
        setAlbums(allAlbums.filter(a => a.album_type === "album"));
        setEps(allAlbums.filter(a => a.album_type === "ep"));
        setSingles(allAlbums.filter(a => a.album_type === "single"));
      }

      // Fetch popular reviews of this artist's albums
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          *,
          users (
            name,
            avatar_url
          ),
          albums!inner (
            id,
            title,
            cover_url,
            artist_id
          )
        `)
        .eq("albums.artist_id", artistId)
        .order("likes", { ascending: false })
        .limit(6);

      if (reviewsData) setPopularReviews(reviewsData);

    } catch (error) {
      console.error("Error fetching artist:", error);
    } finally {
      setLoading(false);
    }
  }

  async function checkFollowStatus(userId: string) {
    const { data } = await supabase
      .from("artist_follows")
      .select("id")
      .eq("user_id", userId)
      .eq("artist_id", artistId)
      .single();

    setIsFollowing(!!data);
  }

  async function handleFollowToggle() {
    if (!user) {
      alert("Please sign in to follow artists");
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("artist_follows")
          .delete()
          .eq("user_id", user.id)
          .eq("artist_id", artistId);
        setIsFollowing(false);
      } else {
        // Follow
        await supabase
          .from("artist_follows")
          .insert({
            user_id: user.id,
            artist_id: artistId
          });
        setIsFollowing(true);
      }
      fetchArtistData(); // Refresh follower count
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Artist not found</h2>
        <button onClick={() => router.push("/")} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  const AlbumGrid = ({ albums, type }: { albums: AlbumWithReviews[], type: string }) => (
    <div className="bg-[#1e2936] rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4 capitalize">{type}s</h2>
      {albums.length === 0 ? (
        <p className="text-[#678] text-center py-4">No {type}s yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="group"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                {album.cover_url ? (
                  <Image
                    src={album.cover_url}
                    alt={album.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2a3441] flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                )}
                
                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Quick rate!");
                    }}
                    className="bg-[#00c030] hover:bg-[#00e054] text-[#14181c] font-bold px-3 py-1 rounded text-sm"
                  >
                    Rate
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-white text-sm truncate group-hover:text-[#00c030] transition-colors">
                {album.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-[#678]">
                <span>{album.release_year}</span>
                {album.average_rating > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-[#00c030] font-semibold">
                      {album.average_rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Artist Header */}
      <div className="bg-[#1e2936] rounded-lg p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Artist Image */}
          <div className="flex-shrink-0">
            {artist.image_url ? (
              <Image
                src={artist.image_url}
                alt={artist.name}
                width={200}
                height={200}
                className="rounded-full shadow-2xl"
              />
            ) : (
              <div className="w-[200px] h-[200px] bg-[#2a3441] rounded-full flex items-center justify-center">
                <span className="text-6xl">🎤</span>
              </div>
            )}
          </div>

          {/* Artist Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{artist.name}</h1>
              {artist.genres.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {artist.genres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs font-semibold px-3 py-1 rounded bg-[#456] text-[#9ab]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {artist.bio && (
              <p className="text-[#9ab] leading-relaxed">{artist.bio}</p>
            )}

            <div className="flex items-center gap-4">
              <div className="text-[#9ab]">
                <span className="font-bold text-white text-xl">
                  {artist.followers_count}
                </span>{" "}
                followers
              </div>
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2 rounded font-bold transition-all ${
                  isFollowing
                    ? "bg-[#2a3441] text-[#9ab] hover:bg-[#456]"
                    : "bg-[#00c030] text-[#14181c] hover:bg-[#00e054]"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discography - Albums */}
      {albums.length > 0 && <AlbumGrid albums={albums} type="album" />}

      {/* Discography - EPs */}
      {eps.length > 0 && <AlbumGrid albums={eps} type="ep" />}

      {/* Discography - Singles */}
      {singles.length > 0 && <AlbumGrid albums={singles} type="single" />}

      {/* Popular Reviews */}
      {popularReviews.length > 0 && (
        <div className="bg-[#1e2936] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Popular Reviews</h2>
          <div className="space-y-4">
            {popularReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-[#2a3441] rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/albums/${review.album_id}`}>
                      {review.albums.cover_url ? (
                        <Image
                          src={review.albums.cover_url}
                          alt={review.albums.title}
                          width={60}
                          height={60}
                          className="rounded"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] bg-[#456] rounded flex items-center justify-center">
                          <span className="text-2xl">🎵</span>
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link
                        href={`/albums/${review.album_id}`}
                        className="font-bold text-white hover:text-[#00c030] transition-colors"
                      >
                        {review.albums.title}
                      </Link>
                      <div className="text-sm text-[#678]">
                        reviewed by {review.users.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#00c030] font-bold text-xl">
                    {review.rating}/10
                  </div>
                </div>
                <p className="text-[#9ab] leading-relaxed line-clamp-3">
                  {review.text}
                </p>
                <div className="flex items-center gap-2 text-sm text-[#678]">
                  <button className="hover:text-[#00c030] transition-colors">
                    ❤️ {review.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fans Also Like (placeholder for now) */}
      <div className="bg-[#1e2936] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Fans Also Like</h2>
        <p className="text-[#678] text-center py-8">
          Similar artists coming soon...
        </p>
      </div>
    </div>
  );
}
