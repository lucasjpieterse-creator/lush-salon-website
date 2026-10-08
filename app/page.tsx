"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import SeasonalDecor from "@/components/SeasonalDecor";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => { fetchBiz(); }, []);

  async function fetchBiz() {
    const { data } = await supabase.from("businesses").select("*").order("created_at");
    if (data) setBusinesses(data);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SeasonalDecor />

      <header className="p-4 flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-xl font-black tracking-tight">HUSTLEHUB <span className="text-zinc-500">SECUNDA</span></h1>
        <div className="flex gap-2">
          <Link href="/manager" className="bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-full text-xs font-bold border border-zinc-700">Manager Login</Link>
          <Link href="/join" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold">+ List Your Hustle</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {businesses.map(b => (
          <Link key={b.id} href={`/${b.slug}`} className={`p-5 rounded-[24px] border transition-all block ${b.halloween_special? "bg-orange-950/30 border-orange-500 shadow-[0_0_30px_rgba(255,100,0,0.35)]" : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-[17px]">{b.name} {b.halloween_special && "🎃"}</h3>
                <p className="text-xs text-zinc-500 mt-1">{b.category} • Open Now</p>
                {b.halloween_special && b.special_price_text && (
                  <p className="mt-2.5 text-[13px] font-black tracking-wide text-orange-400 bg-orange-600/20 border border-orange-600/30 inline-block px-3 py-1 rounded-full">
                    {b.special_price_text}
                  </p>
                )}
              </div>
              {b.base_price && <p className="font-bold text-sm">R{b.base_price}</p>}
            </div>
            <div className={`mt-4 w-full py-3.5 rounded-full font-bold text-[14px] text-center ${b.halloween_special? "bg-[#ff4d00] text-white" : "bg-white text-black"}`}>
              View Services →
            </div>
          </Link>
        ))}
      </main>

      <div className="fixed bottom-4 left-4 flex gap-2">
        <Link href="/ceo" className="bg-zinc-900 border border-zinc-800 text-zinc-600 text-[11px] px-3 py-1.5 rounded-full">CEO 👑</Link>
      </div>
    </div>
  );
}