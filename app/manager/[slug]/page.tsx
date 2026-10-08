"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ManagerSlugPage() {
  const { slug } = useParams() as { slug: string };
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  async function load() {
    setLoading(true);
    const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
    if (!biz) { setLoading(false); return; }
    setBusiness(biz);
    const { data } = await supabase.from("bookings").select("*").eq("business_id", biz.id).order("booking_date", { ascending: true });
    setBookings(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [slug]);

  async function updateStatus(b: any, status: string, dateVal?: string, timeVal?: string) {
    if (status === "rescheduled" && (!dateVal ||!timeVal)) {
      alert("Pick date and time");
      return;
    }
    const updateData: any = { status: status === "rescheduled"? "confirmed" : status };
    if (dateVal) updateData.booking_date = dateVal;
    if (timeVal) updateData.booking_time = timeVal;

    const { error } = await supabase.from("bookings").update(updateData).eq("id", b.id);
    if (error) { alert(error.message); return; }

    if (b.client_phone) {
      const clean = b.client_phone.replace(/\D/g, "");
      let msg = "";
      if (status === "confirmed") msg = `Hi ${b.client_name || ''}! ✅ Your booking for ${b.service_name} at ${business.name} is CONFIRMED for ${dateVal || b.booking_date} at ${timeVal || b.booking_time}. See you!`;
      if (status === "cancelled") msg = `Hi ${b.client_name || ''}! ❌ Your booking for ${b.service_name} at ${business.name} on ${b.booking_date} has been cancelled. Reply to rebook.`;
      if (status === "rescheduled") msg = `Hi ${b.client_name || ''}! 🔁 Your booking at ${business.name} was rescheduled to ${dateVal} at ${timeVal} for ${b.service_name}. Reply YES to confirm.`;
      if (msg) window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
    }
    setRescheduleId(null);
    load();
  }

  const confirmed = bookings.filter(b => b.status === "confirmed");
  const earnings = bookings.filter(b => b.status!== "cancelled").reduce((sum, b) => sum + Number(b.service_price || 0), 0);

  if (loading) return <div className="p-8 bg-black min-h-screen text-white">Loading {slug}...</div>;
  if (!business) return <div className="p-8 bg-black min-h-screen text-white">Business {slug} not found in Supabase</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <Link href="/manager" className="text-zinc-400 text-sm hover:text-white">← All Managers</Link>
      <h1 className="text-3xl font-black mt-4">{business.name}</h1>
      <p className="text-zinc-500 mt-1">/{business.slug} • {business.phone}</p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-[10px] text-zinc-500 uppercase">Bookings</p><p className="text-2xl font-black">{bookings.length}</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-[10px] text-zinc-500 uppercase">Confirmed</p><p className="text-2xl font-black text-green-500">{confirmed.length}</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-[10px] text-zinc-500 uppercase">Earnings</p><p className="text-2xl font-black">R{earnings}</p></div>
      </div>

      <div className="mt-8 space-y-3">
        <h2 className="font-bold">Bookings</h2>
        {bookings.length === 0 && <p className="text-zinc-500 text-sm">No bookings yet</p>}
        {bookings.map((b) => (
          <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex justify-between">
              <p className="font-bold">{b.service_name} • R{b.service_price}</p>
              <span className={`text-[10px] px-2 py-1 rounded-full h-fit ${b.status === 'confirmed'? 'bg-green-600' : b.status === 'cancelled'? 'bg-red-600' : 'bg-orange-500'}`}>{b.status}</span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">👤 {b.client_name || 'Client'} • {b.client_phone}</p>
            <p className="text-sm">📅 {b.booking_date} at {b.booking_time}</p>

            {rescheduleId === b.id? (
              <div className="mt-3 space-y-2">
                <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm"/>
                <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm"/>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>updateStatus(b, "rescheduled", newDate, newTime)} className="bg-blue-600 py-2 rounded-full text-xs font-bold">Save + WhatsApp</button>
                  <button onClick={()=>setRescheduleId(null)} className="bg-zinc-800 py-2 rounded-full text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={()=>updateStatus(b, "confirmed")} className="bg-green-600 py-2 rounded-full text-xs font-bold">✅ Confirm</button>
                <button onClick={()=>{setRescheduleId(b.id); setNewDate(b.booking_date); setNewTime(b.booking_time);}} className="bg-zinc-800 border border-zinc-700 py-2 rounded-full text-xs">🔁 Move</button>
                <button onClick={()=>{if(confirm("Cancel this booking?")) updateStatus(b, "cancelled")}} className="bg-red-900/40 border border-red-800 py-2 rounded-full text-xs">❌ Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link href={`/${business.slug}`} className="text-orange-500 text-sm underline">View Public Page → /{business.slug}</Link>
      </div>
    </div>
  );
}