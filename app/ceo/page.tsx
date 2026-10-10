"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CEODashboard() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });
    setBusinesses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

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

    // Update state locally
    setBusinesses(
      businesses.map((b) => (b.id === biz.id ? { ...b, is_approved: true } : b))
    );

    // Send WhatsApp notification to the Business Owner
    const ownerPhone = (biz.whatsapp_number || biz.whatsapp || biz.owner_phone || biz.phone || "").toString();
    if (ownerPhone) {
      const msg = `🎉 GREAT NEWS - ${biz.name} IS LIVE!\n\nYour business registration on HustleHub Secunda has been APPROVED by CEO Lucas.\n\nYour clients can now book services directly at:\nhttps://hustlehubsecunda.co.za/${biz.slug}\n\nManage bookings here:\nhttps://hustlehubsecunda.co.za/manager/${biz.slug}`;
      await sendAutomatedWhatsApp(ownerPhone, msg);
    }

    alert(`✅ ${biz.name} approved! Owner notified via WhatsApp.`);
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

  const pendingCount = businesses.filter((b) => !b.is_approved).length;
  const approvedCount = businesses.filter((b) => b.is_approved).length;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center pb-6 border-b border-[#2A2A2A]">
        <div>
          <h1 className="text-3xl font-black">CEO Command Center 👑</h1>
          <p className="text-xs text-zinc-500 mt-1">HustleHub Secunda Platform Oversight</p>
        </div>
        <Link href="/" className="text-xs bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-2 rounded-full font-bold hover:bg-white hover:text-black transition">
          View Landing Page →
        </Link>
      </div>

      {/* KPI STATS */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-5">
          <p className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Total Hustles</p>
          <p className="text-3xl font-black mt-1">{businesses.length}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-amber-500/30 rounded-[20px] p-5">
          <p className="text-[11px] text-amber-400 uppercase font-bold tracking-wider">Pending CEO Approval</p>
          <p className="text-3xl font-black mt-1 text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-emerald-500/30 rounded-[20px] p-5">
          <p className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">Live on Landing</p>
          <p className="text-3xl font-black mt-1 text-emerald-400">{approvedCount}</p>
        </div>
      </div>

      {/* BUSINESS DIRECTORY OVERVIEW */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Business Approval Queue</h2>
        <p className="text-xs text-zinc-500 mt-1">New registrations remain hidden from landing page until you click Approve.</p>

        {loading ? (
          <p className="mt-6 text-zinc-500 text-sm animate-pulse">Loading directory...</p>
        ) : (
          <div className="mt-4 space-y-4">
            {businesses.map((biz) => {
              const isApproved = Boolean(biz.is_approved);
              return (
                <div
                  key={biz.id}
                  className={`bg-[#1A1A1A] border rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isApproved ? "border-[#2A2A2A]" : "border-amber-500/50 bg-amber-500/5"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black">{biz.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {isApproved ? "LIVE ON LANDING" : "PENDING APPROVAL"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Category: <span className="text-white font-bold">{biz.category || "General"}</span> // Slug: <span className="text-zinc-500">{biz.slug}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Phone / WhatsApp: {biz.whatsapp_number || biz.whatsapp || biz.owner_phone || "Not set"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isApproved ? (
                      <button
                        onClick={() => handleRevoke(biz.id)}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs px-4 py-2 rounded-full font-bold transition"
                      >
                        Hide Listing
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(biz)}
                        className="bg-emerald-400 text-black hover:bg-emerald-300 text-xs px-5 py-2.5 rounded-full font-black transition shadow-lg"
                      >
                        ✅ Approve & Go Live
                      </button>
                    )}

                    <Link
                      href={`/manager/${biz.slug || biz.id}`}
                      className="bg-[#2A2A2A] text-white hover:bg-white hover:text-black text-xs px-4 py-2 rounded-full font-bold transition"
                    >
                      Manager Portal →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}