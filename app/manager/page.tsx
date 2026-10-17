"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ManagerPortal() {
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const savedBusinessId = localStorage.getItem("teksbook_manager_biz_id");
    if (savedBusinessId) {
      loadBusinessAndBookings(savedBusinessId);
    }
  }, []);

  const loadBusinessAndBookings = async (bizId: string) => {
    setLoading(true);
    const { data: bizData } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", bizId)
      .maybeSingle();

    if (bizData) {
      setBusiness(bizData);
      localStorage.setItem("teksbook_manager_biz_id", bizData.id);

      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("business_id", bizData.id)
        .order("created_at", { ascending: false });

      setBookings(bookingData || []);
    }
    setLoading(false);
    setSearched(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    const cleanQuery = searchQuery.trim();

    const { data } = await supabase
      .from("businesses")
      .select("*")
      .or(`phone.ilike.%${cleanQuery}%,whatsapp.ilike.%${cleanQuery}%,name.ilike.%${cleanQuery}%`)
      .limit(1)
      .maybeSingle();

    if (data) {
      await loadBusinessAndBookings(data.id);
    } else {
      setBusiness(null);
      setBookings([]);
      setLoading(false);
      setSearched(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teksbook_manager_biz_id");
    setBusiness(null);
    setBookings([]);
    setSearched(false);
    setSearchQuery("");
  };

  // AUTOMATED BOOKING ACTION HANDLER (BACKEND WHATSAPP DISPATCH)
  const handleBookingAction = async (booking: any, action: "confirm" | "reschedule" | "decline" | "delete") => {
    if (action === "delete") {
      if (!confirm(`Are you sure you want to delete the booking for ${booking.client_name}?`)) return;
      
      const { error } = await supabase.from("bookings").delete().eq("id", booking.id);
      if (!error) {
        setBookings(bookings.filter((b) => b.id !== booking.id));
      } else {
        alert("Delete failed: " + error.message);
      }
      return;
    }

    setActionLoadingId(booking.id);
    
    // Map 'decline' to 'cancelled' so it matches the Supabase booking_status enum
    const newStatus = action === "confirm" ? "confirmed" : action === "reschedule" ? "rescheduled" : "cancelled";
    
    // 1. Update status in Supabase
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", booking.id);
    
    if (error) {
      alert("Status update failed: " + error.message);
      setActionLoadingId(null);
      return;
    }

    // 2. Update local state so status badge changes immediately
    setBookings(bookings.map((b) => (b.id === booking.id ? { ...b, status: newStatus } : b)));

    // 3. Prepare message payload for automated background WhatsApp dispatch
    const clientPhone = (booking.client_phone || "").replace(/[^0-9]/g, "");
    let textMessage = "";

    if (action === "confirm") {
      textMessage = `Hi ${booking.client_name}! ⚡ Your booking for "${booking.service_name || "Service"}" on ${booking.booking_date} at ${booking.booking_time} with ${business.name} is CONFIRMED! See you then.`;
    } else if (action === "reschedule") {
      textMessage = `Hi ${booking.client_name}! Regarding your booking for "${booking.service_name || "Service"}" with ${business.name}: We need to reschedule this appointment. Could you please reply with another preferred date or time?`;
    } else if (action === "decline") {
      textMessage = `Hi ${booking.client_name}! Unfortunately, ${business.name} is unable to accept your booking request for ${booking.booking_date} at ${booking.booking_time}. Apologies for any inconvenience!`;
    }

    // 4. Send background WhatsApp notification without redirecting
    if (clientPhone && textMessage) {
      try {
        await fetch("/api/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: clientPhone,
            message: textMessage,
          }),
        });
      } catch (err) {
        console.error("WhatsApp background send failed:", err);
      }
    }

    setActionLoadingId(null);
  };

  // Metrics Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookingsCount = bookings.filter((b) => b.booking_date === todayStr).length;
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "declined")
    .reduce((sum, b) => sum + (Number(b.service_price) || Number(b.price) || 0), 0);

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-5xl mx-auto font-mono selection:bg-cyan-500 selection:text-black pb-24">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <Link href="/" className="text-xs text-cyan-400 hover:underline">
            ← Back to Directory
          </Link>
          <h1 className="text-2xl font-black text-white mt-2">💼 Manager Portal</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage your business bookings & automated client notices</p>
        </div>

        {business && (
          <button
            onClick={handleLogout}
            className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-full hover:text-white hover:border-red-500/50 transition"
          >
            Switch Business 🔓
          </button>
        )}
      </div>

      {/* LOGIN / SEARCH FORM */}
      {!business ? (
        <div className="mt-12 bg-[#121212] border border-zinc-800 rounded-[24px] p-8 max-w-xl mx-auto text-center space-y-6">
          <div className="text-4xl">🏢</div>
          <div>
            <h2 className="text-xl font-bold text-white">Access Your Business Dashboard</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enter your registered business phone number, WhatsApp, or business name.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              required
              placeholder="e.g. Fade Masters or 0721234567"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none text-center"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-400 text-black font-black py-3 rounded-xl text-sm hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              {loading ? "Searching Directory..." : "Access Dashboard →"}
            </button>
          </form>

          {searched && !business && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              No active listing found matching "{searchQuery}". Make sure your listing is approved in the directory.
            </div>
          )}
        </div>
      ) : (
        /* ACTIVE MANAGER DASHBOARD */
        <div className="mt-8 space-y-8">
          {/* METRICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Est. Total Revenue</span>
              <span className="text-2xl font-black text-emerald-400">R{totalRevenue}</span>
            </div>

            <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Today's Bookings</span>
              <span className="text-2xl font-black text-amber-400">{todayBookingsCount}</span>
            </div>

            <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Total Bookings</span>
              <span className="text-2xl font-black text-cyan-400">{bookings.length}</span>
            </div>

            <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Directory Views</span>
              <span className="text-2xl font-black text-fuchsia-400">{business.views || 0}</span>
            </div>
          </div>

          {/* BUSINESS OVERVIEW CARD */}
          <div className="bg-[#121212] border border-zinc-800 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 font-bold">
                {business.category || "Service Provider"}
              </span>
              <h2 className="text-2xl font-black text-white mt-2">{business.name}</h2>
              <p className="text-xs text-zinc-400 mt-1">{business.description}</p>
            </div>
          </div>

          {/* INCOMING BOOKINGS QUEUE */}
          <div>
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider mb-4">
              📋 Incoming Client Bookings ({bookings.length})
            </h3>

            {bookings.length === 0 ? (
              <div className="bg-[#121212] border border-zinc-800 rounded-[24px] p-12 text-center text-zinc-500 text-xs">
                No bookings received yet. Share your booking link to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((b) => {
                  const currentStatus = (b.status || "pending").toLowerCase();
                  
                  const statusStyle =
                    currentStatus === "confirmed"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : currentStatus === "rescheduled"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : currentStatus === "cancelled" || currentStatus === "declined"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";

                  const isProcessing = actionLoadingId === b.id;

                  return (
                    <div
                      key={b.id}
                      className="bg-[#121212] border border-zinc-800 hover:border-cyan-500/40 rounded-[20px] p-6 space-y-4 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white">Hi {b.client_name || "Client"}</span>
                            <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${statusStyle}`}>
                              {currentStatus}
                            </span>
                          </div>
                          <span className="text-xs text-emerald-400 font-bold mt-1 block">
                            💬 WhatsApp Client: {b.client_phone || "Not provided"}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                            R{b.service_price || b.price || 0}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-zinc-500 block font-bold">DATE & TIME:</span>
                          <span className="text-zinc-200">{b.booking_date} at {b.booking_time}</span>
                        </div>

                        <div>
                          <span className="text-zinc-500 block font-bold">SELECTED SERVICES:</span>
                          <span className="text-cyan-400 font-bold">{b.service_name || "Standard Service"}</span>
                        </div>
                      </div>

                      {b.notes && (
                        <div className="bg-black border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-300">
                          <span className="text-zinc-500 block text-[10px] font-bold">CLIENT NOTES / SPECIAL REQUESTS:</span>
                          <p className="mt-0.5 italic">"{b.notes}"</p>
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="pt-2 flex flex-wrap items-center gap-2 font-mono">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleBookingAction(b, "confirm")}
                          className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-500 hover:text-black transition disabled:opacity-50"
                        >
                          {isProcessing ? "Processing..." : "✅ Confirm"}
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleBookingAction(b, "reschedule")}
                          className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl font-bold hover:bg-amber-500 hover:text-black transition disabled:opacity-50"
                        >
                          📅 Reschedule
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleBookingAction(b, "decline")}
                          className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl font-bold hover:bg-red-500 hover:text-black transition disabled:opacity-50"
                        >
                          ❌ Decline
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleBookingAction(b, "delete")}
                          className="text-xs bg-zinc-900 text-zinc-500 border border-zinc-800 px-3.5 py-2.5 rounded-xl font-bold hover:text-red-400 hover:border-red-500/40 transition ml-auto disabled:opacity-50"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}