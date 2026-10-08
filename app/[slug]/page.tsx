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
  const [selectedTime, setSelectedTime] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      if (biz) {
        setBusiness(biz);
        const { data: servs } = await supabase.from("services").select("*").eq("business_id", biz.id);
        setServices(servs || []);
      }
    }
    load();
  }, [slug]);

  function handleWhatsAppBook() {
    if (!selectedService) { alert("Select a service"); return; }
    if (!selectedTime) { alert("Select a time"); return; }
    if (!business?.whatsapp) { alert("Business WhatsApp not set"); return; }

    const cleanWa = business.whatsapp.replace(/\D/g,""); // remove spaces
    const msg = `Hi ${business.name}! 👋

I want to book:
• Service: ${selectedService.name} - R${selectedService.price}
• Time: ${selectedTime} today
• My number: ${phone || "I'll call"}

Found you on HustleHub Secunda 🎃`;

    // track click
    supabase.from("business_clicks").insert({ business_id: business.id, click_type: "whatsapp" }).then(()=>{},()=>{});

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  if (!business) return <div className="p-10 text-white bg-black min-h-screen">Loading {slug}...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-zinc-500 text-sm">← Back to HustleHub</Link>
        <h1 className="text-3xl font-black mt-4">{business.name}</h1>
        <p className="text-zinc-500">{business.category}</p>

        {/* Step 1: Service */}
        <div className="mt-8">
          <h2 className="font-bold text-sm tracking-widest text-zinc-400">1. CHOOSE SERVICE</h2>
          <div className="mt-3 space-y-3">
            {services.map((s)=>(
              <div key={s.id} onClick={()=>setSelectedService(s)} className={`border p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all ${selectedService?.id===s.id? "bg-white text-black border-white" : "bg-zinc-900 border-zinc-800"}`}>
                <div><p className="font-semibold">{s.name}</p><p className={`text-sm ${selectedService?.id===s.id? "text-zinc-600" : "text-zinc-500"}`}>R{s.price}</p></div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${selectedService?.id===s.id? "bg-black border-black text-white" : "border-zinc-700"}`}>{selectedService?.id===s.id && "✓"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Time */}
        {selectedService && (
          <div className="mt-8">
            <h2 className="font-bold text-sm tracking-widest text-zinc-400">2. CHOOSE TIME</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((t)=>(
                <button key={t} onClick={()=>setSelectedTime(t)} className={`py-3 rounded-full text-sm font-bold border ${selectedTime===t? "bg-white text-black border-white" : "bg-zinc-900 border-zinc-800 text-zinc-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Your number + Book */}
        {selectedService && selectedTime && (
          <div className="mt-8">
            <h2 className="font-bold text-sm tracking-widest text-zinc-400">3. BOOK ON WHATSAPP</h2>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Your WhatsApp number (optional)" className="border border-zinc-800 bg-zinc-900 p-4 w-full mt-3 rounded-2xl text-white" />

            <button onClick={handleWhatsAppBook} className="mt-4 w-full bg-[#25D366] text-black py-4 rounded-full font-black text-[15px]">
              Book {selectedService.name} at {selectedTime} on WhatsApp →
            </button>
            <p className="text-[11px] text-zinc-500 mt-3 text-center">You will be redirected to WhatsApp with all details filled</p>
          </div>
        )}
      </div>
    </div>
  );
}