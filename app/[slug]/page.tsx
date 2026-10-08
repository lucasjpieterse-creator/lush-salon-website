"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function BookingPage() {
  const params = useParams();
  const rawSlug = params.slug as string | string[];
  const slug = Array.isArray(rawSlug)? rawSlug[0] : rawSlug;

  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    booking_date: "",
    booking_time: "",
  });

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      if (!biz) { setLoading(false); return; }
      setBusiness(biz);
      const { data: servs } = await supabase.from("services").select("*").eq("business_id", biz.id);
      setServices(servs || []);
      if (servs && servs[0]) setSelectedService(servs[0]);
      setLoading(false);
    })();
  }, [slug]);

  const handleBooking = async (e: any) => {
    e.preventDefault();
    if (!selectedService) return alert("Select a service");
    if (!formData.client_name ||!formData.client_phone ||!formData.booking_date ||!formData.booking_time) {
      return alert("Fill all fields");
    }

    const payload = {
      business_id: business.id,
      service_name: selectedService.name,
      service_price: selectedService.price,
      client_name: formData.client_name,
      client_phone: formData.client_phone,
      booking_date: formData.booking_date,
      booking_time: formData.booking_time,
      status: "pending",
    };

    const { error } = await supabase.from("bookings").insert(payload);
    if (error) return alert("Booking failed: " + error.message);

    // --- AUTOMATIC WHATSAPP TO OWNER ---
    const ownerRaw = (business.owner_phone || business.phone || business.whatsapp || "").toString();
    let ownerPhone = ownerRaw.replace(/\D/g, "");
    if (ownerPhone.startsWith("0")) ownerPhone = "27" + ownerPhone.slice(1);

    if (ownerPhone) {
      const ownerMsg = `🔔 NEW BOOKING - ${business.name}\n\n👤 Client: ${formData.client_name}\n📱 ${formData.client_phone}\n💅 Service: ${selectedService.name} - R${selectedService.price}\n📅 Date: ${formData.booking_date} at ${formData.booking_time}\n\nManage here: https://hustlehub-secunda.co.za/manager/${business.slug}`;
      window.open(`https://api.whatsapp.com/send?phone=${ownerPhone}&text=${encodeURIComponent(ownerMsg)}`, "_blank");
    }

    setSuccess(true);
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10">Loading {slug}...</div>;
  if (!business) return <div className="min-h-screen bg-black text-white p-10">Business not found: {slug}</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-8 max-w-md w-full">
          <h1 className="text-3xl font-black">✅ Booked!</h1>
          <p className="text-zinc-400 mt-3 text-sm">Your booking at {business.name} for {formData.booking_date} at {formData.booking_time} is pending confirmation. The owner was notified on WhatsApp.</p>
          <p className="text-white font-bold mt-4">{selectedService?.name} - R{selectedService?.price}</p>
          <button onClick={()=>setSuccess(false)} className="mt-6 bg-white text-black w-full py-3 rounded-full font-bold text-sm">Book Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-lg mx-auto">
      <div className="mt-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-6">
        <h1 className="text-3xl font-black">{business.name}</h1>
        <p className="text-zinc-500 text-sm mt-1">{business.category} • Secunda</p>

        <div className="mt-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Service</p>
          <div className="mt-3 grid gap-2">
            {services.map(s => (
              <button key={s.id} onClick={()=>setSelectedService(s)} className={`text-left p-4 rounded-[14px] border text-sm font-bold flex justify-between ${selectedService?.id===s.id? "bg-white text-black border-white" : "bg-[#0F0F0F] border-[#2A2A2A] text-white"}`}>
                <span>{s.name}</span><span>R{s.price}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleBooking} className="mt-6 space-y-3">
          <input placeholder="Your Name" value={formData.client_name} onChange={e=>setFormData({...formData, client_name: e.target.value})} className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white" />
          <input placeholder="WhatsApp Number e.g 0721234567" value={formData.client_phone} onChange={e=>setFormData({...formData, client_phone: e.target.value})} className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white" />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={formData.booking_date} onChange={e=>setFormData({...formData, booking_date: e.target.value})} className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-white" />
            <input type="time" value={formData.booking_time} onChange={e=>setFormData({...formData, booking_time: e.target.value})} className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-white" />
          </div>
          <button type="submit" className="w-full bg-white text-black py-4 rounded-full font-black text-sm mt-2">Confirm Booking - R{selectedService?.price||""}</button>
          <p className="text-[11px] text-zinc-600 text-center mt-2">You will be redirected to WhatsApp to notify the owner automatically</p>
        </form>
      </div>
    </div>
  );
}