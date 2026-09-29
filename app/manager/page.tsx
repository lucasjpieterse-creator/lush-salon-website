"use client";
import Link from "next/link";

const businesses = [
  { slug: "glamour-locks", name: "Glamour Locks", owner: "Thandi", today: 3, revenue: "R750", color: "from-pink-500 to-rose-500" },
  { slug: "nails-by-lisa", name: "Nails by Lisa", owner: "Lisa", today: 2, revenue: "R360", color: "from-purple-500 to-indigo-500" },
  { slug: "fade-masters", name: "Fade Masters", owner: "Sipho", today: 5, revenue: "R600", color: "from-amber-500 to-orange-500" },
];

export default function ManagerHub() {
  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-6xl mx-auto">
      <Link href="/" className="text-sm text-zinc-400">← Back to HustleHub</Link>

      <h1 className="text-3xl font-black mt-6">Manager Hub</h1>
      <p className="text-zinc-400 mt-2">All HustleHub Secunda businesses</p>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {businesses.map(b => (
          <Link key={b.slug} href={`/${b.slug}/manager`} className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-5 hover:border-zinc-600 transition">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center font-bold`}>{b.owner[0]}</div>
            <h3 className="font-bold mt-4">{b.name}</h3>
            <p className="text-sm text-zinc-400">{b.owner}</p>
            <div className="flex justify-between mt-4 text-sm">
              <span className="text-zinc-500">{b.today} today</span>
              <span className="font-bold">{b.revenue}</span>
            </div>
            <div className="mt-4 bg-white text-black text-center py-2.5 rounded-full text-sm font-bold">Open →</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className="text-xs bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-zinc-400">← Back to Marketplace</Link>
      </div>
    </div>
  );
}