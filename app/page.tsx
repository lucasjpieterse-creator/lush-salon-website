"use client";
import { useEffect, useState } from "react";
import BusinessCard from "../components/BusinessCard";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const categories = [{ label: "All", icon: "✨" },{ label: "Salon", icon: "💇" },{ label: "Nails", icon: "💅" },{ label: "Pet Grooming", icon: "🐶" },{ label: "Car Wash", icon: "🚗" },{ label: "Massage", icon: "💆" },];

export default function HomePage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false }); setBusinesses(data || []); setLoading(false); })(); }, []);

  const filtered = businesses.filter((b) => {
    const cat = (b.category || "").toLowerCase();
    return (active === "All" || cat.includes(active.toLowerCase())) && (b.name || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-[28px] font-extrabold tracking-tight">Find trusted pros in Secunda 🎃</h1>
        <p className="text-sm text-white/60 mt-1">Verified • Instant booking • Deposit protected 🦇</p>
        <div className="relative my-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search salon, nails, car wash..." className="w-full bg-white text-black border rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-[#FF4D00] placeholder:text-black/50 font-medium" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-3">
          {categories.map((cat) => (
            <button key={cat.label} onClick={() => setActive(cat.label)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-all ${active === cat.label? "bg-white text-black border-white" : "bg-white/10 text-white border-white/20"}`}>{cat.icon} {cat.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filtered.map((biz) => <BusinessCard key={biz.id} business={biz} />)}
        </div>
      </div>
    </main>
  );
}