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
      {/* UNIFIED CLEAN HEADER WITH MANAGER PORTAL LINK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-zinc-800 gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 tracking-tight">
            HUSTLEHUB SECUNDA 🚀
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Secunda's On-Demand Local Service Directory
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <Link
            href="/manager"
            className="text-xs bg-[#121212] text-zinc-300 border border-zinc-800 px-4 py-2.5 rounded-full font-bold hover:text-white hover:border-cyan-500/50 transition"
          >
            Manager Portal 💼
          </Link>
          <Link
            href="/join"
            className="text-xs bg-cyan-400 text-black px-5 py-2.5 rounded-full font-black hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            + Add Hustle
          </Link>
        </div>
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
                    className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-3 rounded-full font-mono font-bold hover:bg-emerald-500 hover:text-black transition flex items-center justify-center shrink-0"
                    title="Enquire on WhatsApp"
                  >
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
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