"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManagerHub() {
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
      setBusinesses(data || []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black">Manager Hub</h1>
      <p className="text-zinc-500 text-sm mt-1">Select a business to manage bookings & QR</p>

      <div className="mt-6 grid gap-3">
        {businesses.map((b) => (
          <Link key={b.id} href={`/manager/${b.slug}`} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4 flex justify-between items-center hover:border-zinc-600 transition">
            <div>
              <p className="font-bold">{b.name}</p>
              <p className="text-zinc-500 text-xs">{b.slug} • {b.category}</p>
            </div>
            <span className="text-xs bg-white text-black px-3 py-1 rounded-full font-bold">Manage →</span>
          </Link>
        ))}
        {businesses.length === 0 && <p className="text-zinc-600 text-sm">No businesses yet.</p>}
      </div>
    </div>
  );
}