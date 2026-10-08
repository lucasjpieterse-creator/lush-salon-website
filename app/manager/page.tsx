"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ManagerPage() {
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState<any>(null);
  const [error, setError] = useState("");

  const login = async () => {
    const { data, error } = await supabase.from("businesses").select("*").eq("slug", slug).eq("business_password", password).single();
    if (error ||!data) setError("Wrong slug or password");
    else setBusiness(data);
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-sm">
          <h1 className="font-black text-lg">Business Manager 🔒</h1>
          <p className="text-xs text-zinc-500 mt-1 mb-4">Enter your business slug + password to manage YOUR business only.</p>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="your-business-slug (e.g. fade-masters)" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm mb-2" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Business Password" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm mb-3" />
          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
          <button onClick={login} className="w-full bg-white text-black font-black py-3 rounded-full text-sm">Access My Business</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="font-black text-xl">Welcome {business.name}</h1>
      <p className="text-zinc-500 text-sm">You can only see your business, not competitors ✅</p>
      {/* Put your existing bookings logic here using business.id */}
      <div className="mt-6 bg-[#111] border border-[#222] rounded-2xl p-4">
        <p className="text-sm">Business: {business.name}</p>
        <p className="text-xs text-zinc-500">ID: {business.id}</p>
      </div>
    </div>
  );
}