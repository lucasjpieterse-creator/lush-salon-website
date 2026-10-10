"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManagerDetail() {
  const params = useParams();
  const rawSlug = params.slug as string | string[];
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Security PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Payment / Deposit Management State
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | string>(0);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
  const [paymentSaveMsg, setPaymentSaveMsg] = useState("");

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);
      
      const query = supabase.from("businesses").select("*");
      const { data: biz, error: bizErr } = isUUID 
        ? await query.eq("id", slug).single()
        : await query.eq("slug", slug).single();

      if (bizErr || !biz) {
        setLoading(false);
        return;
      }

      setBusiness(biz);
      setDepositRequired(Boolean(biz.deposit_required));
      setDepositAmount(biz.deposit_amount ?? 0);

      const { data: books } = await supabase
        .from("bookings")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false });

      setBookings(books || []);
      setLoading(false);
    })();
  }, [slug]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = business.manager_pin || "1234";
    if (pinInput === correctPin) {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect password / PIN. Try again.");
    }
  };

  const handleSavePaymentSettings = async () => {
    setSavingPaymentSettings(true);
    setPaymentSaveMsg("");

    const numericAmount = parseFloat(depositAmount.toString()) || 0;

    const { error } = await supabase
      .from("businesses")
      .update({
        deposit_required: depositRequired,
        deposit_amount: numericAmount,
      })
      .eq("id", business.id);

    if (error) {
      setPaymentSaveMsg("❌ Error saving settings: " + error.message);
    } else {
      setBusiness((prev: any) => ({
        ...prev,
        deposit_required: depositRequired,
        deposit_amount: numericAmount,
      }));
      setPaymentSaveMsg("✅ Payment settings updated!");
      setTimeout(() => setPaymentSaveMsg(""), 3000);
    }
    setSavingPaymentSettings(false);
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todays = bookings.filter((b) => b.booking_date === today);
    const revenueToday = todays
      .filter((b) => !b.status?.includes("cancel"))
      .reduce((sum, b) => sum + (Number(b.service_price || b.price) || 0), 0);
    const totalRevenue = bookings
      .filter((b) => !b.status?.includes("cancel"))
      .reduce((sum, b) => sum + (Number(b.service_price || b.price) || 0), 0);
    return {
      todayCount: todays.length,
      revenueToday,
      totalRevenue,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      total: bookings.length,
    };
  }, [bookings]);

  const waToClient = (phoneRaw: string, message: string) => {
    let phone = (phoneRaw || "").toString().replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "27" + phone.slice(1);
    if (!phone) return alert("No client phone");
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleConfirm = async (bk: any) => {
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bk.id);
    setBookings(bookings.map((b) => (b.id === bk.id ? { ...b, status: "confirmed" } : b)));
    const msg = `Hi ${bk.client_name}! ✅ Your booking at ${business.name} is CONFIRMED.\n\nService: ${bk.service_name} (R${bk.service_price || bk.price || 0})\nDate: ${bk.booking_date} at ${bk.booking_time}\n\nSee you soon! Thank you for booking on HustleHub Secunda.`;
    waToClient(bk.client_phone, msg);
  };

  const handleCancel = async (bk: any) => {
    if (!confirm("Cancel booking?")) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bk.id);
    setBookings(bookings.map((b) => (b.id === bk.id ? { ...b, status: "cancelled" } : b)));
    const msg = `Hi ${bk.client_name} 😔 Your booking at ${business.name} on ${bk.booking_date} at ${bk.booking_time} has been CANCELLED.`;
    waToClient(bk.client_phone, msg);
  };

  const handleReschedule = async (bk: any) => {
    const newDate = prompt("New date YYYY-MM-DD", bk.booking_date);
    if (!newDate) return;
    const newTime = prompt("New time HH:MM", bk.booking_time);
    if (!newTime) return;
    await supabase.from("bookings").update({ booking_date: newDate, booking_time: newTime, status: "confirmed" }).eq("id", bk.id);
    setBookings(bookings.map((b) => (b.id === bk.id ? { ...b, booking_date: newDate, booking_time: newTime, status: "confirmed" } : b)));
    const msg = `Hi ${bk.client_name}! 🔄 Your booking at ${business.name} has been MOVED to ${newDate} at ${newTime}.`;
    waToClient(bk.client_phone, msg);
  };

  const handleCloseOut = () => {
    const today = new Date().toISOString().split("T")[0];
    const todaysAll = bookings.filter((b) => b.booking_date === today);
    const todays = todaysAll.filter((b) => !b.status?.includes("cancel"));
    const total = todays.reduce((sum, b) => sum + (Number(b.service_price || b.price) || 0), 0);
    const list =
      todays.length > 0
        ? todays
            .map(
              (b) =>
                `• ${b.client_name} - ${b.service_name} R${b.service_price || b.price || 0} at ${b.booking_time} (${b.status})`
            )
            .join("\n")
        : "No valid bookings today";
    const msg = `📊 DAILY CLOSE-OUT - ${business.name}\nDate: ${today}\n\n${list}\n\nTotal Revenue: R${total}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10 font-bold">Loading dashboard...</div>;
  if (!business) return <div className="min-h-screen bg-black text-white p-10 font-bold">Business not found.</div>;

  // PASSWORD LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-8 shadow-2xl">
          <Link href="/manager" className="text-xs text-zinc-500 hover:text-white">← Back to Manager Hub</Link>
          <h1 className="text-2xl font-black mt-4">{business.name}</h1>
          <p className="text-zinc-400 text-xs mt-1">Enter manager password to access this portal.</p>
          
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter PIN (default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white"
                autoFocus
              />
            </div>
            {errorMsg && <p className="text-red-400 text-xs font-bold">{errorMsg}</p>}
            <button type="submit" className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-zinc-200 transition">
              Unlock Portal →
            </button>
          </form>
        </div>
      </div>
    );
  }

  const bookingLink = `https://hustlehubsecunda.co.za/${business.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingLink)}`;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <Link href="/manager" className="text-sm text-zinc-500 hover:text-white">← Back to Manager Hub</Link>
        <button onClick={() => setIsAuthenticated(false)} className="text-xs text-zinc-400 hover:text-white underline">Lock Portal</button>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Today Bookings</p>
          <p className="text-2xl font-black mt-1">{stats.todayCount}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-green-500/20 rounded-[16px] p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Revenue Today</p>
          <p className="text-2xl font-black mt-1 text-green-400">R{stats.revenueToday}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Total Revenue</p>
          <p className="text-2xl font-black mt-1">R{stats.totalRevenue}</p>
          <p className="text-[11px] text-zinc-600">{stats.total} bookings</p>
        </div>
        <div className="bg-[#1A1A1A] border border-orange-500/20 rounded-[16px] p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Pending / Confirmed</p>
          <p className="text-2xl font-black mt-1">{stats.pending} / {stats.confirmed}</p>
        </div>
      </div>

      <button onClick={handleCloseOut} className="mt-4 w-full md:w-auto bg-[#1A1A1A] border border-white/10 hover:bg-white hover:text-black transition text-white px-5 py-3 rounded-full text-xs font-bold">
        📊 Send Daily Close-Out to My WhatsApp
      </button>

      <div className="mt-6 grid md:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Column: Info, QR & Payment Controls */}
        <div className="space-y-4 sticky top-6">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-5">
            <h1 className="text-2xl font-black">{business.name}</h1>
            <p className="text-zinc-500 text-sm">{business.slug}</p>
            <div className="mt-5 bg-white rounded-[20px] p-4 flex flex-col items-center">
              <img src={qrUrl} alt="QR" className="w-56 h-56 rounded-xl" />
              <p className="text-black font-bold text-[11px] mt-3 break-all text-center">{bookingLink}</p>
            </div>
          </div>

          {/* ONLINE PAYMENT & DEPOSIT SETTINGS CONTROL CARD */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                💳 Online Payments & Deposits
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${depositRequired ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-500"}`}>
                {depositRequired ? "ENABLED" : "OFF"}
              </span>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-400">Require Upfront Deposit</span>
              <button
                type="button"
                onClick={() => setDepositRequired(!depositRequired)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${depositRequired ? "bg-emerald-500" : "bg-zinc-800"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${depositRequired ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Deposit Amount Field */}
            {depositRequired && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-zinc-400 font-bold">Deposit Amount (ZAR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-zinc-400 font-bold">R</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-4 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-500">Clients must pay this amount via Paystack during booking.</p>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSavePaymentSettings}
              disabled={savingPaymentSettings}
              className="w-full bg-white text-black font-bold text-xs py-2.5 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {savingPaymentSettings ? "Saving..." : "Save Payment Settings"}
            </button>

            {paymentSaveMsg && (
              <p className="text-[11px] font-bold text-center mt-1 text-emerald-400">{paymentSaveMsg}</p>
            )}
          </div>
        </div>

        {/* Right Column: Bookings Directory */}
        <div>
          <h2 className="font-bold text-lg">Bookings ({bookings.length})</h2>
          <div className="mt-4 space-y-3">
            {bookings.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-6 text-zinc-500 text-sm">
                No bookings found for this business yet.
              </div>
            ) : (
              bookings.map((bk) => (
                <div key={bk.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[14px]">{bk.client_name || "Client"}</p>
                      <p className="text-xs text-zinc-400">{bk.client_phone}</p>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${bk.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
                      {bk.status} - R{bk.service_price || bk.price || 0}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    {bk.service_name} — {bk.booking_date} at {bk.booking_time}
                  </p>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button onClick={() => handleConfirm(bk)} className="bg-white text-black px-3.5 py-1.5 rounded-full text-[11px] font-bold hover:bg-zinc-200 transition">
                      Confirm → Client
                    </button>
                    <button onClick={() => handleCancel(bk)} className="bg-red-500/20 text-red-400 px-3.5 py-1.5 rounded-full text-[11px] font-bold hover:bg-red-500/30 transition">
                      Cancel → Client
                    </button>
                    <button onClick={() => handleReschedule(bk)} className="bg-zinc-800 text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold hover:bg-zinc-700 transition">
                      Move → Client
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}