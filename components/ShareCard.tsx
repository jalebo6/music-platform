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

  // Generate a placeholder album cover with first letter
  const albumInitial = share.title[0]?.toUpperCase() || "?";

  return (
    <div className="bg-[#1e2936] rounded-lg p-5 hover:bg-[#2a3441] transition-all">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <Link href={`/profile/${share.user_id}`} className="flex-shrink-0">
          {share.users.avatar_url ? (
            <Image
              src={share.users.avatar_url}
              alt={share.users.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#456] flex items-center justify-center text-white font-bold">
              {share.users.name[0].toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header: User + Time */}
          <div className="flex items-center space-x-2 mb-3">
            <Link
              href={`/profile/${share.user_id}`}
              className="font-bold text-white hover:text-[#00c030] transition-colors"
            >
              {share.users.name}
            </Link>
            <span className="text-[#678]">•</span>
            <span className="text-sm text-[#678]">
              {timeAgo(share.created_at)}
            </span>
          </div>

          {/* Album Cover + Info Side by Side */}
          <div className="flex items-start space-x-4 mb-4">
            {/* Album Cover (Placeholder) */}
            <div className="flex-shrink-0 w-20 h-20 bg-[#2a3441] rounded flex items-center justify-center border border-[#456]">
              <span className="text-3xl font-bold text-[#678]">{albumInitial}</span>
            </div>

            {/* Music Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                {share.title}
              </h3>
              <p className="text-sm text-[#9ab] font-medium">
                {share.artist}
              </p>
              {share.album && (
                <p className="text-xs text-[#678]">
                  {share.album}
                </p>
              )}
            </div>
          </div>

          {/* Thought/Review */}
          <p className="text-[#ccc] mb-3 leading-relaxed">
            {share.thought}
          </p>

          {/* Tags */}
          {share.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {share.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs font-semibold px-3 py-1 rounded bg-[#456] text-[#9ab]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-[#9ab] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </button>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 space-y-3 pt-4 border-t border-[#456]">
              {/* New Comment Input */}
              {user && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00c030]"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className="bg-[#00c030] hover:bg-[#00e054] disabled:bg-[#456] disabled:text-[#678] text-[#14181c] font-bold px-4 py-2 rounded transition-colors text-sm whitespace-nowrap"
                  >
                    Post
                  </button>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-center text-[#678] py-3 text-sm">
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-[#14181c] p-3 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        {comment.users.avatar_url ? (
                          <Image
                            src={comment.users.avatar_url}
                            alt={comment.users.name}
                            width={28}
                            height={28}
                            className="rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#456] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {comment.users.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-bold text-white text-sm">
                              {comment.users.name}
                            </span>
                            <span className="text-xs text-[#678]">
                              {timeAgo(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-[#ccc] text-sm leading-relaxed break-words">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                        <button
                          onClick={() => handleUpvote(comment.id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            upvotes[comment.id]
                              ? "text-[#00c030]"
                              : "text-[#678] hover:text-white"
                          }`}
                        >
                          <svg className="w-4 h-4" fill={upvotes[comment.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span className="text-xs font-bold">{comment.upvotes}</span>
                        </button>
                        {user && user.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-[#678] hover:text-white text-xs font-semibold transition-colors"
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
