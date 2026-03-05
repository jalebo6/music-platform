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
  const [saving, setSaving] = useState(false);

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

    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ bio: editBio })
      .eq("id", userId);

    if (!error) {
      setProfile({ ...profile, bio: editBio });
      setEditing(false);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] space-y-4">
        <div className="spinner h-12 w-12"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card p-12 text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Profile not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This user doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="btn-secondary"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.name}
                width={120}
                height={120}
                className="rounded-full ring-4 ring-gray-200 dark:ring-gray-700 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                {profile.name[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {profile.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      {shares.length}
                    </span>{" "}
                    {shares.length === 1 ? "share" : "shares"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {isOwnProfile ? (
                  <button
                    onClick={() => setEditing(!editing)}
                    className="btn-secondary"
                  >
                    {editing ? "Cancel" : "Edit Profile"}
                  </button>
                ) : currentUser ? (
                  <button
                    onClick={handleFollow}
                    className={`font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-md ${
                      isFollowing
                        ? "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    }`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Following</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Follow</span>
                      </span>
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Bio Section */}
            {editing ? (
              <div className="space-y-3">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your music taste and favorites..."
                  className="input-primary resize-none"
                />
                <button
                  onClick={handleSaveBio}
                  disabled={saving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center space-x-2">
                      <div className="spinner h-4 w-4 border-white"></div>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    "Save Bio"
                  )}
                </button>
              </div>
            ) : (
              <>
                {profile.bio ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic">
                    {isOwnProfile ? "Add a bio to tell others about your music taste" : "No bio yet"}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Shares Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isOwnProfile ? "Your Shares" : `${profile.name}'s Shares`}
        </h2>

        {shares.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isOwnProfile ? "You haven't shared any music yet" : "No shares yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isOwnProfile
                ? "Start sharing your favorite songs and albums!"
                : `${profile.name} hasn't shared any music yet.`}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => router.push("/share")}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Share Your First Song</span>
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
