"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SharePage() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [thought, setThought] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/");
    } else {
      setUser(session.user);
    }
    setAuthLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title || !artist || !thought) return;

    setLoading(true);

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const { error } = await supabase.from("shares").insert({
      user_id: user.id,
      title,
      artist,
      album: album || null,
      thought,
      tags: tagArray,
    });

    if (error) {
      console.error("Error creating share:", error);
      alert("Failed to create share. Please try again.");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] space-y-4">
        <div className="spinner h-12 w-12"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block mb-4 p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <span className="text-4xl">🎵</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
          Share Your Music
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Tell the world about a song or album you love. Share your thoughts and feelings.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-8 md:p-10 space-y-6">
        {/* Song/Album Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Song/Album Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Bohemian Rhapsody"
            className="input-primary"
          />
        </div>

        {/* Artist */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Artist <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            placeholder="e.g., Queen"
            className="input-primary"
          />
        </div>

        {/* Album (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Album <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="e.g., A Night at the Opera"
            className="input-primary"
          />
        </div>

        {/* Your Thoughts */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Your Thoughts <span className="text-red-500">*</span>
          </label>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            required
            rows={6}
            placeholder="What do you love about this music? How does it make you feel? Share your thoughts..."
            className="input-primary resize-none"
            style={{ minHeight: '120px' }}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Minimum 10 characters. Be thoughtful and genuine.
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tags <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., rock, classic, epic, 70s"
            className="input-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Separate tags with commas. Help others discover your share!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !title || !artist || !thought}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="spinner h-5 w-5 border-white"></div>
                <span>Sharing...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Share</span>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            disabled={loading}
            className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Tips for great shares</span>
        </h3>
        <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-2">
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Be specific about what you love – emotions, lyrics, production</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Share personal connections or memories with the music</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Use tags to help others discover similar music</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
