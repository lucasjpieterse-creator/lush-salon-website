"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import SeasonalFrame from "@/components/SeasonalFrame";
import SeasonalDecor from "@/components/SeasonalDecor";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const META: any = {
  "pawfect-parlor": { image: "🐾", color: "from-emerald-500 to-teal-500", owner: "Megan", service: "Pet Grooming • Wash, Cut", price: 200 },
  "glamour-locks": { image: "💇🏾‍♀️", color: "from-pink-500 to-rose-500", owner: "Thandi", service: "Braids, Weave, Dreadlocks", price: 250 },
  "nails-by-lisa": { image: "💅", color: "from-purple-500 to-indigo-500", owner: "Lisa", service: "Acrylic, Gel, Art", price: 180 },
  "fade-masters": { image: "💈", color: "from-amber-500 to-orange-500", owner: "Sipho", service: "Fades, Cuts, Beard Trim", price: 120 },
};

export default function Home() {
  const [q, setQ] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [showSpecialsOnly, setShowSpecialsOnly] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("businesses").select("*").eq("status", "approved").order("name");
      if (data) setBusinesses(data);
      else {
        const { data: all } = await supabase.from("businesses").select("*");
        if (all) setBusinesses(all);
      }
    })();
  }, []);

  const filtered = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(q.toLowerCase());
    const matchesSpecial = showSpecialsOnly? b.halloween_special : true;
    return matchesSearch && matchesSpecial;
  });

  const specialsCount = businesses.filter(b => b.halloween_special).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <SeasonalDecor />

      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <h1 className="text-xl font-black">HustleHub <span className="text-zinc-500">Secunda</span></h1>
          <div className="flex items-center gap-2">
            <Link href="/join" className="text-xs bg-white text-black px-4 py-1.5 rounded-full font-bold">+ List Your Hustle</Link>
            <Link href="/pawfect-parlor/manager" className="text-xs bg-zinc-800 text-white px-3 py-1.5 rounded-full font-bold border border-zinc-700">Manager</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mt-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Book local.<br/>Hustle local.</h2>
          <p className="mt-3 text-zinc-400 max-w-xl">Secunda's marketplace — real-time bookings, WhatsApp confirmations.</p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search braids, nails, pawfect..." className="flex-1 min-w-[220px] bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 outline-none focus:border-white transition" />
            {specialsCount > 0 && (
              <button onClick={()=>setShowSpecialsOnly(!showSpecialsOnly)} className={`px-5 py-3 rounded-full font-bold text-sm border transition ${showSpecialsOnly? "bg-orange-600 border-orange-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-300"}`}>
                🎃 Halloween Specials ({specialsCount})
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map(b => {
            const m = META[b.slug] || { image: "🏪", color: "from-zinc-700 to-zinc-800", owner: b.owner_name || "Owner", service: b.category, price: b.base_price || b.price_text || 100 };
            return (
              <SeasonalFrame key={b.slug} hasSpecial={b.halloween_special} badgeText={b.special_price_text || "HALLOWEEN SPECIAL"}>
                <Link href={`/${b.slug}`} className="group bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 hover:border-zinc-700 transition block">
                  <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-3xl`}>{m.image}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <h3 className="font-bold text-lg">{b.name}</h3>
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">● Open</span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{m.owner} • {m.service}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold">R{m.price} <span className="font-normal text-zinc-500 text-sm">/ session</span></p>
                    <p className="text-xs text-zinc-400">⭐ 5.0 (1)</p>
                  </div>
                  <div className="mt-4 w-full bg-white text-black text-center py-3 rounded-full font-bold group-hover:bg-zinc-200 transition">Book Now →</div>
                </Link>
              </SeasonalFrame>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-zinc-500">No hustles found {showSpecialsOnly? "with Halloween specials" : ""}. Try another search.</div>
        )}
      </main>
    </div>
  );
}