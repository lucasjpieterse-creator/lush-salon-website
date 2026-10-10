"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManagerHub() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinesses() {
      const { data, error } = await supabase.from("businesses").select("*");
      if (error) console.error("Error loading businesses:", error);
      setBusinesses(data || []);
      setLoading(false);
    }
    fetchBusinesses();
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white p-10 font-bold">Loading portal...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black">HustleHub Manager Portal</h1>
      <p className="text-zinc-500 text-sm mt-1">Select your business to view bookings and manage clients.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {businesses.map((biz) => (
          <div key={biz.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{biz.name}</h2>
                <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Slug: {biz.slug}</p>
              <p className="text-[11px] text-zinc-600 font-mono mt-1 break-all">ID: {biz.id}</p>
            </div>

            <div className="mt-6 flex gap-2">
              <Link
                href={`/manager/${biz.slug || biz.id}`}
                className="w-full text-center bg-white text-black font-bold text-xs py-3 rounded-full hover:bg-zinc-200 transition"
              >
                Open Dashboard →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}