"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BusinessCard from "@/components/BusinessCard";
import HalloweenFloaties from "@/components/HalloweenFloaties";

const categories = ["All", "Nails", "Hair", "Barber", "Massage", "Towing", "Makeup", "Photography"];

export default function HomePage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
      setBusinesses(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = businesses.filter((b) => {
    const matchCat = filter === "All" || b.category?.toLowerCase().includes(filter.toLowerCase());
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-screen bg-black text-white relative">
      <HalloweenFloaties />

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6 relative z-10">
        <h1 className="text-[32px] md:text-[42px] font-black leading-tight text-white">
          Find & Book <br />
          <span className="text-zinc-500">Local Hustlers</span> 🎃
        </h1>
        <p className="text-zinc-500 text-sm mt-3">Secunda • Evander • Trichardt • Verified businesses only</p>

        {/* SEARCH */}
        <div className="mt-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nails, hair, towing..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white placeholder-zinc-500 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* CATEGORIES */}
        <div className="flex gap-2 mt-5 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap border transition ${
                filter === cat? "bg-white text-black border-white" : "bg-[#1A1A1A] text-zinc-400 border-[#2A2A2A] hover:text-white hover:border-zinc-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto px-6 pb-10 relative z-10">
        {loading? (
          <p className="text-zinc-500 text-sm">Loading hustlers...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && <p className="text-zinc-500 mt-8 text-sm text-center">No businesses found for "{search || filter}"</p>}
      </div>

      {/* FOOTER - Legal Links */}
      <footer className="mt-16 bg-[#0a0a0a] border-t border-[#1A1A1A] py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-white font-bold text-sm">HustleHub Secunda 🎃</p>
            <p className="text-zinc-500 text-xs mt-1">Secunda • Evander • Trichardt</p>
          </div>

          <div className="flex gap-6 text-xs">
            <a href="/terms" className="text-zinc-400 hover:text-white transition underline">Terms & Conditions</a>
            <a href="/privacy" className="text-zinc-400 hover:text-white transition underline">Privacy Policy (POPIA)</a>
            <a href="mailto:support@hustlehubsecunda.co.za" className="text-zinc-400 hover:text-white transition">Support</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-6 text-center">
          <p className="text-[10px] text-zinc-600">© 2026 HustleHub Secunda. All bookings processed via WhatsApp Business API. Secured by Supabase.</p>
        </div>
      </footer>
    </main>
  );
}