"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

interface AlbumCoverProps {
  albumId: string;
  albumTitle: string;
  albumArtist: string;
  coverUrl: string;
  userId?: string;
  showHoverActions?: boolean;
  size?: "sm" | "md" | "lg";
}

interface AlbumBadges {
  averageRating: number | null;
  isLiked: boolean;
  isListened: boolean;
  userRating: number | null;
}

export default function AlbumCover({
  albumId,
  albumTitle,
  albumArtist,
  coverUrl,
  userId,
  showHoverActions = true,
  size = "md",
}: AlbumCoverProps) {
  const [showActions, setShowActions] = useState(false);
  const [badges, setBadges] = useState<AlbumBadges>({
    averageRating: null,
    isLiked: false,
    isListened: false,
    userRating: null,
  });
  const [showRatingSelector, setShowRatingSelector] = useState(false);

  const sizeClasses = {
    sm: "h-32 w-32",
    md: "h-48 w-48",
    lg: "h-64 w-64",
  };

  useEffect(() => {
    fetchBadges();
  }, [albumId, userId]);

  async function fetchBadges() {
    // Fetch average rating
    const { data: ratings } = await supabase
      .from("ratings")
      .select("rating")
      .eq("album_id", albumId);

    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length;
      setBadges((prev) => ({ ...prev, averageRating: Math.round(avg * 2) / 2 }));
    }

    if (userId) {
      // Fetch user-specific badges
      const [{ data: like }, { data: listened }, { data: userRating }] = await Promise.all([
        supabase.from("likes").select("id").eq("album_id", albumId).eq("user_id", userId).single(),
        supabase.from("listened").select("id").eq("album_id", albumId).eq("user_id", userId).single(),
        supabase.from("ratings").select("rating").eq("album_id", albumId).eq("user_id", userId).single(),
      ]);

      setBadges((prev) => ({
        ...prev,
        isLiked: !!like,
        isListened: !!listened,
        userRating: userRating?.rating || null,
      }));
    }
  }

  async function handleQuickAction(action: "like" | "listened" | "rate") {
    if (!userId) {
      alert("Please sign in to interact with albums");
      return;
    }

    try {
      switch (action) {
        case "like":
          if (badges.isLiked) {
            await supabase.from("likes").delete().eq("album_id", albumId).eq("user_id", userId);
            setBadges((prev) => ({ ...prev, isLiked: false }));
          } else {
            await supabase.from("likes").insert({ album_id: albumId, user_id: userId });
            setBadges((prev) => ({ ...prev, isLiked: true }));
          }
          break;

        case "listened":
          if (badges.isListened) {
            await supabase.from("listened").delete().eq("album_id", albumId).eq("user_id", userId);
            setBadges((prev) => ({ ...prev, isListened: false }));
          } else {
            await supabase.from("listened").insert({ album_id: albumId, user_id: userId });
            setBadges((prev) => ({ ...prev, isListened: true }));
          }
          break;

        case "rate":
          setShowRatingSelector(true);
          break;
      }
    } catch (error) {
      console.error("Quick action error:", error);
    }
  }

  async function handleRating(rating: number) {
    if (!userId) return;

    try {
      await supabase.from("ratings").upsert({
        user_id: userId,
        album_id: albumId,
        rating,
      });

      setBadges((prev) => ({ ...prev, userRating: rating }));
      setShowRatingSelector(false);
      fetchBadges(); // Refresh to update average
    } catch (error) {
      console.error("Rating error:", error);
    }
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => showHoverActions && setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowRatingSelector(false);
      }}
    >
      {/* Album Cover */}
      <Link href={`/album/${albumId}`}>
        <div
          className={`${sizeClasses[size]} relative aspect-square bg-[#2a3441] rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-[#00c030] transition-all`}
        >
          {coverUrl ? (
            <Image src={coverUrl} alt={albumTitle} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">🎵</div>
          )}

          {/* Badges Overlay - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
            {/* Average Rating Badge */}
            {badges.averageRating !== null && (
              <div className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded flex items-center space-x-1">
                <span className="text-yellow-400 text-sm">⭐</span>
                <span className="text-white text-xs font-bold">
                  {badges.averageRating.toFixed(1)}
                </span>
              </div>
            )}

            {/* User Rating Badge */}
            {badges.userRating !== null && (
              <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded flex items-center space-x-1">
                <span className="text-white text-xs font-bold">
                  You: {badges.userRating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Liked Badge */}
            {badges.isLiked && (
              <div className="bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded">
                <span className="text-white text-sm">❤️</span>
              </div>
            )}

            {/* Listened Badge */}
            {badges.isListened && (
              <div className="bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded">
                <span className="text-white text-sm">✔</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Hover Actions Menu */}
      {showHoverActions && showActions && userId && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center transition-opacity">
          {showRatingSelector ? (
            <div className="bg-[#1e2936] p-4 rounded-lg shadow-2xl">
              <p className="text-white text-sm font-semibold mb-3 text-center">Rate Album</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleRating(star)}
                      className="text-2xl hover:scale-125 transition-transform"
                      title={`${star} stars`}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => handleRating(star - 0.5)}
                      className="text-xs text-[#9ab] hover:text-white"
                      title={`${star - 0.5} stars`}
                    >
                      {star - 0.5}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 p-4">
              <ActionButton
                icon="✔"
                label={badges.isListened ? "Unmark Listened" : "Mark Listened"}
                active={badges.isListened}
                onClick={() => handleQuickAction("listened")}
              />
              <ActionButton
                icon="⭐"
                label="Rate"
                onClick={() => handleQuickAction("rate")}
              />
              <ActionButton
                icon="❤️"
                label={badges.isLiked ? "Unlike" : "Like"}
                active={badges.isLiked}
                onClick={() => handleQuickAction("like")}
              />
              <ActionButton icon="📁" label="Add to List" onClick={() => alert("Coming soon!")} />
              <ActionButton icon="🔖" label="Listen Later" onClick={() => alert("Coming soon!")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Action Button Component
function ActionButton({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg font-semibold transition-all ${
        active
          ? "bg-[#00c030] text-[#14181c]"
          : "bg-[#2a3441] text-white hover:bg-[#456]"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm whitespace-nowrap">{label}</span>
    </button>
  );
}
