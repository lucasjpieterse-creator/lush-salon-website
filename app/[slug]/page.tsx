"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

export default function BusinessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const label = i === 0? "Today" : i === 1? "Tomorrow" : d.toLocaleDateString("en-ZA", { weekday: "short" });
    const dateStr = d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });
    const full = d.toISOString().split("T")[0];
    return { label, dateStr, full };
  });

  useEffect(() => {
    if (!slug) return;
    (async()=>{
      const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      if (biz) {
        setBusiness(biz);
        const { data: servs } = await supabase.from("services").select("*").eq("business_id", biz.id);
        setServices(servs || []);
      }
    })();
  }, [slug]);

  async function handleWhatsAppBook() {
    if (!selectedService ||!selectedDate ||!selectedTime) return alert("Select service, date and time");
    if (!name ||!phone) return alert("Please enter your name and WhatsApp number");
    const waRaw = business?.whatsapp_number || business?.whatsapp || business?.phone || "";
    if (!waRaw) return alert("Business WhatsApp missing");
    setLoading(true);

    // SAVE WITH ALL COLUMN NAMES so Manager dashboard reads it correctly
    const { data: booking, error } = await supabase.from("bookings").insert({
      business_id: business.id,
      // support both schemas
      service: selectedService.name,
      service_name: selectedService.name,
      service_price: selectedService.price,
      date: selectedDate,
      booking_date: selectedDate,
      time: selectedTime,
      booking_time: selectedTime,
      customer_name: name,
      client_name: name,
      customer_phone: phone,
      client_phone: phone,
      phone: phone,
      status: "pending"
    }).select().single();

    if (error) { setLoading(false); alert(error.message); console.error(error); return; }

    const cleanWa = waRaw.toString().replace(/\D/g,"");
    const dateObj = dates.find(d => d.full === selectedDate);
    const msg = `Hi ${business.name}! 👋 New booking #${booking.id.slice(0,6)}

Service: ${selectedService.name} - R${selectedService.price}
Date: ${dateObj?.label} (${dateObj?.dateStr})
Time: ${selectedTime}
Client: ${name} - ${phone}

Please confirm in Manager Dashboard.`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, "_blank");
    setLoading(false);
    alert("Booked! Business will confirm on WhatsApp.");
    setSelectedDate(""); setSelectedTime(""); setName(""); setPhone("");
  }

  if (!business) return <div className="p-10 text-white bg-black min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-zinc-500 text-sm hover:text-white">← Back to HustleHub</Link>
        <h1 className="text-3xl font-black mt-4">{business.name}</h1>
        <p className="text-zinc-500">{business.category} • {business.location || "Secunda"}</p>

        <div className="mt-8">
          <h2 className="font-bold text-[11px] tracking-[0.2em] text-zinc-500">1. CHOOSE SERVICE</h2>
          <div className="mt-3 space-y-3">
            {services.map((s)=>(<div key={s.id} onClick={()=>{setSelectedService(s); setSelectedDate(""); setSelectedTime("");}} className={`border p-4 rounded-[20px] flex justify-between items-center cursor-pointer transition ${selectedService?.id===s.id? "bg-white text-black border-white" : "bg-[#1A1A1A] border-[#2A2A2A] hover:border-zinc-600"}`}><div><p className="font-bold">{s.name}</p><p className={`text-sm ${selectedService?.id===s.id? "text-zinc-600":"text-zinc-500"}`}>R{s.price}</p></div><div className={`w-6 h-6 rounded-full border flex items-center justify-center ${selectedService?.id===s.id? "bg-black border-black text-white":"border-[#2A2A2A]"}`}>{selectedService?.id===s.id && "✓"}</div></div>))}
            {services.length===0 && <p className="text-zinc-600 text-sm">No services added yet.</p>}
          </div>
        </div>

        {selectedService && (
          <div className="mt-8"><h2 className="font-bold text-[11px] tracking-[0.2em] text-zinc-500">2. CHOOSE DATE</h2>
          <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-2">{dates.map((d)=>(<button key={d.full} onClick={()=>setSelectedDate(d.full)} className={`py-3 rounded-[16px] text-sm font-bold border flex flex-col items-center transition ${selectedDate===d.full? "bg-white text-black border-white" : "bg-[#1A1A1A] border-[#2A2A2A] text-zinc-300 hover:border-zinc-600"}`}><span>{d.label}</span><span className="text-[11px] opacity-60">{d.dateStr}</span></button>))}</div></div>
        )}

        {selectedService && selectedDate && (
          <div className="mt-8"><h2 className="font-bold text-[11px] tracking-[0.2em] text-zinc-500">3. CHOOSE TIME</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">{TIME_SLOTS.map((t)=>(<button key={t} onClick={()=>setSelectedTime(t)} className={`py-3 rounded-full text-sm font-bold border transition ${selectedTime===t? "bg-white text-black border-white" : "bg-[#1A1A1A] border-[#2A2A2A] text-zinc-300 hover:border-zinc-600"}`}>{t}</button>))}</div></div>
        )}

        {selectedService && selectedDate && selectedTime && (
          <div className="mt-8">
            <h2 className="font-bold text-[11px] tracking-[0.2em] text-zinc-500">4. YOUR DETAILS</h2>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your Name" className="border border-[#2A2A2A] bg-[#1A1A1A] p-4 w-full mt-3 rounded-[16px] text-white placeholder-zinc-500 focus:border-zinc-500 outline-none" />
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Your WhatsApp number (e.g. 082...)" className="border border-[#2A2A2A] bg-[#1A1A1A] p-4 w-full mt-3 rounded-[16px] text-white placeholder-zinc-500 focus:border-zinc-500 outline-none" />
            <button disabled={loading} onClick={handleWhatsAppBook} className="mt-4 w-full bg-[#25D366] hover:bg-[#20bd5a] text-black py-4 rounded-full font-black transition">{loading? "Saving..." : `Book ${selectedService.name} →`}</button>
          </div>
        )}
      </div>
    </div>
  );
}