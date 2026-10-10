"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CEODashboard() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [viewsCount, setViewsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch All Businesses
    const { data: bizData } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    setBusinesses(bizData || []);

    // 2. Fetch All Bookings
    const { data: bookData } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    setBookings(bookData || []);

    // 3. Fetch Views Count
    const { count } = await supabase
      .from("business_views")
      .select("*", { count: "exact", head: true });

    setViewsCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todaysBookings = bookings.filter((b) => b.booking_date === today);
    const revenueToday = todaysBookings
      .filter((b) => !b.status?.includes("cancel"))
      .reduce((sum, b) => sum + (Number(b.service_price || b.price) || 0), 0);
    const totalRevenue = bookings
      .filter((b) => !b.status?.includes("cancel"))
      .reduce((sum, b) => sum + (Number(b.service_price || b.price) || 0), 0);

    return {
      todayCount: todaysBookings.length,
      revenueToday,
      totalRevenue,
      totalBookings: bookings.length,
    };
  }, [bookings]);

  // Pending businesses waiting for approval
  const pendingBusinesses = businesses.filter((b) => b.is_approved === false);

  const sendAutomatedWhatsApp = async (phone: string, msg: string) => {
    try {
      await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message: msg }),
      });
    } catch (err) {
      console.error("WhatsApp dispatch failed:", err);
    }
  };

  const handleApprove = async (biz: any) => {
    const { error } = await supabase
      .from("businesses")
      .update({ is_approved: true })
      .eq("id", biz.id);

    if (error) return alert("Approval failed: " + error.message);

    setBusinesses(
      businesses.map((b) => (b.id === biz.id ? { ...b, is_approved: true } : b))
    );

    const ownerPhone = (biz.whatsapp_number || biz.whatsapp || biz.owner_phone || biz.phone || "").toString();
    if (ownerPhone) {
      const msg = `🎉 GREAT NEWS - ${biz.name} IS LIVE!\n\nYour business registration on HustleHub Secunda has been APPROVED by CEO Lucas.\n\nClients can now book you online:\nhttps://hustlehubsecunda.co.za/${biz.slug}\n\nManage your bookings:\nhttps://hustlehubsecunda.co.za/manager/${biz.slug}`;
      await sendAutomatedWhatsApp(ownerPhone, msg);
    }

    alert(`✅ ${biz.name} is now LIVE on the directory!`);
  };

  const handleToggleSpecial = async (biz: any) => {
    const newStatus = !biz.is_special;
    await supabase.from("businesses").update({ is_special: newStatus }).eq("id", biz.id);
    setBusinesses(businesses.map((b) => (b.id === biz.id ? { ...b, is_special: newStatus } : b)));
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10 font-bold">Loading Cyberpunk CEO Portal...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-6 border-b border-[#2A2A2A]">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CEO COMMAND CENTER 👑</h1>
          <p className="text-xs text-zinc-500 mt-1">HustleHub Secunda Platform Oversight & Real-Time Analytics</p>
        </div>
        <Link href="/" className="text-xs bg-[#1A1A1A] border border-[#2A2A2A] px-5 py-2.5 rounded-full font-bold hover:bg-white hover:text-black transition">
          View Directory →
        </Link>
      </div>

      {/* --- NEW HUSTLE PENDING APPROVAL ALERT BAR --- */}
      {pendingBusinesses.length > 0 && (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/40 rounded-[20px] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <h3 className="font-black text-amber-400 text-sm tracking-wide uppercase">
                {pendingBusinesses.length} New Hustle Registration{pendingBusinesses.length > 1 ? "s" : ""} Waiting Approval
              </h3>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
              PENDING ACTION
            </span>
          </div>

          <div className="space-y-2">
            {pendingBusinesses.map((biz) => (
              <div key={biz.id} className="bg-black/80 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="font-black text-white text-base">{biz.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Category: <span className="text-amber-400 font-bold">{biz.category || "General"}</span> // WhatsApp: <span className="text-zinc-300">{biz.whatsapp || biz.phone || "N/A"}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleApprove(biz)}
                  className="bg-emerald-400 text-black font-black text-xs px-5 py-2.5 rounded-full hover:bg-emerald-300 transition shadow-lg shrink-0"
                >
                  ✅ Approve & Publish
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORIGINAL CYBERPUNK STATS GRID */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-5">
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Total Platform Views</p>
          <p className="text-3xl font-black mt-2 text-white">{viewsCount}</p>
          <p className="text-[11px] text-zinc-600 mt-1">Directory Traffic</p>
        </div>

        <div className="bg-[#1A1A1A] border border-emerald-500/20 rounded-[20px] p-5">
          <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Revenue Today</p>
          <p className="text-3xl font-black mt-2 text-emerald-400">R{stats.revenueToday}</p>
          <p className="text-[11px] text-zinc-500 mt-1">{stats.todayCount} bookings today</p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-5">
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Total Revenue Generated</p>
          <p className="text-3xl font-black mt-2 text-white">R{stats.totalRevenue}</p>
          <p className="text-[11px] text-zinc-600 mt-1">{stats.totalBookings} total bookings</p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-5">
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Active Hustles</p>
          <p className="text-3xl font-black mt-2 text-white">{businesses.filter((b) => b.is_approved !== false).length}</p>
          <p className="text-[11px] text-zinc-600 mt-1">Live on Landing</p>
        </div>
      </div>

      {/* BUSINESSES CONTROL TABLE */}
      <div className="mt-8">
        <h2 className="text-xl font-black tracking-tight">Hustle Management Directory</h2>
        <p className="text-xs text-zinc-500 mt-1">Manage listings, toggle specials, and view analytics.</p>

        <div className="mt-4 space-y-3">
          {businesses.map((biz) => {
            const isApproved = biz.is_approved !== false;
            return (
              <div key={biz.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{biz.name}</h3>
                    {biz.is_special && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        🔥 PROMOTED SPECIAL
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isApproved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                      {isApproved ? "LIVE" : "PENDING CEO"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Category: <span className="text-white font-bold">{biz.category}</span> // Views: <span className="text-emerald-400 font-bold">{biz.views || 0}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleToggleSpecial(biz)}
                    className={`text-xs px-3.5 py-2 rounded-full font-bold transition ${
                      biz.is_special
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-[#2A2A2A] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {biz.is_special ? "🔥 Special Active" : "+ Promote Special"}
                  </button>

                  <Link
                    href={`/manager/${biz.slug || biz.id}`}
                    className="bg-white text-black hover:bg-zinc-200 text-xs px-4 py-2 rounded-full font-bold transition"
                  >
                    Manager Portal →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}