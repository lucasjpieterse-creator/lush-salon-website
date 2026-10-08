"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Business = {
  id: string;
  name: string;
  category: string;
  phone: string;
  area: string;
  is_verified: boolean;
  is_special: boolean;
  created_at: string;
};

export default function CEOPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
      if (data) setBusinesses(data);
      setLoading(false);
    };
    fetchBusinesses();
  }, []);

  const toggleField = async (id: string, field: "is_verified" | "is_special", current: boolean) => {
    const { error } = await supabase.from("businesses").update({ [field]:!current }).eq("id", id);
    if (!error) {
      setBusinesses((prev) => prev.map((b) => (b.id === id? {...b, [field]:!current } : b)));
    }
  };

  const filtered = businesses.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading CEO...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-cyan-500/30 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-cyan-400">CEO://DASHBOARD</h1>
            <p className="text-zinc-500 text-xs mt-1">VERIFIED={businesses.filter(b=>b.is_verified).length} • SPECIALS={businesses.filter(b=>b.is_special).length}</p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH HUSTLERS..."
            className="bg-zinc-900 border border-zinc-700 rounded-full px-5 py-2 text-sm w-full md:w-72 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((business) => (
            <div
              key={business.id}
              className={`relative rounded-2xl p-5 border transition-all ${
                business.is_special? "border-orange-500 bg-orange-500/10 shadow-[0_0_30px_rgba(255,77,0,0.3)]" : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              {business.is_special && (
                <div className="absolute -top-2 -right-2 bg-[#FF4D00] text-black text-[9px] font-black px-2 py-1 rounded-full animate-pulse">🔥 SPECIAL LIVE</div>
              )}
              <h3 className="font-bold text-[15px]">{business.name}</h3>
              <p className="text-[11px] text-zinc-500 mt-1">{business.category} • {business.area}</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between bg-black/50 rounded-full px-3 py-2 border border-white/5">
                  <span className="text-[10px] font-black tracking-widest text-zinc-400">VERIFIED</span>
                  <button onClick={() => toggleField(business.id, "is_verified", business.is_verified)} className={`w-11 h-6 rounded-full p-1 flex items-center transition-all ${business.is_verified? "bg-green-500 justify-end" : "bg-zinc-700 justify-start"}`}>
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-black/50 rounded-full px-3 py-2 border border-white/5">
                  <span className="text-[10px] font-black tracking-widest text-orange-300">SPECIALS 🔥</span>
                  <button onClick={() => toggleField(business.id, "is_special", business.is_special)} className={`w-11 h-6 rounded-full p-1 flex items-center transition-all ${business.is_special? "bg-[#FF4D00] justify-end" : "bg-zinc-700 justify-start"}`}>
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}