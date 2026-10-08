"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CEOPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
      setBusinesses(data || []);
      setLoading(false);
    })();
  }, []);

  const toggle = async (id: string, field: string) => {
    const current = businesses.find(b => b.id === id);
    if (!current) return;
    const newVal =!current[field];

    // optimistic move
    setBusinesses(prev => prev.map(b => b.id === id? {...b, [field]: newVal } : b));

    const { error } = await supabase.from("businesses").update({ [field]: newVal }).eq("id", id);
    if (error) {
      console.error(error);
      setBusinesses(prev => prev.map(b => b.id === id? {...b, [field]:!newVal } : b));
      alert("Failed to update: " + error.message + " - Run SQL to add column");
    }
  };

  const filtered = businesses.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">LOADING CEO...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between gap-4 mb-8 border-b border-cyan-500/20 pb-6">
          <div>
            <h1 className="text-4xl font-black text-cyan-400">CEO://DASHBOARD</h1>
            <p className="text-zinc-500 text-xs mt-2">TOTAL:{businesses.length} • SPECIALS:{businesses.filter(b=>b.is_special).length} • VIEWS:{businesses.reduce((s,b)=>s+(b.views||0),0)} • ERRORS:{businesses.reduce((s,b)=>s+(b.errors||0),0)}</p>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="SEARCH..." className="bg-zinc-900 border border-zinc-700 rounded-full px-5 py-2 text-sm w-72"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.id} className={`relative rounded-2xl p-5 border ${b.is_special? "border-[#FF4D00] bg-orange-500/10 shadow-[0_0_30px_rgba(255,77,0,0.25)]" : "border-zinc-800 bg-zinc-900/60"}`}>
              {b.is_special && <div className="absolute -top-2 -right-2 bg-[#FF4D00] text-black text-[9px] font-black px-2 py-1 rounded-full animate-pulse">🔥 SPECIAL LIVE</div>}
              <h3 className="font-bold">{b.name}</h3>
              <p className="text-[11px] text-zinc-500">{b.category} • {b.area}</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-[11px]">
                <div className="bg-black/50 rounded-lg p-2 text-center border border-white/5"><p className="text-zinc-500 text-[9px]">VISITS</p><p className="font-bold">{b.views || 0}</p></div>
                <div className="bg-black/50 rounded-lg p-2 text-center border border-white/5"><p className="text-zinc-500 text-[9px]">BOOKS</p><p className="font-bold">{b.bookings || 0}</p></div>
                <div className="bg-black/50 rounded-lg p-2 text-center border border-white/5"><p className="text-zinc-500 text-[9px]">ERRORS</p><p className="font-bold text-red-400">{b.errors || 0}</p></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between bg-black/60 rounded-full px-3 py-2 border border-white/5">
                  <span className="text-[10px]">VERIFIED</span>
                  <button type="button" onClick={()=>toggle(b.id, "is_verified")} className={`w-11 h-6 rounded-full p-1 flex items-center transition-all ${b.is_verified? "bg-green-500 justify-end" : "bg-zinc-700 justify-start"}`}><div className="w-4 h-4 bg-white rounded-full"/></button>
                </div>
                <div className="flex justify-between bg-black/60 rounded-full px-3 py-2 border border-orange-500/20">
                  <span className="text-[10px] text-orange-300">SPECIALS 🔥</span>
                  <button type="button" onClick={()=>toggle(b.id,"is_special")} className={`w-11 h-6 rounded-full p-1 flex items-center transition-all ${b.is_special? "bg-[#FF4D00] justify-end" : "bg-zinc-700 justify-start"}`}><div className="w-4 h-4 bg-white rounded-full"/></button>
                </div>
              </div>
              <a href={`/${b.slug || b.id}`} target="_blank" className="mt-3 block text-center text-[10px] text-zinc-500 border border-white/10 rounded-full py-2">VIEW LIVE →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}