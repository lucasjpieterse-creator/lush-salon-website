"use client";
import { useState } from "react";
import Link from "next/link";

const BUSINESSES = [
  { slug: "glamour-locks", name: "Glamour Locks", owner: "Thandi", service: "Braids, Weave, Dreadlocks", price: 250, rating: 4.9, reviews: 127, image: "💇🏾‍♀️", color: "from-pink-500 to-rose-500", available: true },
  { slug: "nails-by-lisa", name: "Nails by Lisa", owner: "Lisa", service: "Acrylic, Gel, Art", price: 180, rating: 4.8, reviews: 89, image: "💅", color: "from-purple-500 to-indigo-500", available: true },
  { slug: "fade-masters", name: "Fade Masters", owner: "Sipho", service: "Fades, Cuts, Beard Trim", price: 120, rating: 4.9, reviews: 203, image: "💈", color: "from-amber-500 to-orange-500", available: true },
];

export default function Home() {
  const [q, setQ] = useState("");
  const filtered = BUSINESSES.filter(b =>
    `${b.name} ${b.owner} ${b.service}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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
        {/* Hero */}
        <div className="mt-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Book local.<br/>Hustle local.</h2>
          <p className="mt-3 text-zinc-400 max-w-xl">Secunda's community marketplace — braids, nails, cuts. Real-time bookings, WhatsApp confirmations.</p>

          <div className="mt-6 flex gap-2">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search braids, nails, fades..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 outline-none focus:border-white transition" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map(b => (
            <Link key={b.slug} href={`/${b.slug}`} className="group bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 hover:border-zinc-700 transition">
              <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center text-3xl`}>{b.image}</div>
              <div className="mt-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">{b.name}</h3>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">● {b.available? 'Open' : 'Closed'}</span>
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

        <div className="mt-10 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-center text-xs text-zinc-500">
          API: <span className="text-white">/api/whatsapp</span> ✅ | Webhook: <span className="text-white">/api/whatsapp/webhook</span> ✅ | Chickens bot ready for orders
        </div>
      </main>
    </div>
  );
}