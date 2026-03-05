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
  const [upvotes, setUpvotes] = useState<{ [key: string]: boolean }>({});

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
    
    // Check which comments user has upvoted
    if (user) {
      const commentIds = data?.map(c => c.id) || [];
      const { data: userUpvotes } = await supabase
        .from("upvotes")
        .select("comment_id")
        .eq("user_id", user.id)
        .in("comment_id", commentIds);
      
      const upvotedMap: { [key: string]: boolean } = {};
      userUpvotes?.forEach(uv => {
        upvotedMap[uv.comment_id] = true;
      });
      setUpvotes(upvotedMap);
    }
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

    const isUpvoted = upvotes[commentId];

    if (isUpvoted) {
      await supabase
        .from("upvotes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);
    } else {
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

  const tagColors = [
    "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
  ];

  return (
    <div className="card p-6 transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <Link href={`/profile/${share.user_id}`} className="flex-shrink-0">
          {share.users.avatar_url ? (
            <Image
              src={share.users.avatar_url}
              alt={share.users.name}
              width={48}
              height={48}
              className="rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-indigo-500 transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {share.users.name[0].toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-3">
            <Link
              href={`/profile/${share.user_id}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {share.users.name}
            </Link>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {timeAgo(share.created_at)}
            </span>
          </div>

          {/* Music Info */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
              {share.title}
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
              {share.artist}
              {share.album && <span className="text-gray-400 dark:text-gray-500"> • {share.album}</span>}
            </p>
          </div>

          {/* Thought */}
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {share.thought}
          </p>

          {/* Tags */}
          {share.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {share.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`tag ${tagColors[index % tagColors.length]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center space-x-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>
              {showComments ? "Hide" : "Show"} {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </button>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-6 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* New Comment Input */}
              {user && (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Add a comment..."
                    className="input-primary text-sm"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
                  >
                    Post
                  </button>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {comment.users.avatar_url ? (
                          <Image
                            src={comment.users.avatar_url}
                            alt={comment.users.name}
                            width={32}
                            height={32}
                            className="rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {comment.users.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {comment.users.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {timeAgo(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-3 flex-shrink-0">
                        <button
                          onClick={() => handleUpvote(comment.id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            upvotes[comment.id]
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          }`}
                        >
                          <svg className="w-5 h-5" fill={upvotes[comment.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span className="text-sm font-medium">{comment.upvotes}</span>
                        </button>
                        {user && user.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
