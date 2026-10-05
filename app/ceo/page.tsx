"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CEO_PASSWORD = "secunda2024";
const DEFAULT_SPECIALS: any = {
  Barber: "R130 FADE + DESIGN",
  Salon: "R180 BRAIDS SPECIAL",
  Braids: "R180 BRAIDS SPECIAL",
  Nails: "R120 NAILS + ART",
  "Pet Grooming": "R150 WASH + CUT",
  "Dog Parlor": "R150 WASH + CUT",
  Other: "HALLOWEEN SPECIAL"
};

export default function CEOPage() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(localStorage.getItem("ceo_auth")==="yes") setAuth(true);
    fetchBiz();
  }, []);

  async function fetchBiz() {
    const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
    if(data) setBusinesses(data);
    setLoading(false);
  }

  async function toggleSpecial(b: any) {
    if(!b.halloween_special){
      const suggested = DEFAULT_SPECIALS[b.category] || `R${b.base_price||120} SPECIAL`;
      const custom = prompt(`What special for ${b.name}?`, b.special_price_text || suggested);
      if(custom===null) return;
      await supabase.from("businesses").update({ halloween_special:true, special_price_text: custom }).eq("id", b.id);
    } else {
      await supabase.from("businesses").update({ halloween_special:false, special_price_text: null }).eq("id", b.id);
    }
    fetchBiz();
  }

  if(!auth) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm">
        <h1 className="text-2xl font-black">CEO Login</h1>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" className="mt-6 w-full bg-black border border-zinc-800 p-3 rounded-xl" />
        <button onClick={()=>{ if(pw===CEO_PASSWORD){ localStorage.setItem("ceo_auth","yes"); setAuth(true);} else alert("Wrong"); }} className="mt-4 w-full bg-white text-black p-3 rounded-full font-bold">Enter →</button>
      </div>
    </div>
  );

  const specials = businesses.filter(b=>b.halloween_special).length;

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">CEO Dashboard 👑</h1>
        <div className="flex gap-2">
          <Link href="/" className="bg-zinc-800 px-4 py-2 rounded-full text-sm">View Site</Link>
          <button onClick={()=>{localStorage.removeItem("ceo_auth"); setAuth(false); setAuth(false)}} className="bg-red-900/40 border border-red-800 px-4 py-2 rounded-full text-sm">Logout</button>
        </div>
      </div>

      {/* TOTALS BACK */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-[10px] uppercase tracking-widest">Total Hustles</p><p className="text-2xl font-bold mt-1">{businesses.length}</p></div>
        <div className="bg-orange-600/10 border border-orange-600/30 p-4 rounded-2xl"><p className="text-orange-300 text-[10px] uppercase tracking-widest">Halloween Specials</p><p className="text-2xl font-bold mt-1">{specials}</p><p className="text-[10px] text-orange-400 mt-1">R50 each = R{specials*50} revenue</p></div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-[10px] uppercase tracking-widest">Open Now</p><p className="text-2xl font-bold mt-1">{businesses.length}</p><p className="text-[10px] text-zinc-600 mt-1">All live</p></div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold">Manage Specials</h2>
        <p className="text-xs text-zinc-500 mt-1">Click ON to edit text. OFF removes glow. Your screenshot now shows Fade = R130, Glamour = R180 = CORRECT ✅</p>
        <div className="mt-4 grid gap-3">
          {loading? <p className="text-zinc-500">Loading...</p> : businesses.map(b=>(
            <div key={b.id} className={`flex items-center justify-between p-4 rounded-2xl border ${b.halloween_special? "bg-orange-950/20 border-orange-600" : "bg-zinc-900 border-zinc-800"}`}>
              <div>
                <p className="font-bold text-sm md:text-base">{b.name} {b.halloween_special && <span className="text-orange-400">🎃 {b.special_price_text}</span>}</p>
                <p className="text-xs text-zinc-500">{b.category} • R{b.base_price || "?"}</p>
              </div>
              <button onClick={()=>toggleSpecial(b)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${b.halloween_special? "bg-orange-600 text-white" : "bg-white text-black"}`}>
                {b.halloween_special? "ON - Edit/Off" : "Turn ON Special"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}