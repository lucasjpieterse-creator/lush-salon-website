"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Filter = "all" | "today" | "week";

export default function ManagerSlugPage() {
  const { slug } = useParams() as { slug: string };
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  async function load() {
    setLoading(true);
    const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
    if (!biz) { setLoading(false); return; }
    setBusiness(biz);
    const { data: bks } = await supabase.from("bookings").select("*").eq("business_id", biz.id).order("booking_date", { ascending: true });
    setBookings(bks || []);
    const { data: svcs } = await supabase.from("services").select("*").eq("business_id", biz.id).order("price");
    setServices(svcs || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [slug]);

  async function updateStatus(b: any, status: string, dateVal?: string, timeVal?: string) {
    if (status === "rescheduled" && (!dateVal ||!timeVal)) return alert("Pick date and time");
    const updateData: any = { status: status === "rescheduled"? "confirmed" : status };
    if (dateVal) updateData.booking_date = dateVal;
    if (timeVal) updateData.booking_time = timeVal;
    const { error } = await supabase.from("bookings").update(updateData).eq("id", b.id);
    if (error) return alert(error.message);

    // CLIENT WHATSAPP
    if (b.client_phone) {
      const clean = b.client_phone.replace(/\D/g, "");
      const confirmLink = `${window.location.origin}/confirm/${b.id}`;
      let msg = "";
      if (status === "confirmed") msg = `✅ CONFIRMED: ${b.service_name} at ${business.name} on ${dateVal || b.booking_date} at ${timeVal || b.booking_time}. \n\nConfirm you will come: ${confirmLink}`;
      if (status === "cancelled") msg = `❌ CANCELLED: ${b.service_name} on ${b.booking_date}. Reply to rebook: ${window.location.origin}/${business.slug}`;
      if (status === "rescheduled") msg = `🔁 MOVED: New time ${dateVal} at ${timeVal} for ${b.service_name} at ${business.name}. Confirm here: ${confirmLink}`;
      if (status === "reminder") msg = `⏰ REMINDER: Tomorrow ${b.booking_date} at ${b.booking_time} you have ${b.service_name} at ${business.name}. Confirm: ${confirmLink}`;
      if (msg) window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
    }
    setRescheduleId(null);
    load();
  }

  async function updatePrice(serviceId: string, newPrice: string) {
    const price = Number(newPrice);
    if (isNaN(price)) return;
    await supabase.from("services").update({ price }).eq("id", serviceId);
    load();
  }

  // FILTER LOGIC
  const todayStr = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date(); weekFromNow.setDate(weekFromNow.getDate() + 7);
  const filtered = bookings.filter(b => {
    if (filter === "today") return b.booking_date === todayStr;
    if (filter === "week") return b.booking_date >= todayStr && b.booking_date <= weekFromNow.toISOString().split('T')[0];
    return true;
  });

  const confirmed = filtered.filter(b => b.status === "confirmed");
  const earnings = filtered.filter(b => b.status!== "cancelled").reduce((s, b) => s + Number(b.service_price || 0), 0);

  if (loading) return <div className="p-8 bg-black min-h-screen text-white">Loading...</div>;
  if (!business) return <div className="p-8 bg-black min-h-screen text-white">Not found</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <Link href="/manager" className="text-zinc-400 text-sm">← All Managers</Link>
      <h1 className="text-3xl font-black mt-4">{business.name}</h1>

      <div className="flex gap-2 mt-4">
        {(["all","today","week"] as Filter[]).map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${filter===f? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-[10px] text-zinc-500">BOOKINGS ({filter})</p><p className="text-2xl font-black">{filtered.length}</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-[10px] text-zinc-500">CONFIRMED</p><p className="text-2xl font-black text-green-500">{confirmed.length}</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-[10px] text-zinc-500">EARNINGS</p><p className="text-2xl font-black">R{earnings}</p></div>
      </div>

      {/* SERVICES EDITOR */}
      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="font-bold mb-3">Services — Edit Price</h2>
        <div className="space-y-2">
          {services.map(s => (
            <div key={s.id} className="flex justify-between items-center bg-black rounded-xl p-3 border border-zinc-800">
              <span className="text-sm font-bold">{s.name}</span>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-zinc-500">R</span>
                <input defaultValue={s.price} onBlur={(e)=>updatePrice(s.id, e.target.value)} className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg p-1 text-sm text-center"/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOOKINGS */}
      <div className="mt-8 space-y-3">
        <h2 className="font-bold">Bookings</h2>
        {filtered.map((b) => (
          <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex justify-between">
              <p className="font-bold">{b.service_name} • R{b.service_price}</p>
              <span className={`text-[10px] px-2 py-1 rounded-full h-fit ${b.status==='confirmed'?'bg-green-600':b.status==='cancelled'?'bg-red-600':'bg-orange-500'}`}>{b.status}</span>
            </div>
            <p className="text-sm text-zinc-400">👤 {b.client_name} • {b.client_phone}</p>
            <p className="text-sm">📅 {b.booking_date} at {b.booking_time}</p>
            {rescheduleId===b.id?(
              <div className="mt-3 space-y-2">
                <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm"/>
                <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm"/>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>updateStatus(b,"rescheduled",newDate,newTime)} className="bg-blue-600 py-2 rounded-full text-xs font-bold">Save + WhatsApp Client</button>
                  <button onClick={()=>setRescheduleId(null)} className="bg-zinc-800 py-2 rounded-full text-xs">Cancel</button>
                </div>
              </div>
            ):(
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button onClick={()=>updateStatus(b,"confirmed")} className="bg-green-600 py-2 rounded-full text-[11px] font-bold">✅ Confirm</button>
                <button onClick={()=>{setRescheduleId(b.id); setNewDate(b.booking_date); setNewTime(b.booking_time);}} className="bg-zinc-800 border border-zinc-700 py-2 rounded-full text-[11px]">🔁 Move</button>
                <button onClick={()=>updateStatus(b,"reminder")} className="bg-yellow-600 py-2 rounded-full text-[11px] font-bold">⏰ Remind</button>
                <button onClick={()=>{if(confirm("Cancel?")) updateStatus(b,"cancelled")}} className="bg-red-900/40 border border-red-800 py-2 rounded-full text-[11px]">❌</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}