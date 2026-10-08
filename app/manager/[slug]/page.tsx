"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManagerDetail() {
  const params = useParams();
  const rawSlug = params.slug as string | string[];
  const slug = Array.isArray(rawSlug)? rawSlug[0] : rawSlug;
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      if (!biz) return;
      setBusiness(biz);
      const { data: books } = await supabase.from("bookings").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
      setBookings(books || []);
    })();
  }, [slug]);

  // --- STATS ---
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todays = bookings.filter(b => b.booking_date === today);
    const revenueToday = todays.filter(b=> b.status!== 'cancelled').reduce((sum,b)=> sum + (Number(b.service_price)||0), 0);
    const totalRevenue = bookings.filter(b=> b.status!== 'cancelled').reduce((sum,b)=> sum + (Number(b.service_price)||0), 0);
    return {
      todayCount: todays.length,
      revenueToday,
      totalRevenue,
      pending: bookings.filter(b=>b.status==='pending').length,
      confirmed: bookings.filter(b=>b.status==='confirmed').length,
      total: bookings.length
    };
  }, [bookings]);

  const waToClient = (phoneRaw: string, message: string) => {
    let phone = phoneRaw.toString().replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "27" + phone.slice(1);
    if (!phone) return alert("No client phone");
    // FIXED: use api.whatsapp.com + encoded text = always prefilled
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleConfirm = async (bk: any) => {
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, status: "confirmed"} : b));
    const msg = `Hi ${bk.client_name}! ✅ Your booking at ${business.name} is CONFIRMED.

Service: ${bk.service_name} - R${bk.service_price}
Date: ${bk.booking_date} at ${bk.booking_time}

See you soon! Thank you for booking on HustleHub Secunda.`;
    waToClient(bk.client_phone, msg);
  };

  const handleCancel = async (bk: any) => {
    if (!confirm("Cancel booking?")) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, status: "cancelled"} : b));
    const msg = `Hi ${bk.client_name} 😔 Your booking at ${business.name} on ${bk.booking_date} at ${bk.booking_time} has been CANCELLED.\n\nIf you want to reschedule, please reply to this message.`;
    waToClient(bk.client_phone, msg);
  };

  const handleReschedule = async (bk: any) => {
    const newDate = prompt("New date YYYY-MM-DD", bk.booking_date); if(!newDate) return;
    const newTime = prompt("New time HH:MM", bk.booking_time); if(!newTime) return;
    await supabase.from("bookings").update({ booking_date: newDate, booking_time: newTime, status: "confirmed" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, booking_date: newDate, booking_time: newTime, status: "confirmed"} : b));
    const msg = `Hi ${bk.client_name}! 🔄 Your booking at ${business.name} has been MOVED to ${newDate} at ${newTime}.\nService: ${bk.service_name}\n\nPlease reply CONFIRM if this works for you.`;
    waToClient(bk.client_phone, msg);
  };

  if (!business) return <div className="min-h-screen bg-black text-white p-10">Loading {slug}...</div>;

  const bookingLink = `https://hustlehub-secunda.co.za/${business.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingLink)}`;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      <Link href="/manager" className="text-sm text-zinc-500 hover:text-white">← Back to Manager Hub</Link>

      {/* STATS BAR */}
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

      <div className="mt-6 grid md:grid-cols-[340px_1fr] gap-6 items-start">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-5 sticky top-6">
          <h1 className="text-2xl font-black">{business.name}</h1>
          <p className="text-zinc-500 text-sm">{business.slug}</p>
          <div className="mt-5 bg-white rounded-[20px] p-4 flex flex-col items-center">
            <img src={qrUrl} alt="QR" className="w-56 h-56 rounded-xl" />
            <p className="text-black font-bold text-[11px] mt-3 break-all text-center">{bookingLink}</p>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg">Bookings ({bookings.length})</h2>
          <div className="mt-4 space-y-3">
            {bookings.map(bk => (
              <div key={bk.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4">
                <div className="flex justify-between">
                  <p className="font-bold text-[14px]">{bk.client_name} • {bk.client_phone}</p>
                  <span className={`text-[11px] px-2 py-1 rounded-full font-bold ${bk.status==="confirmed"?"bg-green-500/20 text-green-400":"bg-orange-500/20 text-orange-400"}`}>{bk.status} • R{bk.service_price}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{bk.service_name} • {bk.booking_date} {bk.booking_time}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button onClick={()=>handleConfirm(bk)} className="bg-white text-black px-3 py-1.5 rounded-full text-[11px] font-bold">Confirm → Client (prefilled)</button>
                  <button onClick={()=>handleCancel(bk)} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-[11px] font-bold">Cancel → Client</button>
                  <button onClick={()=>handleReschedule(bk)} className="bg-zinc-800 text-white px-3 py-1.5 rounded-full text-[11px] font-bold">Move → Client</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}