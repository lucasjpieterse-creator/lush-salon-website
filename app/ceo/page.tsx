"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CEO_PASSWORD = "secunda2024"; // change this

export default function CEOPage() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(localStorage.getItem("ceo_auth") === "yes") setAuth(true);
    fetchBiz();
  }, []);

  async function fetchBiz() {
    const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
    if(data) setBusinesses(data);
    setLoading(false);
  }

  async function toggleSpecial(b: any) {
    const { error } = await supabase.from("businesses").update({
      halloween_special:!b.halloween_special,
      special_price_text: b.halloween_special? null : "R130 FADE + DESIGN"
    }).eq("id", b.id);
    if(!error) fetchBiz();
  }

  async function deleteBiz(id: string) {
    if(!confirm("Delete this business?")) return;
    await supabase.from("businesses").delete().eq("id", id);
    fetchBiz();
  }

  if(!auth) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm">
        <h1 className="text-2xl font-black">CEO Login</h1>
        <p className="text-zinc-500 text-sm mt-1">Only for HustleHub owner</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" className="mt-6 w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none" />
        <button onClick={()=>{ if(pw===CEO_PASSWORD){ localStorage.setItem("ceo_auth","yes"); setAuth(true);} else alert("Wrong password"); }} className="mt-4 w-full bg-white text-black p-3 rounded-full font-bold">Enter →</button>
        <Link href="/" className="text-xs text-zinc-600 mt-4 block text-center">← Back to site</Link>
      </div>
    </div>
  );

  const specials = businesses.filter(b=>b.halloween_special).length;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">CEO Dashboard 👑</h1>
        <div className="flex gap-2">
          <Link href="/" className="bg-zinc-800 px-4 py-2 rounded-full text-sm">View Site</Link>
          <button onClick={()=>{localStorage.removeItem("ceo_auth"); setAuth(false)}} className="bg-red-900/50 border border-red-800 px-4 py-2 rounded-full text-sm">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-xs">Total Hustles</p><p className="text-2xl font-bold">{businesses.length}</p></div>
        <div className="bg-orange-600/10 border border-orange-600/30 p-4 rounded-2xl"><p className="text-orange-300 text-xs">Halloween Specials</p><p className="text-2xl font-bold">{specials}</p><p className="text-[10px] text-orange-400 mt-1">R50 each = R{specials*50}</p></div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-xs">New Applications</p><p className="text-2xl font-bold">{businesses.filter(b=>!b.slug).length || "0"}</p></div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-lg">All Businesses - Toggle Special</h2>
        <div className="mt-4 grid gap-3">
          {loading? <p className="text-zinc-500">Loading...</p> : businesses.map(b=>(
            <div key={b.id} className={`flex items-center justify-between p-4 rounded-2xl border ${b.halloween_special? "bg-orange-950/30 border-orange-600" : "bg-zinc-900 border-zinc-800"}`}>
              <div>
                <p className="font-bold">{b.name} {b.halloween_special && "🎃"}</p>
                <p className="text-xs text-zinc-500">{b.category} • {b.owner_name} • R{b.base_price || b.price_text || "?"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>toggleSpecial(b)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${b.halloween_special? "bg-orange-600 text-white" : "bg-white text-black"}`}>
                  {b.halloween_special? "★ Special ON" : "Turn ON Special"}
                </button>
                <button onClick={()=>deleteBiz(b.id)} className="bg-zinc-800 px-3 py-1.5 rounded-full text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <h3 className="font-bold">How to sell Specials 💰</h3>
        <p className="text-sm text-zinc-400 mt-2">Go to any barber/salon: "For R50 I put orange glow + 🎃 badge on your card for Halloween month. You pop first when people search. Everyone will click you first." Show them Fade Masters screenshot.</p>
      </div>
    </div>
  );
}