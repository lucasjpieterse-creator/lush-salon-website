"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ManagerSlugPage() {
  const { slug } = useParams() as { slug: string };
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  async function load() {
    const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
    if (!biz) return;
    setBusiness(biz);
    const { data } = await supabase.from("bookings").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
    setBookings(data || []);
  }
  useEffect(() => { load(); }, [slug]);

  async function updateStatus(b: any, status: string, dateVal?: string, timeVal?: string) {
    const updateData: any = { status: status === "rescheduled"? "confirmed" : status };
    if (dateVal) updateData.booking_date = dateVal;
    if (timeVal) updateData.booking_time = timeVal;
    const { error } = await supabase.from("bookings").update(updateData).eq("id", b.id);
    if (error) { alert(error.message); return; }
    if (b.client_phone) {
      const clean = b.client_phone.replace(/\D/g, "");
      const msg = status === "rescheduled"? `Hi! Rescheduled to ${dateVal} at ${timeVal}` : status;
      window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
    }
    setRescheduleId(null);
    load();
  }

  if (!business) return <div className="p-8 bg-black min-h-screen text-white">Loading {slug}...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <Link href="/manager" className="text-zinc-400 text-sm">← All Managers</Link>
      <h1 className="text-3xl font-black mt-4">{business.name}</h1>
      <p className="text-zinc-500 mt-1">{bookings.length} bookings</p>
      <div className="mt-6 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="font-bold">{b.service_name} • R{b.service_price}</p>
            <p className="text-sm">📅 {b.booking_date} at {b.booking_time} — {b.client_phone}</p>
            <span className="text-[10px] bg-orange-500 px-2 py-1 rounded-full">{b.status}</span>
            {rescheduleId === b.id? (
              <div className="mt-3 space-y-2">
                <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm"/>
                <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm"/>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>updateStatus(b, "rescheduled", newDate, newTime)} className="bg-blue-600 py-2 rounded-full text-xs font-bold">Save</button>
                  <button onClick={()=>setRescheduleId(null)} className="bg-zinc-800 py-2 rounded-full text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={()=>updateStatus(b, "confirmed")} className="bg-green-600 py-2 rounded-full text-xs font-bold">✅ Confirm</button>
                <button onClick={()=>{setRescheduleId(b.id); setNewDate(b.booking_date); setNewTime(b.booking_time);}} className="bg-zinc-800 border border-zinc-700 py-2 rounded-full text-xs">🔁 Reschedule</button>
                <button onClick={()=>{if(confirm("Cancel?")) updateStatus(b, "cancelled")}} className="bg-red-900/30 py-2 rounded-full text-xs">❌ Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}