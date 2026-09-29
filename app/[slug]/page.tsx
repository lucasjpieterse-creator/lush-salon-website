"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const DATA: any = {
  "glamour-locks": { name: "Glamour Locks", owner: "Thandi", price: 250, service: "Braids & Weave", desc: "Professional braids, weave install, dreadlocks retwist. House calls available in Secunda." },
  "nails-by-lisa": { name: "Nails by Lisa", owner: "Lisa", price: 180, service: "Acrylic & Gel", desc: "Acrylic, gel, nail art. At home studio in Secunda." },
  "fade-masters": { name: "Fade Masters", owner: "Sipho", price: 120, service: "Cuts & Fades", desc: "Sharp fades, beard trim, line-ups. Walk-ins welcome." },
};

export default function BookingPage() {
  const { slug } = useParams();
  const b = DATA[slug as string] || { name: slug, owner: "Owner", price: 250, service: "Service", desc: "Business details" };
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");

  const book = () => {
    if(!date ||!time ||!name) return alert("Fill date, time and name");
    alert(`✅ Booked ${b.name} on ${date} at ${time} for ${name}\n\nNext: This will save to Supabase + send WhatsApp`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-xl mx-auto">
      <Link href="/" className="text-sm text-zinc-400">← Back to HustleHub</Link>
      <h1 className="text-3xl font-black mt-6">{b.name}</h1>
      <p className="text-zinc-400 mt-2">{b.owner} • {b.service} • R{b.price}</p>
      <p className="mt-4 text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">{b.desc}</p>

      <div className="mt-8 space-y-4">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3" />
        <input value={date} onChange={e=>setDate(e.target.value)} type="date" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3" />
        <input value={time} onChange={e=>setTime(e.target.value)} type="time" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3" />
        <button onClick={book} className="w-full bg-white text-black font-bold py-4 rounded-full">Confirm Booking R{b.price}</button>
        <Link href={`/${slug}/manager`} className="block text-center text-xs text-zinc-500 mt-2">Manager login for {b.owner}</Link>
      </div>
    </div>
  );
}