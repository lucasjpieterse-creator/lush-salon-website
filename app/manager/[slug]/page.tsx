"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ManagerPortal() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchBusinessData = async () => {
      setLoading(true);

      // Fetch Business Details
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single();

      if (biz) {
        setBusiness(biz);

        // Fetch Business Bookings
        const { data: bks } = await supabase
          .from("bookings")
          .select("*")
          .eq("business_id", biz.id)
          .order("created_at", { ascending: false });

        setBookings(bks || []);
      }

      setLoading(false);
    };

    fetchBusinessData();
  }, [slug]);

  const copyBookingLink = () => {
    const link = `https://hustlehubsecunda.co.za/${business?.slug || slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 p-10 font-mono font-bold flex flex-col items-center justify-center">
        <div className="text-2xl animate-pulse">⚡ LOADING MANAGER PORTAL...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-black text-white p-10 font-mono text-center">
        <h1 className="text-2xl font-black text-red-400">Business Not Found</h1>
        <p className="text-xs text-zinc-500 mt-2">Please check your manager URL or slug.</p>
        <Link href="/" className="mt-4 inline-block text-xs bg-zinc-800 text-white px-4 py-2 rounded-full">
          ← Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-6xl mx-auto font-sans selection:bg-cyan-500 selection:text-black">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">{business.name}</h1>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              MANAGER PORTAL
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Manage schedule, client bookings, and sharing links
          </p>
        </div>

        {/* ONE-CLICK COPY LINK BUTTON */}
        <button
          onClick={copyBookingLink}
          className="text-xs bg-cyan-400 text-black px-5 py-2.5 rounded-full font-mono font-bold hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          {copied ? "✅ Link Copied!" : "🔗 Copy Public Booking Link"}
        </button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#121212] border border-zinc-800 rounded-[20px] p-5">
          <p className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Total Bookings</p>
          <p className="text-3xl font-black mt-1 text-white font-mono">{bookings.length}</p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-[20px] p-5">
          <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Total Revenue</p>
          <p className="text-3xl font-black mt-1 text-emerald-400 font-mono">
            R
            {bookings
              .filter((b) => !b.status?.includes("cancel"))
              .reduce((sum, b) => sum + (Number(b.service_price || b.price) || 0), 0)}
          </p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-[20px] p-5 col-span-2 md:col-span-1">
          <p className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Profile Views</p>
          <p className="text-3xl font-black mt-1 text-cyan-400 font-mono">{business.views || 0}</p>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="mt-8">
        <h2 className="text-lg font-black font-mono text-white">Client Bookings</h2>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono">No bookings received yet.</p>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-sm text-white">{b.client_name || "Client"}</p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Date: <span className="text-cyan-400">{b.booking_date || "N/A"}</span> // Time: <span className="text-cyan-400">{b.booking_time || "N/A"}</span> // Phone: <span className="text-zinc-300">{b.client_phone || "N/A"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    R{b.service_price || b.price || 0}
                  </span>
                  <a
                    href={`https://wa.me/${(b.client_phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hi ${b.client_name}, confirming your booking with${business.name} for ${b.booking_date} at${b.booking_time}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-400 text-black text-xs font-mono font-bold px-4 py-2 rounded-full hover:bg-emerald-300 transition"
                  >
                    WhatsApp Client 💬
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}