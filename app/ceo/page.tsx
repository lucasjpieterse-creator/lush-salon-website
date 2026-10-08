"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CEOPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (authed) {
      supabase.from("businesses").select("*").order("created_at", { ascending: false }).then(({ data }) => setBusinesses(data || []));
      supabase.from("bookings").select("*").then(({ data }) => setBookings(data || []));
    }
  }, [authed]);

  const login = () => {
    if (pass === "HustleCEO2026!") setAuthed(true);
    else alert("Wrong CEO key");
  };

  const getIssues = (b: any) => {
    const issues = [];
    if (!b.image_url &&!b.image) issues.push("No image");
    if (!b.whatsapp || b.whatsapp.length < 10) issues.push("WhatsApp invalid");
    if (!b.slug) issues.push("No slug");
    if (!b.business_password) issues.push("No manager pass");
    const count = bookings.filter((bk) => bk.business_id === b.id).length;
    if (count === 0) issues.push("0 bookings yet");
    return issues;
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-6 font-mono">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,255,255,0.15),transparent_60%)]" />
        <div className="relative w-full max-w-sm border border-cyan-400/30 bg-black/80 backdrop-blur p-8 rounded-none shadow-[0_0_40px_rgba(0,255,255,0.15)]">
          <div className="text-[10px] text-cyan-400 tracking-[0.4em]">HUSTLEHUB // CEO_ROOT</div>
          <h1 className="mt-3 text-2xl font-black text-white tracking-tight">CEO_ACCESS.exe</h1>
          <p className="text-[11px] text-zinc-500 mt-1">Cyberpunk private node. No themes. Only you.</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="ENTER KEY" className="mt-6 w-full bg-transparent border border-cyan-400/30 text-cyan-300 px-4 py-3 text-sm tracking-widest focus:outline-none focus:border-cyan-400" />
          <button onClick={login} className="mt-3 w-full bg-cyan-400 text-black font-black py-3 text-sm tracking-widest hover:bg-cyan-300 transition">AUTHENTICATE</button>
          <div className="mt-4 text-[9px] text-zinc-600">_system isolated from seasonal layers</div>
        </div>
      </div>
    );
  }

  const totalBookings = bookings.length;

  return (
    <div className="min-h-screen bg-[#08080a] text-white font-mono">
      <div className="border-b border-cyan-400/20 bg-black/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-pulse" />
            <h1 className="font-black tracking-tighter text-[18px]">CEO_DASHBOARD <span className="text-cyan-400">_CYBER</span></h1>
            <span className="text-[10px] border border-cyan-400/30 px-2 py-1 text-cyan-300">{businesses.length} HUSTLES // {totalBookings} BOOKINGS</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-[11px] border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition">LOGOUT</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-transparent p-4"><div className="text-[10px] text-cyan-400">TOTAL_HUSTLES</div><div className="text-3xl font-black mt-1">{businesses.length}</div></div>
          <div className="border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 to-transparent p-4"><div className="text-[10px] text-fuchsia-400">TOTAL_BOOKINGS</div><div className="text-3xl font-black mt-1">{totalBookings}</div></div>
          <div className="border border-white/10 bg-white/[0.02] p-4"><div className="text-[10px] text-zinc-500">SYSTEM_STATUS</div><div className="text-sm font-bold mt-1 text-lime-400">● ALL NODES ONLINE</div><div className="text-[10px] text-zinc-600 mt-1">No seasonal floaties loaded</div></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((b) => {
            const issues = getIssues(b);
            const bBookings = bookings.filter((bk) => bk.business_id === b.id).length;
            const isHealthy = issues.length <= 1 && issues[0]!== "0 bookings yet"? true : issues.length === 1 && issues[0] === "0 bookings yet";
            return (
              <div key={b.id} className={`border bg-[#111113] p-5 relative overflow-hidden ${isHealthy? "border-white/10" : "border-amber-400/30"}`}>
                <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 opacity-60" />
                <div className="flex justify-between items-start">
                  <div><h3 className="font-black text-[16px] tracking-tight">{b.name}</h3><p className="text-[11px] text-zinc-500 mt-0.5">{b.category} • {b.slug}</p></div>
                  <span className={`text-[9px] px-2 py-1 border ${isHealthy? "border-lime-400/30 text-lime-300" : "border-amber-400/40 text-amber-300"}`}>{isHealthy? "HEALTHY" : "NEEDS ATTN"}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-black/50 border border-white/5 p-2"><div className="text-zinc-600 text-[9px]">VISITS / BOOKINGS</div><div className="font-bold text-white text-[13px] mt-1">{bBookings} bookings</div></div>
                  <div className="bg-black/50 border border-white/5 p-2"><div className="text-zinc-600 text-[9px]">ISSUES</div><div className="font-bold mt-1">{issues.length === 0? <span className="text-lime-400">None</span> : <span className="text-amber-300">{issues.length} flagged</span>}</div></div>
                </div>

                {issues.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {issues.map((iss) => (
                      <span key={iss} className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-1">⚠️ {iss}</span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <a href={`/${b.slug}`} target="_blank" className="flex-1 bg-white text-black text-[11px] font-black py-2 text-center tracking-widest hover:bg-zinc-200">VIEW PAGE</a>
                  <button onClick={() => { navigator.clipboard.writeText(b.slug); alert("Slug copied: " + b.slug); }} className="px-3 border border-white/20 text-[11px] hover:bg-white hover:text-black">COPY SLUG</button>
                  <button onClick={async () => { if (!confirm(`Delete ${b.name}?`)) return; await supabase.from("businesses").delete().eq("id", b.id); setBusinesses(businesses.filter((x) => x.id!== b.id)); }} className="px-3 border border-red-500/30 text-red-400 text-[11px] hover:bg-red-500 hover:text-black">DEL</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}