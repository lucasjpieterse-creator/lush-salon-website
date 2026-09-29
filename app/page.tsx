"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [q, setQ] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("businesses").select("*");
      if (data) setBusinesses(data);
    })();
  }, []);

  const filtered = businesses.filter(b =>
    `${b.name} ${b.slug}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <h1 className="text-xl font-black">HustleHub <span className="text-zinc-500">Secunda</span></h1>
          <Link href="/manager" className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">Manager</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <h2 className="text-4xl font-black mt-6">Book local.<br/>Hustle local.</h2>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="mt-6 w-full bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 outline-none" />
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {filtered.map((b:any) => (
            <Link key={b.slug} href={`/${b.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5">
              <div className="h-20 w-20 rounded-2xl bg-white text-black flex items-center justify-center text-3xl">🏪</div>
              <h3 className="font-bold text-lg mt-4">{b.name}</h3>
              <p className="text-sm text-zinc-400">{b.category}</p>
              <p className="mt-3 font-bold">R{b.base_price || 200} / session</p>
              <div className="mt-4 w-full bg-white text-black text-center py-3 rounded-full font-bold">Book Now →</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
