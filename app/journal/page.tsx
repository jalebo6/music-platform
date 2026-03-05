"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

interface Activity {
  id: string;
  type: "rating" | "like" | "listened";
  created_at: string;
  users: {
    id: string;
    name: string;
    avatar_url: string;
  };
  albums: {
    id: string;
    title: string;
    artist: string;
    cover_url: string;
  };
  rating?: number;
  review_text?: string;
}

export default function JournalPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    // Fetch recent ratings
    const { data: ratings } = await supabase
      .from("ratings")
      .select(
        `
        id,
        rating,
        review_text,
        created_at,
        users (id, name, avatar_url),
        albums:album_id (id, title, artist, cover_url)
      `
      )
      .order("created_at", { ascending: false })
      .limit(30);

    const formattedActivities: Activity[] =
      ratings?.map((r: any) => ({
        id: r.id,
        type: "rating" as const,
        created_at: r.created_at,
        users: r.users,
        albums: r.albums,
        rating: r.rating,
        review_text: r.review_text,
      })) || [];

    setActivities(formattedActivities);
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Journal</h1>
        <p className="text-[#9ab]">Recent activity from the community</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="spinner h-12 w-12"></div>
        </div>
      )}

      {!loading && activities.length === 0 && (
        <div className="text-center py-16 bg-[#1e2936] rounded-lg">
          <div className="text-6xl mb-4">📔</div>
          <p className="text-[#9ab] text-lg">No activity yet</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="bg-[#1e2936] rounded-lg p-6">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <Link href={`/profile/${activity.users.id}`}>
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#456] flex-shrink-0">
            {activity.users.avatar_url ? (
              <Image
                src={activity.users.avatar_url}
                alt={activity.users.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xl font-bold text-white">
                {activity.users.name[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <p className="text-white mb-2">
                <Link
                  href={`/profile/${activity.users.id}`}
                  className="font-bold hover:text-[#00c030] transition-colors"
                >
                  {activity.users.name}
                </Link>
                <span className="text-[#9ab]">
                  {activity.type === "rating" && " rated "}
                  {activity.type === "like" && " liked "}
                  {activity.type === "listened" && " listened to "}
                </span>
                <Link
                  href={`/album/${activity.albums.id}`}
                  className="font-bold hover:text-[#00c030] transition-colors"
                >
                  {activity.albums.title}
                </Link>
                <span className="text-[#9ab]"> by {activity.albums.artist}</span>
              </p>

              {activity.rating && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4"
                        fill={i < activity.rating! ? "#fbbf24" : "#456"}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-yellow-400">
                    {activity.rating.toFixed(1)}
                  </span>
                </div>
              )}

              {activity.review_text && (
                <p className="text-[#9ab] text-sm line-clamp-3">{activity.review_text}</p>
              )}

              <p className="text-xs text-[#678] mt-2">
                {new Date(activity.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Album Cover Thumbnail */}
            <Link href={`/album/${activity.albums.id}`} className="flex-shrink-0">
              <div className="relative w-20 h-20 rounded overflow-hidden bg-[#2a3441]">
                {activity.albums.cover_url ? (
                  <Image
                    src={activity.albums.cover_url}
                    alt={activity.albums.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-2xl">🎵</div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
