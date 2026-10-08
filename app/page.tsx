"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BusinessCard from "@/components/BusinessCard";

const categories = [
  { id: "All", label: "✨ All" },
  { id: "Hair", label: "💇‍♀️ Hair & Beauty" },
  { id: "Barber", label: "💈 Barber" },
  { id: "Nails", label: "💅 Nails" },
  { id: "Auto", label: "🚗 Auto Care" },
  { id: "Towing", label: "🚛 Towing" },
  { id: "Pet", label: "🐶 Pet Care" },
  { id: "Handyman", label: "🔧 Handyman" },
  { id: "Cakes", label: "🍰 Custom Cakes" },
  { id: "Massage", label: "💆 Massage" },
];

export default function HomePage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });

      // DEBUG - CHECK IF SPECIALS IS COMING FROM DB
      console.log("RAW DATA FROM SUPABASE:", data);
      console.log("FIRST BUSINESS:", data?.[0]);
      console.log("FIRST BUSINESS is_special:", data?.[0]?.is_special);
      console.log("ALL SPECIALS:", data?.filter((b:any)=> b.is_special));
      if (error) console.error("SUPABASE ERROR:", error);

      setBusinesses(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = businesses.filter((b) => {
    const matchCat = filter === "All" || b.category?.toLowerCase().includes(filter.toLowerCase()) || (filter === "Auto" && b.category?.toLowerCase().includes("car"));
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-screen bg-black text-white relative z-10">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-4">
        <h1 className="text-[32px] md:text-[48px] font-black leading-[0.95] tracking-tight">
          Find & Book <br />
          <span className="text-zinc-500">Local Hustlers</span> 🎃
        </h1>
        <div className="mt-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search nails, hair, towing..." className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white placeholder-zinc-500 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-zinc-600" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 bg-[#101010] border border-[#222] px-3 py-1.5 rounded-full text-[11px] font-bold text-zinc-300">🔒 POPIA Compliant</span>
          <span className="inline-flex items-center gap-1.5 bg-[#101010] border border-[#222] px-3 py-1.5 rounded-full text-[11px] font-bold text-zinc-300">⚡ Instant WhatsApp Receipts</span>
          <span className="inline-flex items-center gap-1.5 bg-[#101010] border border-[#222] px-3 py-1.5 rounded-full text-[11px] font-bold text-zinc-300">🇿🇦 100% Verified Secunda Providers</span>
        </div>
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setFilter(cat.id)} className={`px-4 py-2.5 rounded-full text-[13px] font-black whitespace-nowrap border transition-all ${filter === cat.id? "bg-white text-black border-white" : "bg-[#1A1A1A] text-zinc-400 border-[#2A2A2A] hover:text-white"}`}>{cat.label}</button>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-10">
        {loading? <p className="text-zinc-500 text-sm animate-pulse">Loading hustlers...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        )}
      </div>
    </main>
  );
}