"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
}

interface ListItem {
  id: string;
  item_order: number;
  albums: Album;
}

interface List {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  users: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface Comment {
  id: string;
  text: string;
  created_at: string;
  users: {
    name: string;
    avatar_url?: string;
  };
}

export default function ListViewPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [likes, setLikes] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    checkUser();
    fetchList();
    fetchItems();
    fetchLikes();
    fetchComments();
  }, [listId]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
    if (session?.user) {
      checkIfLiked(session.user.id);
    }
  }

  async function fetchList() {
    const { data, error } = await supabase
      .from("lists")
      .select(`
        *,
        users (
          id,
          name,
          avatar_url
        )
      `)
      .eq("id", listId)
      .single();

    if (error) {
      console.error("Error fetching list:", error);
    } else {
      setList(data);
    }
    setLoading(false);
  }

  async function fetchItems() {
    const { data, error } = await supabase
      .from("list_items")
      .select(`
        id,
        item_order,
        albums (
          id,
          title,
          artist,
          cover_url
        )
      `)
      .eq("list_id", listId)
      .order("item_order", { ascending: true });

    if (!error && data) {
      setItems(data as any);
    }
  }

  async function fetchLikes() {
    const { count } = await supabase
      .from("list_likes")
      .select("*", { count: "exact", head: true })
      .eq("list_id", listId);

    setLikes(count || 0);
  }

  async function checkIfLiked(userId: string) {
    const { data } = await supabase
      .from("list_likes")
      .select("id")
      .eq("list_id", listId)
      .eq("user_id", userId)
      .single();

    setHasLiked(!!data);
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from("list_comments")
      .select(`
        id,
        text,
        created_at,
        users (
          name,
          avatar_url
        )
      `)
      .eq("list_id", listId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data as any);
    }
  }

  async function toggleLike() {
    if (!currentUser) {
      alert("Please sign in to like this list");
      return;
    }

    if (hasLiked) {
      await supabase
        .from("list_likes")
        .delete()
        .eq("list_id", listId)
        .eq("user_id", currentUser.id);
      
      setHasLiked(false);
      setLikes(likes - 1);
    } else {
      await supabase
        .from("list_likes")
        .insert({
          list_id: listId,
          user_id: currentUser.id,
        });
      
      setHasLiked(true);
      setLikes(likes + 1);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    
    if (!currentUser) {
      alert("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setCommenting(true);

    const { error } = await supabase
      .from("list_comments")
      .insert({
        list_id: listId,
        user_id: currentUser.id,
        text: newComment.trim(),
      });

    if (!error) {
      setNewComment("");
      fetchComments();
    }

    setCommenting(false);
  }

  async function deleteList() {
    if (!confirm("Are you sure you want to delete this list?")) return;

    const { error } = await supabase
      .from("lists")
      .delete()
      .eq("id", listId);

    if (!error) {
      router.push(`/profile/${currentUser.id}`);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="bg-[#1e2936] p-12 rounded-lg text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">List not found</h1>
        <p className="text-[#9ab] mb-6">
          This list doesn't exist or has been removed.
        </p>
        <button onClick={() => router.push("/")} className="btn-secondary">
          Back to Feed
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.id === list.user_id;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-[#9ab] hover:text-white transition-colors mb-4"
        >
          ← Back
        </button>
      </div>

      {/* List Info */}
      <div className="bg-[#1e2936] rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-3">
              {list.title}
            </h1>
            {list.description && (
              <p className="text-[#ccc] text-lg mb-4 leading-relaxed">
                {list.description}
              </p>
            )}
            
            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-4">
              <div
                onClick={() => router.push(`/profile/${list.users.id}`)}
                className="cursor-pointer flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                {list.users.avatar_url ? (
                  <Image
                    src={list.users.avatar_url}
                    alt={list.users.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#456] flex items-center justify-center text-white font-bold">
                    {list.users.name[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">
                    {list.users.name}
                  </p>
                  <p className="text-[#9ab] text-sm">
                    {new Date(list.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-[#9ab]">
              <span>
                <span className="font-bold text-white">{items.length}</span>{" "}
                album{items.length !== 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span>
                <span className="font-bold text-white">{likes}</span>{" "}
                like{likes !== 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span>
                <span className="font-bold text-white">{comments.length}</span>{" "}
                comment{comments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLike}
              className={`font-bold py-2 px-6 rounded transition-all ${
                hasLiked
                  ? "bg-[#00c030] text-[#14181c]"
                  : "bg-[#456] text-white hover:bg-[#678]"
              }`}
            >
              {hasLiked ? "❤️ Liked" : "🤍 Like"}
            </button>
            
            {isOwner && (
              <button
                onClick={deleteList}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-all"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Album Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item.id} className="album-cover group">
                <div className="w-full h-full bg-[#2a3441] flex items-center justify-center border border-[#456]">
                  {item.albums.cover_url ? (
                    <Image
                      src={item.albums.cover_url}
                      alt={item.albums.title}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-[#678]">
                      {item.albums.title[0]}
                    </span>
                  )}
                </div>
                
                <div className="album-overlay">
                  <p className="text-white font-bold text-sm truncate">
                    {item.albums.title}
                  </p>
                  <p className="text-[#9ab] text-xs truncate">
                    {item.albums.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1e2936] p-8 rounded-lg text-center text-[#678]">
            No albums in this list yet
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-[#1e2936] rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Comments</h2>
        
        {/* Comment Form */}
        {currentUser ? (
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 mb-3 resize-none focus:outline-none focus:border-[#00c030]"
            />
            <button
              type="submit"
              disabled={commenting || !newComment.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {commenting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <p className="text-[#9ab] mb-6 italic">Sign in to comment</p>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                {comment.users.avatar_url ? (
                  <Image
                    src={comment.users.avatar_url}
                    alt={comment.users.name}
                    width={40}
                    height={40}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#456] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {comment.users.name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium">
                      {comment.users.name}
                    </span>
                    <span className="text-[#678] text-sm">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#ccc]">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[#678] text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
