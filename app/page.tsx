"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATIC_BUSINESSES = [
  { slug: "glamour-locks", name: "Glamour Locks", owner: "Thandi", service: "Braids, Weave, Dreadlocks", price: 250, rating: 4.9, reviews: 127, image: "💇🏾‍♀️", color: "from-pink-500 to-rose-500", available: true },
  { slug: "nails-by-lisa", name: "Nails by Lisa", owner: "Lisa", service: "Acrylic, Gel, Art", price: 180, rating: 4.8, reviews: 89, image: "💅", color: "from-purple-500 to-indigo-500", available: true },
  { slug: "fade-masters", name: "Fade Masters", owner: "Sipho", service: "Fades, Cuts, Beard Trim", price: 120, rating: 4.9, reviews: 203, image: "💈", color: "from-amber-500 to-orange-500", available: true },
];

const COLORS = ["from-emerald-500 to-teal-500", "from-blue-500 to-cyan-500", "from-orange-500 to-red-500", "from-pink-500 to-violet-500"];
const EMOJIS: any = { "pet": "🐾", "grooming": "🐾", "nails": "💅", "hair": "💇🏾‍♀️", "barber": "💈", "food": "🍗" };

export default function Home() {
  const [q, setQ] = useState("");
  const [live, setLive] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("businesses").select("*");
      if (data) {
        const mapped = data.map((b: any, i: number) => ({
          slug: b.slug,
          name: b.name,
          owner: b.owner_name || b.owner || "Owner",
          service: b.category || b.service || "Services",
          price: b.base_price || 200,
          rating: 5.0,
          reviews: 1,
          image: EMOJIS[(b.category||"").toLowerCase()] || "🏪",
          color: COLORS[i % COLORS.length],
          available: true,
          isLive: true,
        }));
        setLive(mapped);
      }
    })();
  }, []);

  // merge, dedupe by slug, live wins
  const all = [...live,...STATIC_BUSINESSES].filter((v,i,a)=> a.findIndex(t=>t.slug===v.slug)===i);
  const filtered = all.filter(b => `${b.name} ${b.owner} ${b.service}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <h1 className="text-xl font-black">HustleHub <span className="text-zinc-500">Secunda</span></h1>
          <div className="flex gap-2">
            <Link href="/manager" className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">Manager</Link>
            <Link href="/api/whatsapp" className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold">Bot LIVE</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mt-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Book local.<br/>Hustle local.</h2>
          <p className="mt-3 text-zinc-400 max-w-xl">Secunda's community marketplace — braids, nails, cuts, grooming. Real-time bookings, WhatsApp confirmations.</p>
          <div className="mt-6 flex gap-2">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search braids, nails, fades, pawfect..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 outline-none focus:border-white transition" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map(b => (
            <Link key={b.slug} href={`/${b.slug}`} className="group bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 hover:border-zinc-700 transition relative">
              {b.isLive && <span className="absolute top-3 right-3 text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold">LIVE</span>}
              <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center text-3xl`}>{b.image}</div>
              <div className="mt-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">{b.name}</h3>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">● Open</span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">{b.owner} • {b.service}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-bold">R{b.price} <span className="font-normal text-zinc-500 text-sm">/ session</span></p>
                <p className="text-xs text-zinc-400">⭐ {b.rating} ({b.reviews})</p>
              </div>
              <div className="mt-4 w-full bg-white text-black text-center py-3 rounded-full font-bold group-hover:bg-zinc-200 transition">Book Now →</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
