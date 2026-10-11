"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LandingPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchApprovedBusinesses = async () => {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .neq("is_approved", false)
        .order("is_special", { ascending: false });

      setBusinesses(data || []);
      setLoading(false);
    };

    fetchApprovedBusinesses();
  }, []);

  const categories = ["All", ...Array.from(new Set(businesses.map((b) => b.category).filter(Boolean)))];

  const filteredBusinesses =
    selectedCategory === "All"
      ? businesses
      : businesses.filter((b) => b.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 p-10 font-mono font-bold flex flex-col items-center justify-center">
        <div className="text-2xl animate-pulse">⚡ LOADING HUSTLEHUB SECUNDA...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto selection:bg-cyan-500 selection:text-black pb-24">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 tracking-tight">
            HUSTLEHUB SECUNDA 🚀
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Secunda's On-Demand Local Service Directory
          </p>
        </div>
        <Link
          href="/join"
          className="text-xs bg-white text-black px-5 py-2.5 rounded-full font-bold hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          + List Your Hustle
        </Link>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-4 py-2 rounded-full font-bold transition shrink-0 ${
              selectedCategory === cat
                ? "bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                : "bg-[#121212] text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* BUSINESS DIRECTORY GRID */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((biz) => {
          const whatsappPhone = biz.whatsapp || biz.phone || biz.whatsapp_number;
          const prefilledMsg = encodeURIComponent(
            `Hi ${biz.name}! I found your listing on HustleHub Secunda and would like to enquire about your services.`
          );
          const whatsappLink = whatsappPhone
            ? `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}?text=${prefilledMsg}`
            : "#";

          return (
            <div
              key={biz.id}
              className={`bg-[#121212] border rounded-[24px] p-6 flex flex-col justify-between transition ${
                biz.is_special
                  ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : "border-zinc-800 hover:border-cyan-500/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">
                    {biz.category || "General Service"}
                  </span>
                  {biz.is_special && (
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      🔥 PROMOTED
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-black mt-3 text-white">{biz.name}</h2>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {biz.description || "Top rated local service provider in Secunda."}
                </p>

                {biz.price > 0 && (
                  <p className="mt-4 text-sm font-mono font-bold text-emerald-400">
                    Starting from R{biz.price}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Link
                  href={`/${biz.slug || biz.id}`}
                  className="flex-1 bg-white text-black text-center text-xs py-3 rounded-full font-bold hover:bg-cyan-400 transition"
                >
                  Book Online →
                </Link>
                {whatsappPhone && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-3 rounded-full text-xs font-mono font-bold hover:bg-emerald-500 hover:text-black transition"
                    title="Enquire on WhatsApp"
                  >
                    💬
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING "REQUEST A SERVICE" BANNER */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-black/90 border border-cyan-500/40 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-md">
        <span className="text-xs font-mono text-zinc-300 truncate">
          Can't find a trade or service in Secunda?
        </span>
        <a
          href="https://wa.me/27725023999?text=Hi%20HustleHub!%20I%20am%20looking%20for%20a%20specific%20service%20in%20Secunda:"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono font-bold bg-cyan-400 text-black px-4 py-2 rounded-full hover:bg-cyan-300 transition shrink-0 ml-2"
        >
          Request Quote 💬
        </a>
      </div>
    </main>
  );
}