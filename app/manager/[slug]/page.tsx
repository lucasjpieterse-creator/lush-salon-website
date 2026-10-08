"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManagerDetail() {
  const { slug } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      if (!biz) return;
      setBusiness(biz);
      const { data: books } = await supabase.from("bookings").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
      setBookings(books || []);
    })();
  }, [slug]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(bookings.map(b => b.id === id? {...b, status } : b));
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    setBookings(bookings.filter(b => b.id!== id));
  };

  const reschedule = async (bk: any) => {
    const newDate = prompt("New date? YYYY-MM-DD", bk.booking_date || bk.date);
    const newTime = prompt("New time? HH:MM", bk.booking_time || bk.time);
    if (!newDate ||!newTime) return;
    await supabase.from("bookings").update({ booking_date: newDate, booking_time: newTime, date: newDate, time: newTime }).eq("id", bk.id);
    location.reload();
  };

  if (!business) return <div className="min-h-screen bg-black text-white p-6">Loading...</div>;

  const bookingLink = `https://hustlehubsecunda.co.za/${business.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(bookingLink)}`;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      <Link href="/manager" className="text-sm text-zinc-500 hover:text-white">← Back to Manager Hub</Link>

      <div className="mt-6 grid md:grid-cols-[340px_1fr] gap-6 items-start">
        {/* LEFT - QR CARD */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-5 sticky top-6">
          <h1 className="text-2xl font-black text-white">{business.name}</h1>
          <p className="text-zinc-500 text-sm">Dog Parlor • {business.slug}</p>

          <div className="mt-5 bg-white rounded-[20px] p-4 flex flex-col items-center">
            <img src={qrUrl} alt="QR Code" className="w-56 h-56 rounded-xl" />
            <p className="text-black font-black text-sm mt-3">Scan to Book Instantly</p>
            <p className="text-zinc-500 text-[11px] mt-1 text-center break-all">{bookingLink}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={qrUrl} download={`${business.slug}-qr.png`} target="_blank" className="bg-white text-black text-center py-3 rounded-full text-xs font-bold">Download QR</a>
            <button onClick={() => navigator.clipboard.writeText(bookingLink)} className="bg-[#2A2A2A] border border-white/10 text-white py-3 rounded-full text-xs font-bold">Copy Link</button>
          </div>
          <p className="text-[11px] text-zinc-600 mt-4 text-center">Share on WhatsApp Status, Facebook, or print for shop!</p>
        </div>

        {/* RIGHT - BOOKINGS */}
        <div>
          <h2 className="font-bold text-white text-lg">Bookings ({bookings.length})</h2>
          <div className="mt-4 grid gap-3">
            {bookings.map((bk) => (
              <div key={bk.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white text-[14px]">{bk.customer_name || bk.name || "No name"}</p>
                    <p className="text-zinc-400 text-xs mt-1">{bk.service_name || bk.service || "Service"} • {bk.booking_date || bk.date} at {bk.booking_time || bk.time}</p>
                    <p className="text-zinc-500 text-[11px] mt-1">{bk.customer_phone || bk.phone} • {bk.customer_whatsapp || ""}</p>
                  </div>
                  <span className={`text-[11px] px-3 py-1 rounded-full font-bold capitalize ${bk.status === "pending"? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : bk.status === "confirmed"? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-800 text-zinc-400"}`}>{bk.status}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => updateStatus(bk.id, "confirmed")} className="bg-white text-black px-3 py-1.5 rounded-full text-[11px] font-bold">Confirm</button>
                  <button onClick={() => updateStatus(bk.id, "cancelled")} className="bg-[#2A2A2A] border border-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-[11px] font-bold">Cancel</button>
                  <button onClick={() => reschedule(bk)} className="bg-[#2A2A2A] border border-white/10 text-white px-3 py-1.5 rounded-full text-[11px] font-bold">Move / Reschedule</button>
                  <a href={`https://wa.me/${bk.customer_phone?.replace("+", "")}?text=Hi ${bk.customer_name}, your booking at ${business.name} on ${bk.booking_date || bk.date}`} target="_blank" className="bg-green-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold">WhatsApp</a>
                  <button onClick={() => deleteBooking(bk.id)} className="ml-auto text-zinc-500 text-[11px] hover:text-red-400">Delete</button>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-zinc-600 text-sm mt-4">No bookings yet. Share your QR code!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}