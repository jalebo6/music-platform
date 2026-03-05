"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
}

export default function CreateListPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    setUser(session.user);
  }

  async function searchAlbums() {
    if (!searchQuery.trim()) return;

    setSearching(true);
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`)
      .limit(10);

    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAlbums();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function addAlbum(album: Album) {
    if (!selectedAlbums.find(a => a.id === album.id)) {
      setSelectedAlbums([...selectedAlbums, album]);
    }
    setSearchQuery("");
    setSearchResults([]);
  }

  function removeAlbum(albumId: string) {
    setSelectedAlbums(selectedAlbums.filter(a => a.id !== albumId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user || !title.trim() || selectedAlbums.length === 0) {
      alert("Please add a title and at least one album");
      return;
    }

    setLoading(true);

    try {
      // Create the list
      const { data: listData, error: listError } = await supabase
        .from("lists")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
        })
        .select()
        .single();

      if (listError) throw listError;

      // Add list items
      const listItems = selectedAlbums.map((album, index) => ({
        list_id: listData.id,
        album_id: album.id,
        item_order: index,
      }));

      const { error: itemsError } = await supabase
        .from("list_items")
        .insert(listItems);

      if (itemsError) throw itemsError;

      router.push(`/lists/${listData.id}`);
    } catch (error) {
      console.error("Error creating list:", error);
      alert("Failed to create list. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-[#9ab] hover:text-white transition-colors mb-4"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">Create a List</h1>
        <p className="text-[#9ab]">
          Curate your favorite albums into themed collections
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* List Details */}
        <div className="bg-[#1e2936] rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-white font-bold mb-2">
              List Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Best Indie Albums, Sad Albums, Study Music"
              className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 focus:outline-none focus:border-[#00c030]"
              required
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this list is about..."
              rows={3}
              className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 resize-none focus:outline-none focus:border-[#00c030]"
            />
          </div>
        </div>

        {/* Album Search */}
        <div className="bg-[#1e2936] rounded-lg p-6">
          <label className="block text-white font-bold mb-2">
            Add Albums *
          </label>
          
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search albums by title or artist..."
              className="w-full bg-[#2a3441] border border-[#456] text-white placeholder-[#678] rounded px-4 py-3 focus:outline-none focus:border-[#00c030]"
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-[#2a3441] border border-[#456] rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {searchResults.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => addAlbum(album)}
                    className="w-full p-3 hover:bg-[#456] transition-colors text-left flex items-center space-x-3"
                  >
                    <div className="w-12 h-12 bg-[#456] rounded flex-shrink-0 flex items-center justify-center">
                      {album.cover_url ? (
                        <Image
                          src={album.cover_url}
                          alt={album.title}
                          width={48}
                          height={48}
                          className="rounded"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {album.title[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {album.title}
                      </p>
                      <p className="text-[#9ab] text-sm truncate">
                        {album.artist}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Albums */}
          {selectedAlbums.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[#9ab] text-sm">
                {selectedAlbums.length} album{selectedAlbums.length !== 1 ? "s" : ""} added
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedAlbums.map((album) => (
                  <div key={album.id} className="relative group">
                    <div className="aspect-square bg-[#456] rounded flex items-center justify-center">
                      {album.cover_url ? (
                        <Image
                          src={album.cover_url}
                          alt={album.title}
                          width={200}
                          height={200}
                          className="rounded"
                        />
                      ) : (
                        <span className="text-white font-bold text-4xl">
                          {album.title[0]}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAlbum(album.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <p className="text-white text-sm font-medium mt-2 truncate">
                      {album.title}
                    </p>
                    <p className="text-[#9ab] text-xs truncate">
                      {album.artist}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#678]">
              <p>Search and add albums to your list</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim() || selectedAlbums.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create List"}
          </button>
        </div>
      </form>
    </div>
  );
}
