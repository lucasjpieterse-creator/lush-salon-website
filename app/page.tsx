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

  async function trackAndBook(b: any) {
    // log click
    await supabase.from("business_clicks").insert({ business_id: b.id, click_type: "whatsapp" });
    // open whatsapp
    const msg = `Hi! I found ${b.name} on HustleHub Secunda. I want to book.`;
    window.open(`https://wa.me/${b.whatsapp || "27"}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SeasonalDecor />
      
      <header className="p-4 flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-xl font-black">HUSTLEHUB <span className="text-zinc-500">SECUNDA</span></h1>
        <Link href="/list" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold">+ List Your Hustle</Link>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {businesses.map(b => (
          <div key={b.id} className={`p-5 rounded-[24px] border transition-all ${b.halloween_special ? "bg-orange-950/30 border-orange-500 shadow-[0_0_25px_rgba(255,100,0,0.3)]" : "bg-zinc-900 border-zinc-800"}`}>
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{b.name} {b.halloween_special && "🎃"}</h3>
                <p className="text-xs text-zinc-500 mt-1">{b.category} • Open Now</p>
                {b.halloween_special && b.special_price_text && (
                  <p className="mt-2 text-sm font-black text-orange-400 bg-orange-600/20 border border-orange-600/30 inline-block px-3 py-1 rounded-full">{b.special_price_text}</p>
                )}
              </div>
              <p className="font-bold">R{b.base_price || "?"}</p>
            </div>
            <button onClick={() => trackAndBook(b)} className={`mt-4 w-full py-3 rounded-full font-bold text-sm ${b.halloween_special ? "bg-orange-600 text-white" : "bg-white text-black"}`}>
              Book on WhatsApp →
            </button>
          </div>
        ))}
      </main>

      <Link href="/ceo" className="fixed bottom-4 left-4 text-[10px] text-zinc-700">CEO</Link>
    </div>
  );
}