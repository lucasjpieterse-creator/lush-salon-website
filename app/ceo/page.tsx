"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CEODashboard() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [viewsCount, setViewsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // WhatsApp & System Status State
  const [waLogs, setWaLogs] = useState<any[]>([
    {
      id: "log-1",
      timestamp: new Date().toLocaleTimeString(),
      recipient: "Meta WhatsApp API",
      type: "Template Verification",
      status: "PENDING_APPROVAL",
      message: "Waiting on Meta Business template clearance.",
    },
    {
      id: "log-2",
      timestamp: new Date().toLocaleTimeString(),
      recipient: "Paystack Gateway",
      type: "Compliance Check",
      status: "OFFLINE_TEST",
      message: "FICA verification pending. Upfront deposits toggled OFF.",
    },
  ]);

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

    // 3. Fetch Platform Views Count
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

  const pendingBusinesses = businesses.filter((b) => b.is_approved === false);

  const sendAutomatedWhatsApp = async (phone: string, msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message: msg }),
      });

      if (res.ok) {
        setWaLogs((prev) => [
          {
            id: Date.now(),
            timestamp,
            recipient: phone,
            type: "Dispatch",
            status: "SENT",
            message: "Notification sent via WhatsApp API",
          },
          ...prev,
        ]);
      } else {
        throw new Error("API dispatch error");
      }
    } catch (err) {
      setWaLogs((prev) => [
        {
          id: Date.now(),
          timestamp,
          recipient: phone,
          type: "Dispatch",
          status: "FAILED / FALLBACK",
          message: "API dispatch failed. Triggering web intent link.",
        },
        ...prev,
      ]);
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

  const handleRevoke = async (bizId: string) => {
    if (!confirm("Hide this listing from the landing page?")) return;
    const { error } = await supabase
      .from("businesses")
      .update({ is_approved: false })
      .eq("id", bizId);

    if (!error) {
      setBusinesses(
        businesses.map((b) => (b.id === bizId ? { ...b, is_approved: false } : b))
      );
    }
  };

  const handleToggleSpecial = async (biz: any) => {
    const newStatus = !biz.is_special;
    await supabase.from("businesses").update({ is_special: newStatus }).eq("id", biz.id);
    setBusinesses(businesses.map((b) => (b.id === biz.id ? { ...b, is_special: newStatus } : b)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 p-10 font-mono font-bold flex flex-col items-center justify-center">
        <div className="text-2xl animate-pulse">⚡ INITIALIZING CYBERPUNK CEO MATRIX...</div>
        <p className="text-xs text-zinc-500 mt-2">Connecting to Supabase PostgreSQL & Meta API gateway...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto font-sans selection:bg-cyan-500 selection:text-black">
      {/* CYBERPUNK HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-cyan-500/30 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-cyan-400 animate-ping"></span>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 tracking-tight">
              CEO COMMAND CENTER 👑
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            HustleHub Secunda // Matrix Operational Status & Governance
          </p>
        </div>
        <Link
          href="/"
          className="text-xs bg-[#111] text-cyan-400 border border-cyan-500/40 px-5 py-2.5 rounded-full font-mono font-bold hover:bg-cyan-400 hover:text-black transition shadow-[0_0_15px_rgba(6,182,212,0.25)]"
        >
          View Directory →
        </Link>
      </div>

      {/* NEW HUSTLE PENDING APPROVAL ALERT BAR */}
      {pendingBusinesses.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/50 rounded-[20px] p-5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">🚨</span>
              <h3 className="font-black text-amber-400 text-sm tracking-wide uppercase font-mono">
                {pendingBusinesses.length} New Hustle Registration{pendingBusinesses.length > 1 ? "s" : ""} Waiting Approval
              </h3>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/40 font-mono">
              ACTION REQUIRED
            </span>
          </div>

          <div className="space-y-2">
            {pendingBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-black/90 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-black text-white text-base">{biz.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                    Category: <span className="text-amber-400 font-bold">{biz.category || "General"}</span> // WhatsApp: <span className="text-cyan-300">{biz.whatsapp || biz.phone || "N/A"}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleApprove(biz)}
                  className="bg-emerald-400 text-black font-black text-xs px-5 py-2.5 rounded-full hover:bg-emerald-300 transition shadow-[0_0_15px_rgba(52,211,153,0.4)] shrink-0 font-mono"
                >
                  ✅ Approve & Publish
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CYBERPUNK STATS GRID */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-cyan-500/20 rounded-[20px] p-5 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <p className="text-[10px] text-cyan-400 uppercase font-mono font-bold tracking-widest">Total Platform Views</p>
          <p className="text-3xl font-black mt-2 text-white font-mono">{viewsCount}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Directory Traffic</p>
        </div>

        <div className="bg-[#121212] border border-emerald-500/30 rounded-[20px] p-5 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <p className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-widest">Revenue Today</p>
          <p className="text-3xl font-black mt-2 text-emerald-400 font-mono">R{stats.revenueToday}</p>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">{stats.todayCount} bookings today</p>
        </div>

        <div className="bg-[#121212] border border-fuchsia-500/20 rounded-[20px] p-5 shadow-[0_0_15px_rgba(217,70,239,0.05)]">
          <p className="text-[10px] text-fuchsia-400 uppercase font-mono font-bold tracking-widest">Total Revenue Generated</p>
          <p className="text-3xl font-black mt-2 text-white font-mono">R{stats.totalRevenue}</p>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">{stats.totalBookings} total bookings</p>
        </div>

        <div className="bg-[#121212] border border-amber-500/20 rounded-[20px] p-5 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <p className="text-[10px] text-amber-400 uppercase font-mono font-bold tracking-widest">Active Hustles</p>
          <p className="text-3xl font-black mt-2 text-white font-mono">{businesses.filter((b) => b.is_approved !== false).length}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Live on Landing</p>
        </div>
      </div>

      {/* SYSTEM LOGS & WHATSAPP API STATUS PANEL */}
      <div className="mt-8 bg-[#121212] border border-fuchsia-500/30 rounded-[24px] p-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-black text-fuchsia-400 font-mono tracking-tight flex items-center gap-2">
              📡 API Dispatches & Integration Status
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">Real-time status of Meta WhatsApp & Paystack compliance queues</p>
          </div>
          <span className="text-[10px] font-mono bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 px-3 py-1 rounded-full">
            LIVE MONITOR
          </span>
        </div>

        <div className="mt-4 space-y-2 font-mono text-xs max-h-48 overflow-y-auto pr-2">
          {waLogs.map((log) => (
            <div
              key={log.id}
              className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">{log.timestamp}</span>
                <span className="text-cyan-400 font-bold">{log.type}</span>
                <span className="text-zinc-300">→ {log.recipient}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">{log.message}</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    log.status === "SENT"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HUSTLE MANAGEMENT DIRECTORY */}
      <div className="mt-8">
        <h2 className="text-xl font-black tracking-tight text-white font-mono">Hustle Management Directory</h2>
        <p className="text-xs text-zinc-400 mt-1">Manage listings, toggle specials, and view analytics.</p>

        <div className="mt-4 space-y-3">
          {businesses.map((biz) => {
            const isApproved = biz.is_approved !== false;
            return (
              <div
                key={biz.id}
                className="bg-[#121212] border border-zinc-800 hover:border-cyan-500/40 rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{biz.name}</h3>
                    {biz.is_special && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                        🔥 PROMOTED SPECIAL
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                        isApproved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {isApproved ? "LIVE" : "PENDING CEO"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">
                    Category: <span className="text-cyan-400 font-bold">{biz.category}</span> // Views:{" "}
                    <span className="text-emerald-400 font-bold">{biz.views || 0}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* APPROVE / HIDE TOGGLE BUTTON */}
                  {isApproved ? (
                    <button
                      onClick={() => handleRevoke(biz.id)}
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs px-3.5 py-2 rounded-full font-bold transition font-mono border border-red-500/30"
                    >
                      Hide Listing
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(biz)}
                      className="bg-emerald-400 text-black hover:bg-emerald-300 text-xs px-4 py-2 rounded-full font-black transition shadow-[0_0_10px_rgba(52,211,153,0.3)] font-mono"
                    >
                      ✅ Approve
                    </button>
                  )}

                  {/* SPECIAL TOGGLE BUTTON */}
                  <button
                    onClick={() => handleToggleSpecial(biz)}
                    className={`text-xs px-3.5 py-2 rounded-full font-bold transition font-mono ${
                      biz.is_special
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-[#222] text-zinc-400 hover:text-white border border-zinc-700"
                    }`}
                  >
                    {biz.is_special ? "🔥 Special Active" : "+ Promote Special"}
                  </button>

                  <Link
                    href={`/manager/${biz.slug || biz.id}`}
                    className="bg-white text-black hover:bg-cyan-400 text-xs px-4 py-2 rounded-full font-bold transition font-mono shadow-[0_0_10px_rgba(255,255,255,0.1)]"
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