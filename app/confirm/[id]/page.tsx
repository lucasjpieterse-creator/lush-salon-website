"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage() {
  const { id } = useParams() as { id: string };
  const [booking, setBooking] = useState<any>(null);
  const [msg, setMsg] = useState("Loading...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function get() {
      setMsg("Fetching ID: " + id);
      const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
      if (error) { setMsg("ERROR: " + error.message); return; }
      if (!data) { setMsg("No booking found for ID: " + id + " — check Supabase bookings table"); return; }
      setBooking(data);
      setMsg("");
    }
    get();
  }, [id]);

  async function confirmBooking() {
    setLoading(true);

    // 1. Update Supabase database
    const { error } = await supabase.from("bookings").update({ client_confirmed: true }).eq("id", id);

    if (error) {
      alert("Error confirming booking: " + error.message);
      setLoading(false);
      return;
    }

    // 2. Format date cleanly
    const formattedDate = booking.booking_date
      ? new Date(booking.booking_date).toLocaleDateString('en-ZA', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      : booking.booking_date;

    // 3. Trigger automated WhatsApp to Client via backend API
    try {
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: booking.client_phone || booking.phone,
          clientName: booking.client_name,
          message: `✅ Booking Confirmed!\n\nService: ${booking.service_name}\nDate: ${formattedDate}\nTime: ${booking.booking_time}\nPrice: R${booking.service_price || booking.price}\n\nThank you for confirming via TekSBook!`
        })
      });
    } catch (err) {
      console.error("Failed to trigger automated WhatsApp:", err);
    }

    setBooking({ ...booking, client_confirmed: true });
    setLoading(false);
  }

  if (msg) return <div className="min-h-screen bg-black text-white p-8"><p>{msg}</p><p className="text-xs text-zinc-500 mt-2">If stuck here, that ID does not exist in Supabase bookings</p></div>;

  if (booking.client_confirmed) return (
    <div className="min-h-screen bg-black text-white p-8 text-center flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black">✅ Already Confirmed!</h1>
      <p className="mt-2 text-zinc-400">{booking.service_name} on {booking.booking_date} at {booking.booking_time}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center text-center font-mono">
      <h1 className="text-2xl font-black">Confirm Booking</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6 w-full max-w-sm text-left">
        <p className="font-bold text-lg">{booking.service_name} - R{booking.service_price || booking.price}</p>
        <p className="text-sm text-zinc-400 mt-2">👤 {booking.client_name}</p>
        <p className="text-sm text-zinc-400 mt-1">📅 {booking.booking_date} at {booking.booking_time}</p>
        
        <button 
          onClick={confirmBooking} 
          disabled={loading}
          className="w-full mt-6 bg-white text-black py-3 rounded-full font-black hover:bg-zinc-200 transition disabled:opacity-50"
        >
          {loading ? "CONFIRMING..." : "YES, I'LL BE THERE"}
        </button>
      </div>
    </div>
  );
}