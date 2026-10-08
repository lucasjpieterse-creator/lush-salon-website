"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManagerDetail() {
  const params = useParams();
  const rawSlug = params.slug as string | string[];
  const slug = Array.isArray(rawSlug)? rawSlug[0] : rawSlug;
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data: biz, error } = await supabase.from("businesses").select("*").eq("slug", slug).single();
        if (error) { setErrorMsg(error.message); return; }
        setBusiness(biz);
        const { data: books } = await supabase.from("bookings").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
        setBookings(books || []);
      } catch (e: any) { setErrorMsg(e.message); }
    })();
  }, [slug]);

  const waToClient = (bk: any, message: string) => {
    const phone = (bk.client_phone || bk.customer_phone || bk.phone || "").toString().replace(/\D/g, "");
    if (!phone) return alert("No client phone number");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleConfirm = async (bk: any) => {
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, status: "confirmed"} : b));
    waToClient(bk, `Hi ${bk.client_name||"there"}! ✅ Your booking at ${business.name} is CONFIRMED.\n\nService: ${bk.service_name} - R${bk.service_price}\nDate: ${bk.booking_date} at ${bk.booking_time}\n\nSee you soon!`);
  };

  const handleCancel = async (bk: any) => {
    if (!confirm("Cancel this booking?")) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, status: "cancelled"} : b));
    waToClient(bk, `Hi ${bk.client_name||"there"} 😔 Your booking at ${business.name} on ${bk.booking_date} at ${bk.booking_time} has been CANCELLED.\n\nReply here to reschedule.`);
  };

  const handleReschedule = async (bk: any) => {
    const newDate = prompt("New date? YYYY-MM-DD", bk.booking_date);
    if (!newDate) return;
    const newTime = prompt("New time? HH:MM", bk.booking_time);
    if (!newTime) return;
    await supabase.from("bookings").update({ booking_date: newDate, booking_time: newTime, status: "confirmed" }).eq("id", bk.id);
    setBookings(bookings.map(b => b.id === bk.id? {...b, booking_date: newDate, booking_time: newTime, status: "confirmed"} : b));
    waToClient(bk, `Hi ${bk.client_name||"there"}! 🔄 Your booking at ${business.name} moved to ${newDate} at ${newTime}.\n\nPlease reply CONFIRM?`);
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    setBookings(bookings.filter(b => b.id!== id));
  };

  if (errorMsg) return <div className="min-h-screen bg-black text-white p-10">Error: {errorMsg}<br/><Link href="/manager" className="underline">← Back</Link></div>;
  if (!business) return <div className="min-h-screen bg-black text-white p-10">Loading {slug}...</div>;

  const bookingLink = `https://hustlehub-secunda.co.za/${business.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(bookingLink)}`;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      <Link href="/manager" className="text-zinc-500 hover:text-white text-sm">← Back to Manager Hub</Link>
      <div className="mt-6 grid md:grid-cols-[340px_1fr] gap-6 items-start">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-5 sticky top-6">
          <h1 className="text-2xl font-black">{business.name}</h1>
          <p className="text-zinc-500 text-sm">{business.slug}</p>
          <div className="mt-5 bg-white rounded-[20px] p-4 flex flex-col items-center">
            <img src={qrUrl} alt="QR" className="w-56 h-56 rounded-xl" />
            <p className="text-black font-bold text-xs mt-3 text-center break-all">{bookingLink}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={qrUrl} target="_blank" className="bg-white text-black text-center py-3 rounded-full text-xs font-bold">Download QR</a>
            <button onClick={()=>navigator.clipboard.writeText(bookingLink)} className="bg-[#2A2A2A] border border-white/10 py-3 rounded-full text-xs font-bold">Copy Link</button>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg">Bookings ({bookings.length})</h2>
          <div className="mt-4 space-y-3">
            {bookings.map((bk) => (
              <div key={bk.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4">
                <div className="flex justify-between">
                  <p className="font-bold text-[14px]">{bk.client_name || "No name"} • {bk.client_phone}</p>
                  <span className={`text-[11px] px-2 py-1 rounded-full ${bk.status==="confirmed"?"bg-green-500/20 text-green-400":"bg-orange-500/20 text-orange-400"}`}>{bk.status}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{bk.service_name} • R{bk.service_price} • {bk.booking_date} at {bk.booking_time}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button onClick={()=>handleConfirm(bk)} className="bg-white text-black px-3 py-1.5 rounded-full text-[11px] font-bold">Confirm → Client WhatsApp</button>
                  <button onClick={()=>handleCancel(bk)} className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-[11px] font-bold">Cancel → Client WhatsApp</button>
                  <button onClick={()=>handleReschedule(bk)} className="bg-zinc-800 text-white px-3 py-1.5 rounded-full text-[11px] font-bold">Move → Client WhatsApp</button>
                  <button onClick={()=>deleteBooking(bk.id)} className="ml-auto text-zinc-500 text-[11px]">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}