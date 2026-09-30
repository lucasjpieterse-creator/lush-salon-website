"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function BusinessPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      console.log("Loading business for slug:", slug);
      const { data: biz, error } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      if (error) console.error("biz error", error);
      if (biz) {
        setBusiness(biz);
        const { data: servs } = await supabase.from("services").select("*").eq("business_id", biz.id);
        setServices(servs || []);
      }
    }
    load();
  }, [slug]);

  async function handleBook(service: any) {
    if (!phone) { alert("Please enter your WhatsApp number"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          service: service.name,
          price: service.price,
          business: business.name,
        })
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(JSON.stringify(data));
      alert(`Booked ${service.name}! Check WhatsApp`);
    } catch (err: any) {
      alert("Booking failed: " + err.message);
    }
    setLoading(false);
  }

  if (!business) return <div className="p-10">Loading {slug}...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">{business.name}</h1>
      <p className="text-gray-500">{business.category}</p>
      <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="082 123 4567" className="border p-3 w-full mt-6 rounded" />
      <div className="mt-6 space-y-3">
        {services.map((s)=>(
          <div key={s.id} className="border p-4 rounded flex justify-between items-center">
            <div><p className="font-semibold">{s.name}</p><p>R{s.price}</p></div>
            <button disabled={loading} onClick={()=>handleBook(s)} className="bg-black text-white px-4 py-2 rounded">{loading?"Booking...":"Book"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}