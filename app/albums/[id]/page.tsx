"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

interface Album {
  id: string;
  title: string;
  artist_id: string;
  cover_url: string;
  release_year: number;
  genres: string[];
  album_type: string;
  tracklist: Array<{ number: number; title: string; duration: string }>;
  ratings_count: number;
  reviews_count: number;
  average_rating: number;
  artists: {
    id: string;
    name: string;
  };
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  text: string;
  likes: number;
  created_at: string;
  users: {
    name: string;
    avatar_url: string;
  };
}

interface FriendRating {
  id: string;
  user_id: string;
  rating: number;
  listened: boolean;
  users: {
    name: string;
    avatar_url: string;
  };
}

interface SimilarAlbum {
  id: string;
  title: string;
  cover_url: string;
  release_year: number;
  artists: {
    name: string;
  };
}

export default function AlbumPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [friendRatings, setFriendRatings] = useState<FriendRating[]>([]);
  const [similarAlbums, setSimilarAlbums] = useState<SimilarAlbum[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchAlbumData();
  }, [albumId]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    
    if (session?.user) {
      fetchUserRating(session.user.id);
    }
  }

  async function fetchAlbumData() {
    try {
      // Fetch album details
      const { data: albumData, error: albumError } = await supabase
        .from("albums")
        .select(`
          *,
          artists (
            id,
            name
          )
        `)
        .eq("id", albumId)
        .single();

      if (albumError) throw albumError;
      setAlbum(albumData);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          *,
          users (
            name,
            avatar_url
          )
        `)
        .eq("album_id", albumId)
        .order("likes", { ascending: false })
        .limit(10);

      if (!reviewsError) setReviews(reviewsData || []);

      // Fetch friends' ratings
      if (user) {
        const { data: followsData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        const followingIds = followsData?.map(f => f.following_id) || [];

        if (followingIds.length > 0) {
          const { data: friendRatingsData } = await supabase
            .from("ratings")
            .select(`
              *,
              users (
                name,
                avatar_url
              )
            `)
            .eq("album_id", albumId)
            .in("user_id", followingIds)
            .limit(8);

          if (friendRatingsData) setFriendRatings(friendRatingsData);
        }
      }

      // Fetch similar albums
      const { data: recsData } = await supabase
        .from("album_recommendations")
        .select(`
          recommended_album_id,
          albums:recommended_album_id (
            id,
            title,
            cover_url,
            release_year,
            artists (
              name
            )
          )
        `)
        .eq("album_id", albumId)
        .order("score", { ascending: false })
        .limit(6);

      if (recsData) {
        const similar = recsData.map((rec: any) => rec.albums).filter(Boolean);
        setSimilarAlbums(similar);
      }

    } catch (error) {
      console.error("Error fetching album:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserRating(userId: string) {
    const { data } = await supabase
      .from("ratings")
      .select("rating")
      .eq("album_id", albumId)
      .eq("user_id", userId)
      .single();

    if (data) setUserRating(data.rating);
  }

  async function handleRate(rating: number) {
    if (!user) {
      alert("Please sign in to rate albums");
      return;
    }

    try {
      const { error } = await supabase
        .from("ratings")
        .upsert({
          album_id: albumId,
          user_id: user.id,
          rating: rating,
          listened: true
        });

      if (error) throw error;
      setUserRating(rating);
      fetchAlbumData(); // Refresh stats
    } catch (error) {
      console.error("Error rating album:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Album not found</h2>
        <button onClick={() => router.push("/")} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Album Header */}
      <div className="bg-[#1e2936] rounded-lg p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Album Cover */}
          <div className="flex-shrink-0">
            {album.cover_url ? (
              <Image
                src={album.cover_url}
                alt={album.title}
                width={300}
                height={300}
                className="rounded-lg shadow-2xl"
              />
            ) : (
              <div className="w-[300px] h-[300px] bg-[#2a3441] rounded-lg flex items-center justify-center">
                <span className="text-6xl">🎵</span>
              </div>
            )}
          </div>

          {/* Album Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{album.title}</h1>
              <Link
                href={`/artists/${album.artist_id}`}
                className="text-2xl text-[#9ab] hover:text-[#00c030] transition-colors"
              >
                {album.artists.name}
              </Link>
            </div>

            <div className="flex items-center gap-4 text-[#9ab]">
              <span className="font-semibold">{album.release_year}</span>
              <span>•</span>
              <span className="capitalize">{album.album_type}</span>
              {album.genres.length > 0 && (
                <>
                  <span>•</span>
                  <span>{album.genres.join(", ")}</span>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-[#00c030] text-3xl font-bold">
                  {album.average_rating ? album.average_rating.toFixed(1) : "—"}
                </span>
                <span className="text-[#678] ml-2">/ 10</span>
              </div>
              <div className="text-[#9ab]">
                <div className="font-semibold">{album.ratings_count} ratings</div>
                <div>{album.reviews_count} reviews</div>
              </div>
            </div>

            {/* Rating Widget */}
            <div className="pt-4">
              <label className="block text-sm font-semibold text-[#9ab] mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleRate(num)}
                    className={`w-10 h-10 rounded font-bold transition-all ${
                      userRating === num
                        ? "bg-[#00c030] text-[#14181c]"
                        : "bg-[#2a3441] text-[#9ab] hover:bg-[#456] hover:text-white"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => user ? alert("Mark as listened!") : alert("Sign in first")}
                className="btn-secondary"
              >
                ✓ Mark Listened
              </button>
              <button
                onClick={() => user ? alert("Add to list!") : alert("Sign in first")}
                className="btn-secondary"
              >
                + Add to List
              </button>
              <button
                onClick={() => user ? router.push(`/albums/${albumId}/review`) : alert("Sign in first")}
                className="btn-primary"
              >
                ✍️ Write Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Friends' Ratings */}
      {friendRatings.length > 0 && (
        <div className="bg-[#1e2936] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Friends' Ratings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {friendRatings.map((rating) => (
              <div
                key={rating.id}
                className="flex items-center gap-3 p-3 bg-[#2a3441] rounded-lg"
              >
                {rating.users.avatar_url ? (
                  <Image
                    src={rating.users.avatar_url}
                    alt={rating.users.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#456] flex items-center justify-center text-white font-bold">
                    {rating.users.name[0]}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-white truncate">
                    {rating.users.name}
                  </div>
                  <div className="text-[#00c030] font-bold">
                    {rating.rating}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracklist */}
      {album.tracklist && album.tracklist.length > 0 && (
        <div className="bg-[#1e2936] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Tracklist</h2>
          <div className="space-y-2">
            {album.tracklist.map((track: any) => (
              <div
                key={track.number}
                className="flex items-center justify-between p-3 hover:bg-[#2a3441] rounded transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#678] font-mono text-sm w-6">
                    {track.number}
                  </span>
                  <span className="text-white font-medium">{track.title}</span>
                </div>
                <span className="text-[#678] font-mono text-sm">{track.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-[#1e2936] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-[#678]">
            <p>No reviews yet. Be the first to write one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-[#2a3441] rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {review.users.avatar_url ? (
                      <Image
                        src={review.users.avatar_url}
                        alt={review.users.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#456] flex items-center justify-center text-white font-bold">
                        {review.users.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white">
                        {review.users.name}
                      </div>
                      <div className="text-sm text-[#678]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#00c030] font-bold text-xl">
                    {review.rating}/10
                  </div>
                </div>
                <p className="text-[#9ab] leading-relaxed">{review.text}</p>
                <div className="flex items-center gap-2 text-sm text-[#678]">
                  <button className="hover:text-[#00c030] transition-colors">
                    ❤️ {review.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Similar Albums */}
      {similarAlbums.length > 0 && (
        <div className="bg-[#1e2936] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Similar Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarAlbums.map((similar) => (
              <Link
                key={similar.id}
                href={`/albums/${similar.id}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                  {similar.cover_url ? (
                    <Image
                      src={similar.cover_url}
                      alt={similar.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#2a3441] flex items-center justify-center">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-white text-sm truncate group-hover:text-[#00c030] transition-colors">
                  {similar.title}
                </h3>
                <p className="text-xs text-[#678] truncate">
                  {similar.artists.name} • {similar.release_year}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
