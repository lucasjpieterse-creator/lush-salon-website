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

  const waToClient = (bk: any, message: string) => {
    const phone = (bk.client_phone || bk.customer_phone || bk.phone || "").replace(/\D/g, "");
    if (!phone) return alert("No client phone");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleConfirm = async (bk: any) => {
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, status: "confirmed" } : b));
    const name = bk.client_name || bk.customer_name || bk.name || "there";
    const msg = `Hi ${name}! ✅ Your booking at ${business.name} is CONFIRMED.

Service: ${bk.service_name} - R${bk.service_price}
Date: ${bk.booking_date} at ${bk.booking_time}

See you soon! 📍`;
    waToClient(bk, msg);
  };

  const handleCancel = async (bk: any) => {
    if (!confirm(`Cancel booking for ${bk.client_name}?`)) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, status: "cancelled" } : b));
    const name = bk.client_name || "there";
    const msg = `Hi ${name} 😔 Your booking at ${business.name} on ${bk.booking_date} at ${bk.booking_time} has been CANCELLED.

If this was a mistake or you want to reschedule, just reply here.`;
    waToClient(bk, msg);
  };

  const handleReschedule = async (bk: any) => {
    const newDate = prompt("New date? YYYY-MM-DD", bk.booking_date);
    if (!newDate) return;
    const newTime = prompt("New time? HH:MM", bk.booking_time);
    if (!newTime) return;
    await supabase.from("bookings").update({ booking_date: newDate, booking_time: newTime, status: "confirmed" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, booking_date: newDate, booking_time: newTime, status: "confirmed" } : b));
    const name = bk.client_name || "there";
    const msg = `Hi ${name}! 🔄 Your booking at ${business.name} has been MOVED.

New Date: ${newDate} at ${newTime}
Service: ${bk.service_name}

Please confirm you can make it?`;
    waToClient(bk, msg);
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    setBookings(bookings.filter(b => b.id!== id));
  };

  if (!business) return <div className="min-h-screen bg-black text-white p-6">Loading...</div>;

  const bookingLink = `https://hustlehub-secunda.co.za/${business.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(bookingLink)}`;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      <Link href="/manager" className="text-sm text-zinc-500 hover:text-white">← Back to Manager Hub</Link>
      <div className="mt-6 grid md:grid-cols-[340px_1fr] gap-6 items-start">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-5 sticky top-6">
          <h1 className="text-2xl font-black text-white">{business.name}</h1>
          <p className="text-zinc-500 text-sm">{business.category} • {business.slug}</p>
          <div className="mt-5 bg-white rounded-[20px] p-4 flex flex-col items-center">
            <img src={qrUrl} alt="QR Code" className="w-56 h-56 rounded-xl" />
            <p className="text-black font-black text-sm mt-3">Scan to Book Instantly</p>
            <p className="text-zinc-500 text-[11px] mt-1 text-center break-all">{bookingLink}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={qrUrl} download={`${business.slug}-qr.png`} target="_blank" className="bg-white text-black text-center py-3 rounded-full text-xs font-bold">Download QR</a>
            <button onClick={() => navigator.clipboard.writeText(bookingLink)} className="bg-[#2A2A2A] border border-white/10 text-white py-3 rounded-full text-xs font-bold">Copy Link</button>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-white text-lg">Bookings ({bookings.length})</h2>
          <div className="mt-4 grid gap-3">
            {bookings.map((bk) => {
              const name = bk.client_name || bk.customer_name || bk.name || "No name";
              const phone = bk.client_phone || bk.customer_phone || bk.phone || "";
              const service = bk.service_name || bk.service || "Service";
              const date = bk.booking_date || bk.date || "";
              const time = bk.booking_time || bk.time || "";
              return (
                <div key={bk.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-[14px]">{name}</p>
                      <p className="text-zinc-400 text-xs mt-1">{service} • {date} at {time}</p>
                      <p className="text-zinc-500 text-[11px] mt-1">{phone} {bk.service_price? `• R${bk.service_price}` : ""}</p>
                    </div>
                    <span className={`text-[11px] px-3 py-1 rounded-full font-bold capitalize ${bk.status === "pending"? "bg-orange-500/20 text-orange-400" : bk.status === "confirmed"? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>{bk.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => handleConfirm(bk)} className="bg-white text-black px-3 py-1.5 rounded-full text-[11px] font-bold">Confirm → WhatsApp Client</button>
                    <button onClick={() => handleCancel(bk)} className="bg-[#2A2A2A] border border-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-[11px] font-bold">Cancel → WhatsApp Client</button>
                    <button onClick={() => handleReschedule(bk)} className="bg-[#2A2A2A] border border-white/10 text-white px-3 py-1.5 rounded-full text-[11px] font-bold">Move / Reschedule → WhatsApp Client</button>
                    <button onClick={() => deleteBooking(bk.id)} className="ml-auto text-zinc-500 text-[11px] hover:text-red-400">Delete</button>
                  </div>
                </div>
              );
            })}
            {bookings.length === 0 && <p className="text-zinc-600 text-sm mt-4">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}