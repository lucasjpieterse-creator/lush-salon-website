"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function ManagerPage() {
  const { slug } = useParams() as { slug: string };
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  async function load() {
    let { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
    if (!biz) {
      const alt = slug === "glamour-locks"? "glamourlocks" : slug.replace(/-/g, "");
      const r = await supabase.from("businesses").select("*").eq("slug", alt).single();
      biz = r.data;
    }
    setBusiness(biz);
    if (biz) {
      const { data } = await supabase
       .from("bookings")
       .select("*")
       .eq("business_id", biz.id)
       .order("created_at", { ascending: false });
      setBookings(data || []);
    }
  }

  useEffect(() => { load(); }, [slug]);

  async function updateStatus(b: any, status: string, newDate?: string, newTime?: string) {
    let updateData: any = { status };
    if (newDate) updateData.booking_date = newDate;
    if (newTime) updateData.booking_time = newTime;

    const { error } = await supabase.from("bookings").update(updateData).eq("id", b.id);
    if (error) return alert(error.message);

    // Send WhatsApp to client if phone exists
    if (b.client_phone) {
      const clean = b.client_phone.replace(/\D/g, "");
      let msg = "";
      if (status === "confirmed") msg = `Hi! Your booking for ${b.service_name} on ${b.booking_date} at ${b.booking_time} is CONFIRMED by ${business.name} ✅ See you!`;
      if (status === "cancelled") msg = `Hi! Your booking for ${b.service_name} on ${b.booking_date} at ${b.booking_time} was CANCELLED by ${business.name}. Please book again if needed.`;
      if (status === "rescheduled") msg = `Hi! Your booking for ${b.service_name} has been RESCHEDULED to ${newDate} at ${newTime} by ${business.name}. Please confirm.`;
      if (msg) window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
    }

    load();
  }

  function handleReschedule(b: any) {
    const newDate = prompt("New date (YYYY-MM-DD):", b.booking_date);
    if (!newDate) return;
    const newTime = prompt("New time (e.g. 14:00):", b.booking_time);
    if (!newTime) return;
    updateStatus(b, "rescheduled", newDate, newTime);
  }

  if (!business) return <div className="p-8 bg-black min-h-screen text-white">Loading {slug}...</div>;

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <div className="flex justify-between text-sm">
        <Link href="/manager" className="text-zinc-400">← All Managers</Link>
        <Link href={`/${slug}`} className="text-zinc-400">View Booking Page →</Link>
      </div>

      <h1 className="text-3xl font-black mt-6">{business.name}</h1>
      <p className="text-zinc-400 mt-1">{business.owner_name} • {bookings.length} total bookings</p>

      {pendingCount > 0 && (
        <div className="mt-4 bg-orange-600 text-white px-4 py-3 rounded-full font-bold text-sm animate-pulse">
          🔔 {pendingCount} NEW BOOKING ALERT{pendingCount > 1? "S" : ""} — Action needed!
        </div>
      )}

      <div className="mt-6 space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className={`border rounded-2xl p-4 ${b.status === "pending"? "bg-orange-950/30 border-orange-600/50" : b.status === "cancelled"? "bg-zinc-900 border-zinc-800 opacity-60" : "bg-zinc-900 border-zinc-800"}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">{b.service_name} {b.service_price && `• R${b.service_price}`}</p>
                <p className="text-sm text-zinc-300 mt-1">📅 {b.booking_date} at {b.booking_time}</p>
                <p className="text-xs text-zinc-500 mt-1">Client: {b.client_phone || "No number"} • {new Date(b.created_at).toLocaleString()}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-[10px] font-black tracking-widest ${b.status === "pending"? "bg-orange-500 text-white" : b.status === "confirmed"? "bg-green-600 text-white" : b.status === "cancelled"? "bg-zinc-700 text-zinc-300" : "bg-blue-600 text-white"}`}>{b.status?.toUpperCase()}</span>
              </div>
              <p className="text-[10px] text-zinc-600">#{b.id.slice(0,6)}</p>
            </div>

            {/* Owner Actions */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={() => updateStatus(b, "confirmed")} className="bg-green-600 text-white py-2.5 rounded-full text-xs font-bold">✅ Confirm</button>
              <button onClick={() => handleReschedule(b)} className="bg-zinc-800 border border-zinc-700 text-white py-2.5 rounded-full text-xs font-bold">🔁 Reschedule</button>
              <button onClick={() => { if (confirm("Cancel this booking?")) updateStatus(b, "cancelled"); }} className="bg-red-600/20 border border-red-600/30 text-red-400 py-2.5 rounded-full text-xs font-bold">❌ Cancel</button>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <div className="bg-zinc-900 p-8 rounded-2xl text-center text-zinc-500">No bookings yet. Go test one on /{slug}!</div>}
      </div>
    </div>
  );
}