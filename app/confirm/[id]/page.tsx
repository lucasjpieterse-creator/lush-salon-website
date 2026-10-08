"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage() {
  const { id } = useParams() as { id: string };
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function run() {
      console.log("ID:", id);
      const { data, error } = await supabase.from("bookings").select("*, businesses(name)").eq("id", id).single();
      console.log("DATA:", data, "ERROR:", error);
      if (error) setError(error.message);
      setBooking(data);
    }
    if (id) run();
  }, [id]);

  async function confirm() {
    await supabase.from("bookings").update({ client_confirmed: true }).eq("id", id);
    setDone(true);
  }

  if (error) return <div className="p-8 bg-black min-h-screen text-white">❌ Supabase Error: {error}<br/><br/>ID tried: {id}</div>;
  if (!booking) return <div className="p-8 bg-black min-h-screen text-white">Loading booking... ID: {id}</div>;
  if (done) return <div className="p-8 bg-black min-h-screen text-white text-center"><h1 className="text-3xl font-black">✅ Confirmed!</h1><p className="text-zinc-400 mt-2">See you at {booking.businesses?.name}</p></div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-black">{booking.businesses?.name || "Booking"}</h1>
      <p className="mt-2">Hi {booking.client_name}, confirm your booking?</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6 w-full max-w-sm">
        <p className="font-bold">{booking.service_name} • R{booking.service_price}</p>
        <p className="text-sm text-zinc-400 mt-1">📅 {booking.booking_date} at {booking.booking_time}</p>
        <button onClick={confirm} className="w-full mt-6 bg-white text-black py-3 rounded-full font-black">YES, I'LL BE THERE</button>
      </div>
    </div>
  );
}