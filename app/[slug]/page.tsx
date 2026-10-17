"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { getCurrentSeasonTheme, ThemeConfig } from "@/lib/theme";
import Link from "next/link";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

export default function PublicBookingPage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = params?.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setTheme(getCurrentSeasonTheme());

    if (!rawParam) return;

    const fetchBusiness = async () => {
      setLoading(true);

      const decodedParam = decodeURIComponent(rawParam).trim();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedParam);

      let query = supabase.from("businesses").select("*");

      if (isUUID) {
        query = query.or(`id.eq.${decodedParam},slug.eq.${decodedParam}`);
      } else {
        query = query.eq("slug", decodedParam);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching business:", error.message);
      }

      if (data) {
        setBusiness(data);

        // Pre-select default standard service
        const initialService = data.category ? `${data.category} Standard Service` : "Standard Service";
        setSelectedServices([initialService]);

        try {
          await supabase
            .from("businesses")
            .update({ views: (data.views || 0) + 1 })
            .eq("id", data.id);
        } catch (e) {
          console.error("Failed to update view counter:", e);
        }
      }

      setLoading(false);
    };

    fetchBusiness();
  }, [rawParam]);

  // Build service list from database array or fallback service options
  const availableServices: ServiceItem[] = business?.services && Array.isArray(business.services) && business.services.length > 0
    ? business.services
    : [
        { id: "s1", name: `${business?.category || "General"} Standard Service`, price: business?.price || 150 },
        { id: "s2", name: "Premium Express Care", price: (business?.price || 150) + 50 },
        { id: "s3", name: "Full VIP Treatment Package", price: (business?.price || 150) * 2 },
      ];

  const toggleService = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      if (selectedServices.length === 1) return; // keep at least 1 selected
      setSelectedServices(selectedServices.filter((s) => s !== serviceName));
    } else {
      setSelectedServices([...selectedServices, serviceName]);
    }
  };

  const calculatedTotal = availableServices
    .filter((s) => selectedServices.includes(s.name))
    .reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert("Please select at least one service before proceeding.");
      return;
    }

    setSubmitting(true);

    const bookingPayload = {
      business_id: business.id,
      client_name: clientName,
      client_phone: clientPhone,
      booking_date: bookingDate,
      booking_time: bookingTime,
      service_name: selectedServices.join(", "),
      service_price: calculatedTotal,
      price: calculatedTotal,
      notes,
      status: "pending",
    };

    const { error } = await supabase.from("bookings").insert([bookingPayload]);

    if (error) {
      alert("Booking failed: " + error.message);
      setSubmitting(false);
      return;
    }

    const targetPhone = (
      business.whatsapp_number ||
      business.whatsapp ||
      business.phone ||
      "27650753499"
    ).replace(/[^0-9]/g, "");

    const message = `⚡ NEW BOOKING REQUEST via TekSBook!\n\n🏢 Service Provider: ${business.name}\n👤 Client: ${clientName}\n📱 Contact: ${clientPhone}\n📅 Date: ${bookingDate}\n⏰ Time: ${bookingTime}\n🛠️ Selected Services:\n${selectedServices.join(", ")}\n💰 Total Price: R${calculatedTotal}\n\nNotes: ${notes || "None"}`;

    // Trigger WhatsApp Click-to-Chat directly
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    alert(`✅ Booking Confirmed! Your request for R${calculatedTotal} has been saved and sent via WhatsApp.`);
    router.push("/");
  };

  if (loading || !theme) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 p-10 font-mono font-bold flex flex-col items-center justify-center">
        <div className="text-2xl animate-pulse">⚡ LOADING BOOKING PORTAL...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-black text-white p-10 font-mono text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black text-red-500">Business Listing Not Found</h1>
        <p className="text-xs text-zinc-400 mt-2">The requested business page does not exist or has not been approved yet.</p>
        <Link href="/" className="mt-6 inline-block text-xs bg-cyan-400 text-black px-6 py-3 rounded-full font-bold hover:bg-cyan-300 transition">
          ← Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto font-sans selection:bg-cyan-500 selection:text-black pb-24 relative overflow-hidden">
      {/* SEASONAL OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute top-4 right-4 text-4xl animate-season-glow">
          {theme.cornerEmojiTopRight}
        </div>
        <div className="absolute bottom-4 left-4 text-4xl animate-season-glow">
          {theme.cornerEmojiBottomLeft}
        </div>
      </div>

      <style jsx global>{`
        @keyframes seasonPulse {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(${theme.glowColorRgb}, 0.8));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(${theme.glowColorRgb}, 1));
            transform: scale(1.08);
          }
        }
        .animate-season-glow { animation: seasonPulse 2.5s infinite ease-in-out; }
      `}</style>

      {/* HEADER */}
      <div className="pb-6 border-b border-zinc-800 relative z-10">
        <Link href="/" className="text-xs font-mono text-cyan-400 hover:underline">
          ← Back to Directory
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">
              {business.category || "Local Service"}
            </span>
            <h1 className="text-3xl font-black mt-2 text-white flex items-center gap-2">
              <span>{business.name}</span>
              <span className="text-lg">{theme.primaryEmoji}</span>
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold block">Selected Total</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">R{calculatedTotal}</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-2 font-mono">
          {business.description || "Top rated local service provider in TEKS region."}
        </p>
      </div>

      {/* BOOKING FORM */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
        {/* SECTION 1: SELECT MULTIPLE SERVICES */}
        <div className="bg-[#121212] border border-zinc-800 rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-cyan-400 font-mono uppercase tracking-wider">
              1. Select Services (Multiple Selection Active)
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              {selectedServices.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {availableServices.map((service) => {
              const isSelected = selectedServices.includes(service.name);
              return (
                <div
                  key={service.id || service.name}
                  onClick={() => toggleService(service.name)}
                  className={`cursor-pointer border rounded-2xl p-4 flex items-center justify-between transition ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs font-mono transition ${
                        isSelected
                          ? "bg-cyan-400 text-black"
                          : "border border-zinc-700 bg-zinc-900"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                    <span className="text-sm font-bold">{service.name}</span>
                  </div>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    R{service.price}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: DATE & TIME */}
        <div className="bg-[#121212] border border-zinc-800 rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-black text-cyan-400 font-mono uppercase tracking-wider">
            2. Select Date & Time
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">BOOKING DATE</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">PREFERRED TIME</label>
              <select
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none font-mono"
              >
                {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(
                  (time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: CLIENT CONTACT DETAILS */}
        <div className="bg-[#121212] border border-zinc-800 rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-black text-cyan-400 font-mono uppercase tracking-wider">
            3. Client Contact Details
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">YOUR FULL NAME</label>
              <input
                type="text"
                required
                placeholder="e.g. Johan Botha"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">WHATSAPP / PHONE NUMBER</label>
              <input
                type="tel"
                required
                placeholder="e.g. 0721234567"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">NOTES / SPECIAL REQUESTS</label>
              <textarea
                rows={3}
                placeholder="Any special requests or details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-black font-mono py-4 rounded-full text-sm hover:opacity-90 transition shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
        >
          {submitting ? "Processing Booking..." : `⚡ Confirm Booking (R${calculatedTotal}) →`}
        </button>
      </form>
    </div>
  );
}