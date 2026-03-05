"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface RatingSystemProps {
  albumId: string;
  userId?: string;
  showReviewInput?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RatingSystem({
  albumId,
  userId,
  showReviewInput = false,
  size = "md",
}: RatingSystemProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [saving, setSaving] = useState(false);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  useEffect(() => {
    if (albumId) {
      fetchRatings();
      if (userId) {
        fetchUserRating();
        fetchUserLike();
      }
    }
  }, [albumId, userId]);

  async function fetchRatings() {
    // Get average rating and count
    const { data, error } = await supabase
      .from("ratings")
      .select("rating")
      .eq("album_id", albumId);

    if (!error && data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + Number(r.rating), 0) / data.length;
      setAverageRating(Math.round(avg * 2) / 2); // Round to nearest 0.5
      setRatingCount(data.length);
    }
  }

  async function fetchUserRating() {
    if (!userId) return;

    const { data } = await supabase
      .from("ratings")
      .select("rating, review_text")
      .eq("album_id", albumId)
      .eq("user_id", userId)
      .single();

    if (data) {
      setRating(data.rating);
      setReviewText(data.review_text || "");
    }
  }

  async function fetchUserLike() {
    if (!userId) return;

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("album_id", albumId)
      .eq("user_id", userId)
      .single();

    setIsLiked(!!data);
  }

  async function handleRatingClick(value: number) {
    if (!userId) {
      alert("Please sign in to rate albums");
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("ratings")
        .upsert({
          user_id: userId,
          album_id: albumId,
          rating: value,
          review_text: reviewText || null,
        });

      if (!error) {
        setRating(value);
        await fetchRatings();
      }
    } catch (error) {
      console.error("Error saving rating:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleLikeToggle() {
    if (!userId) {
      alert("Please sign in to like albums");
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("album_id", albumId)
          .eq("user_id", userId);
        setIsLiked(false);
      } else {
        // Like
        await supabase
          .from("likes")
          .insert({ user_id: userId, album_id: albumId });
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }

  async function handleReviewSubmit() {
    if (!userId || !rating) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("ratings")
        .upsert({
          user_id: userId,
          album_id: albumId,
          rating: rating,
          review_text: reviewText || null,
        });

      if (!error) {
        alert("Review saved!");
      }
    } catch (error) {
      console.error("Error saving review:", error);
    } finally {
      setSaving(false);
    }
  }

  const stars = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  return (
    <div className="space-y-4">
      {/* Like Button */}
      {userId && (
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              isLiked
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#2a3441] text-[#9ab] hover:bg-[#456]"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>
        </div>
      )}

      {/* Star Rating */}
      <div className="space-y-2">
        {userId && (
          <div>
            <p className="text-sm text-[#9ab] mb-2">Your Rating:</p>
            <div className="flex items-center space-x-1">
              {stars.map((value) => (
                <StarButton
                  key={value}
                  value={value}
                  filled={hoverRating !== null ? value <= hoverRating : value <= (rating || 0)}
                  isHalf={value % 1 !== 0}
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(null)}
                  size={sizeClasses[size]}
                  disabled={saving}
                />
              ))}
              {rating && (
                <span className="ml-2 text-sm font-bold text-[#00c030]">
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Average Rating Display */}
        {averageRating !== null && (
          <div>
            <p className="text-sm text-[#9ab] mb-2">
              Average Rating:
            </p>
            <div className="flex items-center space-x-2">
              <StarDisplay rating={averageRating} size={sizeClasses[size]} />
              <span className="font-bold text-white text-lg">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-[#678]">
                ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Review Input (Optional) */}
      {showReviewInput && userId && (
        <div className="space-y-2">
          <label className="text-sm text-[#9ab]">Review (optional):</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this album..."
            className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded-lg p-3 focus:outline-none focus:border-[#00c030] transition-colors resize-none"
            rows={4}
          />
          <button
            onClick={handleReviewSubmit}
            disabled={!rating || saving}
            className="bg-[#00c030] hover:bg-[#00e054] text-[#14181c] font-semibold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Review"}
          </button>
        </div>
      )}
    </div>
  );
}

// Star Button Component
function StarButton({
  value,
  filled,
  isHalf,
  onClick,
  onMouseEnter,
  onMouseLeave,
  size,
  disabled,
}: {
  value: number;
  filled: boolean;
  isHalf: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  size: string;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className="transition-transform hover:scale-110 disabled:opacity-50"
    >
      {isHalf ? (
        <svg className={size} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`half-${value}`}>
              <stop offset="50%" stopColor={filled ? "#fbbf24" : "#456"} />
              <stop offset="50%" stopColor={filled ? "#fbbf24" : "#456"} />
            </linearGradient>
          </defs>
          <path
            fill={`url(#half-${value})`}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      ) : (
        <svg
          className={size}
          fill={filled ? "#fbbf24" : "none"}
          stroke={filled ? "#fbbf24" : "#456"}
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </button>
  );
}

// Star Display Component (Read-only)
function StarDisplay({ rating, size }: { rating: number; size: string }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      // Full star
      stars.push(
        <svg key={i} className={size} fill="#fbbf24" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    } else if (i - 0.5 === rating) {
      // Half star
      stars.push(
        <svg key={i} className={size} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`half-display-${i}`}>
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#456" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#half-display-${i})`}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      );
    } else {
      // Empty star
      stars.push(
        <svg key={i} className={size} fill="#456" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
  }
  return <div className="flex items-center space-x-1">{stars}</div>;
}
