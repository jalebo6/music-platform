"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import ShareCard from "@/components/ShareCard";
import Image from "next/image";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [shares, setShares] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    checkUser();
    fetchProfile();
    fetchShares();
    checkFollowing();
  }, [userId]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
  }

  async function fetchProfile() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
      setEditBio(data.bio || "");
    }
  }

  async function fetchShares() {
    const { data, error } = await supabase
      .from("shares")
      .select(`
        *,
        users (
          name,
          avatar_url
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching shares:", error);
    } else {
      setShares(data || []);
    }
    setLoading(false);
  }

  async function checkFollowing() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", session.user.id)
      .eq("following_id", userId)
      .single();

    setIsFollowing(!!data);
  }

  async function handleFollow() {
    if (!currentUser) return;

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId);
      setIsFollowing(false);
    } else {
      await supabase
        .from("follows")
        .insert({
          follower_id: currentUser.id,
          following_id: userId,
        });
      setIsFollowing(true);
    }
  }

  async function handleSaveBio() {
    if (!currentUser || currentUser.id !== userId) return;

    const { error } = await supabase
      .from("users")
      .update({ bio: editBio })
      .eq("id", userId);

    if (!error) {
      setProfile({ ...profile, bio: editBio });
      setEditing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile not found
        </h1>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-start space-x-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.name}
              width={96}
              height={96}
              className="rounded-full"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold">
              {profile.name[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              {isOwnProfile ? (
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition"
                >
                  {editing ? "Cancel" : "Edit Profile"}
                </button>
              ) : currentUser ? (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg transition ${
                    isFollowing
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              ) : null}
            </div>

            {editing ? (
              <div className="space-y-3">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your music taste..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSaveBio}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                {profile.bio ? (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                    No bio yet
                  </p>
                )}
              </>
            )}

            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {shares.length}
                </span>{" "}
                shares
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isOwnProfile ? "Your Shares" : `${profile.name}'s Shares`}
        </h2>

        {shares.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              {isOwnProfile ? "You haven't shared any music yet." : "No shares yet."}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => router.push("/share")}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
              >
                Share Your First Song
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {shares.map((share) => (
              <ShareCard key={share.id} share={share} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
