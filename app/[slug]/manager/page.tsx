"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

const DATA: any = {
  "glamour-locks": {
    name: "Glamour Locks", owner: "Thandi",
    today: 3, revenue: "R750", pending: 1,
    bookings: [
      { id: 1, customer: "Lerato M.", service: "Box Braids", date: "2026-05-14", time: "10:00", status: "Confirmed", phone: "082 123 4567" },
      { id: 2, customer: "Amahle K.", service: "Weave Install", date: "2026-05-14", time: "14:00", status: "Pending", phone: "079 987 6543" },
      { id: 3, customer: "Noma S.", service: "Retwist", date: "2026-05-15", time: "09:00", status: "Confirmed", phone: "081 234 5678" },
    ]
  },
  "nails-by-lisa": {
    name: "Nails by Lisa", owner: "Lisa",
    today: 4, revenue: "R720", pending: 2,
    bookings: [
      { id: 1, customer: "Buhle D.", service: "Acrylic Full Set", date: "2026-05-14", time: "11:00", status: "Confirmed", phone: "083 456 7890" },
      { id: 2, customer: "Zinhle P.", service: "Gel Manicure + Art", date: "2026-05-14", time: "13:30", status: "Pending", phone: "072 345 6789" },
      { id: 3, customer: "Tumi R.", service: "Refill", date: "2026-05-14", time: "15:00", status: "Confirmed", phone: "084 567 8901" },
    ]
  },
  "fade-masters": {
    name: "Fade Masters", owner: "Sipho",
    today: 6, revenue: "R720", pending: 0,
    bookings: [
      { id: 1, customer: "Sbu N.", service: "Skin Fade", date: "2026-05-14", time: "09:00", status: "Confirmed", phone: "071 123 4567" },
      { id: 2, customer: "Mandla T.", service: "Cut + Beard", date: "2026-05-14", time: "10:30", status: "Confirmed", phone: "078 234 5678" },
      { id: 3, customer: "Lefa K.", service: "Line-up", date: "2026-05-14", time: "12:00", status: "Confirmed", phone: "076 345 6789" },
    ]
  },
};

export default function BusinessManager() {
  const { slug } = useParams();
  const key = slug as string;
  const b = DATA[key] || DATA["glamour-locks"];

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <div className="flex justify-between text-sm">
        <Link href="/manager" className="text-zinc-400">← All Managers</Link>
        <Link href={`/${key}`} className="text-zinc-400">View Booking Page →</Link>
      </div>

      <h1 className="text-3xl font-black mt-6">{b.name}</h1>
      <p className="text-zinc-400 mt-1">Manager for {b.owner} • Secunda</p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><p className="text-xs text-zinc-500">Today</p><p className="text-xl font-bold">{b.today}</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><p className="text-xs text-zinc-500">Revenue</p><p className="text-xl font-bold">{b.revenue}</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><p className="text-xs text-zinc-500">Pending</p><p className="text-xl font-bold">{b.pending}</p></div>
      </div>

      <h2 className="font-bold mt-8 mb-3">Today&apos;s Bookings</h2>
      <div className="space-y-3">
        {b.bookings.map((item: any) => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="font-bold">{item.customer} • {item.service}</p>
              <p className="text-sm text-zinc-400">{item.date} at {item.time} • {item.phone}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border ${item.status === 'Confirmed'? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{item.status}</span>
          </div>
        ))}
      </div>

      <button onClick={()=>alert(b.name + ' — real bookings will come from Supabase next')} className="mt-8 w-full bg-white text-black font-bold py-3 rounded-full">Refresh Bookings</button>
    </div>
  );
}