"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const CEO_PASSWORD = "secunda2024";
const DEFAULT_SPECIALS: any = { Barber:"R130 FADE + DESIGN", Salon:"R180 BRAIDS SPECIAL", Braids:"R180 BRAIDS SPECIAL", Nails:"R120 NAILS + ART", "Dog Parlor":"R150 WASH + CUT", Other:"HALLOWEEN SPECIAL" };

export default function CEOPage() {
  const [auth,setAuth]=useState(false); const [pw,setPw]=useState(""); const [businesses,setBusinesses]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{ if(localStorage.getItem("ceo_auth")==="yes") setAuth(true); fetchBiz(); },[]);
  async function fetchBiz(){
    const { data: biz } = await supabase.from("businesses").select("*").order("created_at",{ascending:false});
    const { data: clicks } = await supabase.from("business_clicks").select("business_id");
    const countMap:any={}; clicks?.forEach((c:any)=>{ countMap[c.business_id]=(countMap[c.business_id]||0)+1; });
    setBusinesses(biz?.map((b:any)=>({ ...b, clicks: countMap[b.id]||0 }))||[]); setLoading(false);
  }
  async function toggleSpecial(b:any){
    if(!b.halloween_special){
      const suggested=DEFAULT_SPECIALS[b.category]||`R${b.base_price||120} SPECIAL`;
      const custom=prompt(`What special for ${b.name}?`, b.special_price_text||suggested); if(custom===null) return;
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
  const specials=businesses.filter(b=>b.halloween_special).length;
  const totalClicks=businesses.reduce((s,b)=>s+b.clicks,0);
  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center"><h1 className="text-3xl font-black">CEO Dashboard 👑</h1><Link href="/" className="bg-zinc-800 px-4 py-2 rounded-full text-sm">View Site</Link></div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-[10px]">TOTAL HUSTLES</p><p className="text-2xl font-bold mt-1">{businesses.length}</p></div>
        <div className="bg-orange-600/10 border border-orange-600/30 p-4 rounded-2xl"><p className="text-orange-300 text-[10px]">HALLOWEEN SPECIALS</p><p className="text-2xl font-bold mt-1">{specials}</p><p className="text-[10px] text-orange-400 mt-1">R50 each = R{specials*50} revenue</p></div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-[10px]">TOTAL CLICKS</p><p className="text-2xl font-bold mt-1">{totalClicks}</p><p className="text-[10px] text-zinc-600 mt-1">WhatsApp leads</p></div>
      </div>
      <div className="mt-8 grid gap-3">
        {businesses.map(b=>(
          <div key={b.id} className={`flex items-center justify-between p-4 rounded-2xl border ${b.halloween_special?"bg-orange-950/20 border-orange-600":"bg-zinc-900 border-zinc-800"}`}>
            <div><p className="font-bold text-sm">{b.name} {b.halloween_special && <span className="text-orange-400">🎃 {b.special_price_text}</span>}</p><p className="text-xs text-zinc-500">{b.category} • {b.clicks} clicks • R{b.base_price||"?"}</p></div>
            <button onClick={()=>toggleSpecial(b)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${b.halloween_special?"bg-orange-600 text-white":"bg-white text-black"}`}>{b.halloween_special?"ON - Edit/Off":"Turn ON Special"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}