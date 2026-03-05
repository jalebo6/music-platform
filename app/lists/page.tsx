"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

interface List {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  users: {
    name: string;
    avatar_url: string;
  };
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  async function fetchLists() {
    const { data } = await supabase
      .from("lists")
      .select(
        `
        *,
        users (name, avatar_url)
      `
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setLists(data as any);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Music Lists</h1>
        <p className="text-[#9ab]">Curated collections from the community</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="spinner h-12 w-12"></div>
        </div>
      )}

      {!loading && lists.length === 0 && (
        <div className="text-center py-16 bg-[#1e2936] rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-[#9ab] text-lg mb-4">No public lists yet</p>
          <button className="bg-[#00c030] hover:bg-[#00e054] text-[#14181c] font-bold py-3 px-6 rounded-lg transition-all">
            Create Your First List
          </button>
        </div>
      )}

      {!loading && lists.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {lists.map((list) => (
            <Link key={list.id} href={`/list/${list.id}`} className="group">
              <div className="relative aspect-square bg-[#2a3441] rounded-lg overflow-hidden mb-3 group-hover:ring-2 group-hover:ring-[#00c030] transition-all">
                {list.cover_url ? (
                  <Image src={list.cover_url} alt={list.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-6xl">📋</div>
                )}
              </div>
              <h3 className="font-bold text-white text-sm mb-1 truncate group-hover:text-[#00c030] transition-colors">
                {list.title}
              </h3>
              <p className="text-xs text-[#9ab] truncate">by {list.users?.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
