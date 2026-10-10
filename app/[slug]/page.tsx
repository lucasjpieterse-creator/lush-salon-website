"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function BookingPage() {
  const params = useParams();
  const rawSlug = params.slug as string | string[];
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paying, setPaying] = useState(false);

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

      // --- CYBERPUNK CEO VIEW COUNTER ---
      supabase.rpc("increment_views", { row_id: biz.id }).then(({ error }) => {
        if (error) {
          supabase.from("businesses").update({ views: (biz.views || 0) + 1 }).eq("id", biz.id).then(()=>{});
        }
      });
      supabase.from("business_views").insert({ business_id: biz.id }).then(()=>{});

      const { data: servs } = await supabase.from("services").select("*").eq("business_id", biz.id);
      setServices(servs || []);
      // Default select the first service if available
      if (servs && servs[0]) {
        setSelectedServiceIds([servs[0].id]);
      }
      setLoading(false);
    })();
  }, [slug]);

  // Helper function to call the background WhatsApp API route
  const sendAutomatedWhatsApp = async (recipientPhone: string, messageText: string) => {
    try {
      await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: recipientPhone, message: messageText }),
      });
    } catch (err) {
      console.error("WhatsApp dispatch failed:", err);
    }
  };

  const toggleServiceSelection = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      // Don't allow deselecting if it's the only one selected
      if (selectedServiceIds.length === 1) return;
      setSelectedServiceIds(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  // Compute selected services objects and total price
  const selectedServicesList = services.filter(s => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServicesList.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const serviceNamesString = selectedServicesList.map(s => s.name).join(" + ");

  const handleBooking = async (e: any) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) return alert("Select at least one service");
    if (!formData.client_name || !formData.client_phone || !formData.booking_date || !formData.booking_time) {
      return alert("Fill all fields");
    }

    const isDepositRequired = Boolean(business.deposit_required);
    const depositAmount = Number(business.deposit_amount || 0);

    // --- REAL PAYSTACK INITIALIZATION FLOW ---
    if (isDepositRequired && depositAmount > 0) {
      setPaying(true);
      try {
        const cleanPhone = formData.client_phone.replace(/\D/g, "");
        const res = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: `${cleanPhone || "client"}@hustlehubsecunda.co.za`,
            amount: depositAmount,
            metadata: {
              slug: business.slug,
              business_id: business.id,
              client_name: formData.client_name,
              client_phone: formData.client_phone,
              service_name: serviceNamesString,
              service_price: totalPrice,
              booking_date: formData.booking_date,
              booking_time: formData.booking_time,
            },
          }),
        });

        const data = await res.json();
        setPaying(false);

        if (data.authorization_url) {
          window.location.href = data.authorization_url;
          return;
        } else {
          alert("Paystack error: " + (data.error || "Failed to initialize payment gateway."));
          return;
        }
      } catch (err: any) {
        setPaying(false);
        alert("Payment process failed: " + err.message);
        return;
      }
    }

    // --- STANDARD FREE / NO-DEPOSIT BOOKING FALLBACK ---
    const payload = {
      business_id: business.id,
      service_name: serviceNamesString,
      service_price: totalPrice,
      client_name: formData.client_name,
      client_phone: formData.client_phone,
      booking_date: formData.booking_date,
      booking_time: formData.booking_time,
      status: "pending",
    };

    const { error } = await supabase.from("bookings").insert(payload);
    if (error) return alert("Booking failed: " + error.message);

    // Format owner phone number
    const ownerRaw = (business.whatsapp_number || business.whatsapp || business.owner_phone || business.phone || "").toString();
    let ownerPhone = ownerRaw.trim().replace(/\D/g, "");
    if (ownerPhone.startsWith("0")) ownerPhone = "27" + ownerPhone.slice(1);

    // 1. Send automated notification to CLIENT
    const clientMsg = `🗓️ Booking Request Received - ${business.name}\n\nServices: ${serviceNamesString} (Total: R${totalPrice})\nDate & Time: ${formData.booking_date} at ${formData.booking_time}\nStatus: Pending Confirmation\n\nHi ${formData.client_name}, your booking request has been submitted!`;
    await sendAutomatedWhatsApp(formData.client_phone, clientMsg);

    // 2. Send automated notification to OWNER
    if (ownerPhone) {
      const ownerMsg = `🔔 NEW MULTI-SERVICE BOOKING - ${business.name}\n\n👤 Client: ${formData.client_name}\n📱 ${formData.client_phone}\n💅 Services: ${serviceNamesString} (R${totalPrice})\n📅 Date: ${formData.booking_date} at ${formData.booking_time}\n\nManage here: https://hustlehubsecunda.co.za/manager/${business.slug}`;
      await sendAutomatedWhatsApp(ownerPhone, ownerMsg);
    }

    setSuccess(true);
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10">Loading {slug}...</div>;
  if (!business) return <div className="min-h-screen bg-black text-white p-10">Business not found: {slug}</div>;

  const isDepositRequired = Boolean(business.deposit_required);
  const depositAmount = Number(business.deposit_amount || 0);

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-8 max-w-md w-full">
          <h1 className="text-3xl font-black text-emerald-400">✅ Booked!</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Your booking at {business.name} for {formData.booking_date} at {formData.booking_time} is submitted. Details have been sent to your WhatsApp.
          </p>
          <p className="text-white font-bold mt-4">
            {serviceNamesString} — R{totalPrice}
          </p>
          <button onClick={() => setSuccess(false)} className="mt-6 bg-white text-black w-full py-3 rounded-full font-bold text-sm">
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-lg mx-auto">
      <div className="mt-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-black">{business.name}</h1>
          {isDepositRequired && depositAmount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-3 py-1 rounded-full">
              💳 Paystack Deposit: R{depositAmount}
            </span>
          )}
        </div>
        <p className="text-zinc-500 text-sm mt-1">{business.category} // Secunda</p>

        <div className="mt-6">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Services (Multi-select)</p>
            <span className="text-[11px] text-zinc-500 font-bold">{selectedServiceIds.length} selected</span>
          </div>
          <div className="mt-3 grid gap-2">
            {services.map((s) => {
              const isSelected = selectedServiceIds.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleServiceSelection(s.id)}
                  className={`text-left p-4 rounded-[14px] border text-sm font-bold flex justify-between items-center transition ${
                    isSelected ? "bg-white text-black border-white" : "bg-[#0F0F0F] border-[#2A2A2A] text-white hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs ${isSelected ? "bg-black text-white border-black" : "border-zinc-700 bg-black"}`}>
                      {isSelected && "✓"}
                    </div>
                    <span>{s.name}</span>
                  </div>
                  <span>R{s.price}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleBooking} className="mt-6 space-y-3">
          <input
            placeholder="Your Name"
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white"
          />
          <input
            placeholder="WhatsApp Number e.g 0721234567"
            value={formData.client_phone}
            onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={formData.booking_date}
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-white"
            />
            <input
              type="time"
              value={formData.booking_time}
              onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            disabled={paying}
            className="w-full bg-white text-black py-4 rounded-full font-black text-sm mt-2 hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {paying
              ? "Connecting to Paystack..."
              : isDepositRequired && depositAmount > 0
              ? `Pay R${depositAmount} Deposit & Book (${selectedServiceIds.length} services)`
              : `Confirm Booking - R${totalPrice}`}
          </button>
          
          <p className="text-[11px] text-zinc-600 text-center mt-2">
            {isDepositRequired && depositAmount > 0
              ? "🔒 Secure online payments powered by Paystack"
              : "Automated confirmation details will be sent directly to your WhatsApp"}
          </p>
        </form>
      </div>
    </div>
  );
}