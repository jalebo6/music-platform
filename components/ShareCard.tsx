"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface ShareCardProps {
  share: {
    id: string;
    user_id: string;
    title: string;
    artist: string;
    album: string | null;
    thought: string;
    tags: string[];
    created_at: string;
    users: {
      name: string;
      avatar_url: string;
    };
  };
}

export default function ShareCard({ share }: ShareCardProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        users (
          name,
          avatar_url
        )
      `)
      .eq("share_id", share.id)
      .order("upvotes", { ascending: false });

    setComments(data || []);
  }

  async function handleComment() {
    if (!newComment.trim() || !user) return;

    const { error } = await supabase
      .from("comments")
      .insert({
        share_id: share.id,
        user_id: user.id,
        text: newComment.trim(),
      });

    if (!error) {
      setNewComment("");
      fetchComments();
    }
  }

  async function handleUpvote(commentId: string) {
    if (!user) return;

    // Check if already upvoted
    const { data: existing } = await supabase
      .from("upvotes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // Remove upvote
      await supabase
        .from("upvotes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);
    } else {
      // Add upvote
      await supabase
        .from("upvotes")
        .insert({
          comment_id: commentId,
          user_id: user.id,
        });
    }

    fetchComments();
  }

  async function handleDeleteComment(commentId: string) {
    await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    fetchComments();
  }

  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
      <div className="flex items-start space-x-4">
        <Link href={`/profile/${share.user_id}`}>
          {share.users.avatar_url ? (
            <Image
              src={share.users.avatar_url}
              alt={share.users.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {share.users.name[0].toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Link
              href={`/profile/${share.user_id}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-blue-500 transition"
            >
              {share.users.name}
            </Link>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              · {timeAgo(share.created_at)}
            </span>
          </div>

          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {share.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {share.artist}
              {share.album && ` · ${share.album}`}
            </p>
          </div>

          <p className="text-gray-800 dark:text-gray-200 mb-3">
            {share.thought}
          </p>

          {share.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {share.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowComments(!showComments)}
            className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
          >
            {showComments ? "Hide" : "Show"} Comments ({comments.length})
          </button>

          {showComments && (
            <div className="mt-4 space-y-4">
              {user && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleComment}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                  >
                    Post
                  </button>
                </div>
              )}

              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {comment.users.avatar_url ? (
                        <Image
                          src={comment.users.avatar_url}
                          alt={comment.users.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          {comment.users.name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {comment.users.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {timeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 mt-1">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpvote(comment.id)}
                        className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition"
                      >
                        <span>↑</span>
                        <span>{comment.upvotes}</span>
                      </button>
                      {user && user.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
