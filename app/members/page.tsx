"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
}

export default function MembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setUsers(data);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Members</h1>
        <p className="text-[#9ab]">Discover music lovers in the community</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="spinner h-12 w-12"></div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <Link key={user.id} href={`/profile/${user.id}`}>
              <div className="bg-[#1e2936] rounded-lg p-6 hover:bg-[#2a3441] transition-all text-center">
                <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-[#456]">
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-3xl font-bold text-white">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-white mb-2">{user.name}</h3>
                {user.bio && <p className="text-sm text-[#9ab] line-clamp-2 mb-4">{user.bio}</p>}
                <button className="w-full bg-[#00c030] hover:bg-[#00e054] text-[#14181c] font-semibold py-2 px-4 rounded transition-all">
                  View Profile
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
