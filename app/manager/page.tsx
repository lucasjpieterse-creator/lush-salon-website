"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManagerHub() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});

  useEffect(() => {
    (async()=>{
      const { data: bizs } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
      setBusinesses(bizs || []);
      const { data: bookings } = await supabase.from("bookings").select("business_id,status");
      const c: any = {};
      bookings?.forEach(b=>{
        if(!c[b.business_id]) c[b.business_id] = { total: 0, pending: 0 };
        c[b.business_id].total++;
        if(b.status === "pending") c[b.business_id].pending++;
      });
      setCounts(c);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-6xl mx-auto">
      <Link href="/" className="text-sm text-zinc-400">← Back to HustleHub</Link>
      <h1 className="text-3xl font-black mt-6">Manager Hub</h1>
      <p className="text-zinc-400 mt-2">{businesses.length} businesses • Live from Supabase</p>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {businesses.map((b: any) => {
          const stat = counts[b.id] || { total: 0, pending: 0 };
          return (
            <Link key={b.id} href={`/manager/${b.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-5 hover:border-zinc-600 transition block">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center font-bold">{b.name[0]}</div>
              <h3 className="font-bold mt-4">{b.name}</h3>
              <p className="text-sm text-zinc-400">{b.slug}</p>
              <div className="flex justify-between mt-4 text-sm">
                <span className={stat.pending > 0 ? "text-orange-400 font-bold" : "text-zinc-500"}>
                  {stat.pending > 0 ? `${stat.pending} NEW 🔔` : `${stat.total} bookings`}
                </span>
                <span className="font-bold">{b.category}</span>
              </div>
              <div className="mt-4 bg-white text-black text-center py-2.5 rounded-full text-sm font-bold">Open →</div>
            </Link>
          );
        })}
      </div>
      {businesses.length === 0 && <p className="text-zinc-500 mt-8">No businesses found. Add one in Supabase.</p>}
    </div>
  );
}