"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const salons = [
  { id: 1, name: "Glamour Locks", owner: "Thandi", service: "Braids & Weave", price: "R250", phone: "0821234567" },
  { id: 2, name: "Nails by Lisa", owner: "Lisa", service: "Acrylic & Gel", price: "R180", phone: "0832345678" },
  { id: 3, name: "Fade Masters", owner: "Sipho", service: "Cuts & Fades", price: "R120", phone: "0843456789" },
];

export default function Home() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showManager, setShowManager] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (data) setBookings(data);
  }

  async function handleBooking() {
    if (!name || !phone || !selectedSalon || !date || !time) return alert("Fill all fields");
    const { error } = await supabase.from("bookings").insert([{ 
      customer_name: name, 
      customer_phone: phone, 
      salon_name: selectedSalon.name, 
      service: selectedSalon.service, 
      date, time, status: "pending" 
    }]);
    if (!error) {
      alert(`Booked at ${selectedSalon.name} for ${date} ${time} ✅`);
      setName(""); setPhone(""); setSelectedSalon(null); setDate(""); setTime("");
      fetchBookings();
    } else alert(error.message);
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold">HustleHub Secunda</h1>
        <button onClick={() => setShowManager(!showManager)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold">
          {showManager ? "Close Manager" : "Manager Login"}
        </button>
      </header>

      <h2 className="text-xl mb-4 font-semibold">Local businesses in Secunda</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {salons.map((s) => (
          <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold">{s.name}</h3>
            <p className="text-zinc-400 text-sm">Owner: {s.owner} • {s.service}</p>
            <p className="text-green-400 font-bold mt-2">{s.price}</p>
            <button onClick={() => setSelectedSalon(s)} className="mt-4 w-full bg-white text-black py-2 rounded-full font-bold">
              Book Now
            </button>
          </div>
        ))}
      </div>

      {selectedSalon && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Book {selectedSalon.name}</h3>
            <input placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} className="w-full mb-3 p-3 rounded-xl bg-black border border-zinc-700" />
            <input placeholder="Phone e.g. 0712345678" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full mb-3 p-3 rounded-xl bg-black border border-zinc-700" />
            <div className="flex gap-3 mb-3">
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-1/2 p-3 rounded-xl bg-black border border-zinc-700" />
              <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-1/2 p-3 rounded-xl bg-black border border-zinc-700" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleBooking} className="flex-1 bg-white text-black py-3 rounded-full font-bold">Confirm Booking</button>
              <button onClick={()=>setSelectedSalon(null)} className="px-6 py-3 border border-zinc-600 rounded-full">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showManager && (
        <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Manager — Today's Bookings ({bookings.length})</h3>
          {bookings.length === 0 ? <p className="text-zinc-500">No bookings yet</p> : bookings.map((b:any) => (
            <div key={b.id} className="border-b border-zinc-800 py-3 flex justify-between">
              <div><p className="font-bold">{b.customer_name} — {b.salon_name}</p><p className="text-sm text-zinc-400">{
