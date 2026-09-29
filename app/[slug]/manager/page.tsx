"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

const mockBookings = [
  { id: 1, customer: "Lerato M.", date: "2026-05-14", time: "10:00", service: "Braids", status: "Confirmed", phone: "082 123 4567" },
  { id: 2, customer: "Amahle K.", date: "2026-05-14", time: "14:00", service: "Weave Install", status: "Pending", phone: "079 987 6543" },
  { id: 3, customer: "Noma S.", date: "2026-05-15", time: "09:00", service: "Dreadlocks Retwist", status: "Confirmed", phone: "081 234 5678" },
];

export default function BusinessManager() {
  const { slug } = useParams();
  const name = (slug as string).replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <div className="flex justify-between">
        <Link href="/" className="text-sm text-zinc-400">← Back to HustleHub</Link>
        <Link href={`/${slug}`} className="text-sm text-zinc-400">View Booking Page →</Link>
      </div>

      <h1 className="text-3xl font-black mt-6 capitalize">{name}</h1>
      <p className="text-zinc-400 mt-2">Manager for {slug} • Secunda</p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><p className="text-xs text-zinc-500">Today</p><p className="text-xl font-bold">3</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><p className="text-xs text-zinc-500">Revenue</p><p className="text-xl font-bold">R750</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><p className="text-xs text-zinc-500">Pending</p><p className="text-xl font-bold">1</p></div>
      </div>

      <h2 className="font-bold mt-8 mb-3">Today&apos;s Bookings</h2>
      <div className="space-y-3">
        {mockBookings.map(b => (
          <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="font-bold">{b.customer} • {b.service}</p>
              <p className="text-sm text-zinc-400">{b.date} at {b.time} • {b.phone}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border ${b.status === 'Confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{b.status}</span>
          </div>
        ))}
      </div>

      <button onClick={()=>alert('Connected! Later this will fetch real bookings from Supabase for '+slug)} className="mt-8 w-full bg-white text-black font-bold py-3 rounded-full">Refresh Bookings</button>
      <p className="text-center text-xs text-zinc-600 mt-4">Mock data — will connect to Supabase bookings table later</p>
    </div>
  );
}