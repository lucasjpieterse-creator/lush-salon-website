"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage() {
  const { id } = useParams() as { id: string };
  const [booking, setBooking] = useState<any>(null);
  const [msg, setMsg] = useState("Loading...");

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
    await supabase.from("bookings").update({ client_confirmed: true }).eq("id", id);
    setBooking({...booking, client_confirmed: true });
  }

  if (msg) return <div className="min-h-screen bg-black text-white p-8"><p>{msg}</p><p className="text-xs text-zinc-500 mt-2">If stuck here, that ID does not exist in Supabase bookings</p></div>;

  if (booking.client_confirmed) return <div className="min-h-screen bg-black text-white p-8 text-center"><h1 className="text-3xl font-black">✅ Already Confirmed!</h1><p className="mt-2">{booking.service_name} on {booking.booking_date} at {booking.booking_time}</p></div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-black">Confirm Booking</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6 w-full max-w-sm">
        <p className="font-bold">{booking.service_name} • R{booking.service_price}</p>
        <p className="text-sm text-zinc-400">👤 {booking.client_name}</p>
        <p className="text-sm text-zinc-400">📅 {booking.booking_date} at {booking.booking_time}</p>
        <button onClick={confirmBooking} className="w-full mt-6 bg-white text-black py-3 rounded-full font-black">YES, I'LL BE THERE</button>
      </div>
    </div>
  );
}