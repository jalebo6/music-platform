"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import ShareCard from "@/components/ShareCard";
import Image from "next/image";

type TabType = "diary" | "albums" | "reviews" | "lists" | "listen-later" | "activity";

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
  const [activeTab, setActiveTab] = useState<TabType>("diary");

  // Tab data
  const [listeningLogs, setListeningLogs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [listenLater, setListenLater] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    checkUser();
    fetchProfile();
    checkFollowing();
  }, [userId]);

  useEffect(() => {
    loadTabData();
  }, [activeTab, userId]);

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
    setLoading(false);
  }

  async function loadTabData() {
    setTabLoading(true);

    switch (activeTab) {
      case "diary":
        await fetchListeningLogs();
        break;
      case "albums":
        await fetchShares(); // Using shares as albums for now
        break;
      case "reviews":
        await fetchReviews();
        break;
      case "lists":
        await fetchLists();
        break;
      case "listen-later":
        await fetchListenLater();
        break;
      case "activity":
        await fetchActivity();
        break;
    }

    setTabLoading(false);
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

    if (!error && data) {
      setShares(data || []);
    }
  }

  async function fetchListeningLogs() {
    const { data, error } = await supabase
      .from("listening_logs")
      .select(`
        id,
        date_logged,
        rating,
        review,
        albums (
          id,
          title,
          artist,
          cover_url
        )
      `)
      .eq("user_id", userId)
      .order("date_logged", { ascending: false })
      .limit(50);

    if (!error && data) {
      setListeningLogs(data);
    }
  }

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("listening_logs")
      .select(`
        id,
        date_logged,
        rating,
        review,
        albums (
          id,
          title,
          artist,
          cover_url
        )
      `)
      .eq("user_id", userId)
      .not("review", "is", null)
      .order("date_logged", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
  }

  async function fetchLists() {
    const { data, error } = await supabase
      .from("lists")
      .select(`
        id,
        title,
        description,
        created_at,
        list_items (
          albums (
            cover_url,
            title
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLists(data);
    }
  }

  async function fetchListenLater() {
    const { data, error } = await supabase
      .from("listening_logs")
      .select(`
        id,
        albums (
          id,
          title,
          artist,
          cover_url
        )
      `)
      .eq("user_id", userId)
      .eq("listen_later", true);

    if (!error && data) {
      setListenLater(data);
    }
  }

  async function fetchActivity() {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setActivity(data);
    }
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
        <p className="text-[#9ab] font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#1e2936] p-12 rounded-lg text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Profile not found
        </h1>
        <p className="text-[#9ab] mb-6">
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

  const tabs: { id: TabType; label: string }[] = [
    { id: "diary", label: "Diary" },
    { id: "albums", label: "Albums" },
    { id: "reviews", label: "Reviews" },
    { id: "lists", label: "Lists" },
    { id: "listen-later", label: "Listen Later" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-[#1e2936] rounded-lg p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.name}
                width={120}
                height={120}
                className="rounded-full ring-4 ring-[#456]"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#456] flex items-center justify-center text-white text-5xl font-bold">
                {profile.name[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {profile.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-[#9ab]">
                  <div>
                    <span className="font-bold text-white text-lg">
                      {shares.length}
                    </span>{" "}
                    {shares.length === 1 ? "share" : "shares"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => router.push("/lists/new")}
                      className="btn-primary text-sm"
                    >
                      + Create List
                    </button>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="btn-secondary text-sm"
                    >
                      {editing ? "Cancel" : "Edit Profile"}
                    </button>
                  </>
                ) : currentUser ? (
                  <button
                    onClick={handleFollow}
                    className={`font-bold py-2 px-6 rounded transition-all text-sm ${
                      isFollowing
                        ? "bg-[#456] text-[#9ab] hover:bg-[#678]"
                        : "bg-[#00c030] text-[#14181c] hover:bg-[#00e054]"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
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
                  placeholder="Tell us about your music taste..."
                  className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 resize-none focus:outline-none focus:border-[#00c030]"
                />
                <button
                  onClick={handleSaveBio}
                  disabled={saving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Bio"}
                </button>
              </div>
            ) : (
              <>
                {profile.bio ? (
                  <p className="text-[#ccc] leading-relaxed">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-[#678] italic">
                    {isOwnProfile ? "Add a bio to tell others about your music taste" : "No bio yet"}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-[#456] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 font-bold transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-white"
                : "text-[#9ab] hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00c030]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="spinner h-8 w-8"></div>
        </div>
      ) : (
        <>
          {/* Diary Tab */}
          {activeTab === "diary" && (
            <div className="space-y-4">
              {listeningLogs.length > 0 ? (
                listeningLogs.map((log: any) => (
                  <div key={log.id} className="bg-[#1e2936] rounded-lg p-6 flex items-start space-x-4">
                    <div className="w-20 h-20 bg-[#456] rounded flex-shrink-0 flex items-center justify-center">
                      {log.albums?.cover_url ? (
                        <Image
                          src={log.albums.cover_url}
                          alt={log.albums.title}
                          width={80}
                          height={80}
                          className="rounded"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {log.albums?.title?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-bold text-lg">
                          {log.albums?.title || "Unknown Album"}
                        </h3>
                        <span className="text-[#9ab] text-sm">
                          {new Date(log.date_logged).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#9ab] mb-2">{log.albums?.artist}</p>
                      {log.rating && (
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < log.rating ? "text-[#00c030]" : "text-[#456]"}>
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                      {log.review && (
                        <p className="text-[#ccc] leading-relaxed">{log.review}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#1e2936] p-12 rounded-lg text-center">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    No diary entries yet
                  </h3>
                  <p className="text-[#9ab]">
                    {isOwnProfile ? "Start logging albums to build your music diary" : "No listening logs yet"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Albums Tab */}
          {activeTab === "albums" && (
            <div>
              {shares.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {shares.map((share) => {
                    const initial = share.title[0]?.toUpperCase() || "?";
                    return (
                      <div key={share.id} className="album-cover group">
                        <div className="w-full h-full bg-[#2a3441] flex items-center justify-center border border-[#456]">
                          <span className="text-5xl font-bold text-[#678]">{initial}</span>
                        </div>
                        <div className="album-overlay">
                          <p className="text-white font-bold text-sm truncate">
                            {share.title}
                          </p>
                          <p className="text-[#9ab] text-xs truncate">
                            {share.artist}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#1e2936] p-12 rounded-lg text-center">
                  <div className="text-6xl mb-4">💿</div>
                  <h3 className="text-xl font-bold text-white mb-2">No albums yet</h3>
                  <p className="text-[#9ab]">
                    {isOwnProfile ? "Share music to see it here" : "Nothing shared yet"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review: any) => (
                  <div key={review.id} className="bg-[#1e2936] rounded-lg p-6 flex items-start space-x-4">
                    <div className="w-20 h-20 bg-[#456] rounded flex-shrink-0 flex items-center justify-center">
                      {review.albums?.cover_url ? (
                        <Image
                          src={review.albums.cover_url}
                          alt={review.albums.title}
                          width={80}
                          height={80}
                          className="rounded"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {review.albums?.title?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        {review.albums?.title || "Unknown Album"}
                      </h3>
                      <p className="text-[#9ab] mb-2">{review.albums?.artist}</p>
                      {review.rating && (
                        <div className="flex items-center space-x-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-[#00c030]" : "text-[#456]"}>
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[#ccc] leading-relaxed">{review.review}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#1e2936] p-12 rounded-lg text-center">
                  <div className="text-6xl mb-4">✍️</div>
                  <h3 className="text-xl font-bold text-white mb-2">No reviews yet</h3>
                  <p className="text-[#9ab]">
                    {isOwnProfile ? "Write reviews to share your thoughts" : "No reviews written"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Lists Tab */}
          {activeTab === "lists" && (
            <div>
              {lists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {lists.map((list: any) => (
                    <div
                      key={list.id}
                      onClick={() => router.push(`/lists/${list.id}`)}
                      className="bg-[#1e2936] rounded-lg p-4 cursor-pointer hover:bg-[#2a3441] transition-colors"
                    >
                      <div className="grid grid-cols-2 gap-1 mb-3 h-40">
                        {list.list_items?.slice(0, 4).map((item: any, idx: number) => (
                          <div key={idx} className="bg-[#456] rounded flex items-center justify-center">
                            {item.albums?.cover_url ? (
                              <Image
                                src={item.albums.cover_url}
                                alt=""
                                width={100}
                                height={100}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-white font-bold text-2xl">
                                {item.albums?.title?.[0] || "?"}
                              </span>
                            )}
                          </div>
                        ))}
                        {[...Array(Math.max(0, 4 - (list.list_items?.length || 0)))].map((_, idx) => (
                          <div key={`empty-${idx}`} className="bg-[#456] rounded"></div>
                        ))}
                      </div>
                      <h3 className="text-white font-bold mb-1">{list.title}</h3>
                      {list.description && (
                        <p className="text-[#9ab] text-sm line-clamp-2">{list.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1e2936] p-12 rounded-lg text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-white mb-2">No lists yet</h3>
                  <p className="text-[#9ab] mb-6">
                    {isOwnProfile ? "Create lists to curate your favorite albums" : "No lists created"}
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => router.push("/lists/new")}
                      className="btn-primary"
                    >
                      Create Your First List
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Listen Later Tab */}
          {activeTab === "listen-later" && (
            <div>
              {listenLater.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {listenLater.map((item: any) => (
                    <div key={item.id} className="album-cover group">
                      <div className="w-full h-full bg-[#2a3441] flex items-center justify-center border border-[#456]">
                        {item.albums?.cover_url ? (
                          <Image
                            src={item.albums.cover_url}
                            alt={item.albums.title}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-5xl font-bold text-[#678]">
                            {item.albums?.title?.[0] || "?"}
                          </span>
                        )}
                      </div>
                      <div className="album-overlay">
                        <p className="text-white font-bold text-sm truncate">
                          {item.albums?.title}
                        </p>
                        <p className="text-[#9ab] text-xs truncate">
                          {item.albums?.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1e2936] p-12 rounded-lg text-center">
                  <div className="text-6xl mb-4">⏱️</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Nothing saved for later
                  </h3>
                  <p className="text-[#9ab]">
                    {isOwnProfile ? "Save albums you want to listen to" : "No albums saved"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              {activity.length > 0 ? (
                activity.map((item: any) => (
                  <div key={item.id} className="bg-[#1e2936] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">
                          {item.activity_type === "log" && "Logged an album"}
                          {item.activity_type === "review" && "Wrote a review"}
                          {item.activity_type === "like" && "Liked a list"}
                          {item.activity_type === "comment" && "Commented on a list"}
                          {item.activity_type === "list_create" && `Created list: ${item.metadata?.title}`}
                        </span>
                        {item.metadata && item.activity_type === "log" && (
                          <p className="text-[#9ab] text-sm">
                            Rating: {item.metadata.rating ? "★".repeat(item.metadata.rating) : "N/A"}
                          </p>
                        )}
                      </div>
                      <span className="text-[#678] text-sm">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#1e2936] p-12 rounded-lg text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-white mb-2">No activity yet</h3>
                  <p className="text-[#9ab]">
                    {isOwnProfile ? "Your activity will appear here" : "No activity to show"}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
