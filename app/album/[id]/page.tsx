"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import RatingSystem from "@/components/RatingSystem";

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  release_date: string;
  genre: string;
  artists?: {
    name: string;
    image_url: string;
  };
}

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  users: {
    id: string;
    name: string;
    avatar_url: string;
  };
}

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [album, setAlbum] = useState<Album | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchAlbum();
    fetchReviews();
  }, [resolvedParams.id]);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  async function fetchAlbum() {
    const { data, error } = await supabase
      .from("albums")
      .select(
        `
        *,
        artists (
          name,
          image_url
        )
      `
      )
      .eq("id", resolvedParams.id)
      .single();

    if (!error && data) {
      setAlbum(data);
    }
    setLoading(false);
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from("ratings")
      .select(
        `
        *,
        users (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("album_id", resolvedParams.id)
      .not("review_text", "is", null)
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data as any);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-16">
        <p className="text-[#9ab] text-lg">Album not found</p>
        <Link href="/" className="text-[#00c030] hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Album Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Album Cover */}
        <div className="md:col-span-1">
          <div className="relative aspect-square bg-[#2a3441] rounded-lg overflow-hidden shadow-2xl">
            {album.cover_url ? (
              <Image src={album.cover_url} alt={album.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-8xl">🎵</div>
            )}
          </div>
        </div>

        {/* Album Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{album.title}</h1>
            <Link
              href={`/artist/${album.artists?.name || album.artist}`}
              className="text-2xl text-[#9ab] hover:text-white transition-colors"
            >
              {album.artist}
            </Link>
          </div>

          {/* Album Metadata */}
          <div className="flex flex-wrap gap-4 text-sm">
            {album.release_date && (
              <div className="bg-[#2a3441] px-4 py-2 rounded">
                <span className="text-[#678]">Released: </span>
                <span className="text-white font-semibold">
                  {new Date(album.release_date).getFullYear()}
                </span>
              </div>
            )}
            {album.genre && (
              <div className="bg-[#2a3441] px-4 py-2 rounded">
                <span className="text-[#678]">Genre: </span>
                <span className="text-white font-semibold">{album.genre}</span>
              </div>
            )}
          </div>

          {/* Rating System */}
          <div className="bg-[#1e2936] rounded-lg p-6">
            <RatingSystem
              albumId={album.id}
              userId={user?.id}
              showReviewInput={true}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
        {reviews.length === 0 ? (
          <div className="bg-[#1e2936] rounded-lg p-12 text-center">
            <p className="text-[#9ab]">No reviews yet. Be the first to review this album!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-[#1e2936] rounded-lg p-6">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <Link href={`/profile/${review.users.id}`}>
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#456] flex-shrink-0">
            {review.users.avatar_url ? (
              <Image
                src={review.users.avatar_url}
                alt={review.users.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xl font-bold text-white">
                {review.users.name[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/profile/${review.users.id}`}
              className="font-bold text-white hover:text-[#00c030] transition-colors"
            >
              {review.users.name}
            </Link>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4"
                    fill={i < review.rating ? "#fbbf24" : "#456"}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-bold text-yellow-400">{review.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-[#9ab] leading-relaxed whitespace-pre-wrap">{review.review_text}</p>
          <p className="text-xs text-[#678] mt-3">
            {new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
