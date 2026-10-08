"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const CEO_PASSWORD = "HustleCEO2026!"; // Change this to your secret

export default function CEOPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);

  const checkAuth = () => {
    if (pass === CEO_PASSWORD) {
      setAuthed(true);
      localStorage.setItem("ceo_auth", "true");
    } else alert("Wrong CEO password");
  };

  useEffect(() => {
    if (localStorage.getItem("ceo_auth") === "true") setAuthed(true);
    if (authed) {
      supabase.from("businesses").select("*").then(({ data }) => setBusinesses(data || []));
    }
  }, [authed]);

  const deleteBiz = async (id: string) => {
    if (!confirm("Delete this business?")) return;
    await supabase.from("businesses").delete().eq("id", id);
    setBusinesses(businesses.filter((b) => b.id!== id));
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-sm">
          <h1 className="font-black text-xl mb-4">CEO Access Only 🔒</h1>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="CEO Password" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm mb-3" />
          <button onClick={checkAuth} className="w-full bg-white text-black font-black py-3 rounded-full text-sm">Enter CEO Dashboard</button>
          <Link href="/" className="block text-center text-zinc-500 text-xs mt-4 underline">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="font-black text-2xl">CEO Dashboard 👑 {businesses.length} Hustles</h1>
        <button onClick={() => { localStorage.removeItem("ceo_auth"); setAuthed(false); }} className="text-xs bg-[#1A1A1A] border border-[#222] px-4 py-2 rounded-full">Logout</button>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {businesses.map((b) => (
          <div key={b.id} className="bg-[#111] border border-[#222] rounded-2xl p-4">
            <p className="font-black">{b.name} • {b.category}</p>
            <p className="text-xs text-zinc-500 mt-1">R{b.price} | {b.pricing_type} | Pass: {b.business_password || "NO PASS"}</p>
            <p className="text-xs text-zinc-500">WhatsApp: {b.whatsapp}</p>
            <div className="flex gap-2 mt-3">
              <Link href={`/${b.slug}`} className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold">View</Link>
              <button onClick={() => deleteBiz(b.id)} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}